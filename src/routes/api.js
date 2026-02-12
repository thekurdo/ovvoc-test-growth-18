const express = require('express');
const router = express.Router();

// In-memory store for testing without DB connection
const messages = [];
const rooms = [];

// --- Message CRUD ---

// List messages (optionally filter by room)
router.get('/messages', (req, res) => {
  const { room, limit } = req.query;
  let result = messages;
  
  if (room) {
    result = result.filter(m => m.room === room);
  }
  
  const count = parseInt(limit) || 50;
  result = result.slice(-count);
  
  res.json({
    success: true,
    data: result,
    total: result.length
  });
});

// Get single message
router.get('/messages/:id', (req, res) => {
  const msg = messages.find(m => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }
  res.json({ success: true, data: msg });
});

// Create message
router.post('/messages', (req, res) => {
  const { content, author, room, type } = req.body;
  
  if (!content || !author || !room) {
    return res.status(400).json({
      success: false,
      error: 'content, author, and room are required'
    });
  }
  
  const message = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    content,
    author,
    room,
    type: type || 'text',
    readBy: [author],
    createdAt: new Date().toISOString()
  };
  
  messages.push(message);
  res.status(201).json({ success: true, data: message });
});

// Update message
router.put('/messages/:id', (req, res) => {
  const idx = messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }
  
  const { content, type } = req.body;
  if (content) messages[idx].content = content;
  if (type) messages[idx].type = type;
  messages[idx].updatedAt = new Date().toISOString();
  
  res.json({ success: true, data: messages[idx] });
});

// Delete message — using app.del() is deprecated in Express 5
// router.del is not a thing on Router, but app.del() is deprecated on app
// We'll use router.delete here and show app.del() in app.js
router.delete('/messages/:id', (req, res) => {
  const idx = messages.findIndex(m => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }
  
  const removed = messages.splice(idx, 1)[0];
  res.json({ success: true, data: removed });
});

// --- Room CRUD ---

router.get('/rooms', (req, res) => {
  const publicRooms = rooms.filter(r => !r.isPrivate);
  res.json({ success: true, data: publicRooms, total: publicRooms.length });
});

router.get('/rooms/:id', (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  res.json({ success: true, data: room });
});

router.post('/rooms', (req, res) => {
  const { name, description, createdBy, isPrivate } = req.body;
  
  if (!name || !createdBy) {
    return res.status(400).json({
      success: false,
      error: 'name and createdBy are required'
    });
  }
  
  const room = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name,
    description: description || '',
    createdBy,
    members: [createdBy],
    isPrivate: isPrivate || false,
    maxMembers: 50,
    lastActivity: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  rooms.push(room);
  res.status(201).json({ success: true, data: room });
});

router.delete('/rooms/:id', (req, res) => {
  const idx = rooms.findIndex(r => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Room not found' });
  }
  
  const removed = rooms.splice(idx, 1)[0];
  // Also remove all messages in this room
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].room === removed.id) {
      messages.splice(i, 1);
    }
  }
  
  res.json({ success: true, data: removed });
});

// --- Stats ---

router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalMessages: messages.length,
      totalRooms: rooms.length,
      publicRooms: rooms.filter(r => !r.isPrivate).length,
      privateRooms: rooms.filter(r => r.isPrivate).length
    }
  });
});

// Express 4 wildcard pattern: app.get('*', handler)
// In Express 5, wildcard '*' must become '/{*path}' (path-to-regexp v8)
router.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

module.exports = router;
module.exports._messages = messages;
module.exports._rooms = rooms;
