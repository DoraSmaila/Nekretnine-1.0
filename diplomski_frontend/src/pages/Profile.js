import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { backendUrl } from '../config';

const ProfilePage = () => {
  const [myUploads, setMyUploads] = useState([]);
  const [rentedProperties, setRentedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingProperty, setEditingProperty] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser) {
        setLoading(false);
        return;
      }

      setUser(storedUser);

      try {
        const uploadsRes = await axios.get(`${backendUrl}/api/properties/uploads/${storedUser.email}`);
        setMyUploads(uploadsRes.data);

        const rentedRes = await axios.get(`${backendUrl}/api/properties/user/${storedUser.id}`);
        setRentedProperties(rentedRes.data);
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const unrentProperty = async (propertyId) => {
    try {
      await axios.post(`${backendUrl}/api/properties/unrent/${propertyId}`);
      setRentedProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Greška pri odjavi nekretnine:', error);
      alert('Neuspjela odjava nekretnine');
    }
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Jesi sigurna da želiš obrisati ovu objavu?')) return;

    try {
      await axios.delete(`${backendUrl}/api/properties/${propertyId}`);
      setMyUploads(prev => prev.filter(p => p.id !== propertyId));
    } catch (error) {
      console.error('Greška pri brisanju objave:', error);
      alert('Brisanje nije uspjelo.');
    }
  };

  const startEditing = (property) => {
    setEditingProperty({ ...property });
  };

  const cancelEdit = () => {
    setEditingProperty(null);
    setNewImages([]);
  };

  const handleEditChange = (e) => {
    setEditingProperty({ ...editingProperty, [e.target.name]: e.target.value });
  };

  const handleNewImages = (e) => {
    setNewImages(Array.from(e.target.files));
  };

  const handleDeleteImage = async (imageUrl) => {
    try {
      await axios.delete(`${backendUrl}/api/images`, {
        data: { image_url: imageUrl }
      });
      setEditingProperty((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imageUrl),
      }));
    } catch (error) {
      console.error('Greška pri brisanju slike:', error);
      alert('Brisanje slike nije uspjelo.');
    }
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${backendUrl}/api/properties/${editingProperty.id}`, {
        title: editingProperty.title,
        description: editingProperty.description,
        price: editingProperty.price,
        location: editingProperty.location,
        size: editingProperty.size,
        type: editingProperty.type,
      });

      if (newImages.length > 0) {
        const formData = new FormData();
        formData.append('property_id', editingProperty.id);
        newImages.forEach((img) => {
          formData.append('images', img);
        });

        await axios.post(`${backendUrl}/api/images/upload-multiple`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const refreshed = await axios.get(`${backendUrl}/api/properties/uploads/${user.email}`);
      setMyUploads(refreshed.data);
      setEditingProperty(null);
      setNewImages([]);
    } catch (error) {
      console.error('Greška pri ažuriranju nekretnine:', error);
      alert('Uređivanje nije uspjelo.');
    }
  };

  if (loading) return <p>Učitavanje nekretnina...</p>;

  return (
    <div className="profile-container">
      <h2>Tvoj profil</h2>
      {user && (
        <div className="user-info">
          <p><strong>Ime:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}

      <h3>🏠 Moje objave</h3>
      <div className="property-list">
        {myUploads.length > 0 ? (
          myUploads.map((property) => (
            <div className="property-card" key={property.id}>
              <div
                className="property-clickable"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <img
                  src={`http://localhost:5000${property.images?.[0] || '/uploads/no-image.jpg'}`}
                  alt={property.title}
                  className="property-image"
                />
                <h4>{property.title}</h4>
                <p>Lokacija: {property.location}</p>
                <p>Veličina: {property.size} m²</p>
                <p>Cijena: {property.price} €</p>
              </div>
              <div className="property-actions">
                <button className="edit-btn" onClick={() => startEditing(property)}>Uredi</button>
                <button className="delete-btn" onClick={() => handleDelete(property.id)}>Obriši objavu</button>
              </div>
            </div>
          ))
        ) : (
          <p>Nemaš objavljenih nekretnina.</p>
        )}

      </div>

      <h3>📦 Unajmljene nekretnine</h3>
      <div className="property-list">
        {rentedProperties.length > 0 ? (
          rentedProperties.map((property) => (
            <div className="property-card" key={property.id}>
              <div
                className="property-clickable"
                onClick={() => navigate(`/property/${property.id}`)}
              >
                <img
                  src={`http://localhost:5000${property.images?.[0] || '/uploads/no-image.jpg'}`}
                  alt={property.title}
                  className="property-image"
                />
                <h4>{property.title}</h4>
                <p>Lokacija: {property.location}</p>
                <p>Veličina: {property.size} m²</p>
                <p>Cijena: {property.price} €</p>
              </div>
              <div className="property-actions">
                <button className="unrent-btn" onClick={() => unrentProperty(property.id)}>Odjavi nekretninu</button>
              </div>
            </div>
          ))
        ) : (
          <p>Nemaš unajmljenih nekretnina.</p>
        )}

      </div>
      
      <button className="logout-btn" onClick={handleLogout}>Odjavi se</button>

      {editingProperty && (
        <div className="edit-modal">
          <h3>Uredi objavu</h3>
          <input name="title" value={editingProperty.title} onChange={handleEditChange} placeholder="Naslov" />
          <textarea name="description" value={editingProperty.description} onChange={handleEditChange} placeholder="Opis" />
          <input name="price" type="number" value={editingProperty.price} onChange={handleEditChange} placeholder="Cijena" />
          <input name="location" value={editingProperty.location} onChange={handleEditChange} placeholder="Lokacija" />
          <input name="size" type="number" value={editingProperty.size} onChange={handleEditChange} placeholder="Veličina (m²)" />
          <select name="type" value={editingProperty.type} onChange={handleEditChange}>
            <option value="Stan">Stan</option>
            <option value="Kuća">Kuća</option>
            <option value="Apartman">Apartman</option>
            <option value="Poslovni prostor">Poslovni prostor</option>
          </select>

          <h4>📸 Postojeće slike</h4>
          <div className="edit-images">
            {editingProperty.images?.map((img, idx) => (
              <div key={idx} className="edit-image-item">
                <img src={`http://localhost:5000${img}`} alt="slika" width="100" />
                <button onClick={() => handleDeleteImage(img)}>Obriši</button>
              </div>
            ))}
          </div>

          <h4>➕ Dodaj nove slike</h4>
          <input type="file" multiple accept="image/*" onChange={handleNewImages} />

          <div className="modal-buttons">
            <button onClick={saveEdit}>Spremi promjene</button>
            <button onClick={cancelEdit}>Odustani</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
