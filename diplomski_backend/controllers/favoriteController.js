const db = require('../db');

const addToFavorites = async (req, res) => {
  const { userId, propertyId } = req.body;
  try {
    await db.query('INSERT INTO favorites (user_id, property_id) VALUES (?, ?)', [userId, propertyId]);
    res.status(200).json({ message: 'Dodano u favorite' });
  } catch (error) {
    console.error('Greška pri dodavanju favorita:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// Dohvati sve favorite korisnika
const getFavorites = async (req, res) => {
  const { userId } = req.params;
  try {
    const [rows] = await db.query(
    `SELECT p.*, i.image_url AS image 
    FROM properties p
    JOIN favorites f ON p.id = f.property_id
    LEFT JOIN (
        SELECT property_id, MIN(image_url) AS image_url
        FROM images
        GROUP BY property_id
    ) i ON p.id = i.property_id
    WHERE f.user_id = ?`,
    [userId]
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error('Greška pri dohvaćanju favorita:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// (Opcionalno) Ukloni iz favorita
const removeFromFavorites = async (req, res) => {
  const { userId, propertyId } = req.body;
  try {
    await db.query('DELETE FROM favorites WHERE user_id = ? AND property_id = ?', [userId, propertyId]);
    res.status(200).json({ message: 'Uklonjeno iz favorita' });
  } catch (error) {
    console.error('Greška pri uklanjanju favorita:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};



module.exports = {
    addToFavorites,
    getFavorites,
    removeFromFavorites,
};