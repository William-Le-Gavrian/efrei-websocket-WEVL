import { checkWin } from '../../services/tictactoe.js';
import { getWinner } from '../../services/shifumi.js';
import { setWord, guessLetter, guessWord } from "../../services/hangman.js";

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
            let newGame = {
                roomName: room,
                gameType: gameType,
                status: 'waiting',
                players: [],
                lastResult: null
            }

            if('tictactoe' === gameType) {
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
            game.players.push({ id: socket.id, pseudo: pseudo });
            game.lastResult = null;

            if ('tictactoe' === game.gameType) {
                game.scores = { X: 0, O: 0 };
                game.board = Array(9).fill(null);
                game.turn = 0;
            } else if ('hangman' === game.gameType) {

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
            if ('shifumi' === game.gameType) {
                game.scores = { [game.players[0].id]: 0, [game.players[1].id]: 0 };
            } else if ('hangman' === game.gameType) {
                game.status = 'choosing';
            }
        }

        io.to(room).emit("update_ui", game);
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
        } else if ('hangman' === game.gameType ) {
            handleHangman(game, room, socket.id, io, moveData);
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
                const winnerIndex = result === 'X' ? 0 : 1;
                const loserIndex = result === 'X' ? 1 : 0;
                updateLeaderboard(game.players[winnerIndex].pseudo, game.players[loserIndex].pseudo, io);
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
            const winner = game.players.find(p => p.id === winnerId);
            const loser = game.players.find(p => p.id !== winnerId);
            updateLeaderboard(winner.pseudo, loser.pseudo, io);
        } else {
            game.choices = {};
        }
    }

    io.to(room).emit("update_ui", game);
}

function handleHangman(game, room, socketId, io, data) {
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
    }
    io.to(room).emit("update_ui", game);
}