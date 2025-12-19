const Message = require('../models/Message');

async function mongoGetMessages(room) {
  return await Message.find({ room })
    .sort({ __createdtime__: 1 }) // oldest → newest
    .limit(100)
    .lean();
}

module.exports = mongoGetMessages;
