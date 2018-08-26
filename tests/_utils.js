"use strict";

const mongoose = require('mongoose');

const apiUtils = require('../api/utils'),
  config = require('../config'),
  Chat = require('../api/models/chat'),
  User = require('../api/models/user');

const setUpDbBeforeTest = (done) => {
  // Connect to mongoDB
  mongoose.connect(config.db, { useNewUrlParser: true });
  const connection = mongoose.connection;
  connection.on('error', console.log);
  connection.once('open', done);
}

const cleanAndCloseDbAfterTest = (done) => {
  // Drop test database and disconect from mongoDB
  const connection = mongoose.connection;
  // Clean up all collections
  // Clean up user collection
  User.remove({}, (err) => {
    if (err) { throw err; }
    // Clean up chat collection
    Chat.remove({}, (err) => {
      if (err) { throw err; }
      mongoose.connection.close(done);
    });
  });
}

async function setUpControllerTests() {
  // Set up environment for controller tests:
  // Create user and define stubs for request and response

  // Create user
  this.user = User({
    email: 'test-email@google.com',
    googleID: 'test-google-id'
  });
  await this.user.save();

  // Set up request
  const req = {
    user: this.user,
    body: {}
  };
  this.req = req;

  // Set up response
  const res = {
    json() {}
  }
  res.status = () => {return res;};
  this.res = res;
};

async function createChatAndUser() {
  // Helper to set up chat and user before test case is run
  this.user = User({
    email: 'test-email@google.com',
    googleID: 'test-google-id'
  });
  await this.user.save();

  this.chat = Chat({});
  await this.chat.save();
}

module.exports = {
  setUpDbBeforeTest,
  cleanAndCloseDbAfterTest,

  setUpControllerTests,
  createChatAndUser
}