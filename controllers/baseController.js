// controllers/baseController.js

// Temporary home page builder
const buildHome = (req, res) => {
  res.render('home', {
    title: 'RANN - Send Anonymous Messages',
    messages: res.locals.messages || [],
  });
};

module.exports = { buildHome };
