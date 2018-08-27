// Stores knowledge about MongoDB and custom model errors
"use strict";

const MONGODB_DUPLICATE_KEY_ERROR = 11000;

const isMongoError = (error) => {
  return error.name === 'MongoError';
};

module.exports.isDuplicateKeyError = (error) => {
  return (
    (isMongoError(error)) && 
    (error.code === MONGODB_DUPLICATE_KEY_ERROR));
};