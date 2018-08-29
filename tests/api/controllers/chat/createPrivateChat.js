"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  ChatController = require('../../../../api/controllers/chat'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Create new private chat', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if chat created successfully', async () => {
    this.req.body = {
      user: this.user.id
    };

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.createPrivateChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('422 unprocessable entity returned if user does not exist', async () => {
    this.req.body = {
      user: mongoose.Types.ObjectId().toString()
    };

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.createPrivateChat(this.req, this.res);
    expect(statusStub.withArgs(422).calledOnce).to.be.true;
  });

  it('Chat created successfully', async () => {
    const newUser = User({
      email: 'new-test',
      googleID: 'new-test'
    });
    await newUser.save();

    this.req.body = {
      user: newUser.id
    };
    await ChatController.createPrivateChat(this.req, this.res);
    const createdChat = await Chat.findOne(
      {
        $and: [
          {isGroupChat: false},
          {users: this.user.id},
          {users: newUser.id}
        ]
      }
    );
    expect(createdChat).to.exist;
  });

  it('Chat returned if created successfully', async () => {
    this.req.body = {
      user: this.user.id
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.createPrivateChat(this.req, this.res);
    expect(
      jsonSpy.getCall(0).args[0].users[0].toString()
    ).to.be.equal(this.user.id);
  });

  it('Existing chat returned if already created', async () => {
    const chat = Chat({
      isGroupChat: false,
      users: [this.user.id]
    });
    await chat.save();

    this.req.body = {
      user: this.user.id
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.createPrivateChat(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].id).to.be.equal(chat.id);
  });

  it('Validation errors returned if user does not exist', async () => {
    this.req.body = {
      user: mongoose.Types.ObjectId().toString()
    };

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.createPrivateChat(this.req, this.res);
    const errors = {
      errors: {
        user: 'This user does not exist'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Chat with same user created successfully', async () => {
    this.req.body = {
      user: this.user.id
    };
    await ChatController.createPrivateChat(this.req, this.res);
    const createdChat = await Chat.findOne(
      {isGroupChat: false, 'users': this.user.id}
    );
    expect(createdChat).to.exist;
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