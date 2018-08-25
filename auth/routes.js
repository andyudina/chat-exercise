// Authorisation routes with google oauth
"use strict";

const express = require('express'),
  passport = require('passport');

const config = require('../config'),
  AuthController = require('./controller');

const authRouter = express.Router();

// Initiate authorisation through google
const googleOauthMiddleware = passport.authenticate('google', {
  scope: config.googleOauthScopes
});
authRouter.route('/google')
  .get(googleOauthMiddleware);

// Callback, where google redirect user after authorisation
// TODO: redirect to url showing error message
authRouter.route('/google/callback')
  .get(passport.authenticate('google', { failureRedirect: '/' }),
    AuthController.processSuccessfulAuth);

module.exports = authRouter;