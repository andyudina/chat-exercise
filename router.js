"use strict";

const express = require('express');

// Import routes
const apiRoutes = require('./api/routes'),
  authRoutes = require('./auth/routes');

const router = (app)  => {
  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes);
  // Serve static files for al unknown urls - and let react app figureth rest
  app.use('*', express.static(__dirname + '/client/build'));
};

module.exports = router;