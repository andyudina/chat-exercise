"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const authorizeAccessToChat = require('../../middleware/authorize').authorizeAccessToChat,
  User = require('../../api/models/user');

describe('Authorize access to chat', () => {

  const stubHasAccessToChat = (flag) => {
    // Helper to replace hasAccessToChat method with stub
    const hasAccessToChatStub = sinon.stub().returns(Promise.resolve(flag));
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);
  };

  it('Middleware passes request to next step if user is authorized', async () => {
    stubHasAccessToChat(true);

    const req = {
      user: {},
      params: {}
    };

    const nextSpy = sinon.spy();

    await authorizeAccessToChat(req, null, nextSpy);
    expect(nextSpy.calledOnce).to.be.true;
  });

  it('401 error returned if user is not authorized', async () => {
    stubHasAccessToChat(false);

    const req = {
      user: {},
      params: {}
    };

   const res = {
      status() {return res;},
      json() {}
    };

    const statusStub = sinon.stub().returns(res);
    sinon.replace(res, 'status', statusStub);

    await authorizeAccessToChat(req, res, null);
    expect(statusStub.withArgs(401).calledOnce).to.be.true;
  });

  it('Error if user is passed to error hadler', async () => {
    const error = new Error();
    const hasAccessToChatStub = sinon.stub().throws(error);
    sinon.replace(User, 'hasAccessToChat', hasAccessToChatStub);

    const nextSpy = sinon.spy();

    const req = {
      user: {},
      params: {}
    };

    await authorizeAccessToChat(req, null, nextSpy);
    expect(nextSpy.withArgs(error).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});