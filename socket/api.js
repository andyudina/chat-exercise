"use strict";

module.exports.joinChat = (socket, chat) => {
  if (socket.chat) {
    // User already joined chat
    // Leave previous chat first
    socket.leave(socket.chat);
  }
  socket.chat = chat;
  socket.join(chat);
};

module.exports.leaveChat = (socket, chat) => {
  socket.leave(chat);
};

module.exports.newMessage = (io, chat) => {
  // Announce that new message is created in chat
  // TODO rewrite to create message right from socket listeners
  // That will help to avoid extra requests
  io.sockets.in(chat).emit('refresh messages', chat);
};

