const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

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

module.exports = router;
