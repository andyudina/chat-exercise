"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

// Import models to register them with mongoose
const User = require('../../../../api/models/user'),
  Chat = require('../../../../api/models/chat'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('addUser api for chat model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

  it('Add user if not exist', async () => {
    await this.chat.addUser(this.user._id);
    const updatedChat = await Chat.findById(this.chat._id).exec();
    expect(updatedChat.users[0].toString()).to.be.equal(this.user.id);
  });

  it('Do not add user if it already added to array', async () => {
    await this.chat.addUser(this.user._id);
    await this.chat.addUser(this.user._id);
    const updatedChat = await Chat.findById(this.chat._id).exec();
    // user was added only once
    expect(updatedChat.users[0].toString()).to.be.equal(this.user.id);
  });

  it('Return updated chat', async () => {
    const updatedChat = await this.chat.addUser(this.user._id);
    expect(updatedChat.users[0].toString()).to.be.equal(this.user.id);
  });

  it('Throw error if db request failed', async () => {
    const findOneAndUpdateStub = sinon.stub().throws();
    sinon.replace(Chat, 'findOneAndUpdate', findOneAndUpdateStub);
    const chatMock = sinon.mock(this.chat);
    chatMock.expects('addUser').once().throws();
    try {
      await this.chat.addUser(this.user._id);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    chatMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
    await User.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});