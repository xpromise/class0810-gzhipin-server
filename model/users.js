const mongoose = require('mongoose');

const usersSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
  },
  header: String,
  post: String,
  salary: String,
  company: String,
  info: String
})

module.exports = mongoose.model('Users', usersSchema);