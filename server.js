const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve main.js
app.get('/main.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.js'));
});

const server = http.createServer(app);
const io = socketIo(server);

// Your existing socket.io setup here...

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle connection events
io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  // Relay the message to all other users
  socket.on('message', message => {
      console.log('Message received:', message);
      socket.broadcast.emit('message', message); // Use broadcast to send to all users except sender
  });


  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});