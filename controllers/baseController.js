const buildHome = (req, res) => {
  if (req.session.loggedIn) {
    const publicLink = `${req.protocol}://${req.get('host')}/to/${req.session.user.username}`;
    res.render('home', {
      title: `Welcome back, ${req.session.user.username}!`,
      loggedIn: true,
      publicLink: publicLink,
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
