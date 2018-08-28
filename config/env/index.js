"use strict";

const development = require('./development'),
  production = require('./production'),
  test = require('./test');

module.exports = {
  development: development,
  test: test,
  production: production
}[process.env.NODE_ENV || 'development'];
