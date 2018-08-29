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

describe('Set user nickname', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if nickname updated successfully', async () => {
    this.req.body.nickname = 'test';

    const statusStub = testUtils.stubStatus(this.res);

    await UserController.setNickname(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('User updated successfully', async () => {
    const nickname = 'test';
    this.req.body.nickname = nickname;
    await UserController.setNickname(this.req, this.res);
    // Refresh from db
    let updatedUser = await User.findById(this.user.id).exec();
    expect(updatedUser.nickname).to.be.equal(nickname);
  });

  it('Updated user returned if nickname updated successfully', async () => {
    const nickname = 'test';
    this.req.body.nickname = nickname;

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await UserController.setNickname(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].nickname).to.be.equal(nickname);
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});