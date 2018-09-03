"use strict";

const socketApi = require('./api');

module.exports = (io) => {

  // Set up socket.io listeners
  io.on('connection', (socket) => {
    // Join chat
    socket.on('join chat', (chat) => socketApi.joinChat(socket, chat));

    // Leave chat
    socket.on('leave chat', (chat) => socketApi.leaveChat(socket, chat));

    // Send message
    socket.on(
      'new message',
      (chat) => socketApi.newMessage(io, chat)
    );
  });
};