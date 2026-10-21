# Routage et permissions

## Vue d'ensemble

Le routage est implémenté avec `react-router-dom` (v7.11.0) dans un fichier unique `src/router/index.tsx`. Tous les imports sont statiques (pas de `React.lazy`), donc un seul bundle est généré à la build.

L'application est une SPA avec :
- Des routes publiques (authentification, récupération de mot de passe)
- Une zone `/admin` protégée par layout (`AdminLayout`) avec ses routes enfants
- Des guards pour l'authentification, les permissions et le rôle SUPER_ADMIN

## Bootstrap et providers

`src/main.tsx` monte dans cet ordre :
1. `StrictMode`
2. `BrowserRouter`
3. `AuthProvider` (session utilisateur globale)
4. `RecoveryAuthProvider` (session de récupération mot de passe)
5. `App` + `<Toaster position="top-right" />` (react-hot-toast)

`src/App.tsx` encapsule le router dans `ErrorBoundary` (`components/common/ErrorBoundary.tsx`), puis rend `src/router/index.tsx`.

## Guards

Les guards sont définis dans `src/router/`.

| Guard | Rôle | Comportement |
|---|---|---|
| `ProtectedRoute` | Authentification requise | Si `loading` (vérification session via `useAuth`) → affiche `AdminLayoutSkeleton`. Si aucun utilisateur → redirige vers `/login` (avec `replace`). Sinon rend les enfants. |
| `PermissionRoute` | Permission + action requises | Reçoit `permission: PermissionName` **et** `action: ActionCode`. Vérifie via `usePermissions().hasPermission(permission, action)` : la permission doit être présente **et** son masque accordé doit contenir l'action. SUPER_ADMIN bypass (implémenté dans `usePermissions`). Si l'un des deux manque → redirige vers `/admin`. |
| `SelfRoute` | Propriétaire de l'URL uniquement | N'autorise que l'utilisateur dont `user.userId === Number(id)` (paramètre `:id` de l'URL). **Aucune permission ni action n'est consultée** : un utilisateur modifie toujours son propre profil, et personne d'autre n'y accède — pas plus avec `MANAGE_USERS` (+ action) qu'en tant que `SUPER_ADMIN`. Sinon redirige vers `/admin`. |
| `RecoveryProtectedRoute` | Flux récupération mot de passe | Vérifie `authenticated` via `RecoveryAuthProvider`. Si `loading` → `VerificationPageSkeleton`. Si non authentifié → redirige vers `/reccuperation-comptes`. Sinon rend les enfants. |

## Table des routes

### Routes publiques (hors admin)

| Chemin | Composant | Notes |
|---|---|---|
| `/` | `LoginPage` | Page d'accueil = page de connexion |
| `/login` | `LoginPage` | Authentification |
| `/register` | `RegisterPage` | Inscription |
| `/reccuperation-comptes` | `SearchUserPage` | Départ du flux "mot de passe oublié" (sans guard recovery) |

### Flux de récupération de mot de passe (protégé)

| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/information-personnelle` | `RecoveryProtectedRoute` | `RecoveryPage` | Étape 1 du recovery |
| `/verification` | `RecoveryProtectedRoute` | `VerificationPage` | Étape 2 du recovery |

Remarque : `ChangePwdPage` est accessible via `/admin/users/change-pwd` (dans le layout admin), pas via le flux recovery public.

### Zone `/admin` (protégée par `ProtectedRoute` + `AdminLayout`)

L'élément parent est :
```tsx
<ProtectedRoute>
  <AdminLayout />
</ProtectedRoute>
```
`AdminLayout` fournit `<Outlet/>`, Sidebar et Navbar.

#### Route racine
| Chemin | Composant | Notes |
|---|---|---|
| `/admin` (index) | `Dashboard` | Tableau de bord principal (accessible à tout utilisateur connecté selon session) |

#### Gestion des utilisateurs
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/users` | `PermissionRoute` (`MANAGE_USERS` + `SELECT`) | `UserListPage` | Liste des utilisateurs |
| `/admin/users/create` | `PermissionRoute` (`MANAGE_USERS` + `INSERT`) | `CreateUserPage` | Création d'utilisateur |
| `/admin/users/edit-role` | `PermissionRoute` (`MANAGE_USERS` + `UPDATE`) | `EditUserRolePage` | Édition des rôles |
| `/admin/users/profile` | — | `UserProfile` | Profil utilisateur (sans guard explicite; sous `ProtectedRoute`) |
| `/admin/users/:id/edit` | `SelfRoute` | `EditUserPage` | Édition du **propre** profil uniquement : aucun autre utilisateur ni rôle n'y accède |
| `/admin/users/change-pwd` | — | `ChangePwdPage` | Changement mot de passe (sous `ProtectedRoute`) |

#### Gestion des directions
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/directions` | `PermissionRoute` (`MANAGE_DIRECTIONS` + `SELECT`) | `DirectionsListPage` | Liste des directions |
| `/admin/directions/create` | `PermissionRoute` (`MANAGE_DIRECTIONS` + `INSERT`) | `CreateDirection` | Création d'une direction |

#### Gestion des projets
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/projects` | `PermissionRoute` (`MANAGE_PROJECTS` + `SELECT`) | `ProjectListPage` | Liste des projets |
| `/admin/projects/create` | `PermissionRoute` (`MANAGE_PROJECTS` + `INSERT`) | `ProjectFormPage` (`mode="create"`) | Création de projet |
| `/admin/projects/:id` | `PermissionRoute` (`MANAGE_PROJECTS` + `SELECT`) | `ProjectDetailPage` | Détail d'un projet |
| `/admin/projects/:id/edit` | `PermissionRoute` (`MANAGE_PROJECTS` + `UPDATE`) | `ProjectFormPage` (`mode="edit"`) | Édition de projet |
| `/admin/projects/:id/history` | `PermissionRoute` (`MANAGE_PROJECTS` + `SELECT`) | `ActivityHistoryPage` | Historique d'activité du projet |

#### Messagerie & notifications
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/messages` | — | `MessagePage` | Messagerie (sous `ProtectedRoute` uniquement) |
| `/admin/notifications` | — | `NotificationsPage` | Notifications (sous `ProtectedRoute` uniquement) |

#### Administration (permission + action)
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/dashboard-admin` | `PermissionRoute` (`MANAGE_GLOBAL_REPORTS` + `SELECT`) | `AdminDashboard` | Rapports globaux de la plateforme |
| `/admin/admins` | `PermissionRoute` (`MANAGE_ADMINS` + `SELECT`) | `AdminListPage` | Gestion des administrateurs |
| `/admin/roles` | `PermissionRoute` (`MANAGE_ROLES` + `SELECT`) | `RoleListPage` | Gestion des rôles et permissions |

La permission `VIEW_REPORTS` ne donne plus accès à cette page : elle couvre le tableau de bord personnel (`/admin`) et les rapports de projet. Les rapports globaux relèvent de `MANAGE_GLOBAL_REPORTS`, permission accordée (par le backend) au seul rôle `SUPER_ADMIN`. Le rôle `SUPER_ADMIN` y accède également via le bypass de `usePermissions`.

### Route fallback
| Chemin | Composant | Notes |
|---|---|---|
| `*` | `NotFoundPage` | Toute route non matchée renvoie 404 |

## Menu de navigation

Le menu est déclaré dans `src/components/admin/AdminNavigation.config.ts`.

La visibilité des entrées est pilotée par un couple **permission + action** : une entrée portant `permission` n'est affichée que si l'utilisateur possède cette permission **et** le bit `action` (`usePermissions().hasPermission`). Plus aucune entrée n'est filtrée par le rôle brut : le `SUPER_ADMIN` voit tout via le bypass de `usePermissions`, mais tout rôle doté de la permission/action correspondante voit aussi l'entrée. Une entrée sans permission (Dashboard, Message, Notifications) s'affiche pour tout utilisateur connecté.

### Menu principal (`menus`)
| Élément | Chemin | Icône | Permission + action |
|---|---|---|---|
| Dashboard | `/admin` | `LayoutDashboard` | — (toujours visible si connecté) |
| Projets | `/admin/projects` | `FolderKanban` | `MANAGE_PROJECTS` + `SELECT` |
| Utilisateurs | `/admin/users` | `Users` | `MANAGE_USERS` + `SELECT` |
| Directions | `/admin/directions` | `Building2` | `MANAGE_DIRECTIONS` + `SELECT` |
| Message | `/admin/messages` | `MessageCircle` | — |
| Notifications | `/admin/notifications` | `Bell` | — |

### Menu d'administration (`superAdminMenus`)
| Élément | Chemin | Icône | Permission + action |
|---|---|---|---|
| Dashboard Admin | `/admin/dashboard-admin` | `BarChart2` | `VIEW_REPORTS` + `SELECT` |
| Administrateurs | `/admin/admins` | `Shield` | `MANAGE_ADMINS` + `SELECT` |
| Rôles & Permissions | `/admin/roles` | `Settings` | `MANAGE_ROLES` + `SELECT` |

**Important** : `AdminNavigation.config.ts` et `router/index.tsx` doivent rester synchrones (mêmes permission + action) ; un menu pointant vers une route plus restrictive redirige l'utilisateur vers `/admin`.

**Cas « Utilisateurs »** : l'entrée est masquée dès que l'utilisateur détient `MANAGE_ADMINS` + `SELECT` (donc aussi le super-admin), car `UserListPage` le redirige alors vers la page plus large `/admin/admins`.

**Section d'administration** : elle n'est rendue que si au moins une entrée `superAdminMenus` subsiste après filtrage par permission + action ; elle n'est plus conditionnée au rôle `SUPER_ADMIN`.

## Constantes de routes

Un fichier homonyme existe : `src/constant/routes.ts` (singulier) vs la sémantique "routes" du router. Il contient uniquement :
```ts
export const ROUTES = { HOME: "/", LOGIN: "/login", USERS: "/users", ADMIN: "/admin" } as const;
```

Seul `ROUTES.HOME` est utilisé (`NotFoundPage`). `USERS` pointe vers `/users` (route inexistante dans l'app) — ce fichier est peu utilisé et peut prêter à confusion. Préférer utiliser les chemins directement dans le router ou unifier.

## Points d'attention

- **Typage permissions/actions** : `PermissionRoute` et les entrées de menu (`MenuItem`) sont typés `PermissionName` **+** `ActionCode` et reçoivent des constantes `PERM.*` / `ACT.*` — une faute de frappe ou une action oubliée est une erreur TypeScript. `SelfRoute` ne prend aucune permission. `usePermissions` reste typé `PermissionName`.
- **Routes : permission + action obligatoires** : une route n'est plus protégée par la seule présence de la permission. Exemple : `/admin/users/create` exige `MANAGE_USERS` + `INSERT` — un rôle possédant `MANAGE_USERS` sans le bit `INSERT` est redirigé vers `/admin`.
- **Actions contrôlées côté client** : `/auth/me` renvoie `permissions: PermissionSummary[]` (`totalActionsAccordees`) ; `usePermissions().hasPermission(perm, action)` teste donc réellement le bit d'action, sans appel `/roles/actions-map`.
- **Formulaire de rôle migré** : l'affichage et le pré-remplissage des permissions/actions s'appuient désormais sur les masques `totalActions` / `totalActionsAccordees` (`/roles/permissions/actions`, `/roles/actions-map`), plus sur la liste `actions` dépréciée.
- **Actions de tableau contrôlées par permission** : l'ancien champ `roles: string[]` de `TableAction` / `HeaderAction` a été supprimé (le filtrage par rôle brut était inopérant pour les en-têtes). Le masquage des boutons (Ajouter, Modifier, Supprimer, activer/désactiver) se fait désormais **dans chaque page** via `usePermissions().hasPermission(PERM.*, ACT.*)` avant d'ajouter l'action au tableau. Exemple : `AdminListPage` n'ajoute « Ajouter un utilisateur » que si `MANAGE_USERS` + `INSERT`.
- **Recovery redirect** : `RecoveryProtectedRoute` redirige vers `/reccuperation-comptes` (correction apportée vs ancienne version pointant vers `/forgot-password`).
- **SelfRoute** : se base sur `userId` numérique et `id` URL (converti via `Number(id)`). À vérifier si `id` peut ne pas être un nombre valide. Aucune permission ni action n'est consultée, y compris pour le `SUPER_ADMIN` (règle « seul moi »).
- **SuperAdminRoute supprimé** : les pages `/admin/dashboard-admin`, `/admin/admins` et `/admin/roles` sont protégées par `PermissionRoute` (permission + action). Le `SUPER_ADMIN` y accède via le bypass de `usePermissions` (`user.role === "SUPER_ADMIN"` → `true`), plus par un garde de rôle dédié.
- **Rapports globaux vs rapports personnels** : `/admin/dashboard-admin` exige `MANAGE_GLOBAL_REPORTS` (+ `SELECT`), permission que le backend n'accorde qu'au rôle `SUPER_ADMIN` ; `VIEW_REPORTS` reste la porte d'entrée du tableau de bord personnel (`/admin`) et des rapports de projet.
- **Redirections par permission (plus par rôle)** : `UserListPage` redirige vers `/admin/admins` dès que `hasPermission(MANAGE_ADMINS, SELECT)` (et non plus `role === "SUPER_ADMIN"`) ; `CreateUserPage` redirige de la même façon après création et ne propose tous les rôles qu'à ce profil. Un simple gestionnaire d'utilisateurs (`MANAGE_USERS` sans `MANAGE_ADMINS`) reste sur `/admin/users`.
- **Aucun lazy loading** : toutes les pages sont importées statiquement. Acceptable pour cette app, mais impacte la taille initiale du bundle.