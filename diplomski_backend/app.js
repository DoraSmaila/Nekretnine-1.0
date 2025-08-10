const express = require('express');
const app = express();
const cors = require('cors');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');


// Middleware za parsiranje JSON-a
app.use(express.json());

// Omogući CORS za sve zahtjeve
app.use(cors());

// Middleware za parsiranje urlencoded tijela (npr. forme)
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta za nekretnine
app.use('/api/properties', propertyRoutes);
app.use('/api', userRoutes);

const imageRoutes = require('./routes/imageRoutes');
app.use('/api/images', imageRoutes);

const favoriteRoutes = require('./routes/favoriteRoutes');
app.use('/api/favorites', favoriteRoutes);


// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
