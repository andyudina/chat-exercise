// Stores knowledge about MongoDB and custom model errors
"use strict";

const MONGODB_DUPLICATE_KEY_ERROR = 11000;

module.exports.isDuplicateKeyError = (errorCode) => {
  return errorCode === MONGODB_DUPLICATE_KEY_ERROR;
}