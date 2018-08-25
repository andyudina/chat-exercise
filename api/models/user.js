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
    required: false
  },
  createdAt: { 
    type: Date,
    default : Date.now 
  },
});

UserSchema.statics = {
  async findOneOrCreate(googleID, email) {
    // Attempt to retrieve user by id, provided by google
    // Create if not exist
    // Use email only when create new user
    // TODO: what if email changed for same googlID?
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


let User = mongoose.model('User', UserSchema);
module.exports = User;