"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const User = require('../../../api/models/user'),
  UserController = require('../../../api/controllers/user'),
  utils = require('../../_utils')

describe('Set user nickname', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  beforeEach(async () => {
    // Create user
    this.user = User({
      email: 'test-email@google.com',
      googleID: 'test-google-id'
    });
    await this.user.save();

    // Set up request
    const req = {
      user: this.user,
      body: {}
    };
    this.req = req;

    // Set up response
    const res = {
      json() {}
    }
    res.status = () => {return res;};
    this.res = res;
  });
  
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
    utils.dropDbAfterTest(done);
  });
});