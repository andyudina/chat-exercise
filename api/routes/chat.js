"use strict";

const express = require('express');
const { query, body } = require('express-validator/check');

const authenticate = require('../../middleware/authenticate'),
  ChatController = require('../controllers/chat'),
  errorMessages = require('../errorMessages'),
  validate = require('../../middleware/validate');

const chatRouter = express.Router();

chatRouter.route('/')
  .get(
    [
      query('name', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    ChatController.searchByName
  );

chatRouter.route('/group/')
  .post(
    [
      body('name', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    ChatController.createGroupChat
  );

chatRouter.route('/private/')
  .post(
    [
      body('user', errorMessages.FIELD_IS_MISSING).exists(),
    ],
    validate,
    ChatController.createPrivateChat);

chatRouter.route('/:id/')
  .put(ChatController.joinGroupChat);

module.exports = chatRouter;