import { Game } from './Game.js';
import { checkWin } from '../services/tictactoe.js';

export class Tictactoe extends Game {
    constructor() {
        super('tictactoe');
        this.board = Array(9).fill(null);
        this.scores = { X: 0, O: 0 };
        this.turn = 0;
    }

    handleMove(index, socketId, players) {
        const playerIndex = players.findIndex(p => p.id === socketId);
        if (playerIndex !== this.turn || this.board[index] !== null) return null;

        const symbol = this.turn === 0 ? 'X' : 'O';
        this.board[index] = symbol;

        const result = checkWin(this.board);

        if (result === 'draw') {
            this.reset();
            return { finished: false };
        }

        if (result) {
            this.scores[result]++;
            this.reset();

            if (this.scores[result] === 3) {
                this.status = 'finished';
                this.lastResult = result;
                const winnerIndex = result === 'X' ? 0 : 1;
                return {
                    finished: true,
                    winner: players[winnerIndex],
                    loser: players[1 - winnerIndex],
                    scores: { ...this.scores }
                };
            }

            return { finished: false };
        }

        this.turn = this.turn === 0 ? 1 : 0;
        return { finished: false };
    }

    onBothPlayersJoined(_players) {
        this.status = 'playing';
    }

    reset() {
        this.board = Array(9).fill(null);
    }
}
