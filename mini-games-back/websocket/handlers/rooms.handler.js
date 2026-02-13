import { checkWin } from '../../services/tictactoe.js';
import { getWinner } from '../../services/shifumi.js';
import { setWord, guessLetter, guessWord } from "../../services/hangman.js";
import { saveGameResult, getLeaderboard } from '../../services/mongodb.js';

const games = new Map();

// Helper : liste des salles occupées (seulement les parties à 2 joueurs en cours)
function getActiveRooms() {
    const active = [];
    for (const [room, game] of games) {
        if (game.status === 'playing' || game.status === 'waiting_reconnect') {
            active.push(room);
        }
    }
    return active;
}

// Helper : broadcast les salles occupées à tous les clients
function broadcastActiveRooms(io) {
    io.emit('active_rooms_update', getActiveRooms());
}

export const roomHandlers = (io, socket) => {

    socket.on('get_leaderboard', async () => {
        const leaderboard = await getLeaderboard();
        socket.emit('leaderboard_update', leaderboard);
    });

    socket.on('get_active_rooms', () => {
        socket.emit('active_rooms_update', getActiveRooms());
    });

    // ÉVÉNEMENT : VÉRIFIER SI LE JOUEUR A UNE PARTIE EN ATTENTE
    socket.on('check_session', (pseudo) => {
        for (const [room, game] of games) {
            if (game.status === 'playing' || game.status === 'waiting_reconnect') {
                const player = game.players.find(p => p.pseudo === pseudo);
                if (player) {
                    socket.emit('session_found', { room, gameType: game.gameType });
                    return;
                }
            }
        }
        socket.emit('no_session_found');
    });

    // ÉVÉNEMENT : REJOINDRE UNE SALLE
    socket.on('join_game', ({ room, pseudo, gameType }) => {
        const existingGame = games.get(room);

        // --- RECONNEXION : joueur déconnecté qui revient ---
        if (existingGame && existingGame.status === 'waiting_reconnect') {
            const disconnectedPlayer = existingGame.players.find(p => p.pseudo === pseudo && !p.connected);
            if (disconnectedPlayer) {
                const oldId = disconnectedPlayer.id;
                clearTimeout(existingGame.reconnectTimeout);
                disconnectedPlayer.id = socket.id;
                disconnectedPlayer.connected = true;
                existingGame.status = 'playing';

                if (existingGame.gameType === 'shifumi') {
                    if (existingGame.scores[oldId] !== undefined) {
                        existingGame.scores[socket.id] = existingGame.scores[oldId];
                        delete existingGame.scores[oldId];
                    }
                    if (existingGame.choices[oldId] !== undefined) {
                        existingGame.choices[socket.id] = existingGame.choices[oldId];
                        delete existingGame.choices[oldId];
                    }
                }

                socket.join(room);
                console.log(`🔄 ${pseudo} s'est reconnecté à la salle : ${room}`);
                io.to(room).emit('message', {
                    username: 'SYSTEM',
                    userId: 'system',
                    content: `${pseudo} s'est reconnecté`,
                    timestamp: new Date(),
                });
                io.to(room).emit("update_ui", existingGame);
                broadcastActiveRooms(io);
                return;
            }
        }

        if (existingGame && existingGame.gameType !== gameType) {
            socket.emit("security_error", `Désolé, cette planète est réservée à un duel de ${existingGame.gameType.toUpperCase()}.`);
            return;
        }

        const clients = io.sockets.adapter.rooms.get(room);
        const numClients = clients ? clients.size : 0;

        if (numClients >= 2) {
            socket.emit("security_error", "Dojo complet (2/2). Choisis une autre planète !");
            return;
        }

        socket.join(room);
        console.log(`${pseudo} a rejoint la salle : ${room}`);

        if (!games.has(room)) {
            let newGame = {
                roomName: room,
                gameType: gameType,
                status: 'waiting',
                players: [],
                lastResult: null
            }

            if ('tictactoe' === gameType) {
                newGame.board = Array(9).fill(null);
                newGame.scores = { X: 0, O: 0 };
                newGame.turn = 0;
            } else if ('shifumi' === gameType) {
                newGame.choices = {};
            } else if ('hangman' === gameType) {
                newGame.word = "";
                newGame.maskedWord = "";
                newGame.lettersGuessed = [];
                newGame.errors = 0;
                newGame.maxErrors = 10;
            }

            games.set(room, newGame);
        }

        const game = games.get(room);

        if (!game.players.find(p => p.id === socket.id)) {
            game.players.push({ id: socket.id, pseudo: pseudo, connected: true });
            game.lastResult = null;

            if (game.gameType === 'tictactoe' && game.players.length === 1) {
                game.scores = { X: 0, O: 0 };
                // game.board = Array(9).fill(null);
                // game.turn = 0;
            }
        }

        io.to(room).emit('message', {
            username: 'SYSTEM',
            userId: 'system',
            content: `${pseudo} a rejoint la salle`,
            timestamp: new Date(),
        });

        if (game.players.length === 2) {
            game.status = 'playing';
            if ('shifumi' === game.gameType) {
                game.scores = { [game.players[0].id]: 0, [game.players[1].id]: 0 };
            } else if ('hangman' === game.gameType) {
                game.status = 'choosing';
            }
        }

        io.to(room).emit("update_ui", game);
        broadcastActiveRooms(io);
    });

    // ÉVÉNEMENT : FAIRE UN MOUVEMENT
    socket.on('make_move', (moveData) => {
        const room = Array.from(socket.rooms).find(r => r !== socket.id);
        const game = games.get(room);

        if (!game) return;

        if ('tictactoe' === game.gameType) {
            handleTictactoe(game, moveData, socket.id, room, io);
        } else if ('shifumi' === game.gameType) {
            handleShifumi(game, moveData, socket.id, room, io);
        } else if ('hangman' === game.gameType) {
            handleHangman(game, room, socket.id, io, moveData);
        }
    });

    socket.on('leave_room', () => {
        handleDeparture(socket, io);
    });

    socket.on('disconnecting', () => {
        socket.rooms.forEach(room => {
            const game = games.get(room);
            if (game) {
                const player = game.players.find(p => p.id === socket.id);
                if (!player) return;

                if (game.status === 'playing') {
                    player.connected = false;
                    game.status = 'waiting_reconnect';

                    io.to(room).emit('message', {
                        username: 'SYSTEM',
                        userId: 'system',
                        content: `${player.pseudo} s'est déconnecté — reconnexion en attente`,
                        timestamp: new Date(),
                    });
                    io.to(room).emit("update_ui", game);
                    broadcastActiveRooms(io);

                    game.reconnectTimeout = setTimeout(async () => {
                        const connectedPlayer = game.players.find(p => p.connected);
                        const disconnectedPlayer = game.players.find(p => !p.connected);

                        if (connectedPlayer && disconnectedPlayer) {
                            await saveGameResult({
                                winner: connectedPlayer.pseudo,
                                loser: disconnectedPlayer.pseudo,
                                gameType: game.gameType,
                                scores: { forfait: true }
                            });
                            const leaderboard = await getLeaderboard();
                            io.emit('leaderboard_update', leaderboard);
                            io.to(room).emit("security_error", `${disconnectedPlayer.pseudo} a été déclaré forfait. Victoire pour ${connectedPlayer.pseudo} !`);
                        }

                        game.players = game.players.filter(p => p.connected);
                        if (game.players.length === 0) {
                            games.delete(room);
                        } else {
                            game.status = 'waiting';
                            game.board = Array(9).fill(null);
                            game.choices = {};
                            game.lastResult = null;
                            io.to(room).emit("update_ui", game);
                        }
                        broadcastActiveRooms(io);
                    }, 3600000);
                } else if (game.status === 'waiting_reconnect') {
                    clearTimeout(game.reconnectTimeout);
                    io.to(room).emit('message', {
                        username: 'SYSTEM',
                        userId: 'system',
                        content: `${player.pseudo} a aussi quitté — partie annulée`,
                        timestamp: new Date(),
                    });
                    games.delete(room);
                    broadcastActiveRooms(io);
                } else {
                    io.to(room).emit('message', {
                        username: 'SYSTEM',
                        userId: 'system',
                        content: `${player.pseudo} a quitté la salle`,
                        timestamp: new Date(),
                    });

                    game.players = game.players.filter(p => p.id !== socket.id);
                    if (game.players.length === 0) {
                        games.delete(room);
                    } else {
                        game.status = 'waiting';
                        game.board = Array(9).fill(null);
                        game.choices = {};
                        game.lastResult = null;
                        io.to(room).emit("update_ui", game);
                        io.to(room).emit("security_error", "L'adversaire a quitté la partie.");
                    }
                    broadcastActiveRooms(io);
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
        if (!currentUser) {
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

// --- LOGIQUE INTERNE TICTACTOE ---
async function handleTictactoe(game, index, socketId, room, io) {
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
                if (game.players[winnerIndex] && game.players[loserIndex]) {
                    await saveGameResult({
                        winner: game.players[winnerIndex].pseudo,
                        loser: game.players[loserIndex].pseudo,
                        gameType: 'tictactoe',
                        scores: { ...game.scores }
                    });
                    const leaderboard = await getLeaderboard();
                    io.emit('leaderboard_update', leaderboard);
                }
                broadcastActiveRooms(io);
            }
        }
    } else {
        game.turn = game.turn === 0 ? 1 : 0;
    }

    io.to(room).emit("update_ui", game);
}

// --- LOGIQUE INTERNE SHIFUMI ---
async function handleShifumi(game, choice, socketId, room, io) {
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
            const winner = game.players.find(p => p.id === winnerId);
            const loser = game.players.find(p => p.id !== winnerId);
            if (winner && loser) {
                await saveGameResult({
                    winner: winner.pseudo,
                    loser: loser.pseudo,
                    gameType: 'shifumi',
                    scores: { ...game.scores }
                });
                const leaderboard = await getLeaderboard();
                io.emit('leaderboard_update', leaderboard);
            }
            broadcastActiveRooms(io);
        } else {
            game.choices = {};
        }
    }

    io.to(room).emit("update_ui", game);
}
// --- LOGIQUE INTERNE HANGMAN ---
async function handleHangman(game, room, socketId, io, data) {
    if ('choosing' === game.status) {
        if (socketId !== game.players[0].id) {
            return;
        }
        setWord(game, data.value);

    } else if ('playing' === game.status) {
        if (socketId !== game.players[1].id) {
            return;
        }

        if ('letter' === data.type) {
            guessLetter(game, data.value);
        }

        if ('word' === data.type) {
            guessWord(game, data.value);
        }
    } else if ('finished' === game.status) {
        await saveGameResult({
            winner: game.players[winnerIndex].pseudo,
            loser: game.players[loserIndex].pseudo,
            gameType: 'hangman'
        });
        const leaderboard = await getLeaderboard();
        io.emit('leaderboard_update', leaderboard);
    }
    broadcastActiveRooms(io);
}