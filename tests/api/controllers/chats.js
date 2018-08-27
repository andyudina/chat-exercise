"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const Chat = require('../../../api/models/chat'),
  ChatController = require('../../../api/controllers/chat'),
  User = require('../../../api/models/user'),
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

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));
  
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

  it('Add user to created chat', async () => {
    this.req.body.name = 'name';

    const addUserToChatByIdSpy = sinon.spy();
    sinon.replace(User, 'addUserToChatById', addUserToChatByIdSpy);

    await ChatController.createGroupChat(this.req, this.res);
    expect(addUserToChatByIdSpy.calledOnce).to.be.true;
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
    await User.remove({}).exec();
    await Chat.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});


describe('Join group chat', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(
    utils.setUpControllerTestsWithUserAndChat.bind(this));
  
  it('200 OK returned if user joined chat successfully', async () => {
    this.req.params = {
      id: this.chat.id
    };
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.joinGroupChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if no chat id provided', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.joinGroupChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('400 Bad request returned if chat with this id does not exist', async () => {
    this.req.params = {
      id: mongoose.Types.ObjectId().toString()
    };
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.joinGroupChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('Chat joined successfully', async () => {
    this.req.params = {
      id: this.chat.id
    };

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    
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

    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);

    await ChatController.joinGroupChat(this.req, this.res);

    const expectedUsersResult = [
      {
        _id: this.user.id,
        nickname: this.user.nickname
      }
    ];
    expect(
      jsonSpy.getCall(0).args[0].users
    ).to.be.deep.equal(expectedUsersResult);
  });

  it('Validation errors returned if no chat id provided', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.joinGroupChat(this.req, this.res);
    const errors = {
      errors: {
        chat: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Validation errors returned if chat with this id does not exist', async () => {
    this.req.params = {
      id: mongoose.Types.ObjectId().toString()
    };
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
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
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
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
    utils.cleanAndCloseDbAfterTest(done);
  });
});


describe('Create new private chat', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if chat created successfully', async () => {
    this.req.body = {
      user: this.user.id
    };
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createPrivateChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if no user provided', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createPrivateChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('400 Bad request returned if user does not exist', async () => {
    this.req.body = {
      user: mongoose.Types.ObjectId().toString()
    };
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await ChatController.createPrivateChat(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
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
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
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

    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);

    await ChatController.createPrivateChat(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].id).to.be.equal(chat.id);
  });

  it('Validation errors returned if user is not provided', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await ChatController.createPrivateChat(this.req, this.res);
    const errors = {
      errors: {
        user: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Validation errors returned if user does not exist', async () => {
    this.req.body = {
      user: mongoose.Types.ObjectId().toString()
    };
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
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
    utils.cleanAndCloseDbAfterTest(done);
  });
});
