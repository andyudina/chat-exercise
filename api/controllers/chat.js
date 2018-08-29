"use strict";

const HttpStatus = require('http-status-codes'),
  mongoose = require('mongoose');

const errorMessages = require('../errorMessages'),
  modelErrors = require('../models/errors'),
  utils = require('../../utils');

const Chat = mongoose.model('Chat'),
  User = mongoose.model('User');

module.exports.searchByName = async (req, res, next) => {
  // Return chats filtered by name
  // Expects name in query parameters
  // Success:
  // Returns 200 OK
  // {
  //   chats: [
  //     {
  //       _id: String,
  //       name: String
  //     }
  //  ]
  // ]
  // Error:
  // Returns 400 Bad request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const name = req.query.name;
  let chats;
  try {
    chats = await Chat
      .find(
        { $text: { $search: name, $caseSensitive: false } },
        { score: {$meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .select({_id: 1, name: 1})
      .exec();
    // Manually remove score from response
    chats = utils.formatListResponse(chats, ['name']);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({chats: chats});
}

module.exports.createGroupChat = async (req, res, next) => {
  // Create group chat with provided name
  // Expects requests in format:
  // {
  //   name: String
  // }
  // Success:
  // Returns 200 OK
  // {
  //    _id: String,
  //    name: String
  // }
  // Error:
  // Returns 400 Bad request if name is't provided
  // {
  //   errors: [
  //     {
  //       location: String,
  //       param: String.
  //       msg: String
  //     }
  //   ]
  // }
  const name = req.body.name;
  let chat;
  try {
    chat = await Chat
      .create({ name: name, isGroupChat: true });
  } catch (error) {
    if (!(modelErrors.isDuplicateKeyError(error))) {
      // Pass to default error handler
      return next(error);
    }
    const errorResp = {
      errors: {
        name: errorMessages.GROUP_CHAT_ALREADY_EXISTS
      }
    };
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json(errorResp);
  }
  let updatedChat;
  try {
    updatedChat = await User.addUserToChatById(req.user._id, chat);
  } catch (error) {
    // Pass to default error handler
    // It's ok to fail here, if user with this id doesn't exist in
    // app database - it would meen that app db and sessions db is out of sync
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json(updatedChat);
};

module.exports.createPrivateChat = async (req, res, next) => {
  // Create private chat between current user
  // and user in params. Using this api, one can also create
  // chat with himself
  // Expects requests in format:
  // {
  //   user: String
  // }
  // Success:
  // Returns 200 OK
  // {
  //    _id: String,
  // }
  // Error:
  // Returns 400 Bad request if user is't provided
  // {
  //   errors: [
  //     {
  //       location: String,
  //       param: String.
  //       msg: String
  //     }
  //   ]
  // }
  const user = req.body.user;
  // Remove duplicates - we don't want to query db twice
  // to create chat with same user
  const userIdsInChat = [...new Set([user, req.user._id.toString()])];
  // Check if chat between these users already exist
  let chat;
  const conditions = {
    $and: [
      { isGroupChat: false },
      ...userIdsInChat.map(
        (userId) => ({'users': userId})
      )
    ]
  };
  try {
    chat = await Chat
      .findOne(conditions)
      .exec();
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  // Return already created chat if found
  if (chat) {
    return res
      .status(HttpStatus.OK)
      .json(chat);
  }
  // Retrieve users with given ids
  // Return error if user does not exist
  const usersInChat = await User.find(
    {
      _id: {
        $in: userIdsInChat
      }
    }
  ).exec();
  // Check if all users were found
  if (usersInChat.length < userIdsInChat.length) {
    // Return error if not all users were found
    const errorMessage = {
      errors: {
        user: errorMessages.USER_DOES_NOT_EXIST
      }
    };
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json(errorMessage);
  }
  let updatedChat;
  try {
    // Create new chat
    chat = await Chat
      .create({isGroupChat: false});
    // Join new chat
    updatedChat = await User
      .joinChatForMultipleUsers(usersInChat, chat);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json(updatedChat);
};

module.exports.joinGroupChat = async (req, res, next) => {
  // Join group chat
  // Success:
  // Returns 200 OK
  // {
  //    _id: String,
  //    name: String,
  //    users: [
  //      {
  //        _id: String,
  //        nickname: String,
  //      }
  //    ]
  // }
  // Error:
  // Returns 422 Unprocessable Entity 
  // if chat does not exist or chat is not grouped
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const chatId = req.params.id;
  // Validate that chat exists
  let chat;
  try {
    chat = await Chat.findById(chatId);
  } catch(error) {
    // Pass to default error handler
    return next(error);
  }
  if (!(chat)) {
    const errorMessage = {
      errors: {
        chat: errorMessages.GROUP_CHAT_DOES_NOT_EXIST
      }
    };
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json(errorMessage);
  }
  // Validate that it is group chat
  if (!(chat.isGroupChat)) {
    const errorMessage = {
      errors: {
        chat: errorMessages.CAN_NOT_JOIN_PRIVATE_CHAT
      }
    };
    return res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json(errorMessage);
  }
  let updatedChat;
  try {
    // Join chat
    updatedChat = await User.addUserToChatById(req.user._id, chat);
    // Enrich user details
    updatedChat = await Chat.findByIdWithUsers(chat._id);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json(updatedChat);
};