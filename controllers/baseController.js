const buildHome = (req, res) => {
  if (req.session.loggedIn) {
    res.render('home', {
      title: `Welcome back, ${req.session.user.username}!`,
      loggedIn: true,
    });
  } else {
    res.render('home', {
      title: 'RANN - Anonymous Messages',
      loggedIn: false,
    });
  }
};

module.exports = {
  buildHome,
};
