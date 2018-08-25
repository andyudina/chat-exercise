// Configure express server
"use strict";

const bodyParser = require('body-parser'),
  logger = require('morgan');

module.exports = (app, passport) => {
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json());

  app.use(logger('dev'));

  app.use(passport.initialize());
};