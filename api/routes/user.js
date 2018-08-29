"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  authorizeAccessToChat = require('../../middleware/authorize').authorizeAccessToChat,
  errorMessages = require('../errorMessages'),
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
      body('nickname', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    UserController.setNickname);

userRouter.route('/')
  .get(
    apiRequiresAuthentication,
    [
      query('nickname', errorMessages.FIELD_IS_MISSING).exists(),
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

userRouter.route('/self/chats/:chatId([a-f\\d]{24})')
  .get(
    apiRequiresAuthentication,
    authorizeAccessToChat,
    MessageController.getChatWithMessages);

userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages')
  .get(
    apiRequiresAuthentication,
    authorizeAccessToChat,
    MessageController.listMessagesInChat);

userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages')
  .post(
    apiRequiresAuthentication,
    authorizeAccessToChat,
    // Specify validation
    [
      body('message', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    MessageController.sendMessage);

// Returns new messages
// Expects date in get parameters (after wich messages will be returned)
userRouter.route('/self/chats/:chatId([a-f\\d]{24})/messages/new')
  .get(
    apiRequiresAuthentication,
    authorizeAccessToChat,
    [
      query('date', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    MessageController.listNewMessagesInChat);

module.exports = userRouter;