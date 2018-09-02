"use strict";

const express = require('express');

// Import routes
const apiRoutes = require('./api/routes'),
  authRoutes = require('./auth/routes');

const router = (app)  => {
  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes);
  // Serve static files for client urls
  // TODO - refactor, server should not know anything about client urls
  // However serving static files for all unknown urls interfere with sockrt.io
  app.use('/chat/:id', express.static(__dirname + '/client/build'));
};

module.exports = router;