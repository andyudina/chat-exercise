"use strict";

const getTestApi = (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports = {
  getTestApi
};