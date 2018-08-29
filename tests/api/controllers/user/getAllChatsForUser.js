"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

// User import left here, so UserSchema is registered
// before controller is imported
const Chat = require('../../../../api/models/chat'),
  User = require('../../../../api/models/user'),
  UserController = require('../../../../api/controllers/user'),
  testUtils = require('../../../_utils'),
  utils = require('../../../../utils');

describe('Get all chats for current user', () => {
  before((done) => {
    testUtils.setUpDbBeforeTest(done);
  });

  beforeEach(testUtils.setUpControllerTestsWithUser.bind(this));
  
  it('200 OK returned if request completed successfully', async () => {
    const statusStub = testUtils.stubStatus(this.res);

    await UserController.getAllChatsForUser(this.req, this.res);
    expect(statusStub.withArgs(200).calledOnce).to.be.true;
  });

  it('Chats returned successfully', async () => {
    // Create another user
    const anotherUser = User({
      nickname: 'test-1',
      email: 'test-email-1@google.com',
      googleID: 'test-google-id-1'
    });
    await anotherUser.save();

    // Create chats
    const groupChat = Chat({
      name: 'group chat',
      isGroupChat: true,
      users: [
        this.user._id,
        anotherUser._id
      ]
    });
    await groupChat.save();

    const privateChat = Chat({
      isGroupChat: false,
      users: [
        this.user._id,
      ]
    })
    await privateChat.save();

    await User.findByIdAndUpdate(
      this.user._id,
      {
        $addToSet: {
          chats: {
            $each: [groupChat._id, privateChat._id]
          }
        }
      }).exec();

    const jsonSpy = testUtils.replaceJsonWithSpy(this.res);

    await UserController.getAllChatsForUser(this.req, this.res);

    const expectedResponse = {
      chats: [
        {
          _id: groupChat.id,
          name: groupChat.name,
          isGroupChat: true,
          users: [
            {
              _id: this.user.id,
              nickname: this.user.nickname
            },
            {
              _id: anotherUser.id,
              nickname: anotherUser.nickname
            }
          ]
        },
        {
          _id: privateChat.id,
          isGroupChat: false,
          users: [
            {
              _id: this.user.id,
              nickname: this.user.nickname
            },
          ]
        },
      ]
    };
    const receivedResponse = jsonSpy.getCall(0).args[0];
    expect(
      utils.toJSON(receivedResponse)
    ).to.be.deep.equal(expectedResponse);
  });

  afterEach(async () => {
    sinon.restore();
    await User.remove({}).exec();
    await Chat.remove({}).exec();
  });

  after((done) => {
    testUtils.cleanAndCloseDbAfterTest(done);
  });
});
