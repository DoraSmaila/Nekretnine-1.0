const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const upload = require('../middleware/upload');



// POST nova nekretnina
router.post('/', propertyController.createProperty);
// GET sve nekretnine
router.get('/', propertyController.getAllProperties);
// GET nekretnine korisnika
router.get('/user/:userId',propertyController.getUserProperties);
router.get('/public', propertyController.getPublicProperties);
// Nekretnine detalji
router.get('/:id', propertyController.getPropertyById);
router.post('/rent/:id', propertyController.rentProperty);
// Odjava nekretnine (unrent)
router.post('/unrent/:id', propertyController.unrentProperty);


router.post('/properties', upload.single('image'), propertyController.createProperty);
router.get('/uploads/:email', propertyController.getUserUploadsByEmail);
router.delete('/:id', propertyController.deleteProperty);
router.put('/:id', propertyController.updateProperty);

router.get('/recommend/:userId', propertyController.getRecommendations);


router.post('/view/:id', propertyController.incrementView);
router.get('/analytics/views/:email', propertyController.getViewStats);
router.post('/views/:id', propertyController.recordPropertyView);
router.get('/analytics/viewers/:email', propertyController.getViewDetails);






module.exports = router;
