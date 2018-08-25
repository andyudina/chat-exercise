"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const apiRequiresAuthentication = require('../../middleware/authenticate').apiRequiresAuthentication;

describe('Ensure user authentication', () => {

  it('Middleware passes request to next step if user is authenticated', () => {
    let nextSpy = sinon.spy();
    let req = {
      isAuthenticated() {return true}
    };
    apiRequiresAuthentication(req, null, nextSpy);
    expect(nextSpy.calledOnce).to.be.true;
  });

  it('401 error returned if user is not authenticated', async () => {
    let req = {
      isAuthenticated() {return false}
    };
    let res = {
      status() {}
    };
    let statusSpy = sinon.spy();
    sinon.replace(res, 'status', statusSpy);
    apiRequiresAuthentication(req, res, null);
    expect(statusSpy.withArgs(401).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});