"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  mongoose = require('mongoose'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('hasAccessToChat - static api for User model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

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
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});
