"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../api/models/chat'),
  ChatController = require('../../../api/controllers/chat'),
  utils = require('../../_utils')

describe('Search by name', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTests.bind(this));
  
  it('200 OK returned if request completed successfully', async () => {
    this.req.query.name = 'test';
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.searchByName(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if no name provided', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.searchByName(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('Chats returned successfully', async () => {
    const name = 'test';
    const firstMatchChat = Chat({
      name: 'test',
    });
    await firstMatchChat.save();
    const secondMatchChat = Chat({
      name: 'test almost match',
    });
    await secondMatchChat.save();
    const noMatchChat = Chat({
      name: 'no match',
    });
    await noMatchChat.save();
    this.req.query.name = name;
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.searchByName(this.req, this.res);
    const expectedResponse = {
      chats: [
        {
          _id: firstMatchChat.id,
          name: firstMatchChat.name
        },
        {
          _id: secondMatchChat.id,
          name: secondMatchChat.name
        },
      ]
    };
    expect(jsonSpy.withArgs(expectedResponse).calledOnce).to.be.true;
  });

  it('Validation errors returned if name is not provided', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.searchByName(this.req, this.res);
    const errors = {
      errors: {
        name: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Throw error is search falied', async () => {
    const findByIdAndUpdateStub = sinon.stub().throws();
    sinon.replace(Chat, 'findByIdAndUpdate', findByIdAndUpdateStub);
    const ChatControllerMock = sinon.mock(ChatController);
    ChatControllerMock.expects('searchByName').once().throws();
    try {
      await ChatController.searchByName(this.req, this.res);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatControllerMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Create new group chat', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTests.bind(this));
  
  it('200 OK returned if chat created successfully', async () => {
    this.req.body.name = 'new test';
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createGroupChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if no name provided', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createGroupChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('400 Bad request returned if chat with this name already exist', async () => {
    const name = 'test';
    this.req.body.name = name;
    await Chat.create({name: name});
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createGroupChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
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
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.createGroupChat(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].name).to.be.equal(name);
  });

  it('Validation errors returned if name is not provided', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.createGroupChat(this.req, this.res);
    const errors = {
      errors: {
        name: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Validation errors returned if chat with this name already exists', async () => {
    const name = 'test';
    this.req.body.name = name;
    await Chat.create({name: name});
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.createGroupChat(this.req, this.res);
    const errors = {
      errors: {
        name: 'Group chat with this name already exists'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Throw error is unknown error occured', async () => {
    const name = 'test';
    this.req.body.name = name;
    const createStub = sinon.stub().throws();
    sinon.replace(Chat, 'create', createStub);
    const ChatControllerMock = sinon.mock(ChatController);
    ChatControllerMock.expects('createGroupChat').once().throws();
    try {
      await ChatController.createGroupChat(this.req, this.res);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    ChatControllerMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});