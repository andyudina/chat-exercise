"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  MessageController = require('../../../../api/controllers/message'),
  Message = require('../../../../api/models/message'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('List new messages', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    this.req.query.date = '2018-08-28T13:09:58.073Z';

    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);

    await MessageController.listNewMessagesInChat(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Messages returned if request completed successfully', async () => {
    this.req.query.date = '2018-08-28T13:09:58.073Z';

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

  it('Date is passed to listMessages function ', async () => {
    const chatId = 'test-chat-id';
    const date = '2018-08-28T13:09:58.073Z';;
    this.req.params = {
      chatId: chatId
    };
    this.req.query = {
      date: date
    };

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