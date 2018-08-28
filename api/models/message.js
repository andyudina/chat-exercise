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
    page = page || 1;
    const query = this
      .listMessagesWithAuthor(chatId)
      .skip(config.messagePageSize * (page - 1))
      .limit(config.messagePageSize);
    return await query.exec();
  },

  async listNewMessages(chatId, lastDate) {
    // List new chat messages
    // created after or at lastDate
    // TODO: can two writes occur at exact time?
    // if yes, using $gt can lead to missed messages
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
      .populate({ path: 'author', select: 'nickname _id' })
      .select({_id: 1, author: 1, createdAt: 1, text: 1});
  },

};

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;