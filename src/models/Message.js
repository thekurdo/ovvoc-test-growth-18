const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  room: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['text', 'system', 'image'],
    default: 'text'
  },
  readBy: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mongoose 6 callback-based query patterns
// These callbacks are removed in Mongoose 7+

messageSchema.statics.findByRoom = function(roomId, callback) {
  // Callback pattern — deprecated in Mongoose 7
  return this.find({ room: roomId })
    .sort({ createdAt: -1 })
    .limit(50)
    .exec(callback);
};

messageSchema.statics.findRecent = function(limit, callback) {
  // Callback-based exec — removed in Mongoose 7
  return this.find({})
    .sort({ createdAt: -1 })
    .limit(limit || 20)
    .exec(callback);
};

messageSchema.statics.createMessage = function(data, callback) {
  // create() with callback — still works in 6, removed in 7
  return this.create(data, callback);
};

messageSchema.statics.removeByRoom = function(roomId, callback) {
  // remove() is deprecated in Mongoose 6, removed in 7
  // Should use deleteMany() instead
  return this.remove({ room: roomId }, callback);
};

messageSchema.statics.findOneAndRemove = function(messageId, callback) {
  // findOneAndRemove deprecated — use findOneAndDelete in Mongoose 7
  return mongoose.Model.findOneAndRemove.call(this, { _id: messageId }, callback);
};

messageSchema.statics.countByRoom = function(roomId, callback) {
  // count() deprecated in 6, removed in 7 — use countDocuments()
  return this.count({ room: roomId }, callback);
};

// Instance method using remove() — deprecated
messageSchema.methods.softDelete = function(callback) {
  this.type = 'system';
  this.content = '[deleted]';
  return this.save(callback);
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
