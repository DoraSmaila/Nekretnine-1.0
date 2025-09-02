const express = require('express');
const app = express();
const cors = require('cors');
const propertyRoutes = require('./routes/propertyRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');
import mysql from "mysql2";


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
/* const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); */

const db = mysql.createConnection({
  host: "sql12.freesqldatabase.com",   // HOST
  user: "sql1234567",                  // USER
  password: "your_password",           // PASSWORD
  database: "sql1234567",              // DATABASE NAME
  port: 3306                           // PORT
});

db.connect(err => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL database!");
});
