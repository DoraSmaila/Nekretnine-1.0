const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');

router.get('/:userId', favoriteController.getFavorites); // dohvat favorita za korisnika
router.post('/', favoriteController.addToFavorites);       // dodaj u favorite
router.delete('/', favoriteController.removeFromFavorites);  // ukloni iz favorita

module.exports = router;
