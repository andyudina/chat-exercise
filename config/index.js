"use strict";

const constants = require('./const');
const env = require('./env');

module.exports = Object.assign(
  {},
  constants,
  env
);
