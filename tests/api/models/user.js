"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../api/models/chat'),
  User = require('../../../api/models/user'),
  utils = require('../../_utils');

// Static apis

describe('findOneOrCreate static api for user model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  it('User.findOneOrCreate return user with specified googleID, if such user exists', async () => {
    const googleID = 'test-google-id';
    const email = 'test@google.com';
    const user = new User({
      googleID: googleID,
      email: email
    });
    await user.save();
    const retrievedUser = await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.id).to.equal(user.id);
  });

  it('User.findOneOrCreate creates new user with specified email, if user with specified googleID does not exist', async () => {
    const googleID = 'test-google-id-2';
    const email = 'test2@google.com';
    const retrievedUser =  await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.email).to.equal(email);
  });

  it('User.findOneOrCreate throws error, if fetching user failed', async () => {
    const findOneStub = sinon.stub().throws();
    sinon.replace(User, 'findOne', findOneStub);
    const UserMock = sinon.mock(User);
    UserMock.expects('findOneOrCreate').once().throws();
    try {
      await User.findOneOrCreate('test-google-id', 'test@google.com');
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
  });

  it('User.findOneOrCreate throws error, if creating user failed', async () => {
    const createStub = sinon.stub().throws();
    sinon.replace(User, 'create', createStub);
    const UserMock = sinon.mock(User);
    UserMock.expects('findOneOrCreate').once().throws();
    try {
      await User.findOneOrCreate('test-google-id', 'test@google.com');
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
  });

  afterEach(() => {
    sinon.restore();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });

});

// Model apis

describe('addChat api for user model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

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
    utils.cleanAndCloseDbAfterTest(done);
  });

});

describe('Join chat - static api for user model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('Add user to channel', async () => {
    const addUserStub = sinon.stub();
    sinon.replace(Chat.prototype, 'addUser', addUserStub);
    await this.user.joinChat(this.chat);
    expect(addUserStub.withArgs(this.user._id).calledOnce).to.be.true;
  });

  it('Add channel to user', async () => {
    const addChatStub = sinon.stub();
    sinon.replace(User.prototype, 'addChat', addChatStub);
    await this.user.joinChat(this.chat);
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