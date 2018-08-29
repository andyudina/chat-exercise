"use strict";

const mongoose = require('mongoose');

const utils = require('../../utils');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  name: {
    type: String,
    required: false,
    text: true,
    unique: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default : Date.now
  },
  // TODO how to enforce on database level
  // that private chat with same user is unique
  users: {
    type: [
      {
        type: Schema.ObjectId,
        ref: 'User'
      },
    ],
    default: []
  }
});

ChatSchema.methods = {
  async addUser(userId) {
    // Add userId to users if not exist
    // Return updated chat
    const update = {
      $addToSet: { users: userId }
    };
    try {
      // TODO what if chat don't have users array?
      // update will silently fail
      return await Chat.findByIdAndUpdate(
        this._id, update, {new: true}
      ).exec();
    } catch (error) {
      // Log error and re-throw
      console.log(error);
      throw error;
    }
  }
};

ChatSchema.statics = {
  async findByIdWithUsers(chatId) {
    // Find chat by id
    // Populate users details
    const User = mongoose.model('User');
    const chat = await this
      .findById(chatId)
      .populate({ path: 'users', select: User.FIELDS_SHORT });
    if (!(chat)) {
      throw new Error(`User with id ${chatId} does not exist`);
    }
    return chat;
  }
};


const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;