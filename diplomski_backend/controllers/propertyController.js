const db = require('../db');

// Funkcija za unos nekretnine
const createProperty = async (req, res) => {
  const {
    user_id,
    title,
    description,
    price,
    location,
    size,
    type,
    contact_name,
    contact_phone,
    contact_email,
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO properties 
      (user_id, title, description, price, location, size, type, contact_name, contact_phone, contact_email) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        title,
        description,
        price,
        location,
        size,
        type,
        contact_name,
        contact_phone,
        contact_email
      ]
    );

    res.status(201).json({ message: 'Nekretnina unesena!', propertyId: result.insertId });
  } catch (error) {
    console.error('Greška pri unosu nekretnine:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};



// Funkcija za dohvat svih nekretnina
const getAllProperties = async (req, res) => {
  try {
    const [properties] = await db.query('SELECT * FROM properties');

    // Za svaku nekretninu dohvatiti slike
    for (const property of properties) {
      const [images] = await db.query('SELECT image_url FROM images WHERE property_id = ?', [property.id]);
      property.images = images.map(img => img.image_url); // samo url-ovi
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error('Greška pri dohvaćanju nekretnina:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// Dohvati nekretnine korisnika po ID-u
const getUserProperties = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [properties] = await db.query('SELECT * FROM properties WHERE user_id = ?', [userId]);

    for (const property of properties) {
      const [images] = await db.query('SELECT image_url FROM images WHERE property_id = ?', [property.id]);
      property.images = images.map(img => img.image_url);
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error('Greška pri dohvaćanju korisničkih nekretnina:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
// Dohvati nekretnine bez vlasnika
const getPublicProperties = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        p.*, 
        (SELECT image_url FROM images WHERE property_id = p.id LIMIT 1) AS image
      FROM properties p
      WHERE p.user_id IS NULL
    `);

    res.json(rows);
  } catch (error) {
    console.error('Greška kod dohvaćanja javnih nekretnina:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};


// Detalji nekretnine na koju klikneš
const getPropertyById = async (req, res) => {
  const propertyId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [propertyId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nekretnina nije pronađena.' });
    }

    const property = rows[0];

    // Dodaj slike
    const [images] = await db.query('SELECT image_url FROM images WHERE property_id = ?', [propertyId]);
    property.images = images.map(img => img.image_url);  // ["url1", "url2", ...]

    res.json(property);
  } catch (err) {
    console.error('Greška kod dohvaćanja nekretnine:', err);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
};


// Funkcija za najam nekretnine
const rentProperty = async (req, res) => {
  const propertyId = req.params.id;
  const { userId } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE properties SET user_id = ? WHERE id = ? AND user_id IS NULL',
      [userId, propertyId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Nekretnina je već unajmljena ili ne postoji.' });
    }

    res.status(200).json({ message: 'Nekretnina uspješno unajmljena.' });
  } catch (error) {
    console.error('Greška pri unajmljivanju nekretnine:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
};

const unrentProperty = async (req, res) => {
  const propertyId = req.params.id;
  try {
    const [result] = await db.query('UPDATE properties SET user_id = NULL WHERE id = ?', [propertyId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Nekretnina nije pronađena' });
    }
    res.status(200).json({ message: 'Nekretnina je uspješno odjavljena' });
  } catch (error) {
    console.error('Greška pri odjavi nekretnine:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};



const getUserUploadsByEmail = async (req, res) => {
  const email = req.params.email;

  try {
    const [properties] = await db.query(
      `SELECT p.*, 
              (SELECT image_url FROM images WHERE property_id = p.id LIMIT 1) AS image
       FROM properties p
       WHERE p.contact_email = ?`,
      [email]
    );

    // Dodaj sve slike
    for (const property of properties) {
      const [images] = await db.query('SELECT image_url FROM images WHERE property_id = ?', [property.id]);
      property.images = images.map(img => img.image_url);
    }

    res.status(200).json(properties);
  } catch (error) {
    console.error('Greška pri dohvaćanju objava po emailu:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};
const deleteProperty = async (req, res) => {
  const propertyId = req.params.id;

  try {
    // 1. Obriši slike
    await db.query('DELETE FROM images WHERE property_id = ?', [propertyId]);

    // 3. Obriši nekretninu
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [propertyId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Nekretnina nije pronađena.' });
    }

    res.status(200).json({ message: 'Nekretnina je uspješno obrisana.' });
  } catch (error) {
    console.error('Greška pri brisanju nekretnine:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
};
const updateProperty = async (req, res) => {
  const propertyId = req.params.id;
  const {
    title,
    description,
    price,
    location,
    size,
    type
  } = req.body;

  try {
    const [result] = await db.query(
      `UPDATE properties 
       SET title = ?, description = ?, price = ?, location = ?, size = ?, type = ?
       WHERE id = ?`,
      [title, description, price, location, size, type, propertyId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Nekretnina nije pronađena.' });
    }

    res.status(200).json({ message: 'Nekretnina je uspješno ažurirana.' });
  } catch (error) {
    console.error('Greška pri ažuriranju nekretnine:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
};

// GET /api/properties/recommend/:userId
const getRecommendations = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Dohvati tipove nekretnina koje su u favoritima korisnika
    const [favorites] = await db.query(
      `SELECT p.type 
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       WHERE f.user_id = ?`,
      [userId]
    );

    if (favorites.length === 0) {
      return res.status(200).json([]); // nema favorita => nema preporuka
    }

    // Broji učestalost svakog tipa
    const typeCounts = {};
    favorites.forEach(fav => {
      typeCounts[fav.type] = (typeCounts[fav.type] || 0) + 1;
    });

    // Sortiraj po učestalosti
    const sortedTypes = Object.keys(typeCounts).sort((a, b) => typeCounts[b] - typeCounts[a]);

    // Pripremi upit za preporuku nekretnina koje nisu već u favoritima
    const fieldPlaceholders = sortedTypes.map(() => '?').join(','); // "?, ?, ?"
    const query = `
      SELECT p.*, (
        SELECT i.image_url 
        FROM images i 
        WHERE i.property_id = p.id 
        LIMIT 1
      ) AS image
      FROM properties p
      WHERE p.type IN (?)
        AND p.user_id IS NULL
        AND p.id NOT IN (
          SELECT property_id FROM favorites WHERE user_id = ?
        )
      ORDER BY FIELD(p.type, ?)
      LIMIT 10

    `;
    const params = [sortedTypes, userId, ...sortedTypes];

    const [recommended] = await db.query(query, params);

    res.json(recommended);
  } catch (error) {
    console.error('Greška kod preporuka:', error);
    res.status(500).json({ error: 'Greška kod preporuka' });
  }
};

//Analize
const incrementView = async (req, res) => {
  const propertyId = req.params.id;
  // Pretpostavimo da korisnički email dobivaš iz zahtjeva - npr. iz bodyja ili query parametra
  const viewerEmail = req.body.viewerEmail; 

  if (!viewerEmail) {
    return res.status(400).json({ message: "viewerEmail je obavezan" });
  }

  try {
    // Povećaj broj pregleda u tablici properties
    await db.query('UPDATE properties SET views = views + 1 WHERE id = ?', [propertyId]);

    // Ubaci zapis u property_views
    await db.query(
      'INSERT INTO property_views (property_id, viewer_email) VALUES (?, ?)',
      [propertyId, viewerEmail]
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

const getViewStats = async (req, res) => {
  const userEmail = req.params.email; // email vlasnika nekretnine

  try {
    const [rows] = await db.query(
      `SELECT id, title, views 
       FROM properties 
       WHERE contact_email = ?`, 
      [userEmail]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};

// Dodaj u propertyController.js
const recordPropertyView = async (req, res) => {
  const propertyId = req.params.id;
  const viewerEmail = req.body.viewerEmail;

  try {
    // 1. Povećaj broj pregleda
    await db.query('UPDATE properties SET views = views + 1 WHERE id = ?', [propertyId]);

    // 2. Zabilježi tko je pogledao
    await db.query('INSERT INTO property_views (property_id, viewer_email) VALUES (?, ?)', [propertyId, viewerEmail]);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};
const getViewDetails = async (req, res) => {
  const userEmail = req.params.email;

  try {
    const [rows] = await db.query(`
      SELECT pv.viewer_email, p.title, pv.viewed_at
      FROM property_views pv
      JOIN properties p ON pv.property_id = p.id
      WHERE p.contact_email = ?
      ORDER BY pv.viewed_at DESC
    `, [userEmail]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
};






// Eksport  funkcije
module.exports = {
  createProperty,
  getAllProperties,
  getUserProperties,
  getPublicProperties,
  getPropertyById,
  rentProperty,
  unrentProperty,
  getUserUploadsByEmail,
  deleteProperty,
  updateProperty,
  getRecommendations,
  incrementView,
  getViewStats,
  recordPropertyView,
  getViewDetails
};
