// middleware/auth.js

const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.loggedIn) {
    return next();
  }
  req.flash('error', 'You must be logged in to access this page.');
  res.redirect('/auth/login');
};

module.exports = { isLoggedIn };
