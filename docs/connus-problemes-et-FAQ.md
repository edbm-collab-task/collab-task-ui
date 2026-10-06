# Problèmes connus, dette technique et FAQ

Constat vérifié sur la branche `develop` (`0752cf8`, octobre 2026). Chaque élément est documenté avec sa localisation. Mettre à jour ce fichier si vous corrigez un point.

## Bugs actifs

### 1. Redirection de `RecoveryProtectedRoute` vers une route inexistante

`src/router/RecoveryProtectedRoute.tsx:37` renvoie vers `/forgot-password`, qui n'est déclarée **nulle part** dans `src/router/index.tsx`. L'utilisateur sans session de récupération tombe donc sur `*` → `NotFoundPage` (404) au lieu de `src/pages/user/SearchUserPage` (`/reccuperation-comptes`).

Le JSDoc du fichier (lignes 21-22) signale lui-même le problème. `"/reccuperation-comptes"` comporte aussi une faute de frappe, mais **elle fait partie du contrat d'URL** : la corriger nécessite de changer les liens vers.

**Correction** : `<Navigate to="/reccuperation-comptes" replace />`.

### 2. `UserListPage` : hook appelé de façon conditionnelle

`src/pages/admin/user/UserListPage.tsx:46-48` fait un `return null` si l'utilisateur est un `SUPER_ADMIN`, **avant** le `useEffect` de la ligne 99. Dès qu'un super administrateur ouvre `/admin/users`, le nombre de hooks appelés au rendu change. Détecté par `npm run lint` (erreur `react-hooks(rules-of-hooks)`).

Note : l'effet de la ligne 40 redirige déjà un super admin vers `/admin/admins` ; le `return null` est donc redondant et introduit le bug.

**Correction** : retirer le `return null` (l'effet de redirection suffit) ou déplacer tous les hooks au-dessus.

### 3. `Dashboard` : hook appelé de façon conditionnelle

`src/components/admin/Dashboard.tsx:25-33` fait un `return` anticipé si l'utilisateur n'a pas `VIEW_REPORTS`, **avant** `useDashboardPeriod()` (ligne 35), 8 `useState` (36-48) et 2 `useEffect` (51, 57). 12 erreurs `react-hooks(rules-of-hooks)` en découlent.

Le problème est réel : un changement de permission pendant la vie du composant changerait le nombre de hooks.

**Correction** : déplacer le `hasPermission` **après** tous les hooks, ou déléguer le `return` à un composant enfant.

### 4. `npm run build` échoue sur `develop`

```
src/pages/admin/direction/DirectionListPage.tsx(2,10): error TS6133:
  'Pencil' is declared but its value is never read.
```

Code retour `2` : le build de production est impossible sur `develop`. La correction existe sur la branche **`fix/direction-unused-import`** mais n'est pas fusionnée.

### 5. `npm run lint` échoue sur `develop`

Code retour `1` : **13 erreurs** (points 2 et 3 ci-dessus) et 15 avertissements (dépendances manquantes dans les `useEffect`, `catch` non utilisés, imports inutilisés). Détail dans [outillage-qualite.md](./outillage-qualite.md).

### 6. Statuts : 3 graines côté front, 4 colonnes côté style

- `src/types/task.ts` → `STATUSES` ne contient que **3 entrées** (ids 1, 2, 3).
- `src/components/kanban/KanbanBoard.tsx:52-57` → `styleMap` définit **4 styles** (ids 1 à 4).

Le commentaire du fichier le rappelle (« ATTENTION : STATUSES (constante) n'a que 3 entrées (id 1,2,3) mais styleMap en a 4 »). Un 4ᵉ statut de type « relecture » aurait un style, mais aucune graine front — il faudrait donc un statut créé par le backend.

**Sous-typos** : la graine `Termine` est écrite **sans accent**, alors que le fallback par nom de `KanbanBoard` teste `name.includes("terminé")`. Un statut backend nommé « Terminé » sans id 1-4 correspondrait au fallback, mais « Termine » tombera toujours sur le repli gris s'il n'a pas l'id 3.

### 7. Libellés de colonnes utilisateur altérés

`src/types/user.ts` → `userTr` contient des chaînes mojibake : `"PrÃ©nom"` au lieu de `"Prénom"`, `"RÃ´le"` au lieu de `"Rôle"`. Ces libellés alimentent `createColumns()` pour `UserListPage` et `AdminListPage` : les en-têtes de colonnes s'affichent avec des caractères corrompus.

### 8. `formatFileSizeEnShort` contredit sa propre documentation

`src/utils/format.ts:24-33` : le JSDoc annonce « Pas de gestion GB », mais la ligne 32 renvoie bien une valeur en GB. La fonction est utilisée par `MessageComposer.tsx:179`.

### 9. Classe de style inexistante et typo

| Problème | Emplacement |
|---|---|
| `via-priamry` — aucune classe Tailwind correspondante n'est générée | `pages/NotFoundPage.tsx:7` |
| `custom-scrollbar` — utilisée mais jamais définie | `kanban/TaskModal.tsx:121` |

### 10. HTML non assaini : risque résiduel

Deux composants injectent du contenu HTML via `dangerouslySetInnerHTML`, mais **après** `DOMPurify.sanitize()` :

- `components/message/ConversationSidebar.tsx:136`
- `components/message/MessageItem.tsx:220`

Risque actuellement maîtrisé, **à retrouver dans chaque nouveau point d'injection** : aucun helper `sanitize()` ne centralise la règle (voir [composants-et-styles.md](./composants-et-styles.md)).

## Dette technique

### Duplication de code

| Détail | Emplacement |
|---|---|
| `GlobalForm` et `GlobalEditForm` dupliqués à ~90 % (même grille, même appel à `FormFieldControl` avec 11 props, même bloc de bouton) ; seules le bouton retour et trois chaînes de classes diffèrent | `components/Form/` |
| `UserListPage` (325 lignes) et `AdminListPage` (424 lignes) : mêmes importations, mêmes `createColumns` + `createAccountStatusAction` + `DetailModal` + `userDetailFields`, même machine d'état de modale | `pages/admin/user/`, `pages/admin/superadmin/` |
| `UserListPage` et `AdminListPage` affichent les mêmes comptes sous deux espaces : toute évolution de la table doit être faite deux fois | idem |
| Trois systèmes de confirmation concurrents : `ConfirmPopup`, `confirmDelete.ts` (SweetAlert2), `window.confirm`/`window.alert` | voir [composants-et-styles.md](./composants-et-styles.md) |
| Dossiers `src/constant/` et `src/constants/` homonymes, plus `src/api/constants.ts` et `src/enum/` | voir [types-enums-donnees.md](./types-enums-donnees.md) |
| `Status` déclaré en double (`types/status.ts` interface + `types/task.ts` type alias) | 2 définitions |
| 4 interfaces déclarées en double dans `adminDashboard.ts` | fusion silencieuse par TS |
| URLs construites hors `API_ENDPOINTS` : `kanban/CommentItem.tsx:129`, `message/MessageItem.tsx:28`, `services/comment/comment.service.ts:74` (concaténation manuelle de `VITE_API_BASE_URL`) | à rapprocher de `API_CONFIG` / `utils/image.ts` |

### Typage

| Détail | Emplacement |
|---|---|
| **Toute la surface de props de `TaskCard` et `TaskTreeItem` est en `any`**, alors que `TaskRes` existe dans `src/types/task.ts` | `kanban/TaskCard.tsx`, `kanban/TaskTreeItem.tsx` |
| 5 casts `as any` sur la configuration axios | `api/api-client.ts` (lignes 19, 34, 50, 66, 80) |
| `authService.recovery` et `dashboardService.get` passent `silent` via `as any` | idem |
| Chaînes de permission non typées (`string`) : une faute de frappe devient une redirection silencieuse | `PermissionRoute`, `usePermissions` |
| `messageService.getMembers()` sans type générique | `services/message/message.service.ts` |

### Expérience et performance

| Détail | Impact |
|---|---|
| **Aucun code splitting** : toutes les pages importées statiquement dans `src/router/index.tsx` | bundle JS unique de **883 Ko** (minifié, non compressé) |
| Aucun `React.lazy` ni `Suspense` | premier chargement complet, même pour `/login` |
| `public/edbm.png` fait **1,5 Mo** et est copié tel quel dans `dist/` (pas d'optimisation par Vite) | poids de la page d'accueil |
| 2 intervalles de 30 s + 1 de 5 s ouverts simultanément quand plusieurs pages sont montées | coût réseau continu |
| Pas d'accessibilité : boutons à icône sans `aria-label`, modales sans `role="dialog"` ni piège de focus | navigation au clavier |
| Aucun dark mode, alors que `globalDetail.tsx` porte des classes de variante sombre orphelines | incohérence |
| Pas de `role`/`lang` adapté : `index.html` est en `lang="en"`, titre = `collab-task-ui`, **pas de favicon** (404 sur `/favicon.ico`) | SEO et apparence |
| Pas de `meta description`, ni Open Graph | — |

## Code mort et dépendances inutilisées

### Dans `src/`

| Cible | Détail |
|---|---|
| `src/constants/roleLabels.ts` | Aucun importateur dans tout `src/` (`ROLE_LABELS`, `getRoleLabel`) |
| `src/components/user/userEditRole.ts` | Aucun importateur (`userAttachedRole`) |
| `useConversations.synchronizeConversation()` | Construite et retournée, **jamais appelée** ; commentée comme telle dans `useMessages.ts:23` et `message.socket.ts:17` |
| `authService.refresh()` | Aucun appelant : le seul chemin de refresh est l'intercepteur axios |
| `types/message.ts` : `MessageDatabase`, `CreatePrivateConversationRequest`, `CreateGroupRequest`, `AddMembersRequest` | Aucun importateur |
| `src/constant/routes.ts` | 4 constantes, seule `ROUTES.HOME` est utilisée (`NotFoundPage`). `ROUTES.USERS = "/users"` ne correspond à aucune route réelle |
| `src/App.css` | Fichier vide, non importé |
| `src/types/task.ts` : `STATUSES` | seulement 3 entrées et surtout peu utilisées (le Kanban lit les statuts du backend) |
| `FormField.file`, `FormField.date`, `FormField.metadata`, `FormField.defaultValue`, `FormField.showPassword` | Déclarés, jamais lus par `FormFieldControl` |
| `FormField` type `"radio"` et `"datetime"` | Pas de branche de rendu dédiée |
| `types/user.ts` : `userEmailFormFields` | Exporté, jamais consommé |

### Dans `package.json`

| Dépendance | Détail |
|---|---|
| `react-cookie` | Jamais importé — les tokens sont en `localStorage` |
| `zod` + `@hookform/resolvers` | Jamais importés — la validation est en RHF inline |
| `@playwright/test` | Jamais configuré, aucun test |
| `bcryptjs` | Jamais importé, placé en `devDependencies` — et inutile côté front : le hachage des mots de passe appartient au backend |

### Commentaires de lint inutiles

7 directives `// eslint-disable-next-line react-hooks/exhaustive-deps` restent alors que le projet utilise **oxlint** : elles ne désactivent rien. Ironie du résultat : oxlint signale quand même `react-hooks(exhaustive-deps)` en avertissement sur d'autres fichiers.

## FAQ

**Q — `npm run build` casse, je suis pourtant innocent ?**
Vérifier d'abord l'état de `develop` : `DirectionListPage.tsx` ne compile pas actuellement (point 4). Commiter `git stash`, relancer, puis `git stash pop` pour isoler la cause.

**Q — Mon lint ajoute-t-il des erreurs ?**
Comparer le nombre avant/après (`npm run lint` → 13 erreurs sur `develop`). Seules les nouvelles erreurs relèvent de votre modification.

**Q — Je reçois un 401 en boucle / je suis déconnecté(e) ?**
Le refresh a échoué : l'intercepteur purge les tokens et redirige vers `/login`. Cause fréquente : `VITE_API_BASE_URL` pointant vers un backend hors ligne (le toast « Impossible de contacter le serveur. » apparaît alors).

**Q — Comment changer l'URL de l'API ?**
`VITE_API_BASE_URL` dans `.env`. La variable `VITE_API_URL` citée dans le `README.md` racine n'est lue par aucun fichier.

**Q — Pourquoi un `enum` TypeScript ne compile pas ?**
`erasableSyntaxOnly` les interdit. Utiliser un objet `as const` + un type dérivé, comme dans `src/enum/role.enum.ts`.

**Q — Pourquoi mon import de type casse le build ?**
`verbatimModuleSyntax` exige `import type { MaType } from "…"`.

**Q — J'ajoute un `<input>` dans une page, c'est du code normal ?**
Seuls les formulaires pilotés par schéma passent par `GlobalForms`/`GlobalEditForm`. Vérifier [etat-et-formulaires.md](./etat-et-formulaires.md).

**Q — Ma page est créée mais invisible ?**
Deux endroits indépendants : la `<Route>` dans `src/router/index.tsx` et l'entrée dans `AdminNavigation.config.ts`. Un oubli de l'un ou l'autre donne une page accessible en URL directe mais absente du menu (ou l'inverse).

**Q — Une notification arrive 30 s en retard ?**
Comportement attendu : c'est un polling, pas du temps réel. Seul le canal de messagerie passe en WebSocket.

**Q — Où trouver le code d'un garde d'accès ?**
`src/router/` contient les 5 guards ; la table complète des routes est dans [routing-et-permissions.md](./routing-et-permissions.md).

## Priorité de correction suggérée

1. `fix/direction-unused-import` : fusionner pour **débloquer le build**.
2. `Dashboard.tsx` et `UserListPage.tsx` : placer le `return` **après** tous les hooks (débloque le lint).
3. `RecoveryProtectedRoute` : rediriger vers `/reccuperation-comptes` (corrige le 404).
4. Nettoyer le code mort (4 modules + 2 dépendances) et les 7 directives `eslint-disable`.
5. Typer `TaskCard`/`TaskTreeItem` avec `TaskRes`.
6. Unifier les confirmations sur `ConfirmPopup`, puis fusionner `GlobalForm`/`GlobalEditForm`.
7. Introduire `React.lazy` par route : gain de poids immédiat sur le bundle.