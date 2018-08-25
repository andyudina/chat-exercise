"use strict";

const express = require('express');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  UserController = require('../controllers/user');

const userRouter = express.Router();

userRouter.route('/')
  .put(apiRequiresAuthentication, UserController.setNickname);

userRouter.route('/self')
  .get(apiRequiresAuthentication, UserController.getCurrentUser);

module.exports = userRouter;