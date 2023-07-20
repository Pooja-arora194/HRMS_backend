const socketIO = require('socket.io');

const initializeSocket = (io) => {
    io.on('connection', (socket) => {
        socket.on('like', (postId, isLike) => {
            io.emit('like', postId);
        });
    });
};

module.exports = {
    initializeSocket
};
