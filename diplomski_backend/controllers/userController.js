const bcrypt = require('bcrypt');
const db = require('../db');

// Funkcija za registraciju korisnika
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Provjeri postoji li već korisnik s tim emailom
    const [user] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length > 0) {
      return res.status(400).json({ error: 'Korisnik s tim emailom već postoji.' });
    }

    // Hashiraj lozinku
    const hashedPassword = await bcrypt.hash(password, 10);

    // Unesi novog korisnika u bazu
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    res.status(201).json({ message: 'Korisnik uspješno registriran!' });
  } catch (error) {
    console.error('Greška pri registraciji korisnika:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};

// Funkcija za login korisnika
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Pogrešan email ili lozinka.' });
    }

    const user = users[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Pogrešan email ili lozinka.' });
    }

    // ✔️ Vrati korisnika (bez lozinke!)
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Greška pri logiranju korisnika:', error);
    res.status(500).json({ error: 'Greška na serveru' });
  }
};


module.exports = { registerUser, loginUser };

