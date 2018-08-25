"use strict";

const express = require('express'),
  bodyParser = require('body-parser'),
  logger = require('morgan'),
  mongoose = require('mongoose'),
  passport = require('passport');

const authConfig = require('./config/passport/google'),
  config = require('./config'),
  router = require('./router');

// Configure authorisation with passport
authConfig(passport);

// Configure server
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(passport.initialize());

// Configure routes to be served
router(app);

// Connect to mongoDB
const connect = () => {
  const options = { server: { socketOptions: { keepAlive: 1 } } };
  return mongoose.connect(config.db, options).connection;
}
// Start express app on successful connection
const listen = () => {
  app.listen(config.port, config.host);
  console.log(`Express app started on ${config.host}:${config.port}`);
}
connect()
  .on('error', console.log)
  .on('disconnected', connect)
  .once('open', listen);
