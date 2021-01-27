const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cookieParser = require("cookie-parser");
const { formatMessage } = require('./utils/message');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.set('view engine', 'ejs');

// Third party middleware
app.use(express.static('public'));
app.use(cookieParser());

const chatbotName = 'Pluggy'
var clientsCount = {};

// Run when client connected
io.on('connection', (socket) => {
    // When user joins a room
    socket.on('join-room', (roomId, user) => {
        socket.join(roomId);

        // Set custom variables to socket obj (represents a user)
        socket.user = user;
        socket.room = roomId;

        // Update room user count
        if (clientsCount[socket.room] == undefined) clientsCount[socket.room] = 1;
        else clientsCount[socket.room]++;

        // Alert everybody in this room that user has connected
        io.to(socket.room).emit('user-count-changed', clientsCount[socket.room]);
        socket.to(socket.room).broadcast.emit('alert-message', formatMessage(
            chatbotName,
            `<b>${socket.user}</b> has connected`
        ));
    });

    // When user disconnects
    socket.on('disconnect', () => {
        // Update room user count
        clientsCount[socket.room]--;

        // Alert everybody in this room that user has disconnected
        io.to(socket.room).emit('user-count-changed', clientsCount[socket.room]);
        socket.to(socket.room).broadcast.emit('alert-message', formatMessage(
            chatbotName,
            `<b>${socket.user}</b> has disconnected`
        ));
    });

    // On new message
    socket.on('new-message', (message) => {
        // Validate message
        if (message.text.trim() == '' || message.text.trim().length > 512)
            return;

        // Send message to this room
        io.to(socket.room).emit('new-message', formatMessage(
            {
                id: socket.id,
                user: socket.user,
            },
            message.text.trim()
        ));
    });
});

// Routes
app.use('/', require('./routes/index'));
app.use('/room', require('./routes/room'));

// Errors
app.use('/public/*', (req, res) => res.render('errors/403'));
app.use('/', (req, res) => res.render('errors/404'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});