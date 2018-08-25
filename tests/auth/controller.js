"use strict";

const sinon = require('sinon');

const AuthController = require('../../auth/controller');

describe('Authentication controller', () => {
  it('Display user email on successfull authentication', () => {
    let testEmail = 'test@gmail.com';
    let req = {
      user: {
        email: testEmail
      }
    };
    let resp = {
      status: () => {return resp},
      json: () => {}
    };
    let respMock = sinon.mock(resp);
    respMock.expects('json').once().withArgs({'email': testEmail});
    AuthController.processSuccessfulAuth(req, resp);
    respMock.verify();
  });
});