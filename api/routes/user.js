"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const authorizeAccessToChat = require('../../middleware/authorize').authorizeAccessToChat,
  errorMessages = require('../errorMessages'),
  MessageController = require('../controllers/message'),
  UserController = require('../controllers/user'),
  validate = require('../../middleware/validate');

const userRouter = express.Router();

/*

  User routes

*/

userRouter.route('/')
  .put(
    [
      body('nickname', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    UserController.setNickname);

userRouter.route('/')
  .get(
    [
      query('nickname', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    UserController.searchByNickname);

userRouter.route('/self')
  .get(UserController.getCurrentUser);

userRouter.route('/self/chats')
  .get(UserController.getAllChatsForUser);


/*

  Messages routes

*/

userRouter.route('/self/chats/:chatId([a-f\\d]{24})')
  .get(
    authorizeAccessToChat,
    MessageController.getChatWithMessages);

userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages')
  .get(
    authorizeAccessToChat,
    MessageController.listMessagesInChat);

userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages')
  .post(
    authorizeAccessToChat,
    // Specify validation
    [
      body('message', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    MessageController.sendMessage);

// Returns new messages
// Expects date in get parameters (after wich messages will be returned)
userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages/new')
  .get(
    authorizeAccessToChat,
    [
      query('date', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    MessageController.listNewMessagesInChat);

module.exports = userRouter;