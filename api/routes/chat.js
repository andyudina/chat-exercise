"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  ChatController = require('../controllers/chat'),
  errorMessages = require('../errorMessages'),
  validateRequest = require('../../middleware/validate').validateRequest;

const chatRouter = express.Router();

chatRouter.route('/')
  .get(
    apiRequiresAuthentication,
    [
      query('name', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    ChatController.searchByName
  );

chatRouter.route('/group/')
  .post(
    apiRequiresAuthentication,
    [
      body('name', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    ChatController.createGroupChat
  );

chatRouter.route('/private/')
  .post(
    apiRequiresAuthentication,
    [
      body('user', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validateRequest,
    ChatController.createPrivateChat);

chatRouter.route('/:id/')
  .put(apiRequiresAuthentication, ChatController.joinGroupChat);

module.exports = chatRouter;