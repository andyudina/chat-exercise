"use strict";

const mongoose = require('mongoose');

const utils = require('../utils');

const Chat = mongoose.model('Chat');

module.exports.searchByName = async (req, res) => {
  // Return chats filtered by name
  // TODO: refactor to share same code with UserController.searchByNickname
  // Expects requests in format:
  // {
  //   nickname: String
  // }
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