"use strict";

const express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan');

const config = require('./config'),
  router = require('./router');

// Configure server
const app = express();
const server = app.listen(config.port);
console.log(`Your server is running on port ${config.port}.`);

// Configure express app
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(logger('dev'));

// Routes to be served
router(app);