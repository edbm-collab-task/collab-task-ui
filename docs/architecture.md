# Architecture

Vue d'ensemble de l'application : couches, flux de données, rôle de chaque dossier, arborescence réelle et alias `@`. Pour les routes et permissions, voir [routing-et-permissions.md](./routing-et-permissions.md) ; pour l'API en détail, voir [couche-api.md](./couche-api.md).

## Vue d'ensemble

`collab-task-ui` est une SPA React sans backend propre : elle consomme une API Spring Boot (`VITE_API_BASE_URL`, port `8090`).

| Catégorie | Outil | Version (`package.json`) |
|---|---|---|
| Framework | `react` / `react-dom` | ^19.2.7 |
| Build | `vite` + `@vitejs/plugin-react` | ^8.1.1 / ^6.0.3 |
| Langage | `typescript` | ~6.0.2 |
| Routing | `react-router-dom` | ^7.11.0 |
| HTTP | `axios` | ^1.18.1 |
| Formulaires | `react-hook-form` | ^7.82.0 |
| CSS | `tailwindcss` + `@tailwindcss/vite` | ^4.3.3 |
| Temps réel | `@stomp/stompjs` (WebSocket STOMP) | ^7.3.0 |
| Icônes | `lucide-react` | ^1.26.0 |
| Feedback | `react-hot-toast`, `sweetalert2` | ^2.6.0 / ^11.26.25 |
| Graphiques | `chart.js` + `react-chartjs-2` | ^4.5.1 / ^5.3.1 |
| Sanitisation | `dompurify` | ^3.4.14 |
| Lint | `oxlint` (devDependency) | ^1.71.0 |

Scripts : `dev` (vite), `build` (`tsc -b && vite build` — le type-check bloque le build), `lint` (oxlint), `preview`.

### Flux global

```
index.html
  └─ src/main.tsx            StrictMode > BrowserRouter > AuthProvider > RecoveryAuthProvider
       │                     + <Toaster> (react-hot-toast)
       └─ src/App.tsx        <ErrorBoundary>
            └─ src/router/index.tsx
                 ├─ routes publiques  (/, /login, /register, recovery…)
                 └─ /admin → ProtectedRoute → AdminLayout (<Outlet/>)
                        └─ PermissionRoute | SelfOrPermissionRoute | SuperAdminRoute

Page  →  hook (useXxx) ou service (xxxService)
     →  apiClient  (retourne response.data)
     →  api axios  (Bearer depuis localStorage, refresh 401 en file d'attente, toasts globaux)
     →  API Spring Boot (VITE_API_BASE_URL)

Temps réel : STOMP pour la messagerie uniquement
Polling 30 s : notifications et compteur de messages non lus
```

## Les couches

Règle d'or : **les pages n'importent jamais axios directement** et n'écrivent jamais d'URL en dur.

```
pages/ ou hooks/  ──►  services/ (xxxService)  ──►  api/api-client  ──►  api/axios
                                                                     ──►  api/constants (API_ENDPOINTS)
```

1. **`src/api/axios.ts`** — instance unique (`baseURL` = `VITE_API_BASE_URL`, timeout 10 s, `withCredentials: true`) :
   - *request interceptor* : injecte `Authorization: Bearer` depuis `localStorage.accessToken` ;
   - *response interceptor* : sur un **401**, un seul refresh à la fois (`isRefreshing` + file `failedQueue` pour les requêtes en attente), appel de `/auth/refresh` ; en cas d'échec, purge des tokens et redirection `window.location.href = "/login"` ; ensuite, toasts d'erreur globalisés par code statut (400/401/403/404/409/500) sauf si la requête porte le drapeau `silent`.
2. **`src/api/api-client.ts`** — wrapper `get/post/put/patch/delete<T>` qui renvoie directement `response.data` et propage les options (`silent`, `responseType`).
3. **`src/api/constants.ts`** — `API_CONFIG` (URL de base, timeout) et `API_ENDPOINTS` : table centrale de toutes les URL, avec constructeurs de chemins paramétrés (ex. `API_ENDPOINTS.COMMENTS.REACTIONS(taskId, commentId)`).
4. **`src/services/`** — 16 services, un objet exporté par domaine (`taskService`, `authService`, `userService`, …) : la seule couche autorisée à construire des appels. Un cas particulier : `services/dashboard/` distingue les erreurs métier (`StatsNotAvailableError`) des erreurs réseau.

Le reste de l'état vit dans les pages/composants (`useState` + `useEffect`), avec 2 Context React globaux (voir [etat-et-formulaires.md](./etat-et-formulaires.md)) et des hooks métier extraits (`useMessages`, `useConversations`, `useUnreadMessageCount`, `useDashboardPeriod`).

**Temps réel** : `components/message/message.socket.ts` — singleton STOMP (conversion `http→ws` de l'URL de base, auth par header Bearer, abonnement `/topic/conversations/{id}`). Notifications et non-lus sont en **polling 30 s**, pas en WebSocket.

## Rôle de chaque dossier

| Dossier | Rôle |
|---|---|
| `src/api/` | Couche HTTP de bas niveau : instance axios, wrapper `apiClient`, table `API_ENDPOINTS` |
| `src/router/` | Déclaration unique des routes (`index.tsx`) + les 5 guards (`ProtectedRoute`, `PermissionRoute`, `SelfOrPermissionRoute`, `SuperAdminRoute`, `RecoveryProtectedRoute`) |
| `src/pages/` | Écrans, un import = une route ; sous-dossiers `auth/`, `admin/<domaine>/`, `user/` |
| `src/components/` | Composants regroupés **par domaine fonctionnel** : `admin/`, `kanban/`, `message/`, `table/`, `Form/`, `common/`, `details/`, `modal/`, `notification/`, `project/`, `user/`, `direction/` |
| `src/services/` | 16 services (`xxx.service.ts` → objet `xxxService`), un par domaine métier |
| `src/contexts/` | Les 2 Context globaux : `AuthProvider.tsx` (session), `RecoveryAuthProvider.tsx` (récupération de mot de passe) |
| `src/hooks/` | 13 hooks : session/permissions (`useAuth`, `usePermissions`, `useRecoveryAuth`), métier (`useMessages`, `useConversations`, `useUnreadMessageCount`, `useDashboardPeriod`), UI (`useDebounce`, `useClickOutside`, `useEscapeKey`, `useIsMobile`, `useMultiSelect`, `useToggle`) |
| `src/types/` | 18 fichiers de contrats API, convention `*Req` (corps envoyé) / `*Res` (réponse reçue) + types UI (`table.ts`) |
| `src/enum/` | Codes énumérés en objets `as const` (`role.enum.ts`, `gender.enum.ts`) — les `enum` TS sont interdits (voir contraintes plus bas) |
| `src/mappers/` | Conversions DTO ↔ type UI, fonctions `toXxx` (`auth.mapper.ts`, `direction.mapper.ts`, `status.mapper.ts`) |
| `src/constants/` | Libellés d'affichage (`roleLabels.ts`, `permissionCategoryLabels.ts`) |
| `src/constant/` | **Homonyme singulier** : `routes.ts` uniquement, quasi inutilisé — vérifier l'orthographe avant d'importer |
| `src/utils/` | Fonctions pures : `avatar`, `date`, `format`, `image`, `roleCode`, `sparkline`, `taskTree`, `time` |
| `src/assets/` | Images importées en modules (`logo.png`, `hero.png`) |

## Arborescence réelle

```
src/
├── main.tsx              # Bootstrap (providers + Toaster)
├── App.tsx               # <ErrorBoundary><Router/></ErrorBoundary>
├── index.css             # Style global : @import "tailwindcss" + tokens @theme
│
├── api/
│   ├── axios.ts          # instance + intercepteurs (refresh, toasts)
│   ├── api-client.ts     # wrapper retournant response.data
│   └── constants.ts      # API_CONFIG + API_ENDPOINTS
│
├── router/
│   ├── index.tsx         # <Routes> complet (imports statiques, pas de lazy)
│   ├── ProtectedRoute.tsx
│   ├── PermissionRoute.tsx
│   ├── SelfOrPermissionRoute.tsx
│   ├── SuperAdminRoute.tsx
│   └── RecoveryProtectedRoute.tsx
│
├── pages/
│   ├── auth/             # LoginPage, RegisterPage, recovery/, verification/
│   ├── admin/            # direction/, message/, notification/, project/, superadmin/, user/
│   ├── user/             # SearchUserPage (/reccuperation-comptes)
│   └── NotFoundPage.tsx
│
├── components/
│   ├── admin/            # AdminLayout, Sidebar, Navbar, AdminMenu, Dashboard,
│   │                     # AdminNavigation.config.ts, dashboard/, skeleton/
│   ├── Form/             # Moteur de formulaires : Forms.ts, GlobalForm, GlobalEditForm,
│   │                     # FormFieldControl, formLogic
│   ├── table/            # GlobalTable<T>, createColumns, Header/Filter/Pagination/Search/Actions
│   ├── kanban/           # KanbanBoard, TaskCard, TaskModal, CommentPanel, Mention*, ReactionPicker…
│   ├── message/          # ConversationSidebar, Message*, modales + message.socket.ts (STOMP)
│   ├── common/           # BackButton, ConfirmPopup, EmptyState, ErrorBoundary, Spinner…
│   ├── details/          # globalDetail.tsx (DetailModal), userDetails.tsx
│   ├── modal/            # confirmDelete.ts (SweetAlert2)
│   ├── notification/     # NotificationBell.tsx
│   ├── project/          # ProjectContributorsSection, ProjectStatusSection, confirmConfig.ts
│   ├── user/             # Schémas de formulaires (*.ts) + composants profil, auth/
│   └── direction/        # directionForm.ts
│
├── services/             # un dossier par domaine, un fichier xxx.service.ts
│   ├── activity/ attachment/ auth/ comment/ contributor/ direction/
│   ├── message/ notification/ project/ role/ status/ task/ user/
│   └── dashboard/        # dashboard.service.ts, adminDashboard.service.ts, errors.ts
│
├── contexts/             # AuthProvider.tsx, RecoveryAuthProvider.tsx
├── hooks/                # 13 hooks useXxx.ts
├── types/                # 18 fichiers de contrats (*Req/*Res…)
├── enum/                 # role.enum.ts, gender.enum.ts (objets as const)
├── mappers/              # auth.mapper.ts, direction.mapper.ts, status.mapper.ts
├── constants/            # roleLabels.ts, permissionCategoryLabels.ts
├── constant/             # routes.ts (singulier — homonyme déroutant)
├── utils/                # avatar, date, format, image, roleCode, sparkline, taskTree, time
└── assets/               # logo.png, hero.png
```

### Fichiers de configuration à la racine

| Fichier | Rôle |
|---|---|
| `package.json` | Dépendances et scripts (`dev`, `build`, `lint`, `preview`) |
| `tsconfig.json` | Config « solution » : `files: []` + `references` vers `tsconfig.app.json` et `tsconfig.node.json` |
| `tsconfig.app.json` | Type-check de `src/` (options critiques, voir ci-dessous) |
| `tsconfig.node.json` | Type-check de `vite.config.ts` uniquement |
| `vite.config.ts` | Plugins `react()` + `tailwindcss()`, alias `@` |
| `.oxlintrc.json` | Linter oxlint (plugins react, typescript, oxc) |
| `index.html` | Point d'entrée HTML |
| `.env` | `VITE_API_BASE_URL`, `VITE_APP_NAME` (gitignoré) |

## Point d'entrée et bootstrap

`src/main.tsx` monte, dans l'ordre : `StrictMode` → `BrowserRouter` → `AuthProvider` → `RecoveryAuthProvider` → `<App />` + `<Toaster position="top-right" />`.

`src/App.tsx` enveloppe le routeur d'un `ErrorBoundary` (`components/common/ErrorBoundary.tsx`), puis rend `src/router/index.tsx` :

- **routes publiques** : `/` et `/login` → `LoginPage`, `/register` → `RegisterPage` ;
- **`/admin`** : enveloppé dans `ProtectedRoute` + `AdminLayout` (qui fournit `<Outlet/>`, Sidebar et Navbar), avec toutes les routes enfants imbriquées (users, directions, projects, messages, notifications, + 3 routes super-admin) ;
- **flux recovery** : `/information-personnelle` et `/verification` sous `RecoveryProtectedRoute` ; `/reccuperation-comptes` → `SearchUserPage` ;
- **`*`** → `NotFoundPage`.

Tous les imports sont **statiques** : aucun `React.lazy`, donc un bundle unique au build. Le menu admin est déclaré séparément dans `components/admin/AdminNavigation.config.ts` et doit rester en accord avec `router/index.tsx` (double source de vérité — voir [routing-et-permissions.md](./routing-et-permissions.md)).

## Alias `@` et contraintes TypeScript

L'alias `@/` est déclaré **deux fois** et les deux déclarations doivent rester synchrones :

| Fichier | Clé |
|---|---|
| `tsconfig.app.json` | `compilerOptions.baseUrl` + `compilerOptions.paths` (`"@/*": ["./src/*"]`) |
| `vite.config.ts` | `resolve.alias` (`"@": path.resolve(__dirname, "./src")`) |

Toujours importer via l'alias plutôt que des chemins relatifs profonds :

```ts
import UserListPage from "@/pages/admin/user/UserListPage";
```

Options de `tsconfig.app.json` qui façonnent le code :

| Option | Conséquence pratique |
|---|---|
| `verbatimModuleSyntax` | `import type` obligatoire pour les types : `import { TaskRes }` casse le build |
| `erasableSyntaxOnly` | Les `enum` TS sont interdits → objets `as const` dans `src/enum/` |
| `noUnusedLocals` / `noUnusedParameters` | Un import ou une variable inutilisé fait échouer `npm run build` |
| `noFallthroughCasesInSwitch` | `case` sans `break`/`return` interdit |
| `moduleResolution: "bundler"` | Pas d'extensions de fichier dans les imports |
| **`strict` absent** | Le type-check n'est **pas strict** : pas de contrôle de nullabilité |
| `types: ["vite/client"]` | Typage des variables `import.meta.env` |

Le type-check tourne dans `npm run build` (`tsc -b && vite build`) : il n'y a pas de script `typecheck` séparé. Checklist avant de pousser : [outillage-qualite.md](./outillage-qualite.md).

## Styling

Tailwind CSS **v4** en mode utility-first, classes inline partout — pas de CSS Modules, styled-components ni Sass. La configuration vit dans le CSS : `src/index.css` contient `@import "tailwindcss"` puis un bloc `@theme` définissant les tokens (`--color-primary: #6b356b`, `--color-secondary`, `--color-accent`, le breakpoint `xs`, la police Montserrat, les animations `fade-in`/`scale-in`), utilisés comme `bg-primary`, `text-secondary/70`, etc.
