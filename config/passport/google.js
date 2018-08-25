// Passport configuration
"use strict";

const mongoose = require('mongoose'),
  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const config = require('../');

const User = mongoose.model('User');

const googleStrategyCallback = async (token, refreshToken, profile, done) => {
  let email = profile.emails[0].value;
  let user;
  try {
    user = await User.findOneOrCreate(profile.id, email);
  } catch (error) {
    return done(error);
  }
  return done(null, user);
};

module.exports.configure = (passport) => {
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
    googleStrategyCallback
  ));
};

// For tests
module.exports.googleStrategyCallback = googleStrategyCallback;
