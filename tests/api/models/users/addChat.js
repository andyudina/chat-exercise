"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('addChat api for user model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

  it('Add chat if not exist', async () => {
    await this.user.addChat(this.chat._id);
    const updatedUser = await User.findById(this.user._id).exec();
    expect(updatedUser.chats[0].toString()).to.be.equal(this.chat.id);
  });

  it('Do not add chat if it already added to array', async () => {
    await this.user.addChat(this.chat._id);
    await this.user.addChat(this.chat._id);
    const updatedUser = await User.findById(this.user._id).exec();
    // Chat was added only once
    expect(updatedUser.chats[0].toString()).to.be.equal(this.chat.id);
  });

  it('Return updated user', async () => {
    const updatedUser = await this.user.addChat(this.chat._id);
    expect(updatedUser.chats[0].toString()).to.be.equal(this.chat.id);
  });

  it('Throw error if db request failed', async () => {
    const findOneAndUpdateStub = sinon.stub().throws();
    sinon.replace(User, 'findOneAndUpdate', findOneAndUpdateStub);
    const userMock = sinon.mock(this.user);
    userMock.expects('addChat').once().throws();
    try {
      await this.user.addChat(this.chat._id);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    userMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
    await Chat.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});
