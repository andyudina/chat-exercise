"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const googleStrategyCallback = require('../../../config/passport/google').googleStrategyCallback,
  User = require('../../../api/models/user');

describe('Retrieve user using google credentials', () => {

  it('User model api is called with valid emai and google id', async () => {
    const findOneOrCreateStub = sinon.stub();
    sinon.replace(User, 'findOneOrCreate', findOneOrCreateStub);

    const email = 'test@gmail.com';
    const googleID = 'test-google-id';
    const profile = {
      emails: [{
        value: email
      }],
      id: googleID
    };

    const doneStub = sinon.stub();

    await googleStrategyCallback(null, null, profile, doneStub);
    expect(
      findOneOrCreateStub.withArgs(googleID, email).calledOnce).to.be.true;
  });

  it('If user retrieved successfully, it is passed to passport callback', async () => {
    const user = {};
    const findOneOrCreateFake = sinon.fake.returns(Promise.resolve(user));
    sinon.replace(User, 'findOneOrCreate', findOneOrCreateFake);

    const doneSpy = sinon.spy();

    const profile = {
      emails: [{
        value: 'test@google.com'
      }],
      id: 'googleID'
    };
    await googleStrategyCallback(null, null, profile, doneSpy);
    expect(
      doneSpy.withArgs(null, user).calledOnce).to.be.true;
  });

  it('If user retrieveal falied, error is passed to passport callback', async () => {
;
    const error = new Error;
    const findOneOrCreateFake = sinon.fake.throws(error);
    sinon.replace(User, 'findOneOrCreate', findOneOrCreateFake);

    const doneSpy = sinon.spy();

    const profile = {
      emails: [{
        value: 'test@google.com'
      }],
      id: 'googleID'
    };
    await googleStrategyCallback(null, null, profile, doneSpy);
    expect(
      doneSpy.withArgs(error).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});