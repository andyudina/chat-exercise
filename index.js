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
  serverConfig =  require('./config/express/server'),
  socket = require('./socket');

// Configure authorisation with passport
authConfig(passport);

// Configure server
const app = express();
serverConfig(app, passport);

// Configure routes to be served
router(app);

// Register simple error handler that returns 500
// and logs error
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500);
  res.end();
});

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
const setUpServer = () => {
  // Start server
  const server = app.listen(config.port, config.host);
  // Configure socket.io
  socket(server);
  console.log(`Express app started on ${config.host}:${config.port}`);
}
mongoose.connection.once('open', setUpServer);
