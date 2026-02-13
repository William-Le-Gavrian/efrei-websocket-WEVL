import { RoomManager } from '../../rooms/roomManager.js';
import { getLeaderboard, saveGameResult } from "../../services/mongodb.js";

const manager = new RoomManager();

export const roomHandlers = (io, socket) => {

    socket.on('get_leaderboard', async () => {
        const leaderboard = await getLeaderboard();
        socket.emit('leaderboard_update', leaderboard);
    });

    socket.on('get_active_rooms', () => {
        socket.emit('active_rooms_update', manager.getActiveRooms());
    });

    socket.on('check_session', (pseudo) => {
        for (const [, gameRoom] of manager.rooms) {
            if (['playing', 'waiting_reconnect'].includes(gameRoom.status)) {
                const player = gameRoom.players.find(p => p.pseudo === pseudo);
                if (player) {
                    socket.emit('session_found', { room: gameRoom.roomName, gameType: gameRoom.gameType });
                    return;
                }
            }
        }
        socket.emit('no_session_found');
    });

    socket.on('join_game', ({ room, pseudo, gameType }) => {
        let gameRoom = manager.getRoom(room);

        if (gameRoom?.status === 'waiting_reconnect') {
            if (gameRoom.reconnect(pseudo, socket.id)) {
                socket.join(room);
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${pseudo} s'est reconnecté`,
                    timestamp: new Date(),
                });
                io.to(room).emit('update_ui', gameRoom.serialize());
                manager.broadcastActiveRooms(io);
                return;
            }
        }

        if (gameRoom && gameRoom.gameType !== gameType) {
            socket.emit('security_error', `Cette salle est réservée à ${gameRoom.gameType}`);
            return;
        }

        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;
        if (numClients >= 2) {
            socket.emit('security_error', 'Dojo complet (2/2).');
            return;
        }

        if (!gameRoom) {
            gameRoom = manager.createRoom(room, gameType);
        }

        socket.join(room);
        gameRoom.addPlayer({ id: socket.id, pseudo });

        io.to(room).emit('message', {
            username: 'SYSTEM',
            userId: 'system',
            content: `${pseudo} a rejoint la salle`,
            timestamp: new Date(),
        });

        if (gameRoom.players.length === 2) {
            gameRoom.game.onBothPlayersJoined?.(gameRoom.players);
        }

        io.to(room).emit('update_ui', gameRoom.serialize());
        manager.broadcastActiveRooms(io);
    });

    socket.on('make_move', async (moveData) => {
        const room = [...socket.rooms].find(r => r !== socket.id);
        const gameRoom = manager.getRoom(room);
        if (!gameRoom) return;

        const result = gameRoom.game.handleMove(moveData, socket.id, gameRoom.players);

        if (result?.finished) {
            await saveGameResult({ ...result, gameType: gameRoom.gameType });
            const leaderboard = await getLeaderboard();
            io.emit('leaderboard_update', leaderboard);
            manager.broadcastActiveRooms(io);
        }

        io.to(room).emit('update_ui', gameRoom.serialize());
    });

    socket.on('message', (msg) => {
        const room = [...socket.rooms].find(r => r !== socket.id);
        if (!room) return;

        const gameRoom = manager.getRoom(room);
        if (!gameRoom) return;

        const currentUser = gameRoom.players.find(p => p.id === socket.id);
        if (!currentUser) return;

        io.to(room).emit('message', {
            username: currentUser.pseudo,
            userId: socket.id,
            content: msg,
            timestamp: new Date(),
        });
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            const gameRoom = manager.getRoom(room);
            if (!gameRoom) return;

            const player = gameRoom.players.find(p => p.id === socket.id);
            if (!player) return;

            if (gameRoom.status === 'playing') {
                player.connected = false;
                gameRoom.game.status = 'waiting_reconnect';

                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${player.pseudo} s'est déconnecté — reconnexion en attente`,
                    timestamp: new Date(),
                });
                io.to(room).emit('update_ui', gameRoom.serialize());
                manager.broadcastActiveRooms(io);

                gameRoom.startReconnectTimer(async () => {
                    const connectedPlayer    = gameRoom.players.find(p => p.connected);
                    const disconnectedPlayer = gameRoom.players.find(p => !p.connected);

                    if (connectedPlayer && disconnectedPlayer) {
                        await saveGameResult({
                            winner: connectedPlayer.pseudo,
                            loser: disconnectedPlayer.pseudo,
                            gameType: gameRoom.gameType,
                            scores: { forfait: true }
                        });
                        const leaderboard = await getLeaderboard();
                        io.emit('leaderboard_update', leaderboard);
                        io.to(room).emit('security_error',
                            `${disconnectedPlayer.pseudo} a été déclaré forfait. Victoire pour ${connectedPlayer.pseudo} !`
                        );
                    }

                    gameRoom.players = gameRoom.players.filter(p => p.connected);
                    if (gameRoom.players.length === 0) {
                        manager.deleteRoom(room);
                    } else {
                        gameRoom.game.reset();
                        gameRoom.game.status = 'waiting';
                        io.to(room).emit('update_ui', gameRoom.serialize());
                    }
                    manager.broadcastActiveRooms(io);
                });

            } else if (gameRoom.status === 'waiting_reconnect') {
                gameRoom.clearReconnectTimer();
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${player.pseudo} a aussi quitté — partie annulée`,
                    timestamp: new Date(),
                });
                manager.deleteRoom(room);
                manager.broadcastActiveRooms(io);

            } else {
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${player.pseudo} a quitté la salle`,
                    timestamp: new Date(),
                });

                gameRoom.players = gameRoom.players.filter(p => p.id !== socket.id);
                if (gameRoom.players.length === 0) {
                    manager.deleteRoom(room);
                } else {
                    gameRoom.game.reset();
                    gameRoom.game.status = 'waiting';
                    io.to(room).emit('update_ui', gameRoom.serialize());
                    io.to(room).emit('security_error', "L'adversaire a quitté la partie.");
                }
                manager.broadcastActiveRooms(io);
            }
        });
    });
};
