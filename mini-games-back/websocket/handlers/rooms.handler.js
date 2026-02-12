import { checkWin } from '../../services/tictactoe.js';
import { getWinner } from '../../services/shifumi.js';

const games = new Map();

export const roomHandlers = (io, socket) => {

    // ÉVÉNEMENT : REJOINDRE UNE SALLE
    socket.on('join_game', ({ room, pseudo, gameType }) => {
        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;

        if (numClients >= 2) {
            socket.emit("security_error", "Dojo complet (2/2). Choisis une autre planète !");
            return;
        }

        socket.join(room);
        console.log(`${pseudo} a rejoint la salle : ${room}`);

        if (!games.has(room)) {
            games.set(room, {
                roomName: room,
                gameType: gameType,
                status: 'waiting',
                players: [],
                board: Array(9).fill(null),
                turn: 0,
                scores: { X: 0, O: 0 },
                choices: {},
                lastResult: null
            });
        }

        const game = games.get(room);

        if (!game.players.find(p => p.id === socket.id)) {
            game.players.push({ id: socket.id, pseudo: pseudo });
            game.board = Array(9).fill(null);
            game.turn = 0;
            game.lastResult = null;

            if (game.gameType === 'tictactoe') {
                game.scores = { X: 0, O: 0 };
            }
        }

        io.to(room).emit('message', {
            username: 'SYSTEM',
            userId: 'system',
            content: `${pseudo} a rejoint la salle`,
            timestamp: new Date(),
        })

        if (game.players.length === 2) {
            game.status = 'playing';
            if (game.gameType === 'shifumi') {
                game.scores = { [game.players[0].id]: 0, [game.players[1].id]: 0 };
            }
        }

        io.to(room).emit("update_ui", game);
    });

    // ÉVÉNEMENT : FAIRE UN MOUVEMENT
    socket.on('make_move', (moveData) => {
        const room = Array.from(socket.rooms).find(r => r !== socket.id);
        const game = games.get(room);

        if (!game || game.status !== 'playing') return;
        if (game.gameType === 'tictactoe') {
            handleTictactoe(game, moveData, socket.id, room, io);
        } else if (game.gameType === 'shifumi') {
            handleShifumi(game, moveData, socket.id, room, io);
        }
    });

    // ÉVÉNEMENT : DÉCONNEXION
    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            const game = games.get(room);
            if (game) {
                const pseudo = game.players.find(p => p.id === socket.id)?.pseudo;
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${pseudo} a quitté la salle`,
                    timestamp: new Date(),
                });

                game.players = game.players.filter(p => p.id !== socket.id);
                // io.to(room).emit("security_error", "L'adversaire a quitté la base.");

                if (game.players.length === 0) {
                    games.delete(room);
                } else {
                    game.status = 'waiting';
                    io.to(room).emit("update_ui", game);
                }
            }
        });
    });

    socket.on('message', (msg) => {
        const room = Array.from(socket.rooms).find(room => room !== socket.id);
        if (!room) {
          return
        }

        const game = games.get(room);
        if (!game) {
          return
        }

        const currentUser = game.players.find(player => socket.id === player.id);
        if(!currentUser) {
          return;
        }

        io.to(room).emit('message', {
          username: currentUser.pseudo,
          userId: socket.id,
          content: msg,
          timestamp: new Date(),
        });
    })
};

// --- LOGIQUE INTERNE TICTACTOE (Best of 5) ---
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
            }
        }
    } else {
        game.turn = game.turn === 0 ? 1 : 0;
    }

    io.to(room).emit("update_ui", game);
}

// --- LOGIQUE INTERNE SHIFUMI (Best of 5) ---
function handleShifumi(game, choice, socketId, room, io) {
    game.choices[socketId] = choice;

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
        } else {
            game.choices = {};
        }
    }

    io.to(room).emit("update_ui", game);
}