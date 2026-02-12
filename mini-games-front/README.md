# 🚀 WEVL — Arène de Mini-Jeux Spatiale - FRONT

Client React pour la plateforme WEVL.

## Stack

- **React** (Vite)
- **Tailwind CSS**
- **Lucide React** (icônes)
- **Socket.io-client**

## Installation

```bash
npm install
npm run dev
```

Le client démarre sur **http://localhost:5173**.

## Architecture

```
mini-games-front/
├── src/
│   ├── main.jsx               # Point d'entrée Vite
│   ├── App.jsx                 # Composant principal, routage des vues
│   ├── App.css                 # Styles globaux
│   ├── index.css               # Styles de base (Tailwind)
│   └── components/
│       ├── PseudoEntry.jsx     # Saisie du pseudo
│       ├── Lobby.jsx           # Sélection de salle et de jeu
│       ├── Tictactoe.jsx       # Interface du morpion
│       └── Shifumi.jsx         # Interface du shi-fu-mi
└── package.json
```

Le front communique avec le serveur via Socket.io. L'état du jeu est entièrement géré côté serveur (source de vérité). L'interface réagit aux événements `update_ui` et met à jour l'affichage via les hooks React (`useEffect`).

Les stats (pseudo, victoires, défaites) sont stockées en `localStorage` et synchronisées avec le serveur à chaque connexion.
