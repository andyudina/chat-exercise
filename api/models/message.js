"use strict";

const mongoose = require('mongoose');

const config = require('../../config'),
  utils = require('../utils');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  author: {
    type: Schema.ObjectId,
    ref: 'User',
    required: true
  },
  chat: {
    type: Schema.ObjectId,
    ref: 'Chat',
    required: true
  },
  createdAt: {
    type: Date,
    default : Date.now,
    index: true
  },
  text: {
    type: String,
    required: true
  }
});

MessageSchema.statics = {
  async listMessagesWithAuthor(chatId, page) {
    // List paginated chat messages
    // Populate author details
    const User = mongoose.model('User');
    let messages = await this.listMessages(chatId, page);
    // Convert messages _id to string
    messages = utils.convertIdToString(messages);
    // Convert authorId to string
    messages = utils.convertIdToString(messages, 'author');
    const authorIds = [...new Set(messages.map(message => message.author))];
    const usersMap = await User.getUsersMap(authorIds);
    return utils
      .replaceDataInDocumentArray(messages, 'author', usersMap);
  },

  async listMessages(chatId, page) {
    // List paginated chat messages
    page = page || 1;
    return await this
      .find(
        { chat: mongoose.mongo.ObjectId(chatId) })
      .sort({ createdAt: -1 })
      .select({_id: 1, author: 1, createdAt: 1, text: 1})
      .skip(config.messagePageSize * (page - 1))
      .limit(config.messagePageSize)
      .exec();
  }
};

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;