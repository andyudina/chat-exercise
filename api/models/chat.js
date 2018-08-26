"use strict";

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ChatSchema = new Schema({
  name: {
    type: String,
    required: false,
    text: true
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  lastMessageAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default : Date.now
  },
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
    const userIdAsObjectId = mongoose.mongo.ObjectId(userId);
    const update = {
      $addToSet: { users: userIdAsObjectId }
    };
    try {
      // TODO what if chat don't have users array?
      // update will silently fail
      await Chat.findByIdAndUpdate(this._id, update).exec();
    } catch (error) {
      // Log error and re-throw
      console.log(error);
      throw error;
    }
  }
}

ChatSchema.statics = {
  async joinChat(chatId, userId) {
    // Add chatId to chats of user with userId chats
    // and userId to users of chat with chatId
    // Throw error if chat or user does not exist
    // TODO: transaction needed here
    const User = mongoose.model('User');
    // Try find chat and throw error if not exist
    let chat;
    try {
      chat = await this.findById(chatId).exec();
    } catch (error) {
      // Log and re-throw error
      console.log(error);
      throw error;
    }
    if (!(chat)) { 
      throw new Error('Chat with this id doesn\'t exist'); 
    }
    // Try find user and throw error if not exist
    let user;
    try {
      user = await User.findById(userId).exec();
    } catch (error) {
      // Log and re-throw error
      console.log(error);
      throw error;
    }
    if (!(user)) { 
      throw new Error('User with this id doesn\'t exist'); 
    }
    // Update user and chat
    await chat.addUser(userId);
    await user.addChat(chatId);
  }

};

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;