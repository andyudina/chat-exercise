"use strict";

const expect = require('chai').expect;

const apiUtils = require('../../api/utils');

describe('Miscellaneous API Utils', () => {
  it('processErrors returns object with customer visible errors', () => {
    const error = {
      errors: {
        'field-1': {
          'message': 'message-1',
          'something': 'else'
        },
        'field-2': {
          'message': 'message-2',
          'something': 'else'
        }
      }
    };
    const processedError = apiUtils.processErrors(error);
    expect(processedError).to.deep.equal({
      'field-1': 'message-1',
      'field-2': 'message-2'
    });
  });
});