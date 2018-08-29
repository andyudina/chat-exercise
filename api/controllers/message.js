"use strict";

const HttpStatus = require('http-status-codes'),
  mongoose = require('mongoose');

const Chat = mongoose.model('Chat'),
  Message = mongoose.model('Message'),
  User = mongoose.model('User');

module.exports.listMessagesInChat = async (req, res, next) => {
  // Return messages, sorted by creation date
  // Accepts page in query string
  // Success:
  // Returns 200 OK
  // {
  //   messages: [
  //     {
  //       _id: String,
  //       text: String,
  //       date: Date,
  //       author: {
  //         _id: String,
  //         nickname: String
  //       }
  //     }
  //  ]
  // ]
  // Error:
  // Returns 401 Unauthorized
  // if user don't have access to the chat
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  let messages;
  try {
    messages = await Message.listMessagesPaginated(
      req.params.chatId, 
      req.query.page
    );
  } catch(error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({ messages });
};

module.exports.listNewMessagesInChat = async (req, res, next) => {
  // Return messages created at or after passed date
  // Expects date in query string
  // Success:
  // Returns 200 OK
  // {
  //   messages: [
  //     {
  //       _id: String,
  //       text: String,
  //       date: Date,
  //       author: {
  //         _id: String,
  //         nickname: String
  //       }
  //     }
  //  ]
  // ]
  // Error:
  // Returns 401 Unauthorized
  // if user don't have access to the chat
  // Returns 400 Bad request if date is't provided
  // {
  //   errors: [
  //     {
  //       location: String,
  //       param: String.
  //       msg: String
  //     }
  //   ]
  // }
  let messages;
  try {
    // Get new messages
    messages = await Message.listNewMessages(
      req.params.chatId, 
      req.query.date
    );
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({ messages });
};


module.exports.getChatWithMessages = async (req, res, next) => {
  // Return chat with first page of messages
  // Success:
  // Returns 200 OK
  // {
  //   chat: {
  //     users: [
  //       {
  //         _id: String,
  //         nickname: String,
  //       }
  //     ],
  //     _id: String,
  //     isGroupChat: Boolean,
  //     name: String
  //   },
  //   messages: [
  //     {
  //       _id: String,
  //       text: String,
  //       date: Date,
  //       author: {
  //         _id: String,
  //         nickname: String
  //       }
  //     }
  //  ]
  // ]
  // Error:
  // Returns 401 Unauthorized
  // if user don't have access to the chat
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  let messages, chat;
  try {
    messages = await Message.listMessagesPaginated(
      req.params.chatId, 
    );
    chat = await Chat.findByIdWithUsers(req.params.chatId);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({ messages, chat });
};

module.exports.sendMessage = async (req, res, next) => {
  // Send message to chat
  // Expects request:
  // {
  //   message: String
  // }
  // Success:
  // Returns 200 OK
  // {
  //   message: {
  //     _id: String,
  //     text: String,
  //     createdAt: Date,
  //     author: String,
  //     chat: String
  //   }
  // }
  // Error:
  // Returns 401 Unauthorized
  // if user don't have access to the chat
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  // Returns 400 Bad request if message is't provided
  // {
  //   errors: [
  //     {
  //       location: String,
  //       param: String.
  //       msg: String
  //     }
  //   ]
  // }
  const messageText = req.body.message;
  let message;
  try {
    // Create message
    message = Message({
      text: messageText,
      author: req.user._id,
      chat: req.params.chatId
    });
    await message.save();
    // Populate author and convert to json
    message = await Message
      .findById(message.id)
      .populate({ path: 'author', select: User.FIELDS_SHORT });
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({ message });
};
