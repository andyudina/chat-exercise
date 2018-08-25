"use strict";

// Load env variables from .env file
require('dotenv').config();

const express = require('express'),
  mongoose = require('mongoose'),
  passport = require('passport');

// Load models
require('./api/models');

const authConfig = require('./config/passport/google').configure,
  config = require('./config'),
  router = require('./router'),
  serverConfig =  require('./config/express/server');

// Configure authorisation with passport
authConfig(passport);

// Configure server
const app = express();
serverConfig(app, passport);

// Configure routes to be served
router(app);

// Connect to mongoDB
const connect = () => {
  mongoose.connect(config.db, { useNewUrlParser: true });
  mongoose.connection.on('error', console.log);
  mongoose.connection.on(
    'disconnected',
    () => {console.log('Mongoose default connection is disconnected')}
  );
}
connect();

// Start express app on successful connection
const listen = () => {
  app.listen(config.port, config.host);
  console.log(`Express app started on ${config.host}:${config.port}`);
}
mongoose.connection.once('open', listen);
