const sinon = require('sinon');

const AuthController = require('../../auth/controller');

describe('Authentication controller', function() {
  it('Display user email on successfull authentication', function() {
    let testEmail = 'test@gmail.com';
    let req = {
      user: {
        profile: {
          emails: [{
            value: testEmail
          }]
        }
      }
    };
    let resp = {
      status: () => {return resp},
      json: () => {}
    };
    let jsonMock = sinon.mock(resp);
    jsonMock.expects('json').once().withArgs({'email': testEmail});
    AuthController.processSuccessfulAuth(req, resp);
    jsonMock.verify();
  });
});