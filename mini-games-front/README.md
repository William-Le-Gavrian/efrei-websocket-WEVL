# 🚀 WEVL — Arena de Mini-Jeux Spatiale

**WEVL** est une plateforme de jeux multijoueurs en temps réel basée sur les technologies **WebSockets**. Affrontez vos adversaires dans un environnement immersif inspiré du système solaire, où chaque salle de jeu est une planète à conquérir.

---

## ✨ Fonctionnalités

* **Multijoueur en temps réel** : Utilisation de `Socket.io` pour une synchronisation instantanée des mouvements (latence minimale).
* **Système de Salles (Dojos Spatiaux)** : 9 salles prédéfinies basées sur les planètes (Mercure, Mars, Jupiter, jusqu'à la station Pluton).
* **Gestion des Lobby & Sécurité** : 
    * Vérification de la disponibilité des salles côté serveur.
    * **Limitation stricte à 2 joueurs** : Un système de verrouillage empêche toute intrusion dans une partie en cours.
* **Design "Triple A"** : 
    * Interface en **Glassmorphism** (transparence, flous directionnels et bordures cristallines).
    * Arrière-plan dynamique simulant une nébuleuse avec planètes et étoiles scintillantes.
    * Typographie **Rajdhani** typée gaming/e-sport.
* **Persistance locale** : Sauvegarde automatique du pseudo et du compteur de victoires via le `localStorage`.

---

## 🛠 Stack Technique

### Front-end
* **React.js** (Vite)
* **Tailwind CSS** : Utilisation intensive d'utilitaires personnalisés pour le design spatial et les animations (Shimmer, Pulse, Glow).
* **Lucide React** : Iconographie moderne et minimaliste.
* **Socket.io-client** : Gestion de la communication bidirectionnelle.

---

## 🎮 Jeux Disponibles

### 1. Tic-Tac-Toe (Morpion)
Revisité avec une esthétique Cyber-Néon.
* Symboles stylisés : `✕` (Guerrier X) et `◯` (Guerrier O).
* Indicateur de tour dynamique avec halo lumineux.

### 2. Shi-Fu-Mi (Pierre-Feuille-Ciseaux)
Un duel psychologique avec des visuels à haute intensité.
* Reveal dramatique des choix des joueurs.
* Animations de "Shake" et effets de particules lors du résultat.



---

## 🧠 Architecture & Communication

Le projet repose sur une architecture événementielle robuste. Le serveur agit comme une "Source de Vérité" (SSOT) :

1.  **Phase de Join** : Le serveur vérifie le nombre de clients via `io.sockets.adapter.rooms.get(room)`. Si `size >= 2`, l'accès est refusé.
2.  **Gestion d'état** : Chaque coup (`make_move`) déclenche une mise à jour de la logique côté serveur, qui renvoie l'état complet à la salle via `update_ui`.
3.  **Synchronisation** : L'interface réagit immédiatement aux changements d'état grâce aux hooks `useEffect` de React.



---

## ⚙️ Installation

### Prérequis
* Node.js (v16 ou supérieur)
* npm ou yarn

### Lancement
1.  **Clonage du projet** :
    ```bash
    git clone https://github.com/William-Le-Gavrian/efrei-websocket-WEVL.git
    ```
2.  **Installation et lancement du serveur** :
    ```bash
    cd mini-games-back
    npm install
    npm run dev
    ```

---

## 💅 Identité Visuelle

* **Dark Mode** : Fond Deep Space (`#020617`).
* **Accents** : Bleu Électrique (Joueur 1), Rose Néon (Joueur 2), Jaune Solaire (Highlight).
* **Effets** : Utilisation de `backdrop-blur-xl` pour simuler des interfaces de cockpit spatial.

---

**Projet développé dans le cadre du module Webhook/Websocket - EFREI 2026.**
