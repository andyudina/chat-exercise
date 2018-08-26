"use strict";

const mongoose = require('mongoose');

const modelErrors = require('../models/errors'),
  utils = require('../utils');

const Chat = mongoose.model('Chat');

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
    // Manually remove score fron response
    chats = utils.formatListResponse(chats, ['name']);
  } catch (error) {
    // Unexpected error occured
    // Better fail fast
    console.log(error);
    throw error;
  }
  res.status(200).json({chats: chats});  
}

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
    res.status(400).json({errors: {name: 'This field is required'}});
    return;
  }
  let chat;
  try {
    chat = await Chat
      .create({name: name, isGroupChat: true});
    // Manually remove score fron response
  } catch (error) {
    if (!(modelErrors.isDuplicateKeyError(error.code))) {
      // Rethrow unknown error
      throw error;
    }
    const errorResp = {
      errors: {
        name: 'Group chat with this name already exists'
      }
    };
    res.status(400).json(errorResp);
    return;
  }
  res.status(200).json(chat);  
}
