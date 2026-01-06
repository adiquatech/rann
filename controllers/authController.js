const User = require('../models/userModel');

const buildLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login to RANN',
    error: null,
    success: null,
  });
};

const buildRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Create RANN Account',
    error: null,
  });
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  let error = null;

  try {
    // Check duplicate username
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      error = 'Username already taken.';
    }

    // Check duplicate email
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      error = 'Email already registered.';
    }

    if (error) {
      return res.render('auth/register', {
        title: 'Create RANN Account',
        error,
      });
    }

    await User.create({ username, email, password });

    // Success — go to login with success message
    return res.render('auth/login', {
      title: 'Login to RANN',
      error: null,
      success: 'Account created! Please log in.',
    });
  } catch (err) {
    console.error(err);
    error = 'Registration failed. Try again.';
    return res.render('auth/register', {
      title: 'Create RANN Account',
      error,
    });
  }
};

const loginUser = async (req, res) => {
  const { account_email, account_password } = req.body;

  let error = null;

  try {
    let user = await User.findByEmail(account_email);
    if (!user) {
      user = await User.findByUsername(account_email);
    }

    if (!user) {
      error = 'Invalid username/email or password.';
    } else {
      const validPassword = await User.validatePassword(
        account_password,
        user.password
      );
      if (!validPassword) {
        error = 'Invalid username/email or password.';
      }
    }

    if (error) {
      return res.render('auth/login', {
        title: 'Login to RANN',
        error,
        success: null,
      });
    }

    // Login success
    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
    };
    req.session.loggedIn = true;

    const redirectTo = req.session.redirectTo || '/';
    delete req.session.redirectTo;
    return res.redirect(redirectTo);
  } catch (err) {
    console.error(err);
    error = 'Login failed. Try again.';
    return res.render('auth/login', {
      title: 'Login to RANN',
      error,
    });
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
