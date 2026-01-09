/* eslint-disable no-unused-vars */
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { ObjectId } = require('mongodb');
const { getDb } = require('../data/database');

const getInbox = async (req, res) => {
  const messages = await Message.getByUserId(req.session.user.id);
  const standaloneMessages = messages.filter((msg) => !msg.replyTo);

  // Sort newest first
  standaloneMessages.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Force sender to be "Anonymous"
  standaloneMessages.forEach((msg) => {
    msg.senderUsername = 'Anonymous';
  });

  const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;

  res.render('messages/inbox', {
    title: 'Your Inbox',
    messages: standaloneMessages,
    publicLink,
    page: 'inbox',
  });
};

const getOutbox = async (req, res) => {
  const senderId = req.session.user.id;
  const sentMessages = await Message.getBySenderId(senderId);
  const standaloneMessages = sentMessages.filter((msg) => !msg.replyTo);
  standaloneMessages.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Load receiver usernames
  for (let msg of standaloneMessages) {
    const receiver = await User.findById(msg.toUserId);
    msg.receiverUsername = receiver ? receiver.username : 'Deleted User';
  }

  const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;
  res.render('messages/outbox', {
    title: 'Your Sent Messages',
    messages: standaloneMessages,
    publicLink,
    page: 'outbox',
  });
};

const getSend = async (req, res) => {
  const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;
  const sentMessages = await Message.getBySenderId(req.session.user.id);

  // Collect unique receiver IDs
  const receiverIds = new Set();
  sentMessages.forEach((msg) => {
    if (msg.toUserId && msg.toUserId.toString() !== req.session.user.id) {
      receiverIds.add(msg.toUserId.toString());
    }
  });

  // Fetch users
  const contacts = [];
  for (const id of receiverIds) {
    const user = await User.findById(id);
    if (user) contacts.push(user);
  }

  res.render('messages/send', {
    title: 'Send Anonymous Message',
    publicLink,
    contacts,
  });
};

const getThread = async (req, res) => {
  const messageId = req.params.messageId;
  const backTo = req.query.back === 'outbox' ? 'outbox' : 'inbox';
  const ObjectId = require('mongodb').ObjectId;

  try {
    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      req.flash('error', 'Message not found.');
      return res.redirect('/messages/inbox');
    }

    const userId = req.session.user.id;
    const isSender =
      originalMessage.fromUserId &&
      originalMessage.fromUserId.toString() === userId;
    const isReceiver = originalMessage.toUserId.toString() === userId;

    if (!isSender && !isReceiver) {
      req.flash('error', 'Access denied.');
      return res.redirect('/messages/inbox');
    }

    const replies = await Message.getReplies(messageId);
    // Load sender usernames
    const sender = originalMessage.fromUserId
      ? await User.findById(originalMessage.fromUserId)
      : null;
    originalMessage.senderUsername = isReceiver
      ? 'Anonymous'
      : sender
        ? sender.username
        : 'Anonymous';

    for (let reply of replies) {
      const replySender = reply.fromUserId
        ? await User.findById(reply.fromUserId)
        : null;
      reply.senderUsername = isReceiver
        ? 'Anonymous'
        : replySender
          ? replySender.username
          : 'Anonymous';
    }

    // Set header name
    let headerName;
    if (isReceiver) {
      headerName = 'Anonymous';
    } else {
      const receiver = await User.findById(originalMessage.toUserId);
      headerName = receiver ? receiver.username : 'Deleted User';
    }

    const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;

    res.render('messages/thread', {
      title: 'Message Thread',
      originalMessage,
      replies,
      headerName,
      publicLink,
      backTo,
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Thread not found.');
    res.redirect('/messages/inbox');
  }
};

const getProfile = (req, res) => {
  const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;
  res.render('user/profile', {
    title: 'My Profile',
    user: req.session.user,
    publicLink: publicLink,
  });
};

const reply = async (req, res) => {
  const { toUserId, text, replyTo, backTo } = req.body;

  if (!text || text.trim().length === 0) {
    req.flash('error', 'Reply cannot be empty.');
    return res.redirect('/messages/inbox');
  }

  try {
    await Message.create({
      toUserId,
      fromUserId: req.session.user.id,
      text: text.trim(),
      replyTo: replyTo || null,
    });

    req.flash('success', 'Reply sent anonymously!');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to send reply.');
  }

  // Redirect back to the same thread
  res.redirect(`/messages/thread/${replyTo}?back=${backTo || 'inbox'}`);
};

module.exports = {
  getInbox,
  getOutbox,
  getSend,
  getThread,
  getProfile,
  reply,
};
