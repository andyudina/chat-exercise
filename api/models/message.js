"use strict";

const mongoose = require('mongoose');

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
    default : Date.now
  },
  text: {
    type: String,
    required: true
  }
});