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
| `PermissionRoute` | Permission requise | Reçoit `permission: PermissionName`. Vérifie via `usePermissions().hasPermission(permission)`. SUPER_ADMIN bypass (implémenté dans `usePermissions`). Si manquant → redirige vers `/admin`. |
| `SelfOrPermissionRoute` | Soi-même OU permission | Compare `user.userId === Number(id)` (paramètre `:id` de l'URL) OU `hasPermission(permission)`. Autorise si l'un des deux est vrai. Sinon redirige vers `/admin`. Utilisé pour l'édition d'un utilisateur par lui-même ou par un gestionnaire. |
| `SuperAdminRoute` | Rôle strict SUPER_ADMIN | Vérifie `user.role === "SUPER_ADMIN"`. Affiche un spinner pendant `loading`. Sinon redirige vers `/admin`. |
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
| `/admin/users` | `PermissionRoute` (`VIEW_USERS`) | `UserListPage` | Liste des utilisateurs |
| `/admin/users/create` | `PermissionRoute` (`MANAGE_USERS`) | `CreateUserPage` | Création d'utilisateur |
| `/admin/users/edit-role` | `PermissionRoute` (`MANAGE_USERS`) | `EditUserRolePage` | Édition des rôles |
| `/admin/users/profile` | — | `UserProfile` | Profil utilisateur (sans guard explicite; sous `ProtectedRoute`) |
| `/admin/users/:id/edit` | `SelfOrPermissionRoute` (`MANAGE_USERS`) | `EditUserPage` | Édition : soit soi-même, soit avec permission MANAGE_USERS |
| `/admin/users/change-pwd` | — | `ChangePwdPage` | Changement mot de passe (sous `ProtectedRoute`) |

#### Gestion des directions
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/directions` | `PermissionRoute` (`MANAGE_DIRECTIONS`) | `DirectionsListPage` | Liste des directions |
| `/admin/directions/create` | `PermissionRoute` (`MANAGE_DIRECTIONS`) | `CreateDirection` | Création d'une direction |

#### Gestion des projets
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/projects` | `PermissionRoute` (`MANAGE_PROJECTS`) | `ProjectListPage` | Liste des projets |
| `/admin/projects/create` | `PermissionRoute` (`MANAGE_PROJECTS`) | `ProjectFormPage` (`mode="create"`) | Création de projet |
| `/admin/projects/:id` | `PermissionRoute` (`MANAGE_PROJECTS`) | `ProjectDetailPage` | Détail d'un projet |
| `/admin/projects/:id/edit` | `PermissionRoute` (`MANAGE_PROJECTS`) | `ProjectFormPage` (`mode="edit"`) | Édition de projet |
| `/admin/projects/:id/history` | `PermissionRoute` (`MANAGE_PROJECTS`) | `ActivityHistoryPage` | Historique d'activité du projet |

#### Messagerie & notifications
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/messages` | — | `MessagePage` | Messagerie (sous `ProtectedRoute` uniquement) |
| `/admin/notifications` | — | `NotificationsPage` | Notifications (sous `ProtectedRoute` uniquement) |

#### Administration (SuperAdmin uniquement)
| Chemin | Guard | Composant | Notes |
|---|---|---|---|
| `/admin/dashboard-admin` | `SuperAdminRoute` | `AdminDashboard` | Dashboard spécifique aux super-admins |
| `/admin/admins` | `SuperAdminRoute` | `AdminListPage` | Gestion des administrateurs |
| `/admin/roles` | `SuperAdminRoute` | `RoleListPage` | Gestion des rôles et permissions |

### Route fallback
| Chemin | Composant | Notes |
|---|---|---|
| `*` | `NotFoundPage` | Toute route non matchée renvoie 404 |

## Menu de navigation

Le menu est déclaré dans `src/components/admin/AdminNavigation.config.ts`.

### Menu principal (`menus`)
| Élément | Chemin | Icône | Permission requise |
|---|---|---|---|
| Dashboard | `/admin` | `LayoutDashboard` | — (toujours visible si connecté) |
| Projets | `/admin/projects` | `FolderKanban` | `MANAGE_PROJECTS` |
| Utilisateurs | `/admin/users` | `Users` | `VIEW_USERS` |
| Directions | `/admin/directions` | `Building2` | `MANAGE_DIRECTIONS` |
| Message | `/admin/messages` | `MessageCircle` | — |
| Notifications | `/admin/notifications` | `Bell` | — |

### Menu SuperAdmin (`superAdminMenus`)
| Élément | Chemin | Icône | Notes |
|---|---|---|---|
| Dashboard Admin | `/admin/dashboard-admin` | `BarChart2` | Affiché uniquement aux SUPER_ADMIN |
| Administrateurs | `/admin/admins` | `Shield` | Gestion des admins |
| Rôles & Permissions | `/admin/roles` | `Settings` | Gestion rôles/permissions |

**Important** : `AdminNavigation.config.ts` et `router/index.tsx` doivent rester synchrones. C'est une "double source de vérité" relevée dans la documentation.

## Constantes de routes

Un fichier homonyme existe : `src/constant/routes.ts` (singulier) vs la sémantique "routes" du router. Il contient uniquement :
```ts
export const ROUTES = { HOME: "/", LOGIN: "/login", USERS: "/users", ADMIN: "/admin" } as const;
```

Seul `ROUTES.HOME` est utilisé (`NotFoundPage`). `USERS` pointe vers `/users` (route inexistante dans l'app) — ce fichier est peu utilisé et peut prêter à confusion. Préférer utiliser les chemins directement dans le router ou unifier.

## Points d'attention

- **Typage permissions** : les guards (`PermissionRoute`, `SelfOrPermissionRoute`), le menu (`AdminNavigation.config.ts`) et `usePermissions` sont typés `PermissionName` et reçoivent des constantes `PERM.*` — une faute de frappe est désormais une erreur TypeScript.
- **Actions contrôlées côté client** : `/auth/me` renvoie `permissions: PermissionSummary[]` (`totalActionsAccordees`) ; `usePermissions().hasPermission(perm, action)` teste donc réellement le bit d'action, sans appel `/roles/actions-map`.
- **Formulaire de rôle migré** : l'affichage et le pré-remplissage des permissions/actions s'appuient désormais sur les masques `totalActions` / `totalActionsAccordees` (`/roles/permissions/actions`, `/roles/actions-map`), plus sur la liste `actions` dépréciée.
- **Recovery redirect** : `RecoveryProtectedRoute` redirige vers `/reccuperation-comptes` (correction apportée vs ancienne version pointant vers `/forgot-password`).
- **SelfOrPermissionRoute** : se base sur `userId` numérique et `id` URL (converti via `Number(id)`). À vérifier si `id` peut ne pas être un nombre valide.
- **SuperAdmin vs permissions** : `SuperAdminRoute` vérifie le rôle brut (`SUPER_ADMIN`), alors que `PermissionRoute` délègue à `usePermissions` qui inclut un bypass pour SUPER_ADMIN.
- **Aucun lazy loading** : toutes les pages sont importées statiquement. Acceptable pour cette app, mais impacte la taille initiale du bundle.