"use strict";

const socketEvents = require('./events');

module.exports = (server) => {
  // Configure  socket.io connection
  const io = require('socket.io').listen(server);
  socketEvents(io);
};