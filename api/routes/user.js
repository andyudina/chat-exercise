"use strict";

const express = require('express');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  MessageController = require('../controllers/message'),
  UserController = require('../controllers/user');

const userRouter = express.Router();

/*

  User routes

*/

userRouter.route('/')
  .put(apiRequiresAuthentication, UserController.setNickname);

userRouter.route('/')
  .get(apiRequiresAuthentication, UserController.searchByNickname);

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

module.exports = userRouter;