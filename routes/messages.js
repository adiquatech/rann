const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const messageController = require('../controllers/messageController');

router.get('/inbox', isLoggedIn, messageController.getInbox);
router.get('/send', isLoggedIn, messageController.getSend);
router.get('/outbox', isLoggedIn, messageController.getOutbox);
router.get('/thread/:messageId', isLoggedIn, messageController.getThread);
router.get('/user/profile', isLoggedIn, messageController.getProfile);
router.post('/reply', isLoggedIn, messageController.reply);

module.exports = router;
