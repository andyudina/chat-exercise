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
  if (!(req.body.nickname)) {
    res.status(400).json({errors: {nickname: 'This field is required'}});
    return;
  }
  let user;
  try {
    user = await User.findByIdAndUpdate(req.user._id,
      { $set: { nickname: req.body.nickname }},
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