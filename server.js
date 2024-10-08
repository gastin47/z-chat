// server.js
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');

// Публичная папка для статических файлов
app.use(express.static('public'));

// Генерация уникальной ссылки для комнаты
app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`);
});

// Отображение комнаты по ID
app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

// Обработка подключений через Socket.io
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, userName) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId, userName);

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId, userName);
        });
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});


// Запуск сервера на порту 3000
server.listen(3000, () => {
    console.log('Сервер запущен на порту 3000');
});
