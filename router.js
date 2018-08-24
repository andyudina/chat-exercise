"use strict";

// Import routes
const apiRoutes = require('./api/routes'),
  authRoutes = require('./auth/routes');

const router = (app)  => {
  app.use('/api', apiRoutes);
  app.use('/auth', authRoutes);
};

module.exports = router;