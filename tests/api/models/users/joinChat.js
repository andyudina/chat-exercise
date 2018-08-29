"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('joinChat api for User model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

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
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});
