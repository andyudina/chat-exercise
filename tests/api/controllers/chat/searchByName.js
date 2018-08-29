"use strict";

const expect = require('chai').expect,
  mongoose = require('mongoose'),
  sinon = require('sinon');

const Chat = require('../../../../api/models/chat'),
  ChatController = require('../../../../api/controllers/chat'),
  User = require('../../../../api/models/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Search by name', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTests.bind(this));
  
  it('200 OK returned if request completed successfully', async () => {
    this.req.query.name = 'test';

    const statusStub = testUtils.stubStatus(this.res);

    await ChatController.searchByName(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Chats returned successfully', async () => {
    const name = 'test';
    this.req.query.name = name;

    const firstMatchChat = Chat({
      name: 'test',
    });
    await firstMatchChat.save();
    const secondMatchChat = Chat({
      name: 'test almost match',
    });
    await secondMatchChat.save();
    const noMatchChat = Chat({
      name: 'no match',
    });
    await noMatchChat.save();

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await ChatController.searchByName(this.req, this.res);
    const expectedResponse = {
      chats: [
        {
          _id: firstMatchChat.id,
          name: firstMatchChat.name
        },
        {
          _id: secondMatchChat.id,
          name: secondMatchChat.name
        },
      ]
    };
    expect(jsonSpy.withArgs(expectedResponse).calledOnce).to.be.true;
  });

  afterEach(async () => {
    sinon.restore();
    await Chat.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});
