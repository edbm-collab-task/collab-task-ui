# CollaB Tasks - Frontend

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)

## Présentation

CollaB Tasks est une application web collaborative de gestion de projets et de tâches. Elle permet aux équipes d'organiser, de suivre et de collaborer efficacement autour de leurs activités.

Le frontend est développé avec React 19, TypeScript et Vite. Il communique avec une API REST développée avec Spring Boot.

## Fonctionnalités principales

- Authentification sécurisée par cookies HttpOnly et JWT
- Gestion des utilisateurs et attribution de rôles
- Contrôle d'accès basé sur les rôles (RBAC)
- Gestion des projets
- Gestion des tâches (création, attribution, statuts et priorités)
- Tableau de bord avec statistiques et KPI
- Notifications
- Recherche, filtrage et tri
- Gestion du profil utilisateur
- Interface responsive (desktop, tablette, mobile)

## Stack technique

| Technologie | Description |
|---|---|
| [React 19](https://react.dev/) | Bibliothèque frontend |
| [TypeScript](https://www.typescriptlang.org/) | Typage statique |
| [Vite](https://vitejs.dev/) | Outil de build moderne |
| [React Router](https://reactrouter.com/) | Gestion de la navigation |
| [Axios](https://axios-http.com/) | Client HTTP |
| [Tailwind CSS](https://tailwindcss.com/) | Framework CSS utilitaire |
| [React Hook Form](https://react-hook-form.com/) | Gestion des formulaires |
| [Zod](https://zod.dev/) | Validation des schémas de données |
| [ESLint](https://eslint.org/) | Analyse statique du code |

## Structure du projet

```text
src/
├── assets/              # Images, logos et icônes
├── components/
│   ├── common/           # Composants réutilisables
│   ├── forms/            # Formulaires
│   ├── layout/           # Composants de mise en page
│   ├── tables/           # Tableaux
│   └── ui/               # Composants UI atomiques
├── pages/
│   ├── Auth/             # Pages d'authentification
│   ├── Dashboard/        # Tableau de bord
│   ├── Projects/         # Gestion des projets
│   ├── Tasks/            # Gestion des tâches
│   ├── Users/            # Gestion des utilisateurs
│   ├── Profile/          # Profil utilisateur
│   └── Settings/         # Paramètres
├── routes/
│   ├── AppRoutes.tsx     # Définition des routes
│   └── ProtectedRoute.tsx # Routes protégées
├── services/
│   ├── api.ts            # Instance Axios
│   ├── auth.service.ts   # Service d'authentification
│   ├── user.service.ts   # Service utilisateurs
│   ├── task.service.ts   # Service tâches
│   └── project.service.ts # Service projets
├── hooks/                # Hooks personnalisés
├── context/              # Contexts React
├── store/                # État global
├── types/                # Types et interfaces TypeScript
├── utils/                # Fonctions utilitaires
├── constants/            # Constantes globales
├── layouts/              # Layouts principaux
├── styles/               # Styles globaux
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [npm](https://www.npmjs.com/) >= 10
- [Git](https://git-scm.com/)

Vérifier l'installation :

```bash
node -v
npm -v
```

### 1. Cloner le projet

```bash
git clone https://github.com/edbm-collab-task/collab-task-ui.git
cd collab-task-ui
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:8090/api
VITE_APP_NAME=CollaB Tasks
```

## Lancer le projet

### Mode développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:5173](http://localhost:5173).

## Scripts disponibles

| Script | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement |
| `npm run build` | Génère un build optimisé pour la production |
| `npm run preview` | Prévisualise le build de production localement |
| `npm run lint` | Vérifie la qualité du code avec ESLint |

## Communication avec le backend

Toutes les requêtes HTTP sont centralisées dans `src/services/` via une instance Axios utilisant les cookies :

```typescript
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```

## Authentification

L'authentification repose sur :
- Cookies HttpOnly pour protéger les tokens
- JWT générés côté serveur
- Refresh token pour le renouvellement automatique de session
- RBAC pour le contrôle d'accès

Les tokens ne sont jamais stockés dans `localStorage`, `sessionStorage` ou dans des variables JavaScript accessibles. Ils sont uniquement présents dans des cookies HttpOnly.

## Routes protégées

Les pages nécessitant une authentification sont encapsulées par le composant `ProtectedRoute`. Un utilisateur non connecté est redirigé vers la page de connexion.

## Gestion des rôles

| Rôle | Permissions |
|---|---|
| SUPER_ADMIN | Administration complète |
| ADMIN | Gestion des utilisateurs, projets et tâches |
| USER | Accès aux projets et tâches qui lui sont attribués |

Les permissions sont vérifiées côté backend.

## Tests

Les tests sont implémentés avec [Vitest](https://vitest.dev/) et [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), dans `src/tests/`.

## Conventions de nommage

| Type | Convention | Exemples |
|---|---|---|
| Composants | PascalCase | `TaskCard.tsx`, `ProjectTable.tsx` |
| Hooks | `use` + PascalCase/camelCase | `useAuth.ts`, `useTasks.ts` |
| Services | kebab-case + `.service.ts` | `auth.service.ts`, `task.service.ts` |
| Types/Interfaces | PascalCase | `User.ts`, `Task.ts`, `Project.ts` |

## Déploiement

```bash
npm run build
```

Le build est généré dans `dist/`. Il peut être déployé sur Vercel, Netlify, Docker ou avec Nginx.

## Docker

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t collab-tasks-frontend .
docker run -p 80:80 collab-tasks-frontend
```

## Workflow Git

```bash
git checkout -b feature/ma-fonctionnalite
git commit -m "feat: ajout d'une nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite
```