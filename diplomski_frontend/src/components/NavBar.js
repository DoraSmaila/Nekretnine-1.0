import React from 'react';
import { Link } from 'react-router-dom';
import neboderi from '../assets/images/neboderi.jpg'
import './NavBar.css';

const Navbar = () => {
  return (
    <>
      <div
        className="hero-background"
        style={{
          neboderi: `url(${neboderi})`,
          neboderiSize: 'cover',
          neboderiPosition: 'center',
          height: '300px',
          width: '100%',
        }}
      >
        {/* Opcionalno: tekst ili overlay */}
      </div>

      <nav className="navbar">
        <ul>
          <li><Link to="/home">Početna</Link></li>
          <li><Link to="/favorites">Favoriti</Link></li>
          <li><Link to="/profile">Profil</Link></li>
          <li><Link to="/analytics">Analitika</Link></li>
          
        </ul>
      </nav>
    </>
  );
};
export default Navbar;
