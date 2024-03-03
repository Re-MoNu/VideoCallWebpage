const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const socketIo = require('socket.io');

const app = express();

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

// Create HTTPS server
const httpsServer = https.createServer(httpsOptions, app);

// Attach socket.io to the HTTPS server
const io = socketIo(httpsServer);

// Serve index.html at the root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve main.js
app.get('/main.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.js'));
});

// Handle connection events
io.on('connection', socket => {
  console.log('A user connected:', socket.id);

  // Relay messages to all other users
  socket.on('message', message => {
    console.log('Message received:', message);
    socket.broadcast.emit('message', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Listen on port 3000
const PORT = process.env.PORT || 3000;
httpsServer.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
