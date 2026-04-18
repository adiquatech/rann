const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Message = require('../models/messageModel');

// Require login to send message
const requireLogin = (req, res, next) => {
  if (!req.session.loggedIn) {
    req.session.redirectTo = req.originalUrl; // Remember where they wanted to go
    req.flash('info', 'Please login or register to send a message.');
    return res.redirect('/auth/login');
  }
  next();
};

// GET public send page
router.get('/to/:username', requireLogin, async (req, res) => {
  const username = req.params.username?.trim();

  // ← ADD THIS VALIDATION
  if (!username) {
    req.flash('error', 'Invalid username.');
    return res.redirect('/messages/send');
  }

  if (req.session.user && username === req.session.user.username) {
    req.flash('error', 'You cannot send anonymous message to yourself.');
    return res.redirect('/messages/send');
  }

  const user = await User.findByUsername(username);

  if (!user) {
    req.flash('error', 'User not found.');
    return res.redirect('/messages/send');
  }

  res.render('messages/public-send', {
    title: `Send to ${username}`,
    receiver: user,
    success: req.flash('success')[0] || null,
    error: req.flash('error')[0] || null,
  });
});

// POST save the message

// POST save the message
router.post('/to/:username', requireLogin, async (req, res) => {
  const username = req.params.username?.trim();
  const { text } = req.body;

  if (!text || text.trim() === '') {
    req.flash('error', 'Message cannot be empty.');
    return res.redirect(`/to/${username}`);
  }

  try {
    const receiver = await User.findByUsername(username);

    if (!receiver) {
      req.flash('error', 'User not found.');
      return res.redirect('/messages/send');
    }

    if (receiver._id.toString() === req.session.user.id) {
      req.flash('error', 'You cannot send a message to yourself.');
      return res.redirect(`/to/${username}`);
    }

    await Message.create({
      toUserId: receiver._id,
      fromUserId: req.session.user.id,
      text: text.trim(),
    });

    req.flash('success', `Message sent anonymously to @${username} 🎉`);
    res.redirect('/messages/outbox');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to send message. Please try again.');
    res.redirect(`/to/${username}`);
  }
});

module.exports = router;
