"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  ChatController = require('../../../../api/controllers/chat'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Join group chat', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(
    testUtils.setUpControllerTestsWithUserAndChat.bind(this));
  
  it('200 OK returned if user joined chat successfully', async () => {
    this.req.params = {
      id: this.chat.id
    };

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.joinGroupChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('422 unprocessable entity returned if chat with this id does not exist', async () => {
    this.req.params = {
      id: mongoose.Types.ObjectId().toString()
    };

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.joinGroupChat(this.req, this.res);
    expect(statusStub.withArgs(422).calledOnce).to.be.true;
  });

  it('Chat joined successfully', async () => {
    this.req.params = {
      id: this.chat.id
    };

    const joinChatSpy = sinon.stub().returns(this.chat);
    sinon.replace(User.prototype, 'joinChat', joinChatSpy);
    await ChatController.joinGroupChat(this.req, this.res);

    const joinedChatId = joinChatSpy.getCall(0).args[0].id;
    expect(joinedChatId).to.be.equal(this.chat.id);
  });

  it('Chat returned if user joined it successfully', async () => {
    this.req.params = {
      id: this.chat.id
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.joinGroupChat(this.req, this.res);

    const expectedUsersResult = [
      {
        _id: this.user.id,
        nickname: this.user.nickname
      }
    ];
    const receivedResult = jsonSpy.getCall(0).args[0].users;
    expect(
      utils.toJSON(receivedResult)
    ).to.be.deep.equal(expectedUsersResult);
  });

  it('Validation errors returned if chat with this id does not exist', async () => {
    this.req.params = {
      id: mongoose.Types.ObjectId().toString()
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.joinGroupChat(this.req, this.res);
    const errors = {
      errors: {
        chat: 'Group chat with this id does not exists'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Validation errors returned if chat is private', async () => {
    this.req.params = {
      id: this.chat.id
    };
    await Chat.findByIdAndUpdate(this.chat._id, {isGroupChat: false});

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.joinGroupChat(this.req, this.res);
    const errors = {
      errors: {
        chat: 'Unfortunately, you can not join private chat'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
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
