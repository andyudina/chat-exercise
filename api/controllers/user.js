"use strict";

const HttpStatus = require('http-status-codes'),
  mongoose = require('mongoose');

const utils = require('../../utils');

const User = mongoose.model('User');

module.exports.setNickname = async (req, res, next) => {
  // Set user nickname
  // Expects requests in format:
  // {
  //   nickname: String
  // }
  // Success:
  // Returns 200 OK
  // {
  //    _id: String,
  //    googleID: String,
  //    email: String,
  //    nickname: String,
  //    createdAt: Date,
  // }
  // Failure:
  // Returns 400 Bad request
  // {
  //   errors: {
  //     [field]: [errorMessage]
  //   }
  // }
  const nickname = req.body.nickname;
  if (!(nickname)) {
    const errorMessage = {
      errors: {
        nickname: 'This field is required'
      }
    };
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(errorMessage);
  }
  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id,
      { $set: { nickname: nickname }},
      { new: true }
    ).exec();
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json(user);
};

module.exports.getCurrentUser = async (req, res, next) => {
  // Return current user
  // Success:
  // Returns 200 OK
  // {
  //    _id: String,
  //    googleID: String,
  //    email: String,
  //    nickname: String,
  //    createdAt: Date,
  // }
  let user;
  try {
    user = await User.findById(req.user._id).exec();
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json(user);
};

module.exports.searchByNickname = async (req, res, next) => {
  // Return users filtered by nickname
  // Returns also current user (if found) by design
  // Expects nickname in query paramaters
  // Success:
  // Returns 200 OK
  // {
  //   users: [
  //     {
  //       _id: String,
  //       nickname: String
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
  const nickname = req.query.nickname;
  if (!(nickname)) {
    const errorMessage = {
      errors: {
        nickname: 'This field is required'
      }
    };
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json(errorMessage);
  }
  let users;
  try {
    users = await User
      .find(
        { $text: { $search: nickname, $caseSensitive: false } },
        { score: {$meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .select({_id: 1, nickname: 1})
      .exec();
    // Manually remove score fron response
    users = utils.formatListResponse(users, ['nickname']);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({users: users});  
};

module.exports.getAllChatsForUser = async (req, res, next) => {
  // Return all chats for current user
  // sorted by last activity date
  // Success:
  // Returns 200 OK
  // {
  //   chats: [
  //     {
  //       _id: String,
  //       name: String,
  //       isGroupChat: Boolean,
  //       lastMessageAt: Date,
  //       users: [
  //         {
  //           _id: String,
  //           nickname: String,
  //         }
  //       ]
  //     }
  //  ]
  // ]
  const Chat = mongoose.model('Chat');
  let chats;
  try {
    // Get user chats
    const user = await User.findById(req.user.id);
    // Load chat details
    chats = await Chat
      .find({ _id: { $in: user.chats } })
      .sort({ lastMessageAt: -1})
      .select({ _id: 1, name: 1, isGroupChat: 1, lastMessageAt: 1, users: 1 })
      .populate({ path: 'users', select: 'nickname _id' })
      .exec();
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  res
    .status(HttpStatus.OK)
    .json({chats: chats});  
};
