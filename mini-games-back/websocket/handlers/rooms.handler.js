const rooms = new Map();

export const roomHandlers = (io, socket) => {

    socket.on('room:join', ({username, roomId}) => {
        socket.data.username = username;
        socket.data.roomId = roomId;

        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        socket.join(roomId);

        socket.to(roomId).emit('system', { message: `${username} a rejoint la room.` });
        console.log(`${username} joined room ${roomId}`);
    });

    socket.on('room:leave', () => {
        const roomId = socket.data.roomId;
        const username = socket.data.username;
        if (!roomId) return;

        socket.leave(roomId);
        if (rooms.has(roomId)) {
            rooms.get(roomId).delete(socket.id);
        }

        socket.to(roomId).emit('system', { message: `${username} a quitté la room.` });
        console.log(`${username} left room ${roomId}`);
        socket.data.roomId = null;
    });

    socket.on('room:message', ({msg}) => {
        io.to(socket.data.roomId).emit('room:message', {
            username: socket.data.username,
            msg
        });
    });
}
