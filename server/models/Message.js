const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: true,
  },
  __createdtime__: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Message', MessageSchema);
