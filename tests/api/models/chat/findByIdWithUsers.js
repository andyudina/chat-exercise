"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

// Import models to register them with mongoose
const User = require('../../../../api/models/user'),
  Chat = require('../../../../api/models/chat'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('findByIdWithUsers - static api for Chat model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createChatAndUser.bind(this));

  it('Populate user data', async () => {
    await Chat.findByIdAndUpdate(
      this.chat._id,
      { users: [this.user._id] }
    );

    const chatWithUserData = await Chat.findByIdWithUsers(this.chat.id)
    const expectedUsers = [{
      _id: this.user.id,
      nickname: this.user.nickname
    }];
    expect(utils.toJSON(chatWithUserData.users))
      .to.be.deep.equal(expectedUsers);
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
