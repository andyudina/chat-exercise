"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// Import models to register them with mongoose
const Chat = require('../../../../api/models/chat'),
  User = require('../../../../api/models/user'),
  Message = require('../../../../api/models/message'),
  utils = require('../../../../utils'),
  testUtils = require('../../../_utils');

describe('listMessagesPaginated static api for Message model', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.createMessages.bind(this));

  it('Messages returned correctly', async () => {
    const messages = await Message.listMessagesPaginated(this.chat.id, 2);
    // Get texts from messages
    const texts = messages.map(message => message.text);
    // Verify that messages returned in correct order
    const expectedTexts = [
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
      '3',
      '2',
      '1',
      '0',
    ];
    expect(texts).to.deep.equal(expectedTexts);
  });

  it('First page of messages returned if no page provided', async () => {
    const messages = await Message.listMessagesPaginated(this.chat.id);
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

  it('Messages populated with extra data correctly', async () => {
    const messages = await Message.listMessagesPaginated(this.chat.id);
    // Get authors and ids from messages
    const results = messages.map(
      message => ({
        author: message.author,
        _id: message._id
      })
    );
    // Verify that messages returned with extra data
    const expectedResults = this.messages.reverse().slice(0, 10).map(
      message => ({
        author: {
          _id: message.author._id.toString(),
          nickname: message.author.nickname
        },
        _id: message.id
      })
    );
    expect(utils.toJSON(results)).to.deep.equal(expectedResults);
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