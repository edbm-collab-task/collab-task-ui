# 🚀 CollaB Tasks - Frontend

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.x-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green)

---

# 📖 Présentation

**CollaB Tasks** est une application web collaborative de gestion de projets et de tâches permettant aux équipes d'organiser, suivre et collaborer efficacement autour de leurs activités.

Le frontend officiel est développé avec **React**, **TypeScript** et **Vite**.

L'application communique avec une API REST développée avec **Spring Boot**.

## Fonctionnalités principales

- 🔐 Authentification sécurisée par cookies HttpOnly
- 👤 Gestion des utilisateurs
- 🛡️ Gestion des rôles et permissions
- 📁 Gestion des projets
- ✅ Gestion des tâches
- 👥 Attribution des tâches aux utilisateurs
- 📊 Tableau de bord et statistiques
- 🔔 Notifications
- 🔎 Recherche et filtrage
- 👤 Gestion du profil utilisateur
- 📱 Interface responsive

---

# 🛠️ Stack technique

| Technologie | Description |
|---|---|
| React 19 | Bibliothèque frontend |
| TypeScript | Typage statique |
| Vite | Build tool moderne |
| React Router | Gestion de navigation |
| Axios | Client HTTP |
| Tailwind CSS | Framework CSS |
| React Hook Form | Gestion des formulaires |
| Zod | Validation des données |
| ESLint | Analyse qualité du code |

---

# 📂 Structure du projet

```
src/
│
├── assets/                   
│   └── Images, logos, icônes
│
├── components/               
│   ├── common/               
│   ├── forms/                
│   ├── layout/               
│   ├── tables/               
│   └── ui/                   
│
├── pages/                    
│   ├── Auth/
│   ├── Dashboard/
│   ├── Projects/
│   ├── Tasks/
│   ├── Users/
│   ├── Profile/
│   └── Settings/
│
├── routes/                   
│   ├── AppRoutes.tsx
│   └── ProtectedRoute.tsx
│
├── services/                 
│   ├── api.ts
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── task.service.ts
│   └── project.service.ts
│
├── hooks/                    
│   ├── useAuth.ts
│   ├── useTask.ts
│   └── useProject.ts
│
├── context/                  
│   └── AuthContext.tsx
│
├── store/                    
│   └── Global state
│
├── types/                    
│   └── Interfaces TypeScript
│
├── utils/                    
│   └── Fonctions utilitaires
│
├── constants/                
│   └── Constantes globales
│
├── layouts/                  
│   ├── MainLayout.tsx
│   └── AuthLayout.tsx
│
├── styles/                   
│   └── CSS global
│
├── App.tsx
├── main.tsx
└── vite-env.d.ts
```

---

# ⚙️ Installation

## Prérequis

Avant de commencer, installer :

- Node.js >= 20
- npm >= 10
- Git


Vérification :

```bash
node -v

npm -v
```

---

# 📥 Cloner le projet

```bash
git clone https://github.com/edbm-collab-task/collab-task-ui.git

cd collab-task-ui
```

---

# 📦 Installation des dépendances

```bash
npm install
```

---

# 🔐 Configuration des variables d'environnement

Créer un fichier :

```
.env
```

Ajouter :

```env
VITE_API_URL=http://localhost:8090/api
VITE_APP_NAME=CollaB Tasks
```

---

# ▶️ Lancer le projet

Démarrer le serveur de développement :

```bash
npm run dev
```

Application disponible :

```
http://localhost:5173
```

---

# 📜 Scripts disponibles

## Développement

```bash
npm run dev
```

Lancer le serveur frontend.

---

## Production

```bash
npm run build
```

Créer la version optimisée de production.

---

## Preview

```bash
npm run preview
```

Tester le build localement.

---

## Vérification du code

```bash
npm run lint
```

---

# 🌐 Communication avec le Backend

Toutes les requêtes HTTP passent par :

```
src/services
```

Configuration Axios :

```typescript
import axios from "axios";


export const api = axios.create({

    baseURL: import.meta.env.VITE_API_URL,

    withCredentials: true

});
```

---

# 🔐 Authentification

CollaB Tasks utilise une authentification sécurisée basée sur :

- 🍪 Cookies HttpOnly
- 🔑 JWT côté serveur
- 🔄 Refresh Token
- 🛡️ RBAC (Role Based Access Control)


## Fonctionnement

```
Utilisateur

      │

      ▼

Frontend React

      │

      ▼

API Spring Boot

      │

      ▼

Création JWT

      │

      ▼

Cookie HttpOnly

      │

      ▼

Requêtes sécurisées
```

---

# 🍪 Gestion des Cookies

Les tokens d'authentification ne sont jamais stockés dans :

❌ localStorage

❌ sessionStorage

❌ variables JavaScript accessibles


Ils sont stockés uniquement dans :

```
HttpOnly Cookies
```

Avantages :

- Protection contre certaines attaques XSS
- Gestion automatique par le navigateur
- Sécurité renforcée

---

# 🛡️ Routes protégées

Les pages nécessitant une authentification utilisent :

```
ProtectedRoute
```


Exemples :

```
/dashboard

/projects

/tasks

/profile
```

Fonctionnement :

```
Utilisateur connecté ?

        │

   Oui ─────────> Accès autorisé

        │

        Non

        │

        ▼

     Login
```

---

# 👥 Gestion des rôles (RBAC)

L'application possède plusieurs niveaux d'accès :

| Rôle | Description |
|---|---|
| SUPER_ADMIN | Administration complète |
| ADMIN | Gestion utilisateurs et projets |
| USER | Utilisateur standard |

Les permissions sont contrôlées côté backend.

---

# 🎨 Interface utilisateur

L'application utilise une interface :

- Moderne
- Responsive
- Accessible
- Compatible multi-écrans


Support :

- 💻 Desktop
- 📱 Mobile
- 📟 Tablette

---

# 📋 Fonctionnalités


## 🔐 Authentification

- Connexion
- Déconnexion
- Gestion session utilisateur
- Refresh automatique
- Gestion erreurs


## 📁 Projets

- Création projet
- Modification projet
- Suppression projet
- Liste projets
- Détails projet


## ✅ Tâches

- Création tâche
- Modification tâche
- Suppression tâche
- Attribution utilisateur
- Gestion statut
- Gestion priorité


## 📊 Dashboard

- Statistiques globales
- Suivi progression
- Indicateurs KPI


## 👥 Utilisateurs

- Liste utilisateurs
- Gestion profils
- Gestion rôles


## 🔎 Recherche

- Recherche dynamique
- Filtrage
- Tri

---

# 🧪 Tests

Technologies utilisées :

- Vitest
- React Testing Library


Structure :

```
src/
└── tests/

    ├── auth.test.tsx
    ├── task.test.tsx
    └── project.test.tsx
```

---

# 🧹 Convention de nommage


## Composants

```
TaskCard.tsx

ProjectTable.tsx

UserProfile.tsx
```


## Hooks

```
useAuth.ts

useTasks.ts

useProjects.ts
```


## Services

```
auth.service.ts

task.service.ts

project.service.ts
```


## Types

```
User.ts

Task.ts

Project.ts
```

---

# 🚀 Déploiement


Créer le build :

```bash
npm run build
```


Résultat :

```
dist/
```


Déploiement possible :

- Vercel
- Netlify
- Docker
- Nginx


---

# 🐳 Docker


Exemple Dockerfile :

```dockerfile
FROM nginx:alpine

COPY dist /usr/share/nginx/html

EXPOSE 80
```


Build :

```bash
docker build -t collab-tasks-frontend .
```


Run :

```bash
docker run -p 80:80 collab-tasks-frontend
```

---

# 🔄 Workflow Git


Créer une branche :

```bash
git checkout -b feature/nouvelle-fonctionnalite
```


Commit :

```bash
git commit -m "Ajout nouvelle fonctionnalité"
```


Push :

```bash
git push origin feature/nouvelle-fonctionnalite
```

---

# 📄 Licence

Projet développé dans le cadre de **CollaB Tasks**.

Licence MIT.

© 2026 CollaB Tasks
