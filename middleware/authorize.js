"use strict";

const HttpStatus = require('http-status-codes'),
  mongoose = require('mongoose');

const errorMessages = require('../api/errorMessages');

module.exports.authorizeAccessToChat = async (req, res, next) => {
  // Check if user can have access to chat
  // Return 401 unauthorised error, if user is not authenticated
  // Expects user in request and chatUd in params
  // Should be used only with related routes
  // and after authentication middleware
  const User = mongoose.model('User');
  let userHasAccessToChatFlag;
  try {
    userHasAccessToChatFlag = await User
      .hasAccessToChat(req.user._id, req.params.chatId);
  } catch (error) {
    // Pass to default error handler
    return next(error);
  }
  if (!(userHasAccessToChatFlag)) {
    const errorMessage = {
      errors: {
        chat: errorMessages.NO_ACCESS_TO_CHAT
      }
    };
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json(errorMessage);
  }
  next();
};