const rooms = new Map();

export const roomHandlers = (io, socket) => {

    io.on('connection', () => {
        socket.on('room:join', ({ roomId }) => {
            if (rooms.has(roomId)) {
                socket.join(roomId);
            }
        });

        socket.on('room:leave', ({ roomId }) => {
            if (rooms.has(roomId)) {
                socket.leave(roomId);
            }
        });
    })
}