// All REST API routes
"use strict";

const express = require('express');

const userRoutes = require('./user');
const chatRoutes = require('./chat');

const apiRoutes = express.Router();
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/chats', chatRoutes);

module.exports = apiRoutes;