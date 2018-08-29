"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// User import left here, so UserSchema is registered
// before controller is imported
const Chat = require('../../../../api/models/chat'),
  User = require('../../../../api/models/user'),
  UserController = require('../../../../api/controllers/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Get current user', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });
  
  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));

  it('200 OK returned if current user retrieved successfully', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.getCurrentUser(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('User returned on successful request', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await UserController.getCurrentUser(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].id).to.be.equal(this.user.id);
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});