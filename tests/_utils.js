"use strict";

const mongoose = require('mongoose');

const config = require('../config');

const setUpDbBeforeTest = (done) => {
  // Connect to mongoDB
  mongoose.connect(config.db, { useNewUrlParser: true });
  const connection = mongoose.connection;
  connection.on('error', console.log);
  connection.once('open', done);
}

const dropDbAfterTest = (done) => {
  // Drop test database and disconect from mongoDB
  const connection = mongoose.connection;
  connection.db.dropDatabase(
    () => {mongoose.connection.close(done);}
  );
}

module.exports = {
  setUpDbBeforeTest,
  dropDbAfterTest
}