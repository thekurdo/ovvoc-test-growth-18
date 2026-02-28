const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupSocket } = require('./socket');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API routes
app.use('/api', apiRoutes);

// Express 4: app.delete() is deprecated alias for app.delete()
// This is removed in Express 5
app.delete('/legacy/cleanup', (req, res) => {
  res.json({ success: true, message: 'Legacy cleanup endpoint' });
});

// Express 4 wildcard catch-all
// In Express 5, '*' must become '/{*path}'
app.get('/{*path}', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path
  });
});

// Setup Socket.IO
const io = setupSocket(server, corsOptions);

// Make io accessible to routes if needed
app.set('io', io);

const PORT = process.env.PORT || 3000;

// Only listen if this file is run directly
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[ovvoc-test-growth-18] Server running on port ${PORT}`);
    console.log(`[ovvoc-test-growth-18] Socket.IO ready`);
  });
}

module.exports = { app, server, io };
