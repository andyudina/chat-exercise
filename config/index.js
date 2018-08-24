"use strict";

const baseConfig = require('./base');
const secretConfig = require('./secret');

module.exports = Object.assign(
  {},
  baseConfig,
  secretConfig
);
