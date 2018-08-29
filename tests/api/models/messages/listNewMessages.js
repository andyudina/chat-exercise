"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  User = require('../../../../api/models/user'),
  Message = require('../../../../api/models/message'),
  utils = require('../../../../utils'),
  testUtils = require('../../../_utils');

describe('listNewMessages static api for Message model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createMessages.bind(this));

  it('Messages returned correctly', async () => {
    // Expect to return all messages which were created
    // after 15th was created, i.e. messages with texts
    // 15, 16 etc.
    const messages = await Message.listNewMessages(
      this.chat.id,
      this.messages[15].createdAt
    );
    // Get texts from messages
    const texts = messages.map(message => message.text);
    // Verify that messages returned in correct order
    const expectedTexts = [
      '19',
      '18',
      '17',
      '16',
      '15',
    ];
    expect(texts).to.deep.equal(expectedTexts);
  });

  it('Only first page of messages was sent', async () => {
    // Expect to return latest 10 (pages size) messages which were created
    const messages = await Message.listNewMessages(
      this.chat.id,
      this.messages[0].createdAt
    );
    // Get texts from messages
    const texts = messages.map(message => message.text);
    // Verify that messages returned in correct order
    const expectedTexts = [
      '19',
      '18',
      '17',
      '16',
      '15',
      '14',
      '13',
      '12',
      '11',
      '10'
    ];
    expect(texts).to.deep.equal(expectedTexts);
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
    await Message.remove({}).exec();
    await User.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });

});