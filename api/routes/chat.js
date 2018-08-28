"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  ChatController = require('../controllers/chat'),
  validateRequest = require('../../middleware/validate').validateRequest;

const chatRouter = express.Router();

chatRouter.route('/')
  .get(
    apiRequiresAuthentication,
    [
      query('name', 'This field is required').exists(),
    ],
    validateRequest,
    ChatController.searchByName
  );

chatRouter.route('/group/')
  .post(
    apiRequiresAuthentication,
    [
      body('name', 'This field is required').exists(),
    ],
    validateRequest,
    ChatController.createGroupChat
  );

chatRouter.route('/private/')
  .post(
    apiRequiresAuthentication,
    [
      body('user', 'This field is required').exists(),
    ],
    validateRequest,
    ChatController.createPrivateChat);

chatRouter.route('/:id/')
  .put(apiRequiresAuthentication, ChatController.joinGroupChat);

module.exports = chatRouter;