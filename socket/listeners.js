"use strict";

const socketEvents = require('./events');

module.exports = (io) => {

  // Set up socket.io listeners
  io.on('connection', (socket) => {
    // Join chat
    socket.on('join chat', (chat) => socketEvents.joinChat(socket, chat));

    // Leave chat
    socket.on('leave chat', (chat) => socketEvents.leaveChat(socket, chat));

    // Send message
    socket.on(
      'new message',
      (chat) => socketEvents.newMessage(io, chat)
    );
  });
};