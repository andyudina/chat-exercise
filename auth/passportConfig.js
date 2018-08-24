// Passport configuration
"use strict";

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const config = require('../config');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
      clientID: config.clientId,
      clientSecret: config.clientSecret,
      callbackURL: `${config.scheme}://${config.host}:${config.port}/auth/google/callback/`
    },
    (token, refreshToken, profile, done) => {
      return done(null, {
        profile: profile,
        token: token
      });
    })
  );
};