"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../api/models/user'),
  utils = require('../../_utils');

/*

 Static APIs

*/

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

describe('addUserToChatById - static api for User model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('joinChat api called', async () => {
    const joinChatSpy = sinon.spy();
    sinon.replace(User.prototype, 'joinChat', joinChatSpy);
    await User.addUserToChatById(this.user.id, this.chat);
    expect(joinChatSpy.withArgs(this.chat).calledOnce).to.be.true;
  });

  it('Updated chat returned', async () => {
    const updatedChat = await User.addUserToChatById(this.user.id, this.chat);
    expect(updatedChat.id).to.be.equal(this.chat.id);
  });

  it('Error is thrown if user does not exist', async () => {
    const UserMock = sinon.mock(User);
    UserMock.expects('addUserToChatById').once().throws();
    try {
      await User.addUserToChatById(
        mongoose.Types.ObjectId().toString(), this.chat
      );
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
  });

  it('Error is re-thrown if join call failed', async () => {
    const joinChatStub = sinon.stub().throws();
    sinon.replace(User.prototype, 'joinChat', joinChatStub);
    const UserMock = sinon.mock(User);
    UserMock.expects('addUserToChatById').once().throws();
    try {
      await User.addUserToChatById(this.user.id, this.chat);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
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

describe('joinChatForMultipleUsers - static api for User model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('joinChat api called for each user', async () => {
    const newUser = User({
      email: 'new-test',
      googleID: 'new-test'
    });
    await newUser.save();

    const joinChatStub = sinon.stub().returns(this.chat);
    sinon.replace(User.prototype, 'joinChat', joinChatStub);

    await User.joinChatForMultipleUsers(
      [this.user, newUser],
      this.chat
    );
    expect(joinChatStub.calledTwice).to.be.true;
  });

  it('Updated chat returned', async () => {
    const updatedChat = await User.joinChatForMultipleUsers(
      [this.user],
      this.chat
    );
    expect(updatedChat.id).to.be.equal(this.chat.id);
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

describe('hasAccessToChat - static api for User model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('Returns false if user doesn\'t have access', async () => {
    const result = await User.hasAccessToChat(
      this.user.id, this.chat.id);
    expect(result).to.be.false;
  });

  it('Returns false if user doesn\'t exist', async () => {
    const result = await User.hasAccessToChat(
      mongoose.Types.ObjectId().toString(), this.chat.id);
    expect(result).to.be.false;
  });

  it('Returns true if user has access', async () => {
    await User.findByIdAndUpdate(
      this.user._id,
      { chats: [this.chat._id] }
    );
    const result = await User.hasAccessToChat(
      this.user.id, this.chat.id);
    expect(result).to.be.true;
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

describe('getUsersMap - static api for User model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createUser.bind(this));

  it('Returns valid map', async () => {
    const userMap = await User.getUsersMap([this.user.id]);
    const expectedUser = {
      _id: this.user.id,
      nickname: this.user.nickname
    };
    expect(userMap.get(this.user.id)).to.be.deep.equal(expectedUser);
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

/*

 Model APIs

*/

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

describe('joinChat api for User model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.createChatAndUser.bind(this));

  it('Add user to chat', async () => {
    const addUserStub = sinon.stub();
    sinon.replace(Chat.prototype, 'addUser', addUserStub);
    await this.user.joinChat(this.chat);
    expect(addUserStub.withArgs(this.user._id).calledOnce).to.be.true;
  });

  it('Add chat to user', async () => {
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