# Permissions et actions

Le contrôle d'accès combine deux notions : une **permission** (une capacité métier, ex. `MANAGE_PROJECTS`) et des **actions** (ce qu'on peut faire dessus : lire, créer, modifier…). Chaque action porte un **code binaire**, et les actions accordées sont regroupées en un seul entier par une somme de bits — sur le modèle des permissions Unix.

## Modèle binaire

| Action | Code | Bit |
|---|---|---|
| `INSERT` | 1 | `000001` |
| `SELECT` | 2 | `000010` |
| `UPDATE` | 4 | `000100` |
| `DELETE` | 8 | `001000` |
| `GENERATE_REPORT` | 16 | `010000` |
| `EXPORT` | 32 | `100000` |

Les codes sont des puissances de deux : les combiner par un OU binaire (la « somme ») donne un entier unique et sans ambiguïté. Exemples :

| Sélection | Calcul | Masque |
|---|---|---|
| `SELECT` | `2` | `2` |
| `SELECT + INSERT` | `2 \| 1` | `3` |
| `SELECT + INSERT + UPDATE` | `2 \| 1 \| 4` | `7` |
| toutes les actions | `1 \| 2 \| 4 \| 8 \| 16 \| 32` | `63` |

Tester une action revient à vérifier que son bit est positionné : `(masque & action) === action`.

## Constantes

### `src/constants/actions.ts`

| Export | Rôle |
|---|---|
| `ACT` | Table `nom → code` (`ACT.INSERT = 1`, `ACT.SELECT = 2`, …) |
| `ALL_ACTIONS` | Masque de toutes les actions, **calculé** depuis `ACT` (`63`) — se met à jour automatiquement si la table change |
| `ACTION_LABELS` | Libellés FR affichables (`ACT.INSERT → "Insérer"`), alignés sur `ActionResDto.label` |
| `ACTION_NAMES` | Noms des actions dans l'ordre des codes (ordre d'affichage) |
| `hasAction(mask, action)` | `true` si le bit de `action` est présent dans `mask` (`undefined` ⇒ `false`) |
| `actionsToMask(actions)` | Reconstruit un masque depuis une liste de noms (cases à cocher → entier) |
| `maskToActions(mask)` | Inverse : décompose un masque en noms d'actions (actions possibles/accordées → cases à cocher) |
| `ActionName` / `ActionCode` | Types dérivés de `ACT` |

### `src/constants/permissions.ts`

| Export | Rôle |
|---|---|
| `PERM` | Les noms exacts des permissions renvoyées par l'API (`PERM.MANAGE_PROJECTS`, `PERM.VIEW_USERS`, …) |
| `PermissionName` | Type dérivé de `PERM` |
| `PERMISSION_LABELS` | Libellés FR affichables (`MANAGE_PROJECTS → "Gérer les projets"`), plus courts que les `description` de l'API |
| `getPermissionLabel(name)` | Libellé d'une permission, ou nom technique en repli si inconnue |

La liste de `PERM` est issue de `GET /roles/permissions/actions` (13 permissions). **Toute permission ajoutée côté backend doit y être reportée** (dans `PERM` et `PERMISSION_LABELS`).

## Composant `Allow`

`src/components/common/Allow.tsx` masque son contenu si l'utilisateur n'a pas la permission (et, à terme, l'action) requise. Les enfants ne sont **pas montés** : leurs effets et requêtes ne sont donc pas déclenchés.

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

Le composant s'appuie sur `usePermissions().hasPermission(perm, action)` : il ne monte son contenu que si la permission est présente et, lorsque `action` est fournie, le bit accordé correspondant (voir « Résolution côté client des masques accordés »).

## Forme des données reçues

### `GET /roles/actions`

Catalogue des actions (`ActionResDto`) : `{ codeAction, name, label }`. Il double `ACT` / `ACTION_LABELS` côté front, la constante restant la source utilisée par l'UI.

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
- **`/auth/me` ne renvoie pas les masques d'actions** (seulement `permissions: string[]`) : les masques accordés sont **reconstruits côté client** par `PermissionActionsProvider` (voir ci-dessous). `usePermissions().hasPermission(perm, action)` teste alors réellement le bit d'action.
- **Guards/menu migrés** : `PermissionRoute`, `SelfOrPermissionRoute`, `AdminNavigation.config.ts` et `Dashboard` utilisent `PERM.*` avec un typage `PermissionName` (aucune chaîne littérales de permission ne subsiste dans `src/`).

## Résolution côté client des masques accordés

Le backend n'expose les masques accordés que **par rôle** (`GET /roles/actions-map`), jamais par utilisateur. `PermissionActionsProvider` (`src/contexts/PermissionActionsProvider.tsx`, monté sous `AuthProvider`) reconstruit donc les masques de la session :

1. lit le rôle de l'utilisateur (`useAuth().user.role`) ;
2. récupère une fois `GET /roles/actions-map` (le `label` d'une entrée correspond au **nom** du rôle, ex. `label: "ADMIN"` pour `user.role === "ADMIN"`) ;
3. aplatit `totalActionsAccordees` par nom de permission dans `grantedMasks` (`{ MANAGE_PROJECTS: 15, … }`).

`usePermissions` expose ce résultat via `getGrantedMask(perm)`, `grantedMasks`, `hasAction(perm, action)` et `hasPermission(perm, action)`. Le composant `<Allow>` (`src/components/common/Allow.tsx`) en dépend : il ne monte son contenu que si la permission est présente **et** le bit d'action accordé.

**Repli (fail-open)** : si le masque est inconnu (chargement en cours, rôle absent de la map, permission absente), la seule présence de la permission vaut accord — l'UI ne cache rien. Un masque connu, y compris `0`, est en revanche appliqué strictement. `SUPER_ADMIN` court-circuite tout. Ce contrôle est **purement visuel** : le backend reste l'autorité.

## Points d'attention

- **Ne pas utiliser de chaînes littérales** pour une permission : préférer `PERM.*`, sinon une faute de frappe passe inaperçue.
- **`PERM` doit rester synchronisée** avec la table des permissions du backend.
- **`totalActions` ≠ `totalActionsAccordees`** : ne jamais tester une action contre `totalActions` (actions possibles) au lieu de `totalActionsAccordees` (actions accordées).
- **Ne pas se fier au champ `actions`** des réponses API : il sera retiré, seuls les masques `totalActions` / `totalActionsAccordees` sont pérennes.
- **Masques accordés résolus côté client** : ils reposent sur `entry.label === user.role` dans `/roles/actions-map`. Un rôle renommé ou absent de la map rend le masque inconnu (repli fail-open). Le backend reste l'autorité.
