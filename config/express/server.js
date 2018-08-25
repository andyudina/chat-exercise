// Configure express server
"use strict";

const bodyParser = require('body-parser'),
  logger = require('morgan'),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  cookieSession = require('cookie-session');

const mongoStore = require('connect-mongo')(session);

const config = require('../');

module.exports = (app, passport) => {
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(bodyParser.json());

  // CookieParser should be above session
  app.use(cookieParser());
  app.use(cookieSession({ secret: config.sessions.secret }));
  app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: config.sessions.secret,
    store: new mongoStore({
      url: config.db,
      collection : 'sessions'
    })
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  app.use(logger('dev'));
};