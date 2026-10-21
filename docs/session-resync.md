# Synchronisation automatique des permissions (`session-resync`)

Ce document décrit le mécanisme mis en place pour que les changements de rôle/permissions pris côté backend soient reflétés dans l'UI **sans déconnexion (logout)** de l'utilisateur connecté.

## Problématique résolue

Les permissions étaient chargées **une seule fois** au montage de `AuthProvider` via `GET /auth/me`. Si un administrateur modifie les droits d'un utilisateur déjà connecté :

- Rien n'était détecté tant que l'utilisateur ne se déconnectait/reconnectait ou ne rechargeait pas la page (`F5`).
- Le contexte (`AuthProvider.user`) restait figé → `usePermissions()`, `PermissionRoute`, `Allow`, `AdminMenu` continuaient d'utiliser l'ancienne « photocopie » des droits.

## Stratégie retenue (frontend seul)

On conserve le modèle existant (session stockée uniquement dans le contexte React). À chaque événement opportun (navigation, retour d'onglet, 403, refresh 401), on **resynchronise** la session via `GET /auth/me` ou on **injecte directement** la session renvoyée par le refresh. Dès que `setUser` est appelé avec une nouvelle session, toute l'UI (guards, menus, boutons conditionnels) se réévalue automatiquement.

## Composants

### 1. Bus de resync : `src/services/auth/sessionSync.ts`

Fichier sans dépendance React (utilisable dans `axios.ts`). Il expose un bus d'événements léger :

- `type SessionResyncReason = "navigation" | "focus" | "sidebar" | "403" | "token-refresh"`
- `onSessionResync(listener)` → retourne une fonction `unsubscribe`
- `requestSessionResync(reason, options?)` → notifie tous les listeners

**Throttling / dédoublonnage :**

Le budget est **par raison** (`THROTTLE_MS_BY_REASON`) : chaque raison dispose de sa propre fenêtre, si bien qu'une resync « navigation » n'annule plus une resync « sidebar » (et réciproquement). Avant, un budget unique de 1 min était partagé : la demande « sidebar » était presque toujours ignorée, puisqu'une navigation ou un focus avait eu lieu dans la minute précédente.

- **`navigation` / `focus`** : **1 appel maximum toutes les 60 s** (1 min). Si l'utilisateur clique 10 pages en 5 secondes, un seul appel `GET /auth/me` est émis (évite le spam serveur).
- **`sidebar`** : **1 appel maximum toutes les 5 s**. Geste volontaire de l'utilisateur (ouverture de la barre latérale) : le résultat est attendu immédiatement, la fenêtre est donc courte.
- **`403` avec `force: true`** : contourne le throttle des raisons « douces », mais est **dédoublonné à 2 s** (plusieurs 403 simultanés n'envoient qu'une seule demande). Cela évite une rafale si une page effectue plusieurs requêtes refusées.
- **`token-refresh` avec `user` fourni** : **aucun throttle**. Le `UserLoginRes` complet est déjà disponible dans la réponse `/auth/refresh` → `AuthProvider` l'injecte directement via `setUser` **sans appel HTTP supplémentaire** (optimisation + cohérence immédiate). Le test `deliversSession` vérifie la présence de `permissions` pour décider du bypass.

> **Skip du 1er montage** : géré dans `ProtectedRoute` (voir §3). `AuthProvider` lance déjà `refreshUser()` à son montage.

### 2. Contexte d'auth : `src/contexts/AuthProvider.tsx`

Modifications principales :

- **`refreshUser(options?: { resync?: boolean })`**
  - En mode **normal** (montage initial) : échec → `setUser(null)` (déconnexion attendue).
  - En mode **`resync`** (navigation/focus/403) : échec réseau → **conserve la session courante** (`setUser` non appelé). Objectif : ne pas déconnecter l'utilisateur à la moindre coupure réseau/latence au moment d'un focus ou d'un changement de route.
- **`userRef`** : garde une référence toujours à jour de `user` (évite les closures périmées dans les listeners du bus et les `addEventListener`).
- **Abonnement au bus `onSessionResync`** (effet `[]`) :
  - `token-refresh` + `refreshed.permissions` → `setUser(refreshed)` direct (zéro requête).
  - `403` → `const before = userRef.current`; `const after = await refreshUser({ resync: true })`; si `before` et `after` existent et que `sessionChanged(before, after)` détecte un changement (`role/codeRole` ou `permissions` sérialisées) → `toast.success("Vos droits ont été mis à jour.")`. Sinon : **aucun toast** (le toast « Accès refusé » existant dans `axios.ts` reste suffisant).
  - `navigation` / `focus` → `await refreshUser({ resync: true })` (aucun toast).
- **Focus / visibilité de l'onglet** (effet `[]`) : écoute `visibilitychange` + `focus`. Si l'onglet redevient visible **et qu'une session est active** (`userRef.current`), appelle `requestSessionResync("focus")` (throttlé 60 s).
- **Ouverture du sidebar** (`AdminLayout`, effet sur `sidebarOpen`) : à chaque ouverture du sidebar (bouton hamburger, mobile), appelle `requestSessionResync("sidebar")` (throttlé à 5 s — budget propre à cette raison) — les menus reflètent les derniers droits avant que l'utilisateur ne navigue.
- **Synchronisation multi-onglets** (effet `[]`) : `storage` event. Si `accessToken` devient `null` dans un autre onglet → `setUser(null)` (logout propagé entre onglets). Les autres onglets se déconnectent naturellement sans reload forcé.

**Comparaison de sessions :** `sessionChanged(a,b)` compare `role`, `codeRole` et `JSON.stringify(a.permissions)` (masques `totalActionsAccordées` inclus). Cela évite de spammer un toast quand aucun droit n'a réellement évolué.

### 3. Route protégée : `src/router/ProtectedRoute.tsx`

Ajout d'un effet basé sur `useLocation()` :

```ts
const location = useLocation();
const mounted = useRef(false);

useEffect(() => {
    if (!mounted.current) {
        mounted.current = true;        // skip du 1er montage
        return;
    }
    requestSessionResync("navigation");
}, [location.pathname]);
```

- **Skip du 1er montage** : `AuthProvider` exécute déjà `refreshUser()` à son `useEffect([])`. On évite donc un double appel HTTP au chargement initial de l'app.
- **Déclenché sur `location.pathname` uniquement** : un changement de route sous `/admin/*` provoque une demande de resync (throttlée 60 s côté bus). Comme **toutes** les routes `/admin` passent par `ProtectedRoute`, ce seul effet couvre 100 % des navigations dans la zone admin.

### 4. Intercepteur HTTP : `src/api/axios.ts`

- **Refresh token 401 réussi** : après avoir sauvegardé `accessToken/refreshToken`, si `data?.permissions` est présent → `requestSessionResync("token-refresh", { user: data })`. Cela injecte **immédiatement** la session complète (permissions à jour) dans `AuthProvider` sans refaire `GET /auth/me`. Si la forme de réponse évolue (pas de `permissions`), on pourrait envisager un fallback, mais la condition protège ce cas.
- **Réponse 403** : si `status === 403` et que l'URL n'inclut pas `/auth/` → `requestSessionResync("403", { force: true })` **avant** l'affichage du toast « Accès refusé ». Le resync forcé (dédoublonné 2 s) va récupérer la session à jour ; `AuthProvider` comparera `before/after` et n'affichera le toast « Vos droits ont été mis à jour » **que si un changement est détecté**. Sinon seul le toast 403 existant s'affiche (comportement demandé).

> Le guard `!originalRequest.url.includes("/auth/")` évite toute boucle potentielle (pas de resync déclenché par un appel `/auth/me` lui-même).

## Comportement attendu (scénario validé)

1. **Admin modifie les droits** d'un utilisateur connecté (backend). La session côté navigateur est inchangée à cet instant.
2. **Utilisateur navigue** vers une autre route sous `/admin` → `ProtectedRoute` détecte le changement de `pathname` → `requestSessionResync("navigation")` (throttlé 60 s). `GET /auth/me` est appelé → `AuthProvider.setUser` reçoit la **nouvelle session**.
3. **State mis à jour → UI se réévalue seule.** `usePermissions()`, `Allow`, `AdminMenu`, `TaskCard`, `Dashboard`, `PermissionRoute` lisent tous `user` du contexte React. Un bouton/entrée de menu qui doit disparaître disparaît immédiatement au re-render.
4. **Pas de toast automatique sur navigation/focus** (conformément au choix). Seul le **cas 403 avec changement effectif** peut afficher `toast.success("Vos droits ont été mis à jour.")`.
5. **Navigation vers une route non autorisée** : l'utilisateur clique → React rend **d'abord** avec les anciens droits (très court flash possible, le temps du réseau). Le `GET /auth/me` revient → `setUser(nouveaux droits)` → `PermissionRoute` re-rend et redirige vers `/admin` (`Navigate to="/admin" replace />`). **Important :** la sécurité reste assurée côté backend (tout appel d'API non autorisé renverra 403). Ce mécanisme est purement de **cohérence UI** (évite d'afficher une page inaccessible avant la resync).

## Notes d'implémentation

- **Zéro modification** des composants de garde/UI existants (`PermissionRoute`, `Allow`, `AdminMenu`, etc.) : ils sont déjà réactifs au contexte. Le gain est uniquement dans le **rafraîchissement opportun** de ce contexte.
- **Pas de WebSocket requis** (choix frontend seul). Le mécanisme est « pull » opportun (navigation + focus + 403 + refresh token). Latence acceptable vis-à-vis du cas d'usage (retour d'onglet / navigation).
- **Cross-tab** : logout dans un onglet → `accessToken` supprimé → `storage` event dans les autres onglets → `setUser(null)`.
- **Offline au focus** : mode `resync` → échec réseau **ne déconnecte pas** l'utilisateur (on conserve la session courante). C'est le comportement voulu pour éviter des déconnexions intempestives.


