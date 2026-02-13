export class Game {
    constructor(gameType) {
        this.gameType = gameType;
        this.status = 'waiting';
        this.lastResult = null;
    }

    handleMove(data, socketId) {
        throw new Error('handleMove() doit être implémenté');
    }

    reset() {
        throw new Error('reset() doit être implémenté');
    }

    serialize() {
        return { ...this };
    }
}
