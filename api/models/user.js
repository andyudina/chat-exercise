"use strict";

const mongoose = require('mongoose');

const utils = require('../../utils');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  googleID: {
    type: String,
    unique: true,
    required: true
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: true
  },
  nickname: {
    type: String,
    required: false,
    text: true
  },
  createdAt: {
    type: Date,
    default: Date.now 
  },
  chats: {
    type: [
      {
        type: Schema.ObjectId,
        ref: 'Chat'
      },
    ],
    default: []
  }
},
{
  toObject: {
    virtuals: false
  },
  toJSON: {
    virtuals: false
  }
});

UserSchema.methods = {
  async addChat(chatId) {
    // Add chatId to chats if not exist
    // Return updated user
    const update = {
      $addToSet: { chats: chatId }
    };
    try {
      // TODO what if user don't have chats array?
      // update will silently fail
      return await User.findByIdAndUpdate(
        this._id, update,
        {new: true}
      ).exec();
    } catch (error) {
      // Log error and re-throw
      console.log(error);
      throw error;
    }
  },

  async joinChat(chat) {
    // Add chatId to chats of current user
    // and userId to users of this chat
    // TODO: transaction needed here
    await this.addChat(chat._id);
    const updatedChat = await chat.addUser(this._id);
    // TODO does it make sense to return updated chat here?
    return updatedChat;
  }
};

UserSchema.statics = {
  async findOneOrCreate(googleID, email) {
    // Attempt to retrieve user by id, provided by google
    // Create if not exist
    // Use email only when create new user
    // TODO: what if email changed for same googleID?
    let user;
    try {
      user = await this.findOne({googleID: googleID}).exec();
    } catch (error) {
      // If something had happened in MongoDB
      // better fail fast
      console.log(error);
      throw error;
    }
    if (user) {
      return user;
    }
    try {
      user = await this.create({
        googleID: googleID,
        email: email
      });
    } catch (error) {
      // No reason to move forward
      // if we can not create user
      console.log(error);
      throw error;
    }
    return user;
  },

  async addUserToChatById(userId, chat) {
    // Helper to add user to chat, using userId
    // Throws error if user does not exist
    try {
      const user = await this.findById(userId);
      if (!(user)) {
        throw new Error(`User with id ${userId} does not exist`);
      }
      return await user.joinChat(chat);
    } catch (error) {
      // Log and re-throw error
      console.log(error);
      throw error;
    }
  },

  async joinChatForMultipleUsers(users, chat) {
    // Helper to add all users to chat one by one
    return await users.reduce(
      async (chatPromise, user) => {
        const chat = await chatPromise;
        return await user.joinChat(chat);
      },
      Promise.resolve(chat)
    );
  },

  async hasAccessToChat(userId, chatId) {
    // Verify that user is in chat users
    const userCount = await this.count(
      {
        _id: userId,
        chats: chatId
      }
    );
    return userCount > 0;
  },
};

/*

Constants

*/

// Fields that are used with populate
UserSchema.statics.FIELDS_SHORT = 'nickname _id';

const User = mongoose.model('User', UserSchema);
module.exports = User;