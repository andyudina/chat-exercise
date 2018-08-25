// All REST API routes
"use strict";

const express = require('express');

const userRoutes = require('./user');

const apiRoutes = express.Router();
apiRoutes.use('/users', userRoutes);

module.exports = apiRoutes;