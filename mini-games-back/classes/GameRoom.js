export class GameRoom {
    constructor(roomName, gameType, game) {
        this.roomName = roomName;
        this.gameType = gameType;
        this.game = game;
        this.players = [];
        this.reconnectTimeout = null;
    }

    get status() { return this.game.status; }
    set status(val) { this.game.status = val; }

    addPlayer(player) {
        this.players.push({ ...player, connected: true });
    }

    findPlayer(predicate) {
        return this.players.find(predicate);
    }

    reconnect(pseudo, newSocketId) {
        const player = this.findPlayer(p => p.pseudo === pseudo && !p.connected);
        if (!player) return false;

        clearTimeout(this.reconnectTimeout);
        this.game.migrateSocketId?.(player.id, newSocketId);
        player.id = newSocketId;
        player.connected = true;
        this.game.status = 'playing';
        return true;
    }

    startReconnectTimer(callback) {
        this.reconnectTimeout = setTimeout(callback, 3_600_000);
    }

    clearReconnectTimer() {
        clearTimeout(this.reconnectTimeout);
    }

    isFull() {
        return this.players.length >= 2;
    }

    serialize() {
        return {
            roomName: this.roomName,
            gameType: this.gameType,
            players: this.players,
            ...this.game.serialize()
        };
    }
}
