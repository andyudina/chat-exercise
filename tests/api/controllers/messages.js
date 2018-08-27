"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const MessageController = require('../../../api/controllers/message'),
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

    const listMessagesWithAuthorStub = sinon.stub().returns([]);
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