"use strict";

module.exports = {
  db: process.env.MONGODB_URL,
  google: {
    clientID: process.env.GOOGLE_CLIENTID,
    clientSecret: process.env.GOOGLE_SECRET,
    // TODO: change domain after deployed
    callbackURL: 'http://localhost:3000/auth/google/callback/'
  },
  sessions: {
    secret: process.env.SESSION_SECRET
  }
};