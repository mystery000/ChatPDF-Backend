const socketIO = require('socket.io');

let io;

module.exports = {
    init: (server) => {
        io = socketIO(server, {
            cors: {
                origin: '*',
            },
        });
        io.on('connection', (socket) => {
            console.log(`socket ${socket.id} connected`);
            socket.on(`disconnect`, (reason) => {
                console.log(
                    `socket ${socket.id} disconnected due to ${reason}`,
                );
            });
        });
        return io;
    },
    getSocketIO: () => {
        if (!io) {
            throw new Error("Can't get io instance before calling .init()");
        }
        return io;
    },
};
