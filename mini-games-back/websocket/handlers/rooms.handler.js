const rooms = new Map();

export const roomHandlers = (io, socket) => {

    socket.on('room:join', ({username, roomId}) => {
        if (!rooms.has(roomId)) {
            rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(socket.id);

        socket.join(roomId);
        socket.data.username = username;
        socket.data.roomId = roomId;

        socket.to(roomId).emit("system", {
            message: `${username} joined`
        });
    });

    socket.on('room:leave', ({username, roomId}) => {
        socket.leave(roomId);
        if (rooms.has(roomId)) {
            rooms.get(roomId).delete(socket.id);
        }

        socket.to(roomId).emit("system", {
            message: `${username} left`
        });
    });

    socket.on('room:message', (msg) => {
        io.to(socket.data.roomId).emit('room:message', {
            username: socket.data.username,
            content: msg
        });
    });
}
