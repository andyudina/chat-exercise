"use strict";

const express = require('express');

const TestController = require('../controllers/test');

const testRouter = express.Router();
testRouter.route('/test')
    .get(TestController.getTestApi);

module.exports = testRouter;
