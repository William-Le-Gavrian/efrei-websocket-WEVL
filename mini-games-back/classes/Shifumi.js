import { Game } from './Game.js';

export class Shifumi extends Game {
    constructor() {
        super('shifumi');
        this.choices = {};
        this.scores = {};
    }

    onBothPlayersJoined(players) {
        this.status = 'playing';
        this.scores = {
            [players[0].id]: 0,
            [players[1].id]: 0
        };
    }

    migrateSocketId(oldId, newId) {
        if (this.scores[oldId] !== undefined) {
            this.scores[newId] = this.scores[oldId];
            delete this.scores[oldId];
        }
        if (this.choices[oldId] !== undefined) {
            this.choices[newId] = this.choices[oldId];
            delete this.choices[oldId];
        }
    }

    handleMove(choice, socketId, players) {
        if (this.choices[socketId]) return null;

        this.choices[socketId] = choice;

        if (Object.keys(this.choices).length < 2) {
            return { finished: false };
        }

        const [p1, p2] = players;
        const c1 = this.choices[p1.id];
        const c2 = this.choices[p2.id];

        this.resolveRound(p1.id, p2.id, c1, c2);

        const winnerId = Object.keys(this.scores).find(id => this.scores[id] >= 3);

        if (winnerId) {
            this.status = 'finished';
            this.lastResult = winnerId;

            const winner = players.find(p => p.id === winnerId);
            const loser  = players.find(p => p.id !== winnerId);

            return {
                finished: true,
                winner,
                loser,
                scores: { ...this.scores }
            };
        }

        this.choices = {};
        return { finished: false };
    }

    resolveRound(p1Id, p2Id, c1, c2) {
        if (c1 === c2) return;

        const winsAgainst = {
            pierre:  'ciseaux',
            feuille: 'pierre',
            ciseaux: 'feuille'
        };

        if (winsAgainst[c1] === c2) {
            this.scores[p1Id]++;
        } else {
            this.scores[p2Id]++;
        }
    }

    reset() {
        this.choices = {};
    }

    serialize() {
        return {
            status:     this.status,
            gameType:   this.gameType,
            scores:     this.scores,
            choices:    this.choices,
            lastResult: this.lastResult
        };
    }
}
