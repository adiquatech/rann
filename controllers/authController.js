const User = require('../models/userModel');

const buildLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login to RANN',
    messages: res.locals.messages,
  });
};

const buildRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create RANN Account',
    messages: res.locals.messages,
  });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      req.flash('error', 'Email already registered.');
      return res.redirect('/auth/register');
    }

    await User.create({ username, email, password });

    req.flash('success', 'Account created! Please log in.');

    const redirectTo = req.session.redirectTo || '/messages/inbox';
    delete req.session.redirectTo;
    return res.redirect(redirectTo); // ← Fixed: only one redirect, with return
  } catch (err) {
    console.error(err);
    req.flash('error', 'Registration failed. Try again.');
    res.redirect('/auth/register');
  }
};

const loginUser = async (req, res) => {
  const { account_email, account_password } = req.body;

  try {
    let user = null; // ← Fixed: typo "letユーザー" → "let user"

    // Try email first
    user = await User.findByEmail(account_email);
    if (!user) {
      // Then try username
      user = await User.findByUsername(account_email);
    }

    if (!user) {
      req.flash('error', 'Invalid username/email or password.');
      return res.redirect('/auth/login');
    }

    const validPassword = await User.validatePassword(
      account_password,
      user.password
    );
    if (!validPassword) {
      req.flash('error', 'Invalid username/email or password.');
      return res.redirect('/auth/login');
    }

    // Save to session
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    req.session.loggedIn = true;

    req.flash('success', `Welcome back, ${user.username}!`);

    const redirectTo = req.session.redirectTo || '/messages/inbox';
    delete req.session.redirectTo;
    return res.redirect(redirectTo); // ← Good: only one redirect
  } catch (err) {
    console.error(err);
    req.flash('error', 'Login failed. Try again.');
    res.redirect('/auth/login');
  }
};

const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  buildLogin,
  buildRegister,
  registerUser,
  loginUser,
  logoutUser,
};
