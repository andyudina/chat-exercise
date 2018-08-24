"use strict";

const express = require('express');

// Import routes
const testRoutes = require('./api/routes/test');

const router = (app)  => {
  app.use('/', testRoutes);
};

module.exports = router;