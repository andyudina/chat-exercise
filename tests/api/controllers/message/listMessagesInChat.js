"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  MessageController = require('../../../../api/controllers/message'),
  Message = require('../../../../api/models/message'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('List paginated message', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    const statusStub = testUtils.stubStatus(this.res);

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Messages returned if request completed successfully', async () => {
    const listMessagesPaginatedStub =
      sinon
        .stub()
        .returns(Promise.resolve({ messages: [], hasNextPage: false }));
    sinon.replace(
      Message, 
      'listMessagesPaginated', 
      listMessagesPaginatedStub
    );

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await MessageController.listMessagesInChat(this.req, this.res);
    expect(
      jsonSpy.withArgs({ messages: [], hasNextPage: false }).calledOnce
    ).to.be.true;
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