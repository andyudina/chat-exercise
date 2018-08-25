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
    let googleID = 'test-google-id';
    let email = 'test@google.com';
    let user = new User({
      googleID: googleID,
      email: email
    });
    await user.save();
    let retrievedUser = await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.id).to.equal(user.id);
  });

  it('User.getOrCreate creates new user with specified email, if user with specified googleID does not exist', async () => {
    let googleID = 'test-google-id-2';
    let email = 'test2@google.com';
    let retrievedUser =  await User.findOneOrCreate(googleID, email);
    expect(retrievedUser.email).to.equal(email);
  });

  it('User.getOrCreate throws error, if fetching user failed', async () => {
    let findOneFake = sinon.stub().throws();
    sinon.replace(User, 'findOne', findOneFake);
    let UserMock = sinon.mock(User);
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
    let createFake = sinon.stub().throws();
    sinon.replace(User, 'create', createFake);
    let UserMock = sinon.mock(User);
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