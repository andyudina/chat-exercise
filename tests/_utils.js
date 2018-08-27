"use strict";

const mongoose = require('mongoose');

const apiUtils = require('../api/utils'),
  config = require('../config'),
  Chat = require('../api/models/chat'),
  Message = require('../api/models/message'),
  User = require('../api/models/user');

const setUpDbBeforeTest = (done) => {
  // Connect to mongoDB
  mongoose.connect(config.db, { useNewUrlParser: true });
  const connection = mongoose.connection;
  connection.on('error', console.log);
  connection.once('open', done);
};

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
        // Clean up Message collection
        Message.remove({}, (err) => {
          if (err) { throw err; }
          mongoose.connection.close(done);
        });
    });
  });
};

const createTestUser = async ()  => {
  const user = User({
    email: 'test-email@google.com',
    googleID: 'test-google-id',
    nickname: 'nickname'
  });
  await user.save();
  return user;
};

const createTestChat = async ()  => {
  const chat = Chat({
    isGroupChat: true,
    name: 'name'
  });
  await chat.save();
  return chat;
};

function setUpControllerTests() {
  // Set up environment for controller tests
  // Define stubs for request and response

  // Set up request
  const req = {
    body: {},
    query: {},
    params: {}
  };
  this.req = req;

  // Set up response
  const res = {
    json() {}
  }
  res.status = () => {return res;};
  this.res = res;
}

async function setUpControllerTestsWithUser() {
  // Set up environment for controller tests and create user

  // Create user
  this.user = await createTestUser();

  // TODO: decouple from setUpControllerTests
  // Now this function is dependant on setUpControllerTests
  // implementation
  setUpControllerTests.bind(this)();
  this.req.user = this.user;
}


async function createChatAndUser() {
  // Helper to set up chat and user before test case is run
  // Create user
  this.user = await createTestUser();
  // Create chat
  this.chat = await createTestChat();
}

async function createUser() {
  this.user = await createTestUser();
}

async function setUpControllerTestsWithUserAndChat() {
  // Set up environment for controller tests, create user and chat
  await setUpControllerTestsWithUser.bind(this)();

  // Create chat
  this.chat = await createTestChat();
}

async function createMessages() {
  // Generate two pages of messages
  await createChatAndUser.bind(this)();
  const messageDocs = [...Array(20).keys()].map(
    (number) => ({
      text: number.toString(),
      chat: this.chat,
      author: this.user
    })
  );
  this.messages = await Message.insertMany(messageDocs);
}


module.exports = {
  setUpDbBeforeTest,
  cleanAndCloseDbAfterTest,

  setUpControllerTests,
  setUpControllerTestsWithUser,
  setUpControllerTestsWithUserAndChat,

  createUser,
  createChatAndUser,
  createMessages
}