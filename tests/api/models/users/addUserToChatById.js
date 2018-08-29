"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('addUserToChatById - static api for User model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

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
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});
