import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for simplicity; adjust for production
    methods: ['GET', 'POST'],
  },
});

let users = {};

// Serve static files (React build)
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('new-user-joined', (name) => {
    if (!name || name.trim() === '') {
      return socket.emit('invalid-name');
    }
    console.log('New user:', name);
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
  });

  socket.on('send', (message) => {
    console.log('Message:', message, 'from:', users[socket.id]);
    socket.broadcast.emit('receive', { message, name: users[socket.id] });
  });

  socket.on('typing', () => {
    socket.broadcast.emit('user-typing', { name: users[socket.id], id: socket.id });
  });

  socket.on('stop-typing', () => {
    socket.broadcast.emit('user-stopped-typing', { id: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    socket.broadcast.emit('user-left', users[socket.id]);
    delete users[socket.id];
  });
});

server.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});