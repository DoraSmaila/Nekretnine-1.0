const db = require('../db');

const saveMultipleImages = async (req, res) => {
  const { property_id } = req.body;
  const files = req.files;

  if (!property_id || !files || files.length === 0) {
    return res.status(400).json({ error: 'Nedostaju property_id ili slike.' });
  }

  try {
    const values = files.map(file => [property_id, `/uploads/${file.filename}`]);

    await db.query('INSERT INTO images (property_id, image_url) VALUES ?', [values]);

    res.status(200).json({ message: 'Slike uspješno spremljene.' });
  } catch (error) {
    console.error('Greška pri spremanju više slika:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

const fs = require('fs');
const path = require('path');

const deleteImage = async (req, res) => {
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: 'Nedostaje image_url.' });
  }

  try {
    // 1. Obriši iz baze
    await db.query('DELETE FROM images WHERE image_url = ?', [image_url]);

    // 2. Obriši sa diska
    const fullPath = path.join(__dirname, '..', image_url);
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.warn('Slika nije obrisana sa diska:', err.message);
      }
    });

    res.status(200).json({ message: 'Slika uspješno obrisana.' });
  } catch (err) {
    console.error('Greška pri brisanju slike:', err);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
};

module.exports = { saveMultipleImages, deleteImage };
