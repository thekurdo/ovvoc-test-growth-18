const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  createdBy: {
    type: String,
    required: true
  },
  members: [{
    type: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 50
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Mongoose 6 update() with callback — deprecated, use updateOne/updateMany in 7
roomSchema.statics.updateActivity = function(roomId, callback) {
  return this.update(
    { _id: roomId },
    { $set: { lastActivity: new Date() } },
    callback
  );
};

// count() deprecated in 6, removed in 7 — use countDocuments()
roomSchema.statics.countRooms = function(callback) {
  return this.count({}, callback);
};

// count() with filter — also deprecated
roomSchema.statics.countPublicRooms = function(callback) {
  return this.count({ isPrivate: false }, callback);
};

// Callback-based find
roomSchema.statics.findPublicRooms = function(callback) {
  return this.find({ isPrivate: false })
    .sort({ lastActivity: -1 })
    .exec(callback);
};

// update() with upsert option — deprecated pattern
roomSchema.statics.addMember = function(roomId, userId, callback) {
  return this.update(
    { _id: roomId },
    { $addToSet: { members: userId } },
    callback
  );
};

// remove() deprecated — use deleteOne/deleteMany
roomSchema.statics.removeRoom = function(roomId, callback) {
  return this.remove({ _id: roomId }, callback);
};

// findOneAndUpdate with callback
roomSchema.statics.updateDescription = function(roomId, desc, callback) {
  return this.findOneAndUpdate(
    { _id: roomId },
    { description: desc },
    { new: true },
    callback
  );
};

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
