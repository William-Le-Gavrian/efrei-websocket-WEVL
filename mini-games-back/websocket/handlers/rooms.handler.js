import { checkWin } from '../../services/tictactoe.js';
import { getWinner } from '../../services/shifumi.js';

const games = new Map();
const leaderboard = new Map();

function updateLeaderboard(winnerPseudo, loserPseudo, io) {
    if (!winnerPseudo || !loserPseudo) return;
    
    const wKey = winnerPseudo.toLowerCase();
    const lKey = loserPseudo.toLowerCase();
    
    if (!leaderboard.has(wKey)) leaderboard.set(wKey, { wins: 0, losses: 0 });
    if (!leaderboard.has(lKey)) leaderboard.set(lKey, { wins: 0, losses: 0 });
    
    leaderboard.get(wKey).wins++;
    leaderboard.get(lKey).losses++;
    
    io.emit("leaderboard_update", getLeaderboardData());
}

function getLeaderboardData() {
    return Array.from(leaderboard.entries()).map(([pseudo, stats]) => ({
        pseudo,
        wins: stats.wins,
        losses: stats.losses,
    }));
}

export const roomHandlers = (io, socket) => {

    socket.on('get_leaderboard', () => {
        socket.emit('leaderboard_update', getLeaderboardData());
    });

    socket.on('sync_stats', ({ pseudo, wins, losses }) => {
        if (!pseudo) return;
        const key = pseudo.toLowerCase();
        if (!leaderboard.has(key)) {
            leaderboard.set(key, { wins: wins || 0, losses: losses || 0 });
        } else {
            const current = leaderboard.get(key);
            current.wins = Math.max(current.wins, wins || 0);
            current.losses = Math.max(current.losses, losses || 0);
        }
    });

    socket.on('join_game', ({ room, pseudo, gameType }) => {
        socket.rooms.forEach(r => {
            if (r !== socket.id) socket.leave(r);
        });

        const gameRoomId = `${gameType}_${room}`;

        const clients = io.sockets.adapter.rooms.get(gameRoomId);
        const numClients = clients ? clients.size : 0;

        if (numClients >= 2) {
            socket.emit("security_error", "Dojo complet (2/2). Choisis une autre planète !");
            return;
        }

        socket.join(gameRoomId);

        if (!games.has(gameRoomId)) {
            games.set(gameRoomId, {
                roomName: room,
                gameType: gameType,
                status: 'waiting',
                players: [],
                board: Array(9).fill(null),
                turn: 0,
                scores: {}, 
                choices: {},
                lastResult: null
            });
        }

        const game = games.get(gameRoomId);

        if (!game.players.find(p => p.id === socket.id)) {
            game.players.push({ id: socket.id, pseudo: pseudo });
            
            if (game.gameType === 'shifumi') {
                game.scores[socket.id] = 0;
            } else if (game.gameType === 'tictactoe' && game.players.length === 1) {
                game.scores = { X: 0, O: 0 };
            }
        }

        io.to(gameRoomId).emit('message', {
            username: 'SYSTEM',
            userId: 'system',
            content: `${pseudo} a rejoint la salle`,
            timestamp: new Date(),
        });

        if (game.players.length === 2) {
            game.status = 'playing';
            game.board = Array(9).fill(null);
            if (game.gameType === 'shifumi') {
                game.players.forEach(p => {
                    if (game.scores[p.id] === undefined) game.scores[p.id] = 0;
                });
            }
        }

        io.to(gameRoomId).emit("update_ui", game);
    });

    socket.on('make_move', (moveData) => {
        const room = Array.from(socket.rooms).find(r => games.has(r));
        const game = games.get(room);
        if (!game || game.status !== 'playing') return;

        if (game.gameType === 'tictactoe') {
            handleTictactoe(game, moveData, socket.id, room, io);
        } else if (game.gameType === 'shifumi') {
            handleShifumi(game, moveData, socket.id, room, io);
        }
    });

    socket.on('leave_room', () => {
        handleDeparture(socket, io);
    });

    socket.on('disconnecting', () => {
        handleDeparture(socket, io);
    });

    socket.on('message', (msg) => {
        const room = Array.from(socket.rooms).find(r => games.has(r));
        const game = games.get(room);
        if (!game) return;

        const currentUser = game.players.find(p => p.id === socket.id);
        if(!currentUser) return;

        io.to(room).emit('message', {
          username: currentUser.pseudo,
          userId: socket.id,
          content: msg,
          timestamp: new Date(),
        });
    });
};

function handleDeparture(socket, io) {
    socket.rooms.forEach(room => {
        const game = games.get(room);
        if (game) {
            const player = game.players.find(p => p.id === socket.id);
            if (player) {
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${player.pseudo} a quitté la salle`,
                    timestamp: new Date(),
                });
            }

            game.players = game.players.filter(p => p.id !== socket.id);

            if (game.players.length === 0) {
                games.delete(room);
            } else {
                if (game.status !== 'finished') {
                    game.status = 'waiting';
                    game.board = Array(9).fill(null);
                    game.choices = {};
                    game.scores = {}; 
                    game.lastResult = null;
                }
                
                io.to(room).emit("update_ui", game);
            }
        }
    });
}

function handleTictactoe(game, index, socketId, room, io) {
    const playerIndex = game.players.findIndex(p => p.id === socketId);
    if (playerIndex !== game.turn || game.board[index] !== null) return;

    const symbol = game.turn === 0 ? 'X' : 'O';
    game.board[index] = symbol;
    const result = checkWin(game.board);

    if (result) {
        if (result === 'draw') {
            game.board = Array(9).fill(null);
        } else {
            game.scores[result]++;
            game.board = Array(9).fill(null);

            if (game.scores[result] === 3) {
                game.status = 'finished';
                game.lastResult = result;
                const winnerIndex = result === 'X' ? 0 : 1;
                const loserIndex = result === 'X' ? 1 : 0;
                if(game.players[winnerIndex] && game.players[loserIndex]) {
                    updateLeaderboard(game.players[winnerIndex].pseudo, game.players[loserIndex].pseudo, io);
                }
            }
        }
    } else {
        game.turn = game.turn === 0 ? 1 : 0;
    }
    io.to(room).emit("update_ui", game);
}

function handleShifumi(game, choice, socketId, room, io) {
    if (game.choices[socketId]) return;

    game.choices[socketId] = choice;
    io.to(room).emit("update_ui", game);

    if (Object.keys(game.choices).length === 2) {
        const p1Id = game.players[0].id;
        const p2Id = game.players[1].id;
        const c1 = game.choices[p1Id];
        const c2 = game.choices[p2Id];

        if (c1 !== c2) {
            const winsAgainst = { pierre: 'ciseaux', feuille: 'pierre', ciseaux: 'feuille' };
            if (winsAgainst[c1] === c2) {
                game.scores[p1Id]++;
            } else {
                game.scores[p2Id]++;
            }
        }

        const winnerId = Object.keys(game.scores).find(id => game.scores[id] === 3);

        if (winnerId) {
            game.status = 'finished';
            game.lastResult = winnerId;
            const winner = game.players.find(p => p.id === winnerId);
            const loser = game.players.find(p => p.id !== winnerId);
            if(winner && loser) {
                updateLeaderboard(winner.pseudo, loser.pseudo, io);
            }
            io.to(room).emit("update_ui", game);
        } else {
            setTimeout(() => {
                game.choices = {};
                io.to(room).emit("update_ui", game);
            }, 2000);
            io.to(room).emit("update_ui", game);
        }
    }
}