# 🚀 WEVL — Arène de Mini-Jeux Spatiale

Plateforme de jeux multijoueurs en temps réel. Affrontez vos adversaires dans un univers spatial où chaque salle de jeu est une planète à conquérir.

Projet développé dans le cadre du module WebSocket/Webhook - EFREI 2026.

## Concept

WEVL propose des duels en 1v1 dans des salles thématiques inspirées du système solaire (Mercure, Mars, Jupiter... jusqu'à la station Pluton). Chaque partie se joue en temps réel grâce aux WebSockets.

## Jeux disponibles

### 1. Tic-Tac-Toe (Morpion)
Morpion classique revisité avec une esthétique cyber-néon. Premier à 3 manches gagnantes.

### 2. Shi-Fu-Mi (Pierre-Feuille-Ciseaux)
Duel simultané avec révélation dramatique des choix. Premier à 3 manches gagnantes.

## Fonctionnalités

- **Multijoueur temps réel** : synchronisation instantanée entre joueurs
- **9 salles thématiques** : chaque planète est un dojo spatial
- **Sécurité des salles** : maximum 2 joueurs par partie, verrouillage automatique
- **Classement en direct** : leaderboard par jeu et général, mis à jour en temps réel via Socket.io
- **Persistance MongoDB** : résultats des parties stockés dans MongoDB Atlas (victoires et défaites)
- **Chat en jeu** : messagerie temps réel entre joueurs pendant les parties

## Identité visuelle

- Dark mode spatial (fond Deep Space)
- Glassmorphism : transparence, flous et bordures cristallines
- Accents colorés : Bleu Électrique (Joueur 1), Rose Néon (Joueur 2), Jaune Solaire (Highlight)
- Typographie Rajdhani, style gaming/e-sport
- Effets : shimmer, pulse, glow, étoiles scintillantes

## Démarrage rapide

Voir les README de chaque partie pour l'installation :
- [mini-games-back/README.md](mini-games-back/README.md) - Serveur
- [mini-games-front/README.md](mini-games-front/README.md) - Client

## Équipe WEVL

Authors
- Elise LABARRERE
- Luciano FERREIRA
- Valentin CIRCOSTA
- William LE GAVRIAN
