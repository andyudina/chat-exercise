// Authenticate user with google oauth
"use strict";

const processSuccessfulAuth = (req, res) => {
  let email = req.user.profile.emails[0].value;
  return res.status(200).json({ 'email': email });
};

module.exports = {
  processSuccessfulAuth
};