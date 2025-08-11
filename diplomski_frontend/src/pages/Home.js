import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaPlusCircle, FaTimes } from 'react-icons/fa';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [images, setImages] = useState([]);
  const [newProperty, setNewProperty] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    size: '',
    type: 'Stan',
    contact_name: '',
    contact_phone: '',
    contact_email: ''
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); //  prijavljeni korisnik

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Dohvati javne nekretnine
        const res = await axios.get('http://localhost:5000/api/properties/public');
        setProperties(res.data);

        // Dohvati favorite za prijavljenog korisnika iz baze
        if (user) {
          const favRes = await axios.get(`http://localhost:5000/api/favorites/${user.id}`);
          const favoriteIds = favRes.data.map(fav => fav.property_id || fav.id);
          setFavorites(favoriteIds);
        }
      } catch (err) {
        console.error('Greška prilikom dohvaćanja podataka:', err);
      }
    };

    fetchData();
  }, [user]);

  const toggleFavorite = async (propertyId) => {
    if (!user) {
      alert('Molimo prijavite se da biste spremili favorite.');
      return;
    }

    try {
      if (favorites.includes(propertyId)) {
        // Ukloni favorit
        await axios.delete('http://localhost:5000/api/favorites', {
          data: { userId: user.id, propertyId }
        });
        setFavorites(favorites.filter(id => id !== propertyId));
      } else {
        // Dodaj favorit
        await axios.post('http://localhost:5000/api/favorites', {
          userId: user.id,
          propertyId
        });
        setFavorites([...favorites, propertyId]);
      }
    } catch (err) {
      console.error('Greška pri mijenjanju favorita:', err);
    }
  };

  const filteredProperties = properties.filter((property) =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleClick = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/properties/view/${id}`, {
        viewerEmail: user ? user.email : 'anonimni@posjetitelj.com'
      });
      navigate(`/property/${id}`);
    } catch (error) {
      console.error('Greška pri bilježenju pregleda:', error);
      navigate(`/property/${id}`);  // čak i ako padne, možeš nastaviti s navigacijom
    }
  };



  const handleFormChange = (e) => {
    setNewProperty({ ...newProperty, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/properties', {
        //user_id: user ? user.id : null,
        ...newProperty
      });

      const propertyId = response.data.propertyId;

      if (images.length > 0) {
        const formData = new FormData();
        formData.append('property_id', propertyId);
        images.forEach(img => formData.append('images', img));

        await axios.post('http://localhost:5000/api/images/upload-multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setShowForm(false);
      setNewProperty({
        title: '',
        description: '',
        price: '',
        location: '',
        size: '',
        type: 'Stan',
        contact_name: '',
        contact_phone: '',
        contact_email: ''
      });
      setImages([]);

      const res = await axios.get('http://localhost:5000/api/properties/public');
      setProperties(res.data);
    } catch (err) {
      console.error('Greška pri unosu nekretnine:', err);
    }
  };

  return (
    <div className="home-container">
      <div className="top-bar">
        <h2>Nekretnine</h2>
        <button className="create-button" onClick={() => setShowForm(true)}>
          <FaPlusCircle style={{ marginRight: '8px' }} />
          Napravi objavu
        </button>
      </div>

      <input
        type="text"
        placeholder="Pretraži po nazivu ili lokaciji..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <div className="properties-grid">
        {filteredProperties.length === 0 ? (
          <p>Nema rezultata za prikaz.</p>
        ) : (
          filteredProperties.map((property) => (
            <div
              key={property.id}
              className="property-card"
              onClick={() => handleClick(property.id)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={`http://localhost:5000${property.image || '/uploads/no-image.jpg'}`}
                alt={property.title}
                className="property-image"
              />
              <div
                className="favorite-icon"
                style={{backgroundColor: 'white', borderRadius: '50%', border: '1px solid black', margin:'10px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(property.id);
                }}
              >
                <div style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {favorites.includes(property.id) ? (
                    <FaHeart color="red" />
                  ) : (
                      <FaRegHeart color="gray" />
                    )}
                </div>
              </div>
              <h3>{property.title}</h3>
              <p>Lokacija: {property.location}</p>
              <p>Veličina: {property.size} m²</p>
              <p className="price">{property.price} €</p>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="form-overlay">
          <div className="form-popup">
            <div className="form-header">
              <h3>Nova nekretnina</h3>
              <button onClick={() => setShowForm(false)} className="close-btn">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="property-form">
              <input name="title" value={newProperty.title} onChange={handleFormChange} placeholder="Naslov" required />
              <textarea name="description" value={newProperty.description} onChange={handleFormChange} placeholder="Opis" required />
              <input name="price" type="number" value={newProperty.price} onChange={handleFormChange} placeholder="Cijena" required />
              <input name="location" value={newProperty.location} onChange={handleFormChange} placeholder="Lokacija" required />
              <input name="size" type="number" value={newProperty.size} onChange={handleFormChange} placeholder="Veličina (m²)" required />
              <select name="type" value={newProperty.type} onChange={handleFormChange}>
                <option value="Stan">Stan</option>
                <option value="Kuća">Kuća</option>
                <option value="Apartman">Apartman</option>
                <option value="Poslovni prostor">Poslovni prostor</option>
              </select>
              <input name="contact_name" value={newProperty.contact_name} onChange={handleFormChange} placeholder="Ime kontakt osobe" required />
              <input name="contact_phone" value={newProperty.contact_phone} onChange={handleFormChange} placeholder="Telefon" required />
              <input name="contact_email" type="email" value={newProperty.contact_email} onChange={handleFormChange} placeholder="Email" required />
              <input type="file" accept="image/*" multiple onChange={handleImageChange} />
              <button type="submit" className="submit-btn">Spremi</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
