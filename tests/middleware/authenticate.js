"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const authenticate = require('../../middleware/authenticate');

describe('Ensure user authentication', () => {

  it('Middleware passes request to next step if user is authenticated', () => {
    const nextSpy = sinon.spy();
    const req = {
      isAuthenticated() {return true}
    };
    authenticate(req, null, nextSpy);
    expect(nextSpy.calledOnce).to.be.true;
  });

  it('401 error returned if user is not authenticated', async () => {
    const req = {
      isAuthenticated() {return false}
    };
    const res = {
      status() {},
      end() {}
    };
    const statusSpy = sinon.spy();
    sinon.replace(res, 'status', statusSpy);
    authenticate(req, res, null);
    expect(statusSpy.withArgs(403).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});