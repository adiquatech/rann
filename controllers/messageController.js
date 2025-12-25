const Message = require('../models/messageModel');
const User = require('../models/userModel');
const { ObjectId } = require('mongodb');

const getInbox = async (req, res) => {
  const messages = await Message.getByUserId(req.session.user.id);
  res.render('messages/inbox', {
    title: 'Your Inbox',
    messages,
  });
};

const getOutbox = async (req, res) => {
  const senderId = new ObjectId(req.session.user.id);
  const sentMessages = await Message.getBySenderId(senderId);

  for (let msg of sentMessages) {
    const receiver = await User.findById(msg.toUserId);
    msg.receiverUsername = receiver ? receiver.username : 'Deleted User';
  }

  res.render('messages/outbox', {
    title: 'Your Sent Messages',
    messages: sentMessages,
  });
};

const getSend = (req, res) => {
  const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;
  res.render('messages/send', {
    title: 'Send Anonymous Message',
    publicLink: publicLink,
  });
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
  const { toUserId, text } = req.body;

  if (!text || text.trim().length === 0) {
    req.flash('error', 'Reply cannot be empty.');
    return res.redirect('/messages/inbox');
  }

  await Message.create({
    toUserId,
    fromUserId: req.session.user.id,
    text: text.trim(),
  });

  req.flash('success', 'Reply sent anonymously!');
  res.redirect('/messages/inbox');
};

module.exports = {
  getInbox,
  getOutbox,
  getSend,
  getProfile,
  reply,
};
