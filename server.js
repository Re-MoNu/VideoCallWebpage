const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

// Initialize a new express application
const app = express();
// Serve static files from the public directory
app.use(express.static('public'));

// Create an HTTP server
const server = http.createServer(app);
// Initialize socket.io with the HTTP server
const io = socketIo(server);

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

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
