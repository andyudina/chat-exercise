"use strict";

const mongoose = require('mongoose');

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
});

UserSchema.methods = {
  async addChat(chatId) {
    // Add chatId to chats if not exist
    const chatIdAsObjectId = mongoose.mongo.ObjectId(chatId);
    const update = {
      $addToSet: { chats: chatIdAsObjectId }
    };
    try {
      // TODO what if user don't have chats array?
      // update will silently fail
      await User.findByIdAndUpdate(this._id, update).exec();
    } catch (error) {
      // Log error and re-throw
      console.log(error);
      throw error;
    }
  }
}

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
  }

};

const User = mongoose.model('User', UserSchema);
module.exports = User;