"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../api/models/chat'),
  MessageController = require('../../../api/controllers/message'),
  Message = require('../../../api/models/message'),
  User = require('../../../api/models/user'),
  testUtils = require('../../_utils');

describe('List paginated message', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

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

    const listMessagesPaginatedStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listMessagesPaginated', 
      listMessagesPaginatedStub
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

    const listMessagesPaginatedStub = sinon.stub().returns([]);
    sinon.replace(
      Message, 
      'listMessagesPaginated', 
      listMessagesPaginatedStub
    );

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(
      listMessagesPaginatedStub.withArgs(chatId, page).calledOnce
    ).to.be.true;
  });

  afterEach(async () => {
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});

describe('List new messages', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    this.req.query.date = '2018-08-28T13:09:58.073Z';

    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Messages returned if request completed successfully', async () => {
    this.req.query.date = '2018-08-28T13:09:58.073Z';

    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const listNewMessagesStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listNewMessages', 
      listNewMessagesStub
    );

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(jsonStub.withArgs({messages: []}).calledOnce).to.be.true;
  });

  it('403 forbidden returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(403).calledOnce).to.be.true;
  });

  it('Error returned if user don\'t have access to to chat', async () => {
    const hasAccessToChatStub = sinon.stub().returns(false);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const jsonStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'json', jsonStub);

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(jsonStub.withArgs({
      errors: {
        chat: 'Unfortunately you can not access this chat'
      }
    }).calledOnce).to.be.true;
  });

  it('Date is passed to listMessages function ', async () => {
    const chatId = 'test-chat-id';
    const date = '2018-08-28T13:09:58.073Z';;
    this.req.params = {
      chatId: chatId
    };
    this.req.query = {
      date: date
    };

    const hasAccessToChatStub = sinon.stub().returns(true);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const listNewMessagesStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listNewMessages', 
      listNewMessagesStub
    );

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(
      listNewMessagesStub.withArgs(chatId, date).calledOnce
    ).to.be.true;
  });

  afterEach(async () => {
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Get chat with messages', () => {
  // TODO: refactor to share common logic with listMessagesInChat
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

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

    const listMessagesPaginatedStub =
      sinon
        .stub()
        .returns(Promise.resolve([]));
    sinon.replace(
      Message, 
      'listMessagesPaginated', 
      listMessagesPaginatedStub
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
    testUtils.cleanAndCloseDbAfterTest(done);
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
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUserAndChat.bind(this));

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