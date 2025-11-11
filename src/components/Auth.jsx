import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';
import './Footer.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <header className="header sticky top-0 z-50 bg-white shadow-lg animate-fade-in transition-all duration-500">
      <div className="container flex items-center justify-between py-3 px-6">
        <div className="logo flex items-center gap-2">
          <h1 className="text-3xl font-extrabold text-[#2d5a27] font-serif tracking-tight">V-HEALT</h1>
        </div>
        <nav className="nav flex gap-6 items-center">
          <Link to="/" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">HOME</Link>
          <Link to="/plantas" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">PLANTAS MEDICINALES</Link>
          <Link to="/enfermedades" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">ENFERMEDADES</Link>
          <Link to="/contacto" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">CONTACTO</Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">
                DASHBOARD
              </Link>
              <span className="text-sm text-gray-600">Hola, {user?.fullName}</span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded text-sm font-medium transition-colors duration-200"
                style={{ 
                  backgroundColor: '#2d5a27',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3e1a'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2d5a27'}
              >
                SALIR
              </button>
            </div>
          ) : (
            <Link to="/auth" className="nav-link text-[#c4a484] font-semibold hover:text-[#2d5a27] transition-colors duration-200">
              INICIAR SESIÓN
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;