/* eslint-disable no-unused-vars */
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Message = require('../models/messageModel');
const User = require('../models/userModel');

// Inbox Route
router.get('/inbox', isLoggedIn, async (req, res) => {
  const messages = await Message.getByUserId(req.session.user.id);

  res.render('messages/inbox', {
    title: 'Your Inbox',
    messages,
  });
});

// Send Message Route
router.get('/send', isLoggedIn, (req, res) => {
  res.render('messages/send', {
    title: 'Send Anonymous Message',
  });
});

//outbox Route
router.get('/outbox', isLoggedIn, async (req, res) => {
  const ObjectId = require('mongodb').ObjectId;
  const senderId = new ObjectId(req.session.user.id); // ← convert string to ObjectId

  const sentMessages = await Message.getBySenderId(senderId);

  // Load receiver usernames
  for (let msg of sentMessages) {
    const receiver = await User.findById(msg.toUserId);
    msg.receiverUsername = receiver ? receiver.username : 'Deleted User';
  }

  res.render('messages/outbox', {
    title: 'Your Sent Messages',
    messages: sentMessages,
  });
});

//profile route
router.get('/user/profile', isLoggedIn, (req, res) => {
  res.render('user/profile', {
    title: 'My Profile',
    user: req.session.user,
  });
});

// Reply to a message from inbox
router.post('/reply', isLoggedIn, async (req, res) => {
  const { toUserId, text } = req.body;

  if (!text || text.trim().length === 0) {
    req.flash('error', 'Reply cannot be empty.');
    return res.redirect('/messages/inbox');
  }

  try {
    await Message.create({
      toUserId: toUserId,
      fromUserId: req.session.user.id,
      text: text.trim(),
      replyTo: null, // You can add replyTo later when we do threading
    });

    req.flash('success', 'Reply sent anonymously!');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to send reply.');
  }

  res.redirect('/messages/inbox');
});

// View single message thread
router.get('/thread/:messageId', isLoggedIn, async (req, res) => {
  const messageId = req.params.messageId;
  const ObjectId = require('mongodb').ObjectId;

  const originalMessage = await Message.findById(messageId);

  if (
    !originalMessage ||
    originalMessage.toUserId.toString() !== req.session.user.id
  ) {
    req.flash('error', 'Message not found or access denied.');
    return res.redirect('/messages/inbox');
  }

  // Get all replies to this message (and replies to replies — full thread)
  const replies = await Message.getReplies(messageId);

  // Load sender usernames for original and replies
  const sender = await User.findById(originalMessage.fromUserId);
  originalMessage.senderUsername = sender ? sender.username : 'Anonymous';

  for (let reply of replies) {
    const replySender = await User.findById(reply.fromUserId);
    reply.senderUsername = replySender ? replySender.username : 'Anonymous';
  }

  res.render('messages/thread', {
    title: 'Message Thread',
    originalMessage,
    replies,
  });
});

module.exports = router;
