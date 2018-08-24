"use strict";

const getTestApi = (req, res, next) => {
  return res.status(200).json({ 'test': 'passed' });
};

module.exports = {
  getTestApi
};