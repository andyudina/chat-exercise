// All REST API routes
"use strict";

const express = require('express');

const testRoutes = require('./test');

const apiRoutes = express.Router();
apiRoutes.use('/test', testRoutes);

module.exports = apiRoutes;