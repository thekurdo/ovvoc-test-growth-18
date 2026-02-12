const { Server } = require('socket.io');

function setupSocket(httpServer, corsOptions) {
  const io = new Server(httpServer, {
    cors: corsOptions || {
      origin: '*',
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Socket.IO 3 middleware pattern
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      // Allow anonymous connections for now
      socket.data.username = 'anonymous-' + Math.random().toString(36).substr(2, 6);
    } else {
      // In production, verify JWT here
      socket.data.username = token;
    }
    next();
  });

  // Additional middleware — logging
  io.use((socket, next) => {
    console.log(`[Socket.IO] Connection attempt from ${socket.handshake.address}`);
    next();
  });

  io.on('connection', (socket) => {
    const username = socket.data.username;
    console.log(`[Socket.IO] ${username} connected (${socket.id})`);

    // Join a room
    socket.on('join-room', async (roomName) => {
      socket.join(roomName);

      // Socket.IO 3: io.allSockets() — returns all connected socket IDs
      // Changed to io.fetchSockets() in v4
      const allSockets = await io.allSockets();
      console.log(`[Socket.IO] Total connected: ${allSockets.size}`);

      // Get sockets in specific room (v3 pattern)
      const roomSockets = await io.in(roomName).allSockets();
      
      // Broadcast to room
      io.to(roomName).emit('user-joined', {
        username,
        room: roomName,
        memberCount: roomSockets.size,
        totalOnline: allSockets.size
      });

      // socket.rooms is a Set in v3+
      console.log(`[Socket.IO] ${username} rooms:`, [...socket.rooms]);
    });

    // Leave room
    socket.on('leave-room', (roomName) => {
      socket.leave(roomName);
      io.to(roomName).emit('user-left', {
        username,
        room: roomName
      });
    });

    // Send message to room
    socket.on('message', (data) => {
      const { room, content, type } = data;
      if (!room || !content) return;

      const message = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        content,
        author: username,
        room,
        type: type || 'text',
        createdAt: new Date().toISOString()
      };

      // Emit to everyone in the room including sender
      io.to(room).emit('new-message', message);
    });

    // Typing indicator
    socket.on('typing', (roomName) => {
      // Broadcast to others in the room (not sender)
      socket.to(roomName).emit('user-typing', { username });
    });

    socket.on('stop-typing', (roomName) => {
      socket.to(roomName).emit('user-stop-typing', { username });
    });

    // Get online users in a room
    socket.on('get-room-users', async (roomName, callback) => {
      try {
        // v3 pattern: allSockets() in a room
        const socketIds = await io.in(roomName).allSockets();
        const users = [];
        
        for (const id of socketIds) {
          const s = io.sockets.sockets.get(id);
          if (s) {
            users.push({
              id: s.id,
              username: s.data.username
            });
          }
        }
        
        if (typeof callback === 'function') {
          callback({ users, count: users.length });
        }
      } catch (err) {
        if (typeof callback === 'function') {
          callback({ error: err.message });
        }
      }
    });

    // Disconnect handling
    socket.on('disconnecting', () => {
      // socket.rooms includes all rooms the socket is in (including its own ID room)
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          io.to(room).emit('user-left', {
            username,
            room
          });
        }
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] ${username} disconnected: ${reason}`);
    });
  });

  return io;
}

module.exports = { setupSocket };
