"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  MessageController = require('../../../../api/controllers/message'),
  Message = require('../../../../api/models/message'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils');

describe('Get chat with messages', () => {

  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if request completed successfully', async () => {
    const findByIdWithUsersStub =
      sinon
        .stub()
        .returns(Promise.resolve({}));
    sinon.replace(
      Chat, 
      'findByIdWithUsers', 
      findByIdWithUsersStub
    );

    const statusStub = testUtils.stubStatus(this.res);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Chat and messages returned if request completed successfully', async () => {
    const listMessagesPaginatedStub =
      sinon
        .stub()
        .returns(Promise.resolve({messages: [], hasNextPage: false}));
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

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await MessageController.getChatWithMessages(this.req, this.res);
    expect(jsonSpy.withArgs({messages: [], hasNextPage: false, chat: {}}).calledOnce).to.be.true;
  });

  afterEach(async () => {
    await User.remove({}).exec();
    sinon.restore();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});
