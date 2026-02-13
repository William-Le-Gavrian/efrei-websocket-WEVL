import { GameRoom } from '../classes/GameRoom.js';
import { Tictactoe } from '../classes/Tictactoe.js';
import { Shifumi } from '../classes/Shifumi.js';
import { Hangman } from '../classes/Hangman.js';

const GAME_FACTORIES = {
    tictactoe: () => new Tictactoe(),
    shifumi: () => new Shifumi(),
    hangman: () => new Hangman(),
};

export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomName, gameType) {
        const game = GAME_FACTORIES[gameType]?.();
        if (!game) throw new Error(`Type de jeu inconnu : ${gameType}`);

        const room = new GameRoom(roomName, gameType, game);
        this.rooms.set(roomName, room);
        return room;
    }

    getRoom(roomName) {
        return this.rooms.get(roomName);
    }

    deleteRoom(roomName) {
        this.rooms.delete(roomName);
    }

    getActiveRooms() {
        return [...this.rooms.entries()]
            .filter(([, r]) => ['playing', 'waiting_reconnect'].includes(r.status))
            .map(([name]) => name);
    }

    broadcastActiveRooms(io) {
        io.emit('active_rooms_update', this.getActiveRooms());
    }
}
