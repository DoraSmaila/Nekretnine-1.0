const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imageController = require('../controllers/imageController');

// Multer konfiguracija
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Ruta za više slika
router.post('/upload-multiple', upload.array('images', 10), imageController.saveMultipleImages);


// DELETE slika
router.delete('/', imageController.deleteImage);

module.exports = router;
