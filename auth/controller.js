// Authenticate user with google oauth
"use strict";

const processSuccessfulAuth = (req, res) => {
  return res.status(200).json({ 'email': req.user.email });
};

module.exports = {
  processSuccessfulAuth
};