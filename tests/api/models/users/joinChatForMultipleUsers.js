"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('joinChatForMultipleUsers - static api for User model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

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
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});
