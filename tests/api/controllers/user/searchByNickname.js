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

describe('Search by nickname', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if request completed successfully', async () => {
    this.req.query.nickname = 'test';
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.searchByNickname(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Users returned successfully', async () => {
    const nickname = 'test';
    const firstMatchUser = User({
      nickname: 'test',
      email: 'test-email-1@google.com',
      googleID: 'test-google-id-1'
    });
    await firstMatchUser.save();
    const secondMatchUser = User({
      nickname: 'test almost match',
      email: 'test-email-2@google.com',
      googleID: 'test-google-id-2'
    });
    await secondMatchUser.save();
    const noMatchUser = User({
      nickname: 'no match',
      email: 'test-email-3@google.com',
      googleID: 'test-google-id-3'
    });
    await noMatchUser.save();
    this.req.query.nickname = nickname;
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await UserController.searchByNickname(this.req, this.res);
    const expectedResponse = {
      users: [
        {
          _id: firstMatchUser.id,
          nickname: firstMatchUser.nickname
        },
        {
          _id: secondMatchUser.id,
          nickname: secondMatchUser.nickname
        },
      ]
    };
    expect(jsonSpy.withArgs(expectedResponse).calledOnce).to.be.true;
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});