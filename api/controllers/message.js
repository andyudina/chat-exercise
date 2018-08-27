"use strict";

const mongoose = require('mongoose');

const Chat = mongoose.model('Chat'),
  Message = mongoose.model('Message'),
  User = mongoose.model('User');

module.exports.listMessagesInChat = async (req, res) => {
  // Return messages, filtered by creation date
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
      .status(403)
      .json(errorMessage);
    return;
  }
  const messages = await Message.listMessagesWithAuthor(
    req.params.chatId, 
    req.query.page
  );
  res
    .status(200)
    .json({messages: messages});
};

module.exports.getChatWithMessages = async (req, res) => {
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
      .status(403)
      .json(errorMessage);
    return;
  }
  const messages = await Message.listMessagesWithAuthor(
    req.params.chatId, 
  );

  const chat = await Chat.findByIdWithUsers(req.params.chatId);
  res
    .status(200)
    .json({
      messages: messages,
      chat: chat
    });
};
