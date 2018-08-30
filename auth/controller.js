// Authenticate user with google oauth
"use strict";

const processSuccessfulAuth = (req, res) => {
  return res.redirect('/');
};

module.exports = {
  processSuccessfulAuth
};