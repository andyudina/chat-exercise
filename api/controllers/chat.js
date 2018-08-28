"use strict";

const mongoose = require('mongoose');

const modelErrors = require('../models/errors'),
  utils = require('../../utils');

const Chat = mongoose.model('Chat'),
  User = mongoose.model('User');

module.exports.searchByName = async (req, res) => {
  // Return chats filtered by name
  // TODO: refactor to share same code with UserController.searchByNickname
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
  if (!(name)) {
    res.status(400).json({errors: {name: 'This field is required'}});
    return;
  }
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
    // Unexpected error occured
    // Better fail fast
    console.log(error);
    throw error;
  }
  res
    .status(200)
    .json({chats: chats});  
};

module.exports.createGroupChat = async (req, res) => {
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
  // Returns 400 Bad request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const name = req.body.name;
  if (!(name)) {
    res
      .status(400)
      .json({errors: {name: 'This field is required'}});
    return;
  }
  let chat;
  try {
    chat = await Chat
      .create({name: name, isGroupChat: true});
  } catch (error) {
    console.log(error);
    if (!(modelErrors.isDuplicateKeyError(error))) {
      // Rethrow unknown error
      throw error;
    }
    const errorResp = {
      errors: {
        name: 'Group chat with this name already exists'
      }
    };
    res
      .status(400)
      .json(errorResp);
    return;
  }
  const updatedChat = await User.addUserToChatById(req.user._id, chat);
  res
    .status(200)
    .json(updatedChat);
};

module.exports.createPrivateChat = async (req, res) => {
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
  // Returns 400 Bad request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const user = req.body.user;
  if (!(user)) {
    res
      .status(400)
      .json({errors: {user: 'This field is required'}});
    return;
  }
  // Remove duplicates - we don't want to query db twice
  // to create chat with same user
  let userIdsInChat = [...new Set([user, req.user._id.toString()])];
  // Convert to ObjectID
  userIdsInChat = userIdsInChat.map(
    (id) => mongoose.mongo.ObjectId(id)
  );
  // Check if chat between this users already exist
  let chat;
  try {
    const conditions = {
      $and: [
        { isGroupChat: false },
        ...userIdsInChat.map(
          (userId) => ({'users': userId})
        )
      ]
    };
    chat = await Chat
      .findOne(conditions)
      .exec();
  } catch (error) {
    // Log and re-throw error
    console.log(error);
    throw error;
  }
  // Return already created chat if found
  if (chat) {
    res
      .status(200)
      .json(chat);
    return 
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
    res
      .status(400)
      .json({errors: {user: 'This user does not exist'}});
    return;
  }
  // Create new chat
  try {
    chat = await Chat
      .create({isGroupChat: false});
  } catch (error) {
    // Log and re-throw error
    console.log(error);
    throw error;
  }
  // Join new chat
  const updatedChat = await User.joinChatForMultipleUsers(usersInChat, chat);
  res
    .status(200)
    .json(updatedChat);
};

module.exports.joinGroupChat = async (req, res) => {
  // Create group chat with provided name
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
  // Returns 400 Bad request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const chatId = req.params.id;
  // Validate, that chat id was passed
  if (!(chatId)) {
    res
      .status(400)
      .json({errors: {chat: 'This field is required'}});
    return;
  }
  // Validate, that chat exists
  const chat = await Chat.findById(chatId);
  if (!(chat)) {
    const errorMssage = {
      errors: {
        chat: 'Group chat with this id does not exists'
      }
    };
    res
      .status(400)
      .json(errorMssage);
    return;
  }
  // Validate that it is group chat
  if (!(chat.isGroupChat)) {
    const errorMssage = {
      errors: {
        chat: 'Unfortunately, you can not join private chat'
      }
    };
    res
      .status(400)
      .json(errorMssage);
    return;
  }
  // Join chat
  let updatedChat = await User.addUserToChatById(req.user._id, chat);
  // Enrich user details
  updatedChat = await Chat.findByIdWithUsers(chat._id);
  res
    .status(200)
    .json(updatedChat);
};


