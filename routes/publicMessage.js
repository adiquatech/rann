const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Message = require('../models/messageModel');

// Require login to send message
const requireLogin = (req, res, next) => {
  if (!req.session.loggedIn) {
    req.session.redirectTo = req.originalUrl; // Remember where they wanted to go
    req.flash('info', 'Please login or register to send a message.');
    return res.redirect('/auth/register');
  }
  next();
};

// GET public send page
router.get('/to/:username', requireLogin, async (req, res) => {
  const username = req.params.username;
  const user = await User.findByUsername(username);

  if (!user) {
    req.flash('error', 'User not found.');
    return res.redirect('/');
  }

  res.render('messages/public-send', {
    title: `Send to ${username}`,
    receiver: user,
  });
});

// POST save the message
router.post('/to/:username', requireLogin, async (req, res) => {
  const username = req.params.username;
  const { text } = req.body;

  if (!text || text.trim() === '') {
    req.flash('error', 'Message cannot be empty.');
    return res.redirect(`/to/${username}`);
  }

  const user = await User.findByUsername(username);
  if (!user) {
    req.flash('error', 'User not found.');
    return res.redirect('/');
  }

  await Message.create({
    toUserId: user._id,
    fromUserId: req.session.user.id,
    text: text.trim(),
  });

  req.flash('success', 'Message sent anonymously! 🎉');
  res.redirect(`/to/${username}`);
});

module.exports = router;
