"use strict";

const socketEventListeners = require('./listeners');

module.exports = (server) => {
  // Configure  socket.io connection
  const io = require('socket.io').listen(server);
  socketEventListeners(io);
};