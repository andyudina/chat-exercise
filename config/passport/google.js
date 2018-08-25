// Passport configuration
"use strict";

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const config = require('../');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL,
    },
    (token, refreshToken, profile, done) => {
      // Create new user here
      return done(null, {
        profile: profile,
        token: token
      });
    })
  );
};