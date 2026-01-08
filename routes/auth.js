const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');
const { getDb } = require('../data/database');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

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

// GET forgot password page
router.get('/forgot-password', (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password',
    error: null,
    success: null,
  });
});

// POST send reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) {
      req.flash(
        'info',
        'If that email is registered, you will receive a reset link.'
      );
      return res.redirect('/auth/forgot-password');
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpires = Date.now() + 3600000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await getDb()
      .collection('users')
      .updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
          },
        }
      );

    // Send email (console.log for now)
    const resetURL = `http://localhost:3000/auth/reset-password/${resetToken}`;
    console.log(`Reset link for ${email}: ${resetURL}`);

    req.flash(
      'success',
      'Reset link sent! Check console for link (email simulation).'
    );
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Something went wrong.');
    res.redirect('/auth/forgot-password');
  }
});

// GET reset password page
router.get('/reset-password/:token', async (req, res) => {
  const token = req.params.token;

  const user = await getDb()
    .collection('users')
    .findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

  if (!user) {
    req.flash('error', 'Invalid or expired reset token.');
    return res.redirect('/auth/forgot-password');
  }

  res.render('auth/reset-password', {
    title: 'Reset Password',
    token,
  });
});

// POST update password
router.post('/reset-password/:token', async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;

  try {
    const user = await getDb()
      .collection('users')
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

    if (!user) {
      req.flash('error', 'Invalid or expired token.');
      return res.redirect('/auth/forgot-password');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await getDb()
      .collection('users')
      .updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: { resetPasswordToken: '', resetPasswordExpires: '' },
        }
      );

    req.flash('success', 'Password reset successful! Please login.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Reset failed.');
    res.redirect('/auth/forgot-password');
  }
});

module.exports = router;
