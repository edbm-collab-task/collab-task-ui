# Documentation développeur — CollaB Tasks (frontend)

Documentation d'ingénierie du frontend `collab-task-ui`. Elle est **extraite du code** et non des README existants : là où le `README.md` racine et le code divergent, ce kit suit le code et le signale.

## Contenu

| Document | Sujet |
|---|---|
| [getting-started.md](./getting-started.md) | Prérequis, installation, variables d'environnement, scripts npm, premiers pas et pièges de démarrage |
| [architecture.md](./architecture.md) | Vue d'ensemble, couches et flux de données, rôle de chaque dossier, arborescence réelle, alias `@` |
| [routing-et-permissions.md](./routing-et-permissions.md) | Table des routes, les 5 guards, layout et menu, modèle de permissions et de rôles |
| [authentification-et-session.md](./authentification-et-session.md) | Cycle de session, stockage des tokens, intercepteurs, providers, récupération de mot de passe |
| [couche-api.md](./couche-api.md) | Instance axios, `apiClient`, refresh automatique, `API_ENDPOINTS`, conventions des 15 services, multipart |
| [types-enums-donnees.md](./types-enums-donnees.md) | Types `*Req`/`*Res`, enums, libellés, duplications `constant`/`constants`, mappers |
| [temps-reel-et-messagerie.md](./temps-reel-et-messagerie.md) | WebSocket STOMP, `useMessages`/`useConversations`, rafraîchissements et polling |
| [etat-et-formulaires.md](./etat-et-formulaires.md) | Les 2 contexts, les 13 hooks, moteur de formulaires `FormField<T>` et validation |
| [composants-et-styles.md](./composants-et-styles.md) | Composants réutilisables, primitives manquantes, confirmations, tokens Tailwind v4, graphiques |
| [outillage-qualite.md](./outillage-qualite.md) | oxlint, TypeScript (options critiques), build, absence de tests et de CI, checklist locale |
| [bonnes-pratiques.md](./bonnes-pratiques.md) | Nommage, règles de structure, procédures d'ajout (route, formulaire, endpoint, hook), règles de PR |
| [connus-problemes-et-FAQ.md](./connus-problemes-et-FAQ.md) | Bugs vérifiés, dette technique, code mort, FAQ et priorités de correction |
| [git-et-contribution.md](./git-et-contribution.md) | Branches, Conventional Commits, pull requests, organisation des branches de documentation |

## Parcours de lecture

**Premier jour sur le projet**
1. `getting-started.md` — faire tourner l'application
2. `architecture.md` — comprendre les couches et où placer le code
3. `routing-et-permissions.md` — voir comment les écrans s'organisent

**Ajouter une fonctionnalité**
1. `bonnes-pratiques.md` — procédures pas à pas et règles de structure
2. `couche-api.md` (ou `etat-et-formulaires.md`, `composants-et-styles.md`) — la couche concernée
3. `outillage-qualite.md` — vérifier avant de pousser


**Contribuer / faire relire**
1. `git-et-contribution.md`
2. `outillage-qualite.md` (checklist locale)

## Conventions de lecture

- Les chemins de fichiers sont donnés tels qu'ils existent dans le dépôt, généralement sous `src/`.
- Les exemples de code sont **copiés du dépôt** à la date de rédaction ; si le code a changé, c'est le code qui fait foi.
- Les affirmations sur l'état de la chaîne d'outils (`lint`, `build`, tests, CI) ont été **exécutées et vérifiées** à la date de rédaction, avec les codes retour.
- Les libellés utilisateur sont en français dans l'application ; les messages de commit sont en anglais.
- Ce kit est en français.

## Glossaire

| Terme | Signification |
|---|---|
| **Guard** | Composant React de `src/router/` qui rend des enfants ou une redirection selon session/permission |
| **`*Req` / `*Res`** | Types de contrat d'API : corps envoyé / réponse reçue |
| **`api`** | Instance axios unique (`src/api/axios.ts`), intercepteurs inclus |
| **`apiClient`** | Wrapper de verbes HTTP qui renvoie directement `response.data` |
| **`API_ENDPOINTS`** | Table centrale des URL d'API (`src/api/constants.ts`) |
| **Moteur de formulaires** | Ensemble `FormField<T>` + `GlobalForm`/`GlobalEditForm` + `FormFieldControl` + `formLogic` |
| **Schéma de formulaire** | Un tableau `FormField<T>[]` défini dans un fichier dédié (`src/components/...`) |
| **`RoleType` / `RoleName`** | Codes de rôle (`U1S`, `A1D`, `S1ADM`) et noms (`USER`, `ADMIN`, `SUPER_ADMIN`) |
| **Permission** | Chaîne fournie par le backend (`VIEW_USERS`…), testée par `usePermissions().hasPermission()` |
| **Bypass SUPER_ADMIN** | Un `role === "SUPER_ADMIN"` passe toutes les vérifications de permission front |
| **Recovery** | Flux de récupération de mot de passe, protégé par son propre context (`RecoveryAuthProvider`) |
| **`silent`** | Drapeau maison qui désactive le toast d'erreur global de l'intercepteur |
| **Kanban** | Tableau des tâches d'un projet avec glisser-déposer (`components/kanban/`) |
| **Statut** | Colonne du Kanban (`statusId`, `name`) — type déclaré en double, voir `types-enums-donnees.md` |
| **Contributeur** | Utilisateur rattaché à un projet (`contributors`) |
| **Conversation** | Unité de messagerie privée ou de groupe, suivie en temps réel via STOMP |
| **Polling** | Rafraîchissement périodique (`setInterval`) utilisé pour les notifications et compteurs de non-lus |
| **Skeleton** | Écran de chargement factice (`AdminLayoutSkeleton`, `VerificationSkeleton`, `UserProfileSkeleton`) |
| **Primitives** | Briques UI de base manquantes (`Button`, `Input`, `Modal`…) — voir `composants-et-styles.md` |
| **Dette technique** | Fonctionne mais coûteux à maintenir, listé dans `connus-problemes-et-FAQ.md` |

## Périmètre

Ce kit couvre le **développement frontend**. Il ne traite pas de l'API Spring Boot, du déploiement ni des procédures de mise en production : ces sujets sont assurés par d'autres dépôts et ne sont pas encore documentés ici (le `README.md` racine contient à leur sujet un exemple de Dockerfile qui **n'existe pas dans ce dépôt**).

## Maintenance

- Une page doit être mise à jour dès que le comportement du code change, surtout dan `outillage-qualite.md`.
- Une page ajoutée doit être référencée dans l'index ci-dessus.
- Un document qui ne correspond plus au code doit être corrigé, pas complété par une note : c'est l'origine des divergences du `README.md` historique.