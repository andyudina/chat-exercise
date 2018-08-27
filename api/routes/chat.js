"use strict";

const express = require('express');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  ChatController = require('../controllers/chat');

const chatRouter = express.Router();

chatRouter.route('/')
  .get(apiRequiresAuthentication, ChatController.searchByName);

chatRouter.route('/')
  .post(apiRequiresAuthentication, ChatController.createGroupChat);

chatRouter.route('/:id/')
  .put(apiRequiresAuthentication, ChatController.joinGroupChat);

module.exports = chatRouter;