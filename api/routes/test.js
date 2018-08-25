"use strict";

const express = require('express');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication,
  TestController = require('../controllers/test');

const testRouter = express.Router();
testRouter.route('/')
  .get(apiRequiresAuthentication, TestController.getTestApi);

module.exports = testRouter;
