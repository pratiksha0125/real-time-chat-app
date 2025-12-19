// server/index.js
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config(); // This should be at the VERY TOP

const connectDB = require('./db'); // Add this
const mongoSaveMessage = require('./services/mongo-save-message');
const mongoGetMessages = require('./services/mongo-get-messages');

// Connect to MongoDB BEFORE setting up socket.io
connectDB(); // Add this

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Server is running');
});

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const CHAT_BOT = 'ChatBot';
let allUsers = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // =========================
  // JOIN ROOM
  // =========================
  socket.on('join_room', async ({ username, room }) => {
    socket.join(room);
    
    allUsers = allUsers.filter(user => user.id !== socket.id);

    const user = { id: socket.id, username, room };
    allUsers.push(user);

    const chatRoomUsers = allUsers.filter(
      (u) => u.room === room
    );

    // ✅ FETCH LAST 100 MESSAGES
    try {
      let last100Messages = await mongoGetMessages(room);

      if (!Array.isArray(last100Messages)) {
        last100Messages = [];
      }

      socket.emit('last_100_messages', last100Messages);
    } catch (err) {
      console.log('Failed to fetch messages:', err.message);
      socket.emit('last_100_messages', []);
    }

    // ✅ Welcome message
    socket.emit('receive_message', {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__: Date.now(),
    });

    // Broadcast to room about new user
    socket.to(room).emit('receive_message', {
      message: `${username} has joined the chat`,
      username: CHAT_BOT,
      __createdtime__: Date.now(),
    });

    io.to(room).emit('chatroom_users', chatRoomUsers);

    console.log(`${username} joined room ${room}`);
  });

  // =========================
  // SEND MESSAGE
  // =========================
  socket.on('send_message', async (data) => {
    const { message, username, room, __createdtime__ } = data;

    // Send to all users in room EXCEPT sender
    socket.to(room).emit('receive_message', data);
    // Also send to sender
    socket.emit('receive_message', data);

    // Save in MongoDB
    try {
      await mongoSaveMessage(message, username, room, __createdtime__);
    } catch (err) {
      console.log('DB save failed:', err.message);
    }
  });

  // =========================
  // LEAVE ROOM
  // =========================
  socket.on('leave_room', ({ username, room }) => {
    socket.leave(room);
    
    // Remove user from allUsers
    allUsers = allUsers.filter(user => user.id !== socket.id);
    
    const chatRoomUsers = allUsers.filter(user => user.room === room);
    
    // Notify others
    socket.to(room).emit('receive_message', {
      message: `${username} has left the chat`,
      username: CHAT_BOT,
      __createdtime__: Date.now(),
    });
    
    io.to(room).emit('chatroom_users', chatRoomUsers);
    
    console.log(`${username} left room ${room}`);
  });

  // =========================
  // DISCONNECT
  // =========================
  socket.on('disconnect', () => {
    const user = allUsers.find(user => user.id === socket.id);
    
    if (user) {
      allUsers = allUsers.filter(u => u.id !== socket.id);
      const chatRoomUsers = allUsers.filter(u => u.room === user.room);
      
      // Notify others
      io.to(user.room).emit('receive_message', {
        message: `${user.username} has disconnected`,
        username: CHAT_BOT,
        __createdtime__: Date.now(),
      });
      
      io.to(user.room).emit('chatroom_users', chatRoomUsers);
    }
    
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});