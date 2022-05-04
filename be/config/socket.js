const socket = require('socket.io');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use('/socket.io', (req, res, next) => {
    next();
});
const server = require('http').createServer(app);
const io = socket(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('connection');
    io.emit('connection', 'Response From Server, Client Connect Success');
});

server.listen(7777, () => {
    console.log(`Socket server runing at http://localhost:${7777}`);
});

module.exports = { io };
