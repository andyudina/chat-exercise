"use strict";

const getTestApi = (req, res, next) => {
  res.status(200).json({ 'test': 'passed' });
};

module.exports = {
  getTestApi
};