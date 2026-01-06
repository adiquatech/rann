const express = require('express');
const expressLayouts = require('express-ejs-layouts');
// const env = require('dotenv').config();
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { initDb } = require('./data/database');
const baseController = require('./controllers/baseController');

/* ***********************
 * Middleware
 ************************/
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'rann-super-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Change to true in production with HTTPS
  })
);

app.use(flash());

app.use((req, res, next) => {
  res.locals.messages = req.flash(); // Make flash messages available in all views

  // Make session user available in all views
  if (req.session && req.session.loggedIn) {
    res.locals.user = req.session.user;
    res.locals.loggedIn = true;
  } else {
    res.locals.user = null;
    res.locals.loggedIn = false;
  }
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* ***********************
 * View Engine and Templates
 ************************/
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', './layouts/main'); // Main layout file

app.use(express.static('public')); // CSS, JS, images

/* ***********************
 * Routes
 ************************/
app.get('/', baseController.buildHome); // Temporary home route

app.use('/auth', require('./routes/auth'));
app.use('/messages', require('./routes/messages'));
app.use(require('./routes/publicMessage'));

// We'll add these later
// app.use("/auth", require("./routes/auth"));
// app.use("/messages", require("./routes/messages"));

/* ***********************
 * 404 and Error Handler
 ************************/
app.use((req, res, next) => {
  next({ status: 404, message: 'Sorry, page not found.' });
});

app.use((err, req, res) => {
  let title = err.status === 404 ? '404 - Page Not Found' : 'Server Error';
  console.error(`Error: ${err.message}`);

  res.status(err.status || 500);
  res.render('errors/error', {
    title,
    message: err.message,
    messages: res.locals.messages,
  });
});

/* ***********************
 * Start Server after DB Connection
 ************************/
initDb((err) => {
  if (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`RANN server running on http://localhost:${port} 🚀`);
    console.log('MongoDB connected successfully!');
  });
});
