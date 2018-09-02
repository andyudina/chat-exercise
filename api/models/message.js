"use strict";

const mongoose = require('mongoose');

const config = require('../../config'),
  utils = require('../../utils');

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
  async listMessagesPaginated(chatId, page) {
    // List paginated chat messages
    // Returns object with messages and flag that shows
    // if next page exists
    page = page || 1;
    const query = this
      .listMessagesWithAuthor(chatId)
      .skip(config.messagePageSize * (page - 1))
      .limit(config.messagePageSize + 1);
    const messages = await query.exec();
    return {
      messages: messages.slice(0, config.messagePageSize),
      hasNextPage: messages.length === config.messagePageSize + 1
    };
  },

  async listNewMessages(chatId, lastDate) {
    // List new chat messages
    // created after or at lastDate
    // Two messages can have at exact createdAt time, so $gte
    // is used to avoid loosing messages
    return await this
      .listMessagesWithAuthor(chatId, { createdAt: { $gte: lastDate }})
      .limit(config.messagePageSize) // Send only first page of messages
      .exec();
  },

  listMessagesWithAuthor(chatId, ...conditions) {
    // Helper. Creates promise that will return
    // filtered messages with populated author
    // after resolve
    // TODO cover with tests
    const User = mongoose.model('User');
    return this
      .find(
        { 
          $and: [
            { chat: mongoose.mongo.ObjectId(chatId) },
            ...(conditions || [])
          ]
        }
      )
      .sort({ createdAt: -1 })
      .populate({ path: 'author', select: User.FIELDS_SHORT })
      .select({_id: 1, author: 1, createdAt: 1, text: 1});
  },

};

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;