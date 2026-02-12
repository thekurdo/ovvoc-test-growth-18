const assert = require('assert');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    passed++;
  } catch (err) {
    console.log('  FAIL: ' + name);
    console.log('        ' + err.message);
    failed++;
  }
}

console.log('');
console.log('=== ovvoc-test-growth-18: Multi-package CRUD + Realtime App ===');
console.log('');

console.log('Express 4.18.2:');

test('express module loads', () => {
  const express = require('express');
  assert.ok(express, 'express should be importable');
});

test('express has app.del() deprecated method', () => {
  const express = require('express');
  const app = express();
  assert.strictEqual(typeof app.del, 'function', 'app.del should exist in Express 4');
});

test('express version is 4.x', () => {
  const pkg = require('express/package.json');
  assert.ok(pkg.version.startsWith('4.'), 'Expected 4.x, got ' + pkg.version);
});

test('express app can create router', () => {
  const express = require('express');
  const router = express.Router();
  assert.ok(router, 'Router should be created');
  assert.strictEqual(typeof router.get, 'function');
  assert.strictEqual(typeof router.post, 'function');
  assert.strictEqual(typeof router.delete, 'function');
});

test('express wildcard route registers without error', () => {
  const express = require('express');
  const app = express();
  app.get('*', (req, res) => res.send('ok'));
  assert.ok(true, 'Wildcard route registered');
});

console.log('');
console.log('Socket.IO 3.1.2:');

test('socket.io module loads', () => {
  const { Server } = require('socket.io');
  assert.ok(Server, 'Server should be importable');
});

test('socket.io Server can be instantiated standalone', () => {
  const http = require('http');
  const { Server } = require('socket.io');
  const srv = http.createServer();
  const io = new Server(srv);
  assert.ok(io, 'Server instance should be created');
  assert.strictEqual(typeof io.on, 'function', 'io.on should exist');
  io.close();
  srv.close();
});

test('socket.io v3 has allSockets method', () => {
  const http = require('http');
  const { Server } = require('socket.io');
  const srv = http.createServer();
  const io = new Server(srv);
  assert.strictEqual(typeof io.allSockets, 'function', 'io.allSockets should exist in v3');
  io.close();
  srv.close();
});

test('socket.io has to and in methods', () => {
  const http = require('http');
  const { Server } = require('socket.io');
  const srv = http.createServer();
  const io = new Server(srv);
  assert.strictEqual(typeof io.to, 'function', 'io.to should exist');
  assert.strictEqual(typeof io.in, 'function', 'io.in should exist');
  io.close();
  srv.close();
});

test('socket.io version is 3.x', () => {
  const fs = require('fs');
  const path = require('path');
  const pkgPath = path.join(path.dirname(require.resolve('socket.io')), '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert.ok(pkg.version.startsWith('3.'), 'Expected 3.x, got ' + pkg.version);
});

test('socket.io use middleware exists', () => {
  const http = require('http');
  const { Server } = require('socket.io');
  const srv = http.createServer();
  const io = new Server(srv);
  assert.strictEqual(typeof io.use, 'function', 'io.use should exist for middleware');
  io.close();
  srv.close();
});

console.log('');
console.log('Mongoose 6.12.3:');

test('mongoose module loads', () => {
  const mongoose = require('mongoose');
  assert.ok(mongoose, 'mongoose should be importable');
});

test('mongoose version is 6.x', () => {
  const mongoose = require('mongoose');
  assert.ok(mongoose.version.startsWith('6.'), 'Expected 6.x, got ' + mongoose.version);
});

test('mongoose Schema and model work', () => {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({ name: String });
  const TestModel = mongoose.model('TestGrowth18Model', schema);
  assert.ok(TestModel, 'Model should be created');
  assert.strictEqual(typeof TestModel.find, 'function');
  assert.strictEqual(typeof TestModel.create, 'function');
});

test('mongoose model has count - deprecated in 7', () => {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({ value: Number });
  const CountModel = mongoose.model('TestGrowth18Count', schema);
  assert.strictEqual(typeof CountModel.count, 'function', 'count should exist in Mongoose 6');
});

test('mongoose model has remove - deprecated in 7', () => {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({ value: Number });
  const RemoveModel = mongoose.model('TestGrowth18Remove', schema);
  assert.strictEqual(typeof RemoveModel.remove, 'function', 'remove should exist in Mongoose 6');
});

test('mongoose model has update - deprecated in 7', () => {
  const mongoose = require('mongoose');
  const schema = new mongoose.Schema({ value: Number });
  const UpdateModel = mongoose.model('TestGrowth18Update', schema);
  assert.strictEqual(typeof UpdateModel.update, 'function', 'update should exist in Mongoose 6');
});

console.log('');
console.log('Message Model:');

test('Message model loads and has schema', () => {
  const Message = require('../src/models/Message');
  assert.ok(Message, 'Message should load');
  assert.ok(Message.schema, 'Message should have schema');
  assert.ok(Message.schema.paths.content, 'Schema should have content field');
  assert.ok(Message.schema.paths.author, 'Schema should have author field');
  assert.ok(Message.schema.paths.room, 'Schema should have room field');
});

test('Message has static methods', () => {
  const Message = require('../src/models/Message');
  assert.strictEqual(typeof Message.findByRoom, 'function');
  assert.strictEqual(typeof Message.findRecent, 'function');
  assert.strictEqual(typeof Message.createMessage, 'function');
  assert.strictEqual(typeof Message.removeByRoom, 'function');
  assert.strictEqual(typeof Message.countByRoom, 'function');
});

console.log('');
console.log('Room Model:');

test('Room model loads and has schema', () => {
  const Room = require('../src/models/Room');
  assert.ok(Room, 'Room should load');
  assert.ok(Room.schema, 'Room should have schema');
  assert.ok(Room.schema.paths.name, 'Schema should have name field');
  assert.ok(Room.schema.paths.members, 'Schema should have members field');
});

test('Room has static methods', () => {
  const Room = require('../src/models/Room');
  assert.strictEqual(typeof Room.updateActivity, 'function');
  assert.strictEqual(typeof Room.countRooms, 'function');
  assert.strictEqual(typeof Room.countPublicRooms, 'function');
  assert.strictEqual(typeof Room.addMember, 'function');
  assert.strictEqual(typeof Room.removeRoom, 'function');
});

console.log('');
console.log('CORS 2.8.5:');

test('cors module loads', () => {
  const cors = require('cors');
  assert.ok(cors, 'cors should be importable');
  assert.strictEqual(typeof cors, 'function', 'cors should be a function');
});

test('cors returns middleware function', () => {
  const cors = require('cors');
  const middleware = cors({ origin: '*' });
  assert.strictEqual(typeof middleware, 'function', 'cors should return middleware');
});

console.log('');
console.log('Socket Setup:');

test('setupSocket function loads', () => {
  const { setupSocket } = require('../src/socket');
  assert.strictEqual(typeof setupSocket, 'function', 'setupSocket should be a function');
});

test('setupSocket creates io server with http server', () => {
  const http = require('http');
  const { setupSocket } = require('../src/socket');
  const server = http.createServer();
  const io = setupSocket(server);
  assert.ok(io, 'io should be created');
  assert.strictEqual(typeof io.allSockets, 'function', 'io should have allSockets v3');
  io.close();
  server.close();
});

console.log('');
console.log('API Routes:');

test('api routes module loads', () => {
  const apiRoutes = require('../src/routes/api');
  assert.ok(apiRoutes, 'apiRoutes should load');
});

test('api routes export internal stores for testing', () => {
  const apiRoutes = require('../src/routes/api');
  assert.ok(Array.isArray(apiRoutes._messages), '_messages should be an array');
  assert.ok(Array.isArray(apiRoutes._rooms), '_rooms should be an array');
});

console.log('');
console.log('Integration:');

test('app.js exports app, server, and io', () => {
  const { app, server, io } = require('../src/app');
  assert.ok(app, 'app should be exported');
  assert.ok(server, 'server should be exported');
  assert.ok(io, 'io should be exported');
  io.close();
  server.close();
});

test('app has del method - Express 4 deprecated', () => {
  const { app, server, io } = require('../src/app');
  assert.strictEqual(typeof app.del, 'function', 'app.del should exist in Express 4');
  io.close();
  server.close();
});

// --- Results ---

console.log('');
var sep = '==================================================';
console.log(sep);
console.log('Results: ' + passed + ' passed, ' + failed + ' failed, ' + (passed + failed) + ' total');
console.log(sep);
console.log('');

if (failed > 0) {
  process.exit(1);
}