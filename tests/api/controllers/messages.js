"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../api/models/chat'),
  MessageController = require('../../../api/controllers/message'),
  Message = require('../../../api/models/message'),
  User = require('../../../api/models/user'),
  utils = require('../../_utils');

describe('List messages by page', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await MessageController.listMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Messages returned if request completed successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const listMessagesWithAuthorStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listMessagesWithAuthor', 
      listMessagesWithAuthorStub
    );

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(jsonStub.withArgs({messages: []}).calledOnce).to.be.true;
  });

  it('403 forbidden returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await MessageController.listMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(403).calledOnce).to.be.true;
  });

  it('Error returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(jsonStub.withArgs({
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    }).calledOnce).to.be.true;
  });

  it('Page is passed to listMessages function ', async () => {
    const chatId = 'test-chat-id';
    const page = 1;
    this.req.params = {
      chatId: chatId
    };
    this.req.query = {
      page: page
    };

    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const listMessagesWithAuthorStub = sinon.stub().returns([]);
    sinon.replace(
      Message, 
      'listMessagesWithAuthor', 
      listMessagesWithAuthorStub
    );

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(
      listMessagesWithAuthorStub.withArgs(chatId, page).calledOnce
    ).to.be.true;
  });

  afterEach(async () => {
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Get chat with messages', () => {
  // TODO: refactor to share common logic with listMessagesInChat
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const findByIdWithUsersStub =
      sinon
        .stub()
        .returns(Promise.resolve({}));
    sinon.replace(
      Chat, 
      'findByIdWithUsers', 
      findByIdWithUsersStub
    );

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Chat and messages returned if request completed successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const listMessagesWithAuthorStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listMessagesWithAuthor', 
      listMessagesWithAuthorStub
    );

    const findByIdWithUsersStub =
      sinon
        .stub()
        .returns(Promise.resolve({}));
    sinon.replace(
      Chat, 
      'findByIdWithUsers', 
      findByIdWithUsersStub
    );

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(jsonStub.withArgs({messages: [], chat: {}}).calledOnce).to.be.true;
  });

  it('403 forbidden returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(statusStub.withArgs(403).calledOnce).to.be.true;
  });

  it('Error returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(jsonStub.withArgs({
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    }).calledOnce).to.be.true;
  });

  afterEach(async () => {
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Send message to chat', () => {
  // TODO: refactor to share common logic with listMessagesInChat
  async function testReturnedMessage() {
    // Helper function to intercept returned message
    // on successful creation
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.sendMessage(this.req, this.res);
    return jsonStub.getCall(0).args[0].message;
  };

  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUserAndChat.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.sendMessage(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Message created successfully', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    this.req.body = {
      message: 'test'
    };
    this.req.params = {
      chatId: this.chat.id
    };

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

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

  it('403 forbidden returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await MessageController.sendMessage(this.req, this.res);
    expect(statusStub.withArgs(403).calledOnce).to.be.true;
  });

  it('Error returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.sendMessage(this.req, this.res);
    expect(jsonStub.withArgs({
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    }).calledOnce).to.be.true;
  });

  it('400 bad request returned if no text message provided', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.sendMessage(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('Error returned if no text message provided', async () => {
    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.sendMessage(this.req, this.res);
    expect(jsonStub.withArgs({
      errors: { 
        message: 'This field is required'
      } 
    }).calledOnce).to.be.true;
  });

  afterEach(async () => {
    await Chat.remove({}).exec();
    await Message.remove({}).exec();
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});