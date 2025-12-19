const Message = require('../models/Message');

async function mongoSaveMessage(message, username, room, __createdtime__) {
  try {
    const newMessage = new Message({
      message,
      username,
      room,
      __createdtime__,
    });

    await newMessage.save();
  } catch (err) {
    console.error('MongoDB save failed:', err);
  }
}

module.exports = mongoSaveMessage;
