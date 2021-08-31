const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});
const { v4: uuidV4 } = require('uuid');
var port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

app.get('/:roomId', (req, res) => {
    res.render('room', { roomId: req.params.roomId });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.broadcast.emit('user-connected', userId);
        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message, userName);
        });

        socket.on('disconnect', () => {
            console.log('Awdawdawd');
            socket.broadcast.emit('user-disconnected', userId);
        });
    });
});

server.listen(port);
