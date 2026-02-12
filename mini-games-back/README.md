# 🚀 WEVL — Arène de Mini-Jeux Spatiale - BACK

Serveur WebSocket gérant la logique de jeu et la communication temps réel.

## Stack

- **Node.js** (ES modules)
- **Express**
- **Socket.io**
- **MongoDB** (driver natif, connecté à MongoDB Atlas)
- **dotenv** (variables d'environnement)

## Installation

```bash
npm install
```

Créer un fichier `.env` à la racine de `mini-games-back/` :
```
MONGO_URI=mongodb+srv://...@....mongodb.net/?appName=...
```

```bash
npm start
```

Le serveur démarre sur **http://localhost:3001**.

## Architecture

```
mini-games-back/
├── script.js                 # Point d'entrée, connexion MongoDB
├── .env                      # Variables d'environnement (MONGO_URI)
├── websocket/
│   └── handlers/
│       └── rooms.handler.js  # Salles, jeux, chat et leaderboard
├── services/
│   ├── mongodb.js            # Connexion MongoDB, sauvegarde résultats, agrégation leaderboard
│   ├── tictactoe.js          # Logique morpion
│   └── shifumi.js            # Logique shifumi
└── package.json
```

## Événements Socket.io

### Client -> Serveur

| Événement | Payload | Description |
|---|---|---|
| `join_game` | `{ room, pseudo, gameType }` | Rejoindre une salle (max 2 joueurs) |
| `make_move` | `index` ou `string` | Envoyer un coup |
| `get_leaderboard` | - | Demander le classement |
| `message` | `string` | Envoyer un message dans le chat |

### Serveur -> Client

| Événement | Payload | Description |
|---|---|---|
| `update_ui` | `gameState` | État complet du jeu |
| `security_error` | `string` | Erreur (salle pleine, etc.) |
| `leaderboard_update` | `[{ pseudo, gameType, wins, losses }]` | Classement mis à jour |
| `message` | `{ username, userId, content, timestamp }` | Message chat |

## Logique de jeu

- **Tic-Tac-Toe** : premier à 3, détection victoire via lignes/colonnes/diagonales, reset en cas d'égalité
- **Shi-Fu-Mi** : premier à 3, choix simultanés, comparaison côté serveur
- **Leaderboard** : résultats persistés dans MongoDB Atlas, agrégation par joueur et par jeu (wins + losses), diffusé en temps réel via Socket.io
