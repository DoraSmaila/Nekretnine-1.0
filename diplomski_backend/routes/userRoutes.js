const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

// Ruta za registraciju korisnika
router.post('/register', registerUser);

// Ruta za login korisnika
router.post('/login', loginUser);

module.exports = router;
