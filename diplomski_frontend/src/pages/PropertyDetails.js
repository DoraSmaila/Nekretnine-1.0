import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PropertyDetails.css';
import { backendUrl } from '../config';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const currentUserId = user?.id;

  // Za Lightbox
  const [isOpen, setIsOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/properties/${id}`);
        setProperty(res.data);
      } catch (err) {
        console.error('Greška prilikom dohvaćanja nekretnine:', err);
      }
    };

    fetchProperty();
  }, [id]);

  const handleRent = async () => {
    try {
      await axios.post(`${backendUrl}/api/properties/rent/${id}`, {
        userId: currentUserId,
      });
      alert('Uspješno ste unajmili nekretninu!');
      navigate('/profile');
    } catch (err) {
      console.error('Greška pri najmu nekretnine:', err.response?.data || err.message);
      alert('Neuspješan najam. Provjerite je li nekretnina još uvijek dostupna.');
    }
  };

  if (!property) return <p>Učitavanje...</p>;

  const imageUrls = property.images?.map(img => `${backendUrl}${img}`) || [];

  return (
    <div className="property-details-container">
      <h2>{property.title}</h2>

      <div className="property-details-content">
        {/* Lijeva strana - informacije */}
        <div className="property-info">
          <p><strong>Opis:</strong> {property.description}</p>
          <p><strong>Lokacija:</strong> {property.location}</p>
          <p><strong>Veličina:</strong> {property.size} m²</p>
          <p><strong>Vrsta:</strong> {property.type}</p>
          <p><strong>Cijena:</strong> {property.price} €</p>

          <iframe
            title="Mapa lokacije"
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: '8px', marginTop: '10px', marginBottom: '20px' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${encodeURIComponent(property.location)}&output=embed`}
          ></iframe>

          <h3>📞 Kontakt osoba</h3>
          <p><strong>Ime:</strong> {property.contact_name}</p>
          <p><strong>Telefon:</strong> {property.contact_phone}</p>
          <p><strong>Email:</strong> {property.contact_email}</p>

          {!property.user_id && currentUserId && (
            <button onClick={handleRent} className="rent-button">
              Unajmi nekretninu
            </button>
          )}
        </div>

        {/* Desna strana - slike */}
        {imageUrls.length > 0 ? (
          <div className="image-gallery">
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Slika ${index + 1}`}
                className="gallery-image"
                onClick={() => {
                  setPhotoIndex(index);
                  setIsOpen(true);
                }}
              />
            ))}
          </div>
        ) : (
          <p>Nema dostupnih slika.</p>
        )}
          {isOpen && (
            <div className="fullscreen-overlay">
              <span className="close-btn" onClick={() => setIsOpen(false)}>&times;</span>
              <span className="arrow left" onClick={() => setPhotoIndex((photoIndex - 1 + imageUrls.length) % imageUrls.length)}>&#10094;</span>
              <img src={imageUrls[photoIndex]} alt={`Slika ${photoIndex + 1}`} className="fullscreen-image" />
              <span className="arrow right" onClick={() => setPhotoIndex((photoIndex + 1) % imageUrls.length)}>&#10095;</span>
            </div>
          )}
      </div>
    </div>
  );
};

export default PropertyDetails;
