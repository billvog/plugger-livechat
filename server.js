const express = require('express');
const app = express();
const server = app.listen(5000);
const io = require('socket.io')(server);
const cookieParser = require("cookie-parser");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(cookieParser());

// Socket.io
var clientsCount = {};
io.sockets.on('connection', (socket) => {
    socket.on('join-room', (roomId, username) => {
        socket.join(roomId);
        socket.nickname = username;
        socket.connectedRoom = roomId;

        if (clientsCount[roomId] == undefined) clientsCount[roomId] = 1;
        else clientsCount[roomId]++;

        io.in(roomId).emit('user-count-changed', clientsCount[roomId]);
        socket.to(roomId).broadcast.emit('user-connected', socket.nickname);
    });

    socket.on('disconnect', () => {
        clientsCount[socket.connectedRoom]--;

        socket.to(socket.connectedRoom).emit('user-count-changed', clientsCount[socket.connectedRoom]);
        socket.to(socket.connectedRoom).broadcast.emit('user-disconnected', socket.nickname);
    });

    socket.on('new-message', (roomId, message) => {
        if (message.message.trim() == '' || message.message.trim().length > 512)
            return;

        socket.join(roomId);
        socket.to(roomId).broadcast.emit('new-message', message);
    });
});

// Routes
app.use('/', require('./routes/index'));
app.use('/room', require('./routes/room'));