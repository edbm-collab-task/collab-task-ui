# Outillage et qualité

Lint, TypeScript, build, tests et CI : ce que la chaîne d'outils vérifie — et surtout ce qu'elle **ne** vérifie **pas**.

## Commandes disponibles

```bash
npm run dev       # vite
npm run build     # tsc -b && vite build
npm run lint      # oxlint
npm run preview   # vite preview
```

Il n'existe **ni `test`, ni `typecheck`, ni `format`, ni `e2e`** dans `package.json`.

## Lint : oxlint

Le projet n'utilise **ni ESLint ni Biome**. Le lint est assuré par `oxlint` (un lintur JavaScript/TypeScript écrit en Rust), lancé par `npm run lint`.

`package.json` : `"lint": "oxlint"` (aucun argument de parcours : oxlint analyse les fichiers suivis par git).

### Configuration : `.oxlintrc.json`

```json
{
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "plugins": ["react", "typescript", "oxc"],
    "rules": {
        "react/rules-of-hooks": "error",
        "react/only-export-components": ["warn", { "allowConstantExport": true }]
    }
}
```

- Les **deux règles** du bloc `rules` surchargent la sévérité par défaut de ces règles.
- Lister un plugin dans `plugins` active aussi son jeu de règles **recommandées** : l'exécution réelle montre `react-hooks(exhaustive-deps)` et `eslint(no-unused-vars)` en avertissement, plus `oxc(only-used-in-recursion)`.

### État réel de la vérification (constaté sur `develop`, octobre 2026)

`npm run lint` **échoue** (code retour `1`) : **13 erreurs, 15 avertissements**.

Les 13 erreurs sont toutes de type `react-hooks(rules-of-hooks)` :

| Fichier | Cause |
|---|---|
| `components/admin/Dashboard.tsx` (12 erreurs, lignes 35 à 57) | `return` anticipé à la ligne 25 (`!hasPermission("VIEW_REPORTS")`) placé **avant** `useDashboardPeriod()` et les `useState`/`useEffect` suivants |
| `pages/admin/user/UserListPage.tsx:99` | `return null` à la ligne 46 (`currentUser?.role === "SUPER_ADMIN"`) placé avant le `useEffect` de rechargement |

Ce sont de vraies violations de l'ordre des hooks (un changement de permission peut changer le nombre de hooks appelés), pas des faux positifs.

Autres avertissements récurrents : dépendances manquantes dans les `useEffect` (`MessagePage`, `AdminDashboard`, `Dashboard`, `Sparkline`, `CommentPanel`), `catch` sans utilisation de la variable (`AuthProvider`, `RoleListPage`), imports inutilisés (`DirectionListPage`).

### Ce que le lint ne couvre pas

- Aucune règle de cohérence de style (indentation, quotes, points-virgules).
- Aucune règle de sécurité ni de no-floating-promises.
- Aucun contrôle des imports inutilisés côté oxlint (le type-check `tsc` les détecte à la place).
- **Sept directives `// eslint-disable-next-line react-hooks/exhaustive-deps` sont présentes et totalement inertes** : elles désactivent une règle d'un linter qui n'est pas configuré (`TaskModal.tsx` lignes 196, 282, 293 ; `MessageList.tsx` lignes 269, 283 ; `CommentPanel.tsx` ligne 61 ; `RoleListPage.tsx` ligne 287). Les fermetures périmées qu'elles encadrent ne sont donc pas protégées (voir [connus-problemes-et-FAQ.md](./connus-problemes-et-FAQ.md)).

## TypeScript

### Structure des tsconfig

| Fichier | Portée |
|---|---|
| `tsconfig.json` | Solution : `files: []` + `references` → `tsconfig.app.json`, `tsconfig.node.json`. C'est celui qui invoque `tsc -b`. |
| `tsconfig.app.json` | `include: ["src"]` — toute l'application |
| `tsconfig.node.json` | `include: ["vite.config.ts"]` uniquement |

### Options qui changent la façon d'écrire du code

| Option | Valeur | Effet concret |
|---|---|---|
| `strict` | **absente → désactivé** | Pas de contrôle de nullabilité ni d'`any` implicite. Ne pas supposer le mode strict. |
| `noUnusedLocals` | `true` | Une variable ou une importation non utilisée **fait échouer `npm run build`**. |
| `noUnusedParameters` | `true` | Un paramètre non utilisé fait échouer le build. Préfixer avec `_` si intentionnel. |
| `erasableSyntaxOnly` | `true` | **`enum`, `namespace` avec code d'exécution et propriétés de constructeur sont interdits.** Utiliser `as const` + type dérivé. |
| `verbatimModuleSyntax` | `true` | **`import type` obligatoire** pour les types purs ; les types ne peuvent être « effacés » implicitement. |
| `moduleResolution` | `bundler` | Les extensions d'import sont omises. |
| `allowImportingTsExtensions` | `true` | L'extension `.ts`/`.tsx` est autorisée dans un import. |
| `jsx` | `react-jsx` | Pas d'`import React` nécessaire (runtime automatique). |
| `noFallthroughCasesInSwitch` | `true` | `case` sans `break` interdit. |
| `moduleDetection` | `force` | Chaque fichier est un module. |
| `noEmit` | `true` | `tsc` ne fait que vérifier ; Vite gère l'émission. |
| `target` / `lib` | `es2023` / `["ES2023", "DOM"]` | — |
| `types` | `["vite/client"]` | Donne son type à `import.meta.env`. Il n'y a **pas** de `src/vite-env.d.ts`. |
| `skipLibCheck` | `true` | — |

### Alias de chemins

```jsonc
// tsconfig.app.json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```

Doit être tenu en accord avec `vite.config.ts` :

```ts
resolve: { alias: { "@": path.resolve(__dirname, "./src") } }
```

Synchroniser les deux, sinon `tsc` et Vite divergent.

### Localisation des informations de génération

`tsBuildInfoFile` pointe vers `./node_modules/.tmp/tsconfig.*.tsbuildinfo` : une réinitialisation de `node_modules` purge aussi le cache de build.

## Build

```bash
npm run build   # = tsc -b && vite build
```

Le build est **bloqué** : `tsc -b` exécute le type-check complet sur `src/` et `vite.config.ts`. Un import inutilisé, un `enum` ou un type importé sans `import type` casse la production.

### État réel de la vérification (constaté sur `develop`, octobre 2026)

`npm run build` **échoue** (code retour `2`) :

```
src/pages/admin/direction/DirectionListPage.tsx(2,10): error TS6133:
  'Pencil' is declared but its value is never read.
```

Une correction existe sur la branche `fix/direction-unused-import` mais **n'est pas encore fusionnée** : la branche `develop` ne build donc pas. Conséquence pratique pour toute nouvelle contribution : **partir d'une `develop` à jour** et vérifier soi-même que le build passe, plutôt que de conclure que c'est sa propre modification qui casse le projet.

Résultat d'un build réussi : un `dist/` avec **un seul bundle JavaScript** (≈ 904 Ko) + une feuille de style ≈ 79 Ko, sans code splitting, sans `manifest.json`. Le contenu de `dist/` n'est pas versionné.

L'analyse des chiffres de build n'est pas configurée (pas de plugin de rapport de taille).

## Tests

**Il n'y a aucun test, nulle part.**

- Pas de Vitest, pas de Jest, pas de React Testing Library : ces dépendances sont absentes de `package.json`.
- `@playwright/test` est installé en `devDependencies`, mais **aucun fichier `playwright.config.*`, aucun `*.spec.ts`, aucun dossier `tests/`/`e2e/` n'existe** ; aucun historique git ne les a jamais contenus.
- Aucun script `test`.
- Le `README.md` racine décrit pourtant des tests Vitest/RTL sous `src/tests/` : ces fichiers n'ont jamais existé.

Aucune couverture de test automatique : la validation reste manuelle (voir la checklist ci-dessous).

## Intégration continue

**Aucune.** La totalité du contenu de `.github/` est :

```
.github/CODEOWNERS     # → * @ZoFitahiana
```

Pas de workflow, pas de template de pull request, pas de template d'issue. Aucun hook git n'est installé (`.git/hooks/` ne contient que des exemples par défaut) : ni husky, ni commitlint.

Conséquence : **rien n'est automatiquement vérifié lors d'un commit ou d'une PR.** Le type-check ne bloque que si quelqu'un lance `npm run build` volontairement.

## Qualité de code : formatter

Aucun formatter standardisé : pas de Prettier, pas d'EditorConfig, pas de configuration de formatage. L'indentation observée est de **4 espaces**, mais cela relève de la convention manuelle. Les retours à la ligne `CRLF` sont présents.

## Checklist de vérification locale

À exécuter manuellement avant toute PR :

```bash
npm run lint      # 13 erreurs existantes connues (voir « État réel »)
npm run build     # 1 erreur existante connue (DirectionListPage)
```

Les deux commandes **échouent aujourd'hui sur `develop`**. L'objectif n'est pas qu'elles sortent zéro (elles ne le font pas), mais que **votre modification n'en ajoute aucune nouvelle**. Isoler la cause d'un échec n'est donc pas toujours automatique : comparer avec un `git stash` ou un build sur `develop`.

Points à relire spécifiquement, puisqu'**aucun outil ne les détecte** :

1. Les `import` inutilisés (cassent le build, pas le commit).
2. Les hooks conditionnels (seule règle de hooks activée) — attention aux `return` précoces avant un `useEffect`.
3. Les `any` ajoutés, notamment `as any` dans `api-client.ts`.
4. Les `window.confirm` / `window.alert` au lieu de `ConfirmPopup`.
5. Les URLs écrites en dur au lieu de `API_ENDPOINTS`.
6. Les appels `dangerouslySetInnerHTML` qui ne passent pas par `DOMPurify`.
7. La création d'une nouvelle route sans entrée dans `AdminNavigation.config.ts` (ou l'inverse).

## Outils installés mais inutilisés

Ne pas en déduire une fonctionnalité par leur présence dans `package.json` :

| Dépendance | État réel |
|---|---|
| `zod` | Installé, **jamais importé** dans `src/` — la validation est en RHF inline |
| `@hookform/resolvers` | Installé, **jamais importé** (inutile sans Zod) |
| `react-cookie` | Installé, **jamais importé** — les tokens sont en `localStorage` |
| `@playwright/test` | Installé, **aucune config, aucun test** |
| `bcryptjs` | **Jamais importé**, et placé en `devDependencies` : sa place dans une application React est douteuse — le hachage des mots de passe appartient au backend |

## Résumé des chaînes de contrôle

```
Nouveau code
   │
   ├─ npm run lint  →  oxlint   (plugins react/typescript/oxc + règles explicites) — ÉCHEC actuel : 13 erreurs
   ├─ npm run build →  tsc -b   (types, imports inutilisés, erasableSyntaxOnly) — ÉCHEC actuel : TS6133
   │                →  vite build (bundle)
   └─ (aucune vérification automatique : ni CI, ni hook, ni exécution automatique du lint au commit)
```