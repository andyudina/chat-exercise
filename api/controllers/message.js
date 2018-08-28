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
  // Returns 403 Forbidden
  // if user don't have access to the chat
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  // Check if user has access to this chat
  if (!(await User.hasAccessToChat(req.user._id, req.params.chatId))) {
    const errorMessage = {
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    };
    res
      .status(HttpStatus.FORBIDDEN)
      .json(errorMessage);
    return;
  }
  let messages;
  try {
    messages = await Message.listMessagesPaginated(
      req.params.chatId, 
      req.query.page
    );
  } catch(error) {
    // Log error and pass to default error handler
    console.log(error);
    next(error);
    return;
  }
  res
    .status(HttpStatus.OK)
    .json({messages: messages});
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
  // Returns 403 Forbidden
  // if user don't have access to the chat
  // Returns 400 Bad request
  // if date isn't provided
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  // Check if user has access to this chat
  if (!(await User.hasAccessToChat(req.user._id, req.params.chatId))) {
    const errorMessage = {
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    };
    res
      .status(HttpStatus.FORBIDDEN)
      .json(errorMessage);
    return;
  }
  // Validate if message is provided
  if (!(req.query.date)) {
    const errorMessage = {
      errors: {
        date: 'This field is required'
      }
    };
    res.
      status(HttpStatus.BAD_REQUEST)
      .json(errorMessage);
    return;
  }
  let messages;
  try {
    // Get new messages
    messages = await Message.listNewMessages(
      req.params.chatId, 
      req.query.date
    );
  } catch (error) {
    // Log error and pass to default error handler
    console.log(error);
    next(error);
    return;
  }
  res
    .status(HttpStatus.OK)
    .json({messages: messages});
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
  // Returns 403 Forbidden
  // if user don't have access to the chat
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  // Check if user has access to this chat
  // TODO: move to own authorization middleware - 
  // reuse same logic with listMessagesInChat
  if (!(await User.hasAccessToChat(req.user._id, req.params.chatId))) {
    const errorMessage = {
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    };
    res
      .status(HttpStatus.FORBIDDEN)
      .json(errorMessage);
    return;
  }
  let messages, chat;
  try {
    messages = await Message.listMessagesPaginated(
      req.params.chatId, 
    );
    chat = await Chat.findByIdWithUsers(req.params.chatId);
  } catch (error) {
    // Log error and pass to default error handler
    console.log(error);
    next(error);
    return;
  }
  res
    .status(HttpStatus.OK)
    .json({
      messages: messages,
      chat: chat
    });
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
  // Returns 403 Forbidden
  // if user don't have access to the chat
  // Returns 400 Bad request
  // if user don't provided message in request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  // Validate that user has access to chat
  if (!(await User.hasAccessToChat(req.user._id, req.params.chatId))) {
    const errorMessage = {
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    };
    res
      .status(HttpStatus.FORBIDDEN)
      .json(errorMessage);
    return;
  }
  const messageText = req.body.message;
  // Validate if message is provided
  if (!(messageText)) {
    const errorMessage = {
      errors: {
        message: 'This field is required'
      }
    };
    res
      .status(HttpStatus.BAD_REQUEST)
      .json(errorMessage);
    return;
  }
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
      .populate({ path: 'author', select: 'nickname _id' });
  } catch (error) {
    // Log error and pass to default error handler
    console.log(error);
    next(error);
    return;
  }
  res
    .status(HttpStatus.OK)
    .json({message: message});
};
