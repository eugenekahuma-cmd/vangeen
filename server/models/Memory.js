const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { timestamps: true });

const MemorySchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous',
    index: true
  },
  messages: [MessageSchema]
}, { timestamps: true });

module.exports = mongoose.model('Memory', MemorySchema);