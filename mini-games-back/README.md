# 🚀 WEVL — Arène de Mini-Jeux Spatiale - BACK

Serveur WebSocket gérant la logique de jeu et la communication temps réel.

## Stack

- **Node.js** (ES modules)
- **Express**
- **Socket.io**

## Installation

```bash
npm install
npm start
```

Le serveur démarre sur **http://localhost:3001**.

## Architecture

```
mini-games-back/
├── script.js                 # Point d'entrée
├── websocket/
│   ├── index.js
│   └── handlers/
│       └── rooms.handler.js  # Salles, jeux et leaderboard
├── services/
│   ├── tictactoe.js          # Logique morpion
│   ├── shifumi.js            # Logique shifumi
│   └── rooms.service.js
├── routes/
│   ├── games.routes.js
│   └── rooms.routes.js
└── package.json
```

## Événements Socket.io

### Client -> Serveur

| Événement | Payload | Description |
|---|---|---|
| `join_game` | `{ room, pseudo, gameType }` | Rejoindre une salle (max 2 joueurs) |
| `make_move` | `index` ou `string` | Envoyer un coup |
| `get_leaderboard` | - | Demander le classement |
| `sync_stats` | `{ pseudo, wins, losses }` | Synchroniser les stats |

### Serveur -> Client

| Événement | Payload | Description |
|---|---|---|
| `update_ui` | `gameState` | État complet du jeu |
| `security_error` | `string` | Erreur (salle pleine, etc.) |
| `leaderboard_update` | `[{ pseudo, wins, losses }]` | Classement mis à jour |

## Logique de jeu

- **Tic-Tac-Toe** : premier à 3, détection victoire via lignes/colonnes/diagonales, reset en cas d'égalité
- **Shi-Fu-Mi** : premier à 3, choix simultanés, comparaison côté serveur
- **Leaderboard** : stocké en mémoire (Map), perdu au redémarrage (pas de BDD)
