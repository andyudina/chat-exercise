"use strict";

const HttpStatus = require('http-status-codes'),
  expressValidator = require('express-validator/check');

module.exports.validateRequest = (req, res, next) => {
  // Check if there is validation errors
  // Return errors if found
  // Proceed with request otherwise
  const errors = expressValidator.validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ errors: errors.array() });
  }
  return next();
};