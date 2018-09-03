"use strict";

const expect = require('chai').expect,
  sinon = require('sinon');

const socketEvents = require('../../socket/api');

describe('Join chat', () => {

  it('Leave previous chat', () => {
    const newChat = 'new-chat';
    const socket = {
      chat: 'old-chat',
      join() {},
      leave() {}
    };
    const leaveSpy = sinon.spy();
    sinon.replace(socket, 'leave', leaveSpy);
    socketEvents.joinChat(socket, newChat);
    expect(leaveSpy.withArgs('old-chat').calledOnce).to.be.true;
  });

  it('Save current chat', () => {
    const newChat = 'new-chat';
    const socket = {
      join() {},
      leave() {}
    };
    socketEvents.joinChat(socket, newChat);
    expect(socket.chat).to.be.equal(newChat);
  });

  it('Join chat', () => {
    const newChat = 'new-chat';
    const socket = {
      join() {},
      leave() {}
    };
    const joinSpy = sinon.spy();
    sinon.replace(socket, 'join', joinSpy);
    socketEvents.joinChat(socket, newChat);
    expect(joinSpy.withArgs(newChat).calledOnce).to.be.true;
  });

  afterEach(() => {
    sinon.restore();
  });
});