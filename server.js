require ('dotenv').config();
const express = require('express');
const { initDb } = require('./db/connect');
const contactsRouter = require('./routes/contacts');
const templeRouter = require('./routes/temples');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('styles'));

// Home route
app.use(session({
    secret: process.env.SESSION_SECRET || 'rann-secret-key-quadri-2025',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false}
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));