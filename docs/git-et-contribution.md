# Git et contribution

Branches, conventions de commit, processus de pull request et vérifications avant soumission.

## Dépôt

| Élément | Valeur |
|---|---|
| Remote | `https://github.com/edbm-collab-task/collab-task-ui` |
| Branche par défaut (remote) | `main` (`origin/HEAD -> origin/main`) |
| Branche d'intégration | `develop` |
| Branche de publication | `prod` |
| Propriétaire du dépôt | `.github/CODEOWNERS` → `* @ZoFitahiana` (chaque dépôt de PR) |
| Hooks Git | **aucun** — `.git/hooks/` ne contient que les exemples `*.sample` |
| CI | **aucun** — `.github/` ne contient que `CODEOWNERS` |
| Templates de PR / d'issue | **aucun** |

## Branches

À la date de rédaction, 14 branches locales et 29 distantes. Les conventions observées (aucune n'est imposée par un outil) :

| Préfixe | Signification | Exemples |
|---|---|---|
| `feat/` | nouvelle fonctionnalité | `feat/message-pagination`, `feat/project`, `feat/code-role-generator` |
| `fix/` | correction de bug | `fix/frontend`, `fix/TaskModal`, `fix/slow-add-contributor` |
| `style/` | mise en forme / responsive | `style/responsive`, `style/dashboard` |
| `refactor_` | refactorisation | `refactor_et_commentaire` |
| `docs/`, `doc/` | documentation | `docs` (branche courante), `doc/<thème>` |

Les préfixes `feature/`, `feat/` et même `login` / `message` coexistent : l'historique montre plusieurs générations de conventions. Pour un nouveau travail, **préférer `feat/`, `fix/`, `style/`, `docs/`**.

> **Contrainte technique** : la branche `docs` existante **empêche** de créer une branche `docs/<chose>` (conflit de référence dans `.git/refs`). C'est pourquoi les branches de documentation de ce kit utilisent le préfixe `doc/`.

## Flux de contribution

```
branche (feat|fix|style|docs)/sujet
   └─ commits Conventional Commits
        └─ pull request sur GitHub
             └─ revue (CODEOWNERS: @ZoFitahiana)
                  └─ merge commit → develop
                       └─ (régulièrement) develop → main
```

Points observés dans l'historique :

- **Chaque merge est un merge commit**, pas un squash ni un rebase : `Merge pull request #82 from edbm-collab-task/fix/frontend`.
- La numérotation des PR atteint **#82** : les PR sont le seul mécanisme d'intégration.
- Les PR récentes visent `develop` (`fix/frontend` → `develop`).
- Une branche longue durée `feature/*` existe en parallèle de `feat/*`.

## Conventional Commits

Format observé : `type(scope): sujet`.

| Type | Utilisation |
|---|---|
| `feat` | `feat(message): search conversation messages on the server` |
| `fix` | `fix(task): prevent circular parent chain`, `fix(KPI): …` |
| `refactor` | `refactor(message): drop unused messages prop …` |
| `chore` | `chore(hooks): add useDebounce hook` |
| `style` | `style(role): chevron added` |
| `Revert "…"` | réversions littérales |

Sujets : **mélange d'anglais et de français** dans l'historique (anglais pour la majorité des PR récentes, français ponctuellement). Le sujet est au présent, sans point final, en minuscules après les deux-points.

Aucun `commitlint` ni hook ne vérifie quoi que ce soit : la convention est uniquement culturelle.

**Ce qui n'est pas fait aujourd'hui** : réécrire l'historique (`rebase -i`), force-push, amend de commits mergés, commits vides. À éviter également.

## Pull requests

Il n'existe **aucun template de PR** : structurer soi-même la description. Ce qu'il faut couvrir :

1. **Sujet** — une phrase : quoi, et pourquoi.
2. **Contexte / problème** — le bug ou le besoin.
3. **Changement** — les fichiers touchés et les décisions prises.
4. **Vérification manuelle effectuée** — **indispensable** : aucun test automatique ni CI ne valide la PR (voir [outillage-qualite.md](./outillage-qualite.md)).
5. **Risques / suites** — ce qui reste à faire.

Le `CODEOWNERS` (`* @ZoFitahiana`) signale automatiquement le propriétaire du dépôt comme relecteur.

### Checklist avant d'ouvrir une PR

```bash
npm run lint      # ne pas AJOUTER d'erreur (13 existantes sur develop)
npm run build     # ne pas AJOUTER d'erreur (1 existante sur develop)
```

- [ ] Les nouvelles lignes n'introduisent aucun `as any`, `window.confirm`, URL en dur.
- [ ] Aucun import inutilisé n'accompagne la modification (cas `tsc -b`).
- [ ] Les nouvelles routes ont **à la fois** leur `<Route>` et leur entrée de menu le cas échéant.
- [ ] Aucune donnée sensible n'a été ajoutée : `.env` est ignoré, aucun token ou URL interne de backend durable n'est commité.
- [ ] La description décrit les tests manuels réellement réalisés.

## Documentation

Ce kit vit dans `docs/` sur la branche **`docs`**.

### Organisation des branches de documentation

| Branche | Contenu |
|---|---|
| `doc/getting-started` | `docs/getting-started.md` |
| `doc/architecture` | `docs/architecture.md` |
| `doc/access-and-session` | `docs/routing-et-permissions.md`, `docs/authentification-et-session.md` |
| `doc/data` | `docs/couche-api.md`, `docs/types-enums-donnees.md`, `docs/temps-reel-et-messagerie.md` |
| `doc/ui-and-forms` | `docs/etat-et-formulaires.md`, `docs/composants-et-styles.md` |
| `doc/quality-and-contribution` | `docs/outillage-qualite.md`, `docs/bonnes-pratiques.md`, `docs/connus-problemes-et-FAQ.md`, `docs/git-et-contribution.md`, `docs/README.md` |

Chaque branche part de `docs` ; **chaque PR vise `docs`**, pas `develop`. Après intégration de l'ensemble, `docs` pourra à son tour être proposée à `develop`.

### Ajouter ou modifier une page de doc

1. Créer une branche `doc/<sujet>` depuis `docs` (pas `docs/<sujet>` : conflit de référence Git).
2. Un **fichier = un commit** : `docs(<scope>): <description>`.
3. Pousser, ouvrir une PR vers `docs`.
4. Mettre à jour `docs/README.md` (index) si un fichier est ajouté, supprimé ou renommé.
5. **Mettre à jour [connus-problemes-et-FAQ.md](./connus-problemes-et-FAQ.md)** si un point documenté est corrigé dans le code : ce fichier doit rester fidèle à l'état réel.

Règle de qualité pour ce kit : **toute affirmation doit être vérifiable dans le code**. Si un README ou un commentaire contredit le code, le code a raison et la documentation doit le dire explicitement — c'est la raison pour laquelle le `README.md` racine est signalé comme obsolète dans plusieurs fichiers de `docs/`.