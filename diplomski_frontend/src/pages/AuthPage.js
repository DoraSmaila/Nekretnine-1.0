import React, { useState } from 'react';
import axios from 'axios';
import './AuthPage.css';
import { useNavigate } from 'react-router-dom';
import { backendUrl } from '../config';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(`${backendUrl}/api/login`, {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('user', JSON.stringify(response.data)); // MORA BITI DODANO
      navigate('/home');
    } catch (err) {
      alert('Neuspješna prijava');
      console.error('Greška prilikom login-a:', err);
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/api/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      alert('Registracija uspješna, možete se prijaviti!');
      setIsLogin(true); // prebaci na login tab
    } catch (err) {
      alert('Došlo je do pogreške');
      console.error('Greška prilikom registracije:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-toggle">
        <button
          onClick={() => setIsLogin(true)}
          className={isLogin ? 'active-tab' : ''}
        >
          Prijava
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={!isLogin ? 'active-tab' : ''}
        >
          Registracija
        </button>
      </div>

      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Ime"
            value={formData.name}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Lozinka"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="submit-btn">
          {isLogin ? 'Prijavi se' : 'Registriraj se'}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
