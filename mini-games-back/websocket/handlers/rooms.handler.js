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
                choices: {},
                lastResult: null
            });
        }

        const game = games.get(room);
        
        game.players.push({ id: socket.id, pseudo: pseudo });

        if (game.players.length === 2) {
            game.status = 'playing';
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
            if (games.has(room)) {
                io.to(room).emit("security_error", "L'adversaire a quitté la base.");
                games.delete(room);
            }
        });
    });
};

// --- LOGIQUE INTERNE TICTACTOE ---
function handleTictactoe(game, index, socketId, room, io) {
    const playerIndex = game.players.findIndex(p => p.id === socketId);
    
    if (playerIndex !== game.turn) return;
    if (game.board[index] !== null) return;

    game.board[index] = game.turn === 0 ? 'X' : 'O';
    
    const result = checkWin(game.board);
    if (result) {
        game.status = 'finished';
        game.lastResult = result;
    } else {
        game.turn = game.turn === 0 ? 1 : 0;
    }
    
    io.to(room).emit("update_ui", game);
}

// --- LOGIQUE INTERNE SHIFUMI ---
function handleShifumi(game, choice, socketId, room, io) {
    game.choices[socketId] = choice;

    const playerIds = game.players.map(p => p.id);
    
    if (Object.keys(game.choices).length === 2) {
        const result = getWinner(game.choices[playerIds[0]], game.choices[playerIds[1]]);
        game.status = 'finished';
        
        if (result === 'draw') {
            game.lastResult = 'draw';
        } else {
            game.lastResult = result === 'playerA' ? playerIds[0] : playerIds[1];
        }
    }
    
    io.to(room).emit("update_ui", game);
}