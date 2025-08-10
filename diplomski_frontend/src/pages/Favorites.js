import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Favorites.css';
import { useNavigate } from 'react-router-dom';

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;

      try {
        const res = await axios.get(`http://localhost:5000/api/favorites/${user.id}`);
        setFavorites(res.data);

        // nakon dohvata favorita, dohvatimo preporuke
        const recRes = await axios.get(`http://localhost:5000/api/properties/recommend/${user.id}`);
        setRecommendations(recRes.data);
      } catch (err) {
        console.error('Greška pri dohvaćanju favorita ili preporuka:', err);
      }
    };

    fetchFavorites();
  }, [user]);

  const handleClick = (id) => {
    navigate(`/property/${id}`);
  };

  return (
    <div className="favorite-container">
      <h2>Moji favoriti</h2>
      {favorites.length === 0 ? (
        <p>Nemate spremljenih nekretnina.</p>
      ) : (
        <div className="properties-grid">
          {favorites.map((property) => (
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
              <h3>{property.title}</h3>
              <p>Lokacija: {property.location}</p>
              <p>Veličina: {property.size} m²</p>
              <p className="price">{property.price} €</p>
            </div>
          ))}
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="recommendation-section">
          <h2>Preporučene nekretnine za vas</h2>
          <div className="properties-grid">
            {recommendations.map((property) => (
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
                <h3>{property.title}</h3>
                <p>Lokacija: {property.location}</p>
                <p>Veličina: {property.size} m²</p>
                <p className="price">{property.price} €</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Favorite;
