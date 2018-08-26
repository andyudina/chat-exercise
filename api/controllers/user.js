"use strict";

const mongoose = require('mongoose');

const utils = require('../utils');

const User = mongoose.model('User');

module.exports.setNickname = async (req, res) => {
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
    res.status(400).json({errors: {nickname: 'This field is required'}});
    return;
  }
  let user;
  try {

    user = await User.findByIdAndUpdate(req.user._id,
      { $set: { nickname: nickname }},
      {new: true}
    ).exec();
  } catch (error) {
    // Unexpected error occured
    // Better fail fast
    console.log(error);
    throw error;
  }
  res.status(200).json(user);
};

module.exports.getCurrentUser = async (req, res) => {
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
    // Unexpected error - log and fail
    console.log(error);
    throw error;
  }
  res.status(200).json(user);
};

module.exports.searchByNickname = async (req, res) => {
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
    res.status(400).json({errors: {nickname: 'This field is required'}});
    return;
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
    // Unexpected error occured
    // Better fail fast
    console.log(error);
    throw error;
  }
  res.status(200).json({users: users});  
}
