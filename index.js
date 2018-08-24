"use strict";

const express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  passport = require('passport');

const authConfig = require('./auth/passportConfig'),
  config = require('./config'),
  router = require('./router');

// Configure authorisation with passport
authConfig(passport);

// Configure server
const app = express();
const server = app.listen(config.port, config.host);
console.log(`Your server is running on port ${config.port}.`);

// Configure express app
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(passport.initialize());

// Routes to be served
router(app);