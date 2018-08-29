"use strict";

const HttpStatus = require('http-status-codes');

module.exports = (req, res, next) => {
  // Check if request is authenticated
  // Return 401 unauthorised error, if user is not authenticated
  if (req.isAuthenticated()) return next();
  res.status(HttpStatus.FORBIDDEN);
  res.end();
};