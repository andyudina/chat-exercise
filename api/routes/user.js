"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  MessageController = require('../controllers/message'),
  UserController = require('../controllers/user'),
  validateRequest = require('../../middleware/validate').validateRequest;

const userRouter = express.Router();

/*

  User routes

*/

userRouter.route('/')
  .put(
    apiRequiresAuthentication,
    [
      body('nickname', 'This field is required').exists(),
    ],
    validateRequest,
    UserController.setNickname);

userRouter.route('/')
  .get(
    apiRequiresAuthentication,
    [
      query('nickname', 'This field is required').exists(),
    ],
    validateRequest,
    UserController.searchByNickname);

userRouter.route('/self')
  .get(apiRequiresAuthentication, UserController.getCurrentUser);

userRouter.route('/self/chats')
  .get(apiRequiresAuthentication, UserController.getAllChatsForUser);


/*

  Messages routes

*/

userRouter.route('/self/chats/:chatId')
  .get(apiRequiresAuthentication, MessageController.getChatWithMessages);

userRouter.route('/self/chats/:chatId/messages')
  .get(apiRequiresAuthentication, MessageController.listMessagesInChat);

userRouter.route('/self/chats/:chatId/messages')
  .post(
    apiRequiresAuthentication,
    // Specify validation
    [
      body('message', 'This field is required').exists(),
    ],
    validateRequest,
    MessageController.sendMessage);

// Returns new messages
// Expects date in get parameters (after wich messages will be returned)
userRouter.route('/self/chats/:chatId/messages/new')
  .get(
    apiRequiresAuthentication,
    [
      query('date', 'This field is required').exists(),
    ],
    validateRequest,
    MessageController.listNewMessagesInChat);

module.exports = userRouter;