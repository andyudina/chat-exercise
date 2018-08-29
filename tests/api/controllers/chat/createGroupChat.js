"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  ChatController = require('../../../../api/controllers/chat'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Create new group chat', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if chat created successfully', async () => {
    this.req.body.name = 'new test';

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.createGroupChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('422 unprocessable entity returned if chat with this name already exist', async () => {
    const name = 'test';
    this.req.body.name = name;
    await Chat.create({name: name});

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.createGroupChat(this.req, this.res);
    expect(statusStub.withArgs(422).calledOnce).to.be.true;
  });

  it('Chat created successfully', async () => {
    const name = 'test';
    this.req.body.name = name;
    await ChatController.createGroupChat(this.req, this.res);
    const createdChat = await Chat.findOne({name: name});
    expect(createdChat).to.exist;
  });

  it('Chat returned if created successfully', async () => {
    const name = 'test';
    this.req.body.name = name;

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.createGroupChat(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].name).to.be.equal(name);
  });

  it('Add user to created chat', async () => {
    this.req.body.name = 'name';

    const addUserToChatByIdSpy = sinon.spy();
    sinon.replace(User, 'addUserToChatById', addUserToChatByIdSpy);

    await ChatController.createGroupChat(this.req, this.res);
    expect(addUserToChatByIdSpy.calledOnce).to.be.true;
  });

  it('Validation errors returned if chat with this name already exists', async () => {
    const name = 'test';
    this.req.body.name = name;
    await Chat.create({name: name});

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.createGroupChat(this.req, this.res);
    const errors = {
      errors: {
        name: 'Group chat with this name already exists'
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
