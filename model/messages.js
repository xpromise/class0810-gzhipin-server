const mongoose = require('mongoose');

const messagesSchema = new mongoose.Schema({
  message: String,
  from: String,
  to: String,
  createTime: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  from_to: String
})

module.exports = mongoose.model('Messages', messagesSchema);