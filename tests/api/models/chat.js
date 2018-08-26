"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

// Import models to register them with mongoose
const User = require('../../../api/models/user'),
  Chat = require('../../../api/models/chat'),
  utils = require('../../_utils');


describe('addUser api for chat model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

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
    utils.cleanAndCloseDbAfterTest(done);
  });

});


describe('join static api for chat model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('Throw error if fetching user failed', async () => {
    const findByIdStub = sinon.stub().throws();
    sinon.replace(User, 'findById', findByIdStub);
    const ChatMock = sinon.mock(Chat);
    ChatMock.expects('joinChat').once().throws();
    try {
      await Chat.joinChat(this.chat._id, this.user._id);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatMock.verify();
  });

  it('Throw error if fetching chat failed', async () => {
    const findByIdStub = sinon.stub().throws();
    sinon.replace(Chat, 'findById', findByIdStub);
    const ChatMock = sinon.mock(Chat);
    ChatMock.expects('joinChat').once().throws();
    try {
      await Chat.joinChat(this.chat._id, this.user._id);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatMock.verify();
  });

  it('Throw error if user does not exist', async () => {
    const ChatMock = sinon.mock(Chat);
    ChatMock.expects('joinChat').once().throws();
    try {
      await Chat.joinChat(this.chat._id, mongoose.Types.ObjectId());
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatMock.verify();
  });

  it('Throw error if chat does not exist', async () => {
    const ChatMock = sinon.mock(Chat);
    ChatMock.expects('joinChat').once().throws();
    try {
      await Chat.joinChat(mongoose.Types.ObjectId(), this.user._id);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatMock.verify();
  });

  it('Add user to channel', async () => {
    const addUserStub = sinon.stub();
    sinon.replace(Chat.prototype, 'addUser', addUserStub);
    await Chat.joinChat(this.chat._id, this.user._id);
    expect(addUserStub.withArgs(this.user._id).calledOnce).to.be.true;
  });

  it('Add channel to user', async () => {
    const addChatStub = sinon.stub();
    sinon.replace(User.prototype, 'addChat', addChatStub);
    await Chat.joinChat(this.chat._id, this.user._id);
    expect(addChatStub.withArgs(this.chat._id).calledOnce).to.be.true;
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
    await User.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });

});