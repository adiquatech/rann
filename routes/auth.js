const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// GET login page
router.get('/login', authController.buildLogin);

// GET register page
router.get('/register', authController.buildRegister);

// POST register
router.post('/register', authController.registerUser);

// POST login
router.post('/login', authController.loginUser);

// GET logout
router.get('/logout', authController.logoutUser);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    req.flash('success', `Welcome, ${req.user.username}!`);
    res.redirect('/messages/inbox');
  }
);

// Facebook OAuth
router.get(
  '/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
  (req, res) => {
    req.flash('success', `Welcome, ${req.user.username}!`);
    res.redirect('/messages/inbox');
  }
);

module.exports = router;
