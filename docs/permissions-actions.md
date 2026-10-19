# Permissions et actions

Le contrôle d'accès combine deux notions : une **permission** (une capacité métier, ex. `MANAGE_PROJECTS`) et des **actions** (ce qu'on peut faire dessus : lire, créer, modifier…). Chaque action porte un **code binaire**, et les actions accordées sont regroupées en un seul entier par une somme de bits — sur le modèle des permissions Unix.

## Modèle binaire

**Les codes ne sont jamais écrits à la main côté front** : ils proviennent de la table de conversion backend `GET /roles/actions`. Le tableau courant (observé sur l'API) :

| Action | Code | Bit |
|---|---|---|
| `INSERT` | 1 | `0000001` |
| `SELECT` | 2 | `0000010` |
| `UPDATE` | 4 | `0000100` |
| `DELETE` | 8 | `0001000` |
| `EXPORT` | 32 | `0100000` |
| `DOWNLOAD` | 64 | `1000000` |
| `ARCHIVE` | 128 | `10000000` |

> Le bit 16 est absent : le backend ne définit plus `GENERATE_REPORT` (retiré aussi du front, jamais utilisé). L'écart dans les puissances de deux est normal — seuls les codes exposés par l'API comptent.

Les codes sont des puissances de deux : les combiner par un OU binaire (la « somme ») donne un entier unique et sans ambiguïté. Exemples :

| Sélection | Calcul | Masque |
|---|---|---|
| `SELECT` | `2` | `2` |
| `SELECT + INSERT` | `2 \| 1` | `3` |
| `SELECT + INSERT + UPDATE` | `2 \| 1 \| 4` | `7` |
| toutes les actions | `1 \| 2 \| 4 \| 8 \| 32 \| 64 \| 128` | `239` |

Tester une action revient à vérifier que son bit est positionné : `(masque & action) === action`.

## Constantes

### `src/constants/actions.ts`

Le fichier ne déclare que la **liste des noms** (`ACTION_NAMES`, clés de `ACT`) ; les **valeurs sont hydratées au démarrage** depuis `GET /roles/actions` (voir « Hydratation du catalogue »).

| Export | Rôle |
|---|---|
| `ACTION_NAMES` | Liste **statique** des noms d'actions (ordre d'affichage UI stable) |
| `ACT` | Table `nom → code`, clés statiques, **valeurs à 0 jusqu'à l'hydratation** (`ACT.INSERT`, `ACT.SELECT`, …) |
| `ACTION_LABELS` | Libellés FR affichables, remplis depuis `ActionResDto.label` du backend |
| `ALL_ACTIONS` | Masque de toutes les actions, recalculé après hydratation (OU binaire des codes reçus) |
| `hydrateActionCatalog(catalog)` | Remplit `ACT`, `ACTION_LABELS` et `ALL_ACTIONS` depuis la réponse de `GET /roles/actions` |
| `hasAction(mask, action)` | `true` si le bit de `action` est présent dans `mask` (`undefined` ⇒ `false`) |
| `actionsToMask(actions)` | Reconstruit un masque depuis une liste de noms (cases à cocher → entier) |
| `maskToActions(mask)` | Inverse : décompose un masque en noms d'actions (actions possibles/accordées → cases à cocher) ; prend aussi en compte les noms ajoutés par l'hydration |
| `ActionName` / `ActionCode` | `ActionName` = union des noms statiques ; `ActionCode` = `number` (la valeur n'est connue qu'après hydratation) |

### Hydratation du catalogue (`hydrateActionCatalog`)

- **Appariement par nom** (plain text) : chaque entrée de l'API est retrouvée dans `ACT` par son `name` — si l'ordre ou le nombre d'actions diffère côté backend, seuls les noms comptent. Les noms inconnus du front sont ajoutés à `ACT` pour rester décodables dans les masques.
- **Mutation sur place** : `ACT` garde la même référence objet, les ~24 fichiers importeurs fonctionnent sans changement.
- **Déclenchement** : `AuthProvider` appelle `roleService.getActions()` (appel `silent`) **avant** `refreshUser()` au montage ; `loading` (skeleton) ne passe à `false` qu'une fois les deux terminés — les pages ne rendent jamais avec un catalogue vide.
- **Fail-closed** : en cas d'échec de l'appel, les codes restent à `0` → `hasAction` ne détecte rien → les éléments permissionnés sont masqués (aucun toast au démarrage).

### `src/constants/permissions.ts`

| Export | Rôle |
|---|---|
| `PERM` | Les noms exacts des permissions renvoyées par l'API (`PERM.MANAGE_PROJECTS`, `PERM.MANAGE_USERS`, …) |
| `PermissionName` | Type dérivé de `PERM` |
| `PERMISSION_LABELS` | Libellés FR affichables (`MANAGE_PROJECTS → "Gérer les projets"`), plus courts que les `description` de l'API |
| `getPermissionLabel(name)` | Libellé d'une permission, ou nom technique en repli si inconnue |

La liste de `PERM` est issue de `GET /roles/permissions/actions` (11 permissions). **Toute permission ajoutée côté backend doit y être reportée** (dans `PERM` et `PERMISSION_LABELS`). À l'inverse, une action ajoutée au backend n'exige **aucune modification** du front : l'hydratation l'ajoute automatiquement à `ACT` (seul son usage explicite `ACT.NOUVELLE_ACTION` demande un ajout dans `ACTION_NAMES`).

## Composant `Allow`

`src/components/common/Allow.tsx` masque son contenu si l'utilisateur n'a pas la permission (et l'action) requise. Les enfants ne sont **pas montés** : leurs effets et requêtes ne sont donc pas déclenchés.

```tsx
<Allow perm={PERM.MANAGE_PROJECTS} action={ACT.INSERT}>
    <AddButton />
</Allow>
```

| Prop | Rôle |
|---|---|
| `perm` | Permission requise (`PermissionName`) |
| `action` | Action exigée sur la permission (`ActionCode`), optionnelle |
| `fallback` | Contenu de repli si la permission manque (rien par défaut) |

Le composant s'appuie sur `usePermissions().hasPermission(perm, action)` : il ne monte son contenu que si la permission est présente et, lorsque `action` est fournie, le bit accordé correspondant (voir « Masques d'actions portés par la session »).

Sites gardés par `<Allow>` (permission + action) :

| Zone | Action gardée | Permission + action |
|---|---|---|
| Commentaires / pièces jointes (`CommentPanel`, `CommentItem`, `TaskModal`, `MessageComposer`) | insertion / modification / suppression | `MANAGE_COMMENTS`, `MANAGE_ATTACHMENTS` |
| Statuts de projet (`ProjectStatusSection`, `ProjectDetailPage`) | création / suppression | `MANAGE_STATUSES` + `INSERT` / `DELETE` |
| Tâches (`KanbanBoard`, `TaskCard`) | création / modification / suppression / glisser-déposer | `MANAGE_TASKS` + `INSERT` / `UPDATE` / `DELETE` |
| Projets (`ProjectListPage`, `ProjectDetailPage`) | création / édition / archivage | `MANAGE_PROJECTS` + `INSERT` / `UPDATE` |
| Rôles (`RoleForm`) | soumission | `MANAGE_ROLES` + `INSERT` / `UPDATE` |

## Forme des données reçues

### `GET /roles/actions`

Catalogue des actions (`ActionResDto`) : `{ codeAction, name, label }`. C'est la **table de conversion unique** : au démarrage, `AuthProvider` l'appelle (`roleService.getActions()`) et `hydrateActionCatalog` en déduit les codes de `ACT` et les libellés de `ACTION_LABELS`, par appariement de nom. Aucun code binaire n'est écrit en dur côté front.

### `GET /roles/permissions/actions`

Chaque permission (`PermissionActionsResDto`) porte le **masque** de ses actions possibles via `totalActions` :

```jsonc
{ "id": 3, "name": "MANAGE_PROJECTS", "description": "…",
  "categoryPermission": "PROJETS",
  "totalActions": 15 }        // 1|2|4|8 = INSERT, SELECT, UPDATE, DELETE
```

### `GET /roles/{id}/actions` et `GET /roles/actions-map`

Actions d'un rôle (`RoleActionsResDto`), regroupées par nom de permission. `actions-map` renvoie le même objet pour **tous** les rôles, indexé par identifiant (`Record<roleId, RoleActionsResDto>`) :

```jsonc
// GET /roles/actions-map
{ "1": { "label": "USER", "permissions": {
    "MANAGE_PROJECTS": { "totalActions": 15, "totalActionsAccordees": 0 } } } }
```

| Champ | Sens |
|---|---|
| `totalActions` | Masque des actions **possibles** pour la permission |
| `totalActionsAccordees` | Masque des actions **accordées** au rôle |

Les noms d'actions se déduisent de ces masques via `maskToActions`. Types correspondants : `Action`, `PermissionWithActionMask`, `RolePermissionActions`, `RoleActionsMapEntry`, `RoleActionsMap` dans `src/types/role.ts`.

## État actuel et migration

- **Formulaire de rôle migré** : `RoleForm` affiche les actions cochables depuis `totalActions` (`maskToActions` + `ACTION_LABELS`) et pré-remplit permissions/actions depuis `/roles/actions-map` (`totalActionsAccordees`), en édition comme via le sélecteur de modèle. Les permissions y sont titrées par `getPermissionLabel` (plus de nom technique).
- **Écriture inchangée** : `PUT /roles/{id}/actions` attend toujours `Record<nomPermission, string[]>`. La sélection de l'UI (noms d'actions) y est transmise telle quelle.
- **Masques portés par la session** : `/auth/me` (et `/auth/login`, `/auth/refresh`) renvoie `permissions: PermissionSummary[]` — `{ name, totalActions, totalActionsAccordees }`. `usePermissions().hasPermission(perm, action)` teste directement le bit `totalActionsAccordees`, sans appel `/roles/actions-map`.
- **Guards/menu migrés** : `PermissionRoute` (permission `PERM.*` **+ action `ACT.*`**, toutes deux obligatoires) et `SelfRoute` (profil personnel, sans permission) remplacent l'ancien `SelfOrPermissionRoute`/`SuperAdminRoute`. Le menu (`AdminNavigation.config.ts`) déclare lui aussi un couple permission + action, filtré par `AdminMenu` via `hasPermission` (plus de filtre par rôle brut) ; `Dashboard` reste typé `PermissionName`. Aucune chaîne littérale de permission ne subsiste dans `src/`. Les entrées de menu stockent le **nom** de l'action (`"SELECT"`, typé `ActionName`) et non son code : le module est évalué au chargement, avant l'hydratation de `ACT` ; `AdminMenu` résout le nom en code (`ACT[m.action]`) au moment du filtrage.

## Masques d'actions portés par la session

`/auth/me` expose `permissions: PermissionSummary[]` (nom + `totalActions` + `totalActionsAccordees`). Les masques accordés de l'utilisateur sont donc disponibles **directement dans la session**, sans appel dédié :

1. `usePermissions` lit `user.permissions` (normalisées) et résout, pour une permission, son `totalActionsAccordees` (`getGrantedMask`) ;
2. `hasPermission(perm)` vérifie la présence du nom ; `hasPermission(perm, action)` teste ensuite `(masque & action) === action` ;
3. le composant `<Allow>` (`src/components/common/Allow.tsx`) en dépend : il ne monte son contenu que si la permission est présente **et** le bit d'action accordé.

Un masque connu, y compris `0`, est appliqué strictement. `SUPER_ADMIN` court-circuite tout. Ce contrôle est **purement visuel** : le backend reste l'autorité.

**Repli (fail-open)** : `usePermissions` tolère la forme historique de la session (nom seul, `string`) en la normalisant en `{ name, totalActionsAccordees: undefined }`. Un masque absent ⇒ la seule présence de la permission vaut accord, ce qui évite de masquer toute l'interface si le backend ne renvoie pas encore les masques.

## Points d'attention

- **Ne pas utiliser de chaînes littérales** pour une permission : préférer `PERM.*`, sinon une faute de frappe passe inaperçue.
- **`PERM` doit rester synchronisée** avec la table des permissions du backend ; `ACT` ne l'est plus manuellement — il est hydraté depuis `GET /roles/actions` au démarrage.
- **Codes d'actions jamais écrits en dur** : seule la liste des noms (`ACTION_NAMES`) est statique. Les valeurs de `ACT` sont à `0` avant l'hydratation ; ne pas capturer `ACT.*` au niveau module (config de menu, constantes hors composant) — stocker le nom et résoudre via `ACT` au moment de l'usage.
- **`totalActions` ≠ `totalActionsAccordees`** : ne jamais tester une action contre `totalActions` (actions possibles) au lieu de `totalActionsAccordees` (actions accordées).
- **Ne pas se fier au champ `actions`** des réponses API : il sera retiré, seuls les masques `totalActions` / `totalActionsAccordees` sont pérennes.
- **Masques accordés portés par la session** : ils proviennent de `/auth/me` (`PermissionSummary.totalActionsAccordees`), plus de `/roles/actions-map` — ce dernier reste utilisé par le formulaire de rôle. Le backend reste l'autorité.
