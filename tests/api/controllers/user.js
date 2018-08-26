"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// User import left here, so UserSchema is registered
// before controller is imported
const User = require('../../../api/models/user'),
  UserController = require('../../../api/controllers/user'),
  utils = require('../../_utils')

describe('Set user nickname', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if nickname updated successfully', async () => {
    this.req.body.nickname = 'test';
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.setNickname(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if error occured on update', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.setNickname(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
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
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await UserController.setNickname(this.req, this.res);
    expect(jsonSpy.getCall(0).args[0].nickname).to.be.equal(nickname);
  });

  it('Validation errors returned if error occured on update', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await UserController.setNickname(this.req, this.res);
    const errors = {
      errors: {
        nickname: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Throw error is update failed', async () => {
    const findByIdAndUpdateStub = sinon.stub().throws();
    sinon.replace(User, 'findByIdAndUpdate', findByIdAndUpdateStub);
    const UserControllerMock = sinon.mock(UserController);
    UserControllerMock.expects('setNickname').once().throws();
    try {
      await UserController.setNickname(this.req, this.res);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserControllerMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Get current user', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });
  
  beforeEach(utils.setUpControllerTestsWithUser.bind(this));

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

  it('Throw error is user retrieval failed', async () => {
    const findByIdStub = sinon.stub().throws();
    sinon.replace(User, 'findById', findByIdStub);
    const UserControllerMock = sinon.mock(UserController);
    UserControllerMock.expects('getCurrentUser').once().throws();
    try {
      await UserController.getCurrentUser(this.req, this.res);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserControllerMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});

describe('Search by nickname', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(utils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if request completed successfully', async () => {
    this.req.query.nickname = 'test';
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.searchByNickname(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('400 Bad request returned if no nickname provided', async () => {
    const statusStub = sinon.stub().returns(this.res);
    sinon.replace(this.res, 'status', statusStub);
    await UserController.searchByNickname(this.req, this.res);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
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

  it('Validation errors returned if nickname is not provided', async () => {
    const jsonSpy = sinon.spy();
    sinon.replace(this.res, 'json', jsonSpy);
    await UserController.searchByNickname(this.req, this.res);
    const errors = {
      errors: {
        nickname: 'This field is required'
      }
    };
    expect(jsonSpy.withArgs(errors).calledOnce).to.be.true;
  });

  it('Throw error is search falied', async () => {
    const findByIdAndUpdateStub = sinon.stub().throws();
    sinon.replace(User, 'findByIdAndUpdate', findByIdAndUpdateStub);
    const UserControllerMock = sinon.mock(UserController);
    UserControllerMock.expects('searchByNickname').once().throws();
    try {
      await UserController.searchByNickname(this.req, this.res);
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserControllerMock.verify();
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
  });

  after((done) => {
    utils.cleanAndCloseDbAfterTest(done);
  });
});