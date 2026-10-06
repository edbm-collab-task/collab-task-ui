# Bonnes pratiques

Conventions de nommage, règles de structure et procédures d'ajout de fonctionnalité. Le but est de produire du code qui se confond avec ce qui existe déjà.

## Nommage

| Cible | Convention | Exemples |
|---|---|---|
| Composants React | `PascalCase.tsx`, un composant principal par fichier | `TaskCard.tsx`, `GlobalTable.tsx`, `UserListPage.tsx` |
| Pages | `PascalCase.tsx`, suffixe `Page` ou `*Page` | `ProjectFormPage.tsx`, `LoginPage.tsx` |
| Hooks | `useXxx.ts`, export par défaut | `useAuth.ts`, `useMessages.ts` |
| Services | `xxx.service.ts`, un objet exporté `<ressource>Service` | `task.service.ts` → `taskService` |
| Types | `xxx.ts` en `camelCase` | `types/task.ts`, `types/user.ts` |
| Enums / codes | `xxx.enum.ts` | `role.enum.ts`, `gender.enum.ts` |
| Constantes d'affichage | `xxxLabels.ts` dans `constants/` | `permissionCategoryLabels.ts` |
| Schémas de formulaire | `xxxForm.ts` ou `xxxFormFields` | `createUserForm.ts`, `user/auth/loginForm.ts` |
| Mappers | `xxx.mapper.ts`, fonction `toXxx` | `auth.mapper.ts` → `toRecoverPasswordRequest` |
| Utilitaires | `xxx.ts` en `camelCase` | `utils/taskTree.ts` → `buildColumnTaskTrees` |
| Guards | `XxxRoute.tsx` | `PermissionRoute.tsx` |
| Fichiers mixtes à éviter | éviter les `.tsx` qui ne rendent pas de JSX | `components/user/EditUser.tsx` est un schéma, pas un composant |

> **⚠️ Attention aux dossiers homonymes.** Il existe `src/constant/` (singulier, chemins d'URL) **et** `src/constants/` (pluriel, libellés d'affichage). Vérifier l'orthographe avant d'importer : les deux existent, et leurs usages sont différents (voir [types-enums-donnees.md](./types-enums-donnees.md)).

## Règles d'import

```ts
import type { TaskRes } from "@/types/task";      // OUI : type pur
import { TaskRes } from "@/types/task";           // NON : casse le build (verbatimModuleSyntax)

import UserListPage from "@/pages/admin/user/UserListPage";   // OK (alias @)
```

- Toujours l'alias `@/` plutôt que des chemins relatifs profonds (`../../../`).
- Aucun barrel : les services, hooks et utilitaires s'importent en chemin profond (`@/services/task/task.service`).
- Les deux blocs d'imports (types puis valeurs) doivent rester séparés.

## Règles de structure

| À | Faites-le | Ne faites pas |
|---|---|---|
| Appeler l'API | ajouter une méthode à un service | importer `api`/`apiClient` depuis une page, un hook ou un composant |
| Construire une URL | ajouter l'entrée dans `API_ENDPOINTS` | écrire `"/users/${id}"` dans un service |
| Construire une URL d'image | `utils/image.ts` (`getUserImageUrl`) | concaténer `VITE_API_BASE_URL` à la main |
| Choisir une permission | vérifier `usePermissions` + les routes existantes | inventer une chaîne de permission sans support backend |
| Masquer une entrée de menu | la brancher dans `AdminNavigation.config.ts` | filtrer dans `AdminMenu.tsx` |
| Afficher un loader | `Spinner` / un skeleton existant | dessiner un spinner maison |
| Confirmer une action | `ConfirmPopup` | `window.confirm`, `window.alert`, SweetAlert2 |
| Sanitiser du HTML | `DOMPurify.sanitize()` avant `dangerouslySetInnerHTML` | insérer un contenu du backend non assaini |
| Lire une erreur API | `catch { /* toast déjà fait */ }` ou `{ silent: true }` + message | dupliquer l'extraction de `error.response.data.message` si l'intercepteur suffit |
| Ajouter une dépendance | vérifier d'abord qu'elle n'est pas déjà là, et l'utiliser dans `src/` | ajouter une paquete qui reste sans import |

## Procédure : ajouter une route

1. Créer la page dans le dossier d'espace correspondant (`src/pages/admin/<domaine>/`).
2. Si elle a besoin de données, ajouter le service puisque les pages n'appellent jamais axios directement.
3. Dans `src/router/index.tsx` : importer la page, l'insérer sous `/admin` (pour bénéficier du layout et de la protection), et envelopper avec le bon guard :
   - aucun guard supplémentaire → protégée par `ProtectedRoute` uniquement (auto-service) ;
   - `permission="..."` → `PermissionRoute` ;
   - propriétaire ou permission → `SelfOrPermissionRoute` ;
   - `role === "SUPER_ADMIN"` strict → `SuperAdminRoute`.
4. Si elle doit être visible dans le menu : ajouter une entrée dans `AdminNavigation.config.ts` avec son `permission`.
5. Vérifier que l'entrée du menu et la route déclarent **la même permission**.
6. Tester : l'utilisateur sans permission doit être redirigé vers `/admin`, pas vers une page vide.

## Procédure : ajouter un formulaire

1. Définir `FormField<MonReq>[]` dans `src/components/<domaine>/monForm.ts` (+ `validation` inline, `matchField` pour une confirmation).
2. Charger les `options` de `<select>` via le service si elles viennent de l'API.
3. Rendre avec `GlobalForms<T>` (création) ou `GlobalEditForm<T>` (édition) :
   ```tsx
   <GlobalForms form={form} fields={monFormFields} onSubmit={onSubmit} submitLabel="Créer" />
   ```
4. Pour les champs non supportés (fichier, date, radio), soit utiliser le `defaultValues`/contrôleur manuel, soit étendre `FormFieldControl.tsx`.
5. Gérer le retour : `try { await service.create(valeurs); navigate(-1); } catch {}` — l'intercepteur affiche déjà l'erreur.
6. Rappel : la validation est **client uniquement**, le backend doit aussi vérifier.

## Procédure : ajouter un endpoint

1. Ajouter l'URL dans `src/api/constants.ts` :
   ```ts
   MON_RESSOURCE: { ALL: "/mon-ressource", BY_ID: "/mon-ressource" },
   ```
2. Créer le service dans `src/services/mon-ressource/mon-ressource.service.ts` :
   ```ts
   export const monRessourceService = {
       getAll: () => apiClient.get<MonRes[]>(API_ENDPOINTS.MON_RESSOURCE.ALL),
       create: (data: MonReq) => apiClient.post<MonRes, MonReq>(API_ENDPOINTS.MON_RESSOURCE.ALL, data),
   };
   ```
3. Définir les types `MonReq` / `MonRes` dans `src/types/`.
4. Ajouter `{ silent: true }` si l'appelant traite lui-même l'erreur.
5. Pour un fichier : utiliser `api.post` direct avec `Content-Type: multipart/form-data` (comme `attachment.service.ts`).
6. Tester les trois cas : succès, 4xx (toast global attendu), réseau coupé.

## Procédure : ajouter un hook

- Si l'état concerne une page → garder le state dans la page ou dans un hook local au dossier `src/pages/…`.
- S'il concerne plusieurs pages → créer `src/hooks/useXxx.ts`, export par défaut, garder les effets de bord dans le hook (comme `useMessages`).
- Avant d'écrire un nouveau comportement utilitaire (`debounce`, clic hors zone, touche Échap…) → vérifier `src/hooks/` : `useDebounce`, `useClickOutside`, `useEscapeKey`, `useToggle`, `useIsMobile`, `useMultiSelect` existent déjà.

## Règles de PR

Voir [git-et-contribution.md](./git-et-contribution.md) pour le flux ; ici le contenu technique :

- **Un PR = un sujet**. Ne pas mêler un refactoring de style à une correction fonctionnelle.
- **Message en anglais**, Conventional Commits : `feat(message): add unread badge`, `fix(task): prevent circular parent chain`.
- **Vérifier avant de pousser** :
  ```bash
  npm run lint
  npm run build
  ```
  Le second est indispensable : sans lui, les imports inutilisés et les erreurs de types ne sont détectés par personne.
- **Ne pas introduire de `// eslint-disable-*`** : le projet n'utilise pas ESLint, ces commentaires sont sans effet (ils sont déjà présents à 7 endroits).
- **Décrire le test manuel effectué** dans la description du PR (aucune couverture automatique n'existe).

## Style du code

Aucun formatter automatisé : respecter le style environnant.

- Indentation **4 espaces**, chaînes avec guillemets doubles, points-virgules présents.
- Pas de commentaire de code explicatif du code évident ; le JSDoc est apprécié sur les guards et les hooks (« Utilisé par : … »).
- Privilégier les commentaires explicatifs de **comportement** ou de **décision** (ex. le JSDoc de `RecoveryProtectedRoute` qui signale le bug de redirection).
- Les messages de toasts et les libellés utilisateur sont en **français** ; les identifiants de code et les messages de commit en **anglais**.
- Les types explicites là où l'inférence serait obscurcie, mais pas de `as any` ajouté : `apiClient` en contient déjà 5 par défaut.