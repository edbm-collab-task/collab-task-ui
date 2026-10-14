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
| `hasAction(mask, action)` | `true` si le bit de `action` est présent dans `mask` (`undefined` ⇒ `false`) |
| `actionsToMask(actions)` | Reconstruit un masque depuis une liste de noms (cases à cocher → entier) |
| `ActionName` / `ActionCode` | Types dérivés de `ACT` |

### `src/constants/permissions.ts`

| Export | Rôle |
|---|---|
| `PERM` | Les noms exacts des permissions renvoyées par l'API (`PERM.MANAGE_PROJECTS`, `PERM.VIEW_USERS`, …) |
| `PermissionName` | Type dérivé de `PERM` |

La liste de `PERM` est issue de `GET /roles/permissions/actions` (13 permissions). **Toute permission ajoutée côté backend doit y être reportée.**

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

Le composant s'appuie sur `usePermissions().hasPermission(perm, action)`.

## Forme des données reçues

L'API renvoie, pour chaque permission, un objet `actions` sous forme de masques :

```jsonc
// GET /roles/permissions/actions  (sans contexte de rôle)
{ "id": 3, "name": "MANAGE_PROJECTS", "description": "…",
  "categoryPermission": "PROJETS",
  "actions": { "correspondant": 3 } }

// GET /roles/{id}/actions  (avec contexte de rôle)
{ "id": 3, "name": "MANAGE_PROJECTS", "description": "…",
  "categoryPermission": "PROJETS",
  "actions": { "correspondant": 3, "accorde": 2 } }
```

| Champ | Sens |
|---|---|
| `correspondant` | Masque des actions **possibles** pour la permission |
| `accorde` | Masque des actions **accordées** à l'utilisateur/au rôle. **Absent** quand l'appel n'est pas contextualisé par un rôle |

Types correspondants : `ActionGrants` et `PermissionActions` dans `src/types/role.ts`. La forme historique `PermissionWithActions` (`actions: string[]`) reste en place le temps de la migration.

## État actuel et migration

- **Backend non migré** : `/roles/permissions/actions` renvoie encore `actions: string[]`, et `/auth/me` renvoie `permissions: string[]`.
- En conséquence, `usePermissions().hasPermission(perm, action)` **ne contrôle pas encore le bit d'action** : la seule présence de la permission vaut accord. Le point d'extension est `getGrantedMask()` dans `src/hooks/usePermissions.ts` (TODO).
- Le formulaire de rôle (`RoleForm`/`RoleListPage`) fonctionne toujours sur `actions: string[]` ; il sera rebranché sur les masques une fois le backend prêt.
- Les guards (`PermissionRoute`, `SelfOrPermissionRoute`), le menu (`AdminNavigation.config.ts`, `AdminMenu`) et `Dashboard` utilisent encore des chaînes littérales ; leur migration vers `PERM` (et un typage `PermissionName`) reste à faire.

## Points d'attention

- **Ne pas utiliser de chaînes littérales** pour une permission : préférer `PERM.*`, sinon une faute de frappe passe inaperçue.
- **`PERM` doit rester synchronisée** avec la table des permissions du backend.
- **`correspondant` ≠ `accorde`** : ne jamais tester une action contre `correspondant` (actions possibles) au lieu de `accorde` (actions accordées).
