"use strict";

const mongoose = require('mongoose');

const utils = require('../utils');

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
    // Return updated chat
    const userIdAsObjectId = mongoose.mongo.ObjectId(userId);
    const update = {
      $addToSet: { users: userIdAsObjectId }
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
  async populateUserDetails(chats) {
    // Replace chat user ids with detailed information -
    // id and nickname
    // TODO user and chat models are too coupled - refactor
    const User = mongoose.model('User');
    // Get all users from all chats
    let chatParticipants = chats.map(chat => chat.users);
    // Flatten user array
    chatParticipants = [].concat.apply([], chatParticipants);
    // Filter duplicates
    chatParticipants = [...new Set(chatParticipants)];
    // Load chat participants details
    let users = await User
      .find({_id: { $in: chatParticipants }})
      .select({_id: 1, nickname: 1})
      .exec();
    // Convert ids to string
    users = utils.convertIdToString(users);
    // Convert users array to map
    const usersMap = new Map(users.map(user => [user._id, user]));
    // Enrich chat users with user details
    return utils.replaceDataInInnerArray(chats, 'users', usersMap);
  },

  async populateOneChatWithUserDetails(chat) {
    // Replace chat user ids with detailed information -
    // Wrapper for populateUserDetails, that simplifies usage with one chat
    const updatedChats = await this.populateUserDetails([chat]);
    return updatedChats[0];
  }
};


const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;