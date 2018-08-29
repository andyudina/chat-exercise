"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  MessageController = require('../../../../api/controllers/message'),
  Message = require('../../../../api/models/message'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('Send message to chat', () => {

  async function testReturnedMessage() {
    // Helper function to intercept returned message
    // on successful creation
    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await MessageController.sendMessage(this.req, this.res);
    return jsonSpy.getCall(0).args[0].message;
  };

  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUserAndChat.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const statusStub = testUtils.stubStatus(this.res);

    await MessageController.sendMessage(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Message created successfully', async () => {
    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const statusStub = testUtils.stubStatus(this.res);

    await MessageController.sendMessage(this.req, this.res);

    const createdMessage = await Message
      .findOne({ chat: this.chat._id, author: this.user._id, text: 'test'})
      .exec();
    expect(createdMessage).to.be.not.null;
  });

  it('Text of created message returned if request completed successfully', async () => {
    const sendMessage = await testReturnedMessage.bind(this)();
    expect(sendMessage.text).to.be.equal('test');
  });

  it('Author of created message returned if request completed successfully', async () => {
    const sendMessage = await testReturnedMessage.bind(this)();
    expect(sendMessage.author.nickname).to.be.equal(this.user.nickname);
  });

  afterEach(async () => {
    await Chat.remove({}).exec();
    await Message.remove({}).exec();
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});