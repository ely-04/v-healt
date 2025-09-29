import React, { useState } from 'react';
import logo from '../assets/logo1.png';
import './Footer.css';

const Footer = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const plantas = [
    'Manzanilla', 'Jengibre', 'Aloe Vera', 'Eucalipto', 'Tomillo',
    'Romero', 'Lavanda', 'Menta', 'Caléndula', 'Equinácea'
  ];

  const enfermedades = [
    'Dolor de cabeza', 'Indigestión', 'Resfriado común', 'Insomnio',
    'Dolor muscular', 'Ansiedad', 'Problemas digestivos', 'Heridas menores',
    'Inflamación', 'Fatiga'
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    // Aquí implementarías la lógica de búsqueda
    console.log('Buscando:', searchTerm);
  };

  return (
    <footer className="footer">
      <div className="footer-bottom" style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>&copy; V-HEALT - Medicina Natural. Todos los derechos reservados.</p>
        <p className="disclaimer" style={{ fontStyle: 'italic', color: '#c44', marginTop: '0.7rem' }}>
          *Esta información es educativa. Consulta a un profesional de la salud antes de usar cualquier tratamiento.
        </p>
      </div>
  {/* Línea café eliminada */}
    </footer>
  );
};

export default Footer;