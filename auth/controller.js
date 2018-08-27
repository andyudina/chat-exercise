// Authenticate user with google oauth
"use strict";

const processSuccessfulAuth = (req, res) => {
  return res.redirect('/api/users/self/');
};

module.exports = {
  processSuccessfulAuth
};