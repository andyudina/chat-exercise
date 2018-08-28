"use strict";

const expect = require('chai').expect,
  expressValidator = require('express-validator/check'),
  sinon = require('sinon');

const validateRequest = require('../../middleware/validate').validateRequest;

describe('Validate request format', () => {

  it('Middleware passes request to next step if request is valid', () => {
    const nextSpy = sinon.spy();

    const errors = {
      isEmpty() {return true;}
    };

    const validationResultStub = sinon.stub().returns(errors);
    sinon.replace(expressValidator, 'validationResult', validationResultStub);

    validateRequest(null, null, nextSpy);
    expect(nextSpy.calledOnce).to.be.true;
  });

  it('400 error returned if request is not valid', async () => {
    const res = {
      status() {return res;},
      json() {}
    };

    const errors = {
      array() {},
      isEmpty() {return false;}
    };

    const validationResultStub = sinon.stub().returns(errors);
    sinon.replace(expressValidator, 'validationResult', validationResultStub);

    const statusStub = sinon.stub().returns(res);
    sinon.replace(res, 'status', statusStub);

    validateRequest(null, res, null);
    expect(statusStub.withArgs(400).calledOnce).to.be.true;
  });

  it('Errors returned if request is not valid', async () => {
    const res = {
      status() {return res;},
      json() {}
    };

    const errorArray = [];
    const errors = {
      array() {return errorArray;},
      isEmpty() {return false;}
    };

    const validationResultStub = sinon.stub().returns(errors);
    sinon.replace(expressValidator, 'validationResult', validationResultStub);

    const jsonSpy = sinon.spy();
    sinon.replace(res, 'json', jsonSpy);

    validateRequest(null, res, null);
    expect(jsonSpy.withArgs({errors: errorArray}).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});