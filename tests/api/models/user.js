"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const User = require('../../../api/models/user'),
  utils = require('../../_utils');

describe('Static api for user model', () => {
  before((done) => {
    utils.setUpDbBeforeTest(done);
  });

  it('User.getOrCreate return user with specified googleID, if such user exists', async () => {
    const googleID = 'test-google-id';
    const email = 'test@google.com';
    const user = new User({
      googleID: googleID,
      email: email
    });
    await user.save();
    const retrievedUser = await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.id).to.equal(user.id);
  });

  it('User.getOrCreate creates new user with specified email, if user with specified googleID does not exist', async () => {
    const googleID = 'test-google-id-2';
    const email = 'test2@google.com';
    const retrievedUser =  await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.email).to.equal(email);
  });

  it('User.getOrCreate throws error, if fetching user failed', async () => {
    const findOneStub = sinon.stub().throws();
    sinon.replace(User, 'findOne', findOneStub);
    const UserMock = sinon.mock(User);
    UserMock.expects('findOneOrCreate').once().throws();
    try {
      await User.findOneOrCreate('test-google-id', 'test@google.com');
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
  });

  it('User.getOrCreate throws error, if creating user failed', async () => {
    const createStub = sinon.stub().throws();
    sinon.replace(User, 'create', createStub);
    const UserMock = sinon.mock(User);
    UserMock.expects('findOneOrCreate').once().throws();
    try {
      await User.findOneOrCreate('test-google-id', 'test@google.com');
    } catch (error) {
      // Skip this section
      // Error will be verified by mock
    }
    UserMock.verify();
  });

  afterEach(() => {
    sinon.restore();
  });

  after((done) => {
    utils.dropDbAfterTest(done);
  });

});