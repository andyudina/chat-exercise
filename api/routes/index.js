// All REST API routes
"use strict";

const express = require('express');

const authenticate = require('../../middleware/authenticate');

const userRoutes = require('./user'),
  chatRoutes = require('./chat');

const apiRoutes = express.Router();
apiRoutes.use(authenticate);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/chats', chatRoutes);

module.exports = apiRoutes;