import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PanelPlantasPDF from '../components/PanelPlantasPDF';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [vistaActiva, setVistaActiva] = useState('principal');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6" style={{ boxShadow: '0 4px 8px rgba(241, 228, 190, 0.3)' }}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2d5a27' }}>
              Bienvenido, {user?.name || user?.fullName}!
            </h1>
            <p className="text-gray-600">
              Te has autenticado exitosamente en V-Health
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg font-medium transition duration-200"
            style={{ 
              backgroundColor: '#2d5a27',
              color: 'white'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3e1a'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2d5a27'}
          >
            Cerrar Sesión
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#2d5a27' }}>Tu Información</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {user?.email}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Rol:</strong> {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Última conexión:</strong> {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Primera vez'}
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#2d5a27' }}>Seguridad</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-green-600">
                <span className="mr-2">✅</span>
                Contraseña encriptada
              </div>
              <div className="flex items-center text-sm text-green-600">
                <span className="mr-2">✅</span>
                Sesión autenticada con JWT
              </div>
              <div className="flex items-center text-sm text-green-600">
                <span className="mr-2">✅</span>
                Conexión segura
              </div>
              <div className="mt-3">
                <button
                  onClick={() => navigate('/add-face-auth')}
                  className="inline-block px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔐 Configurar Login Facial
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#2d5a27' }}>Próximamente</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🔐</span>
                CAPTCHA en login
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">📄</span>
                Firma digital PDF
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">🔒</span>
                Cifrado combinado
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="border-b border-gray-200 mb-6 mt-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setVistaActiva('principal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActiva === 'principal'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏠 Panel Principal
            </button>
            <button
              onClick={() => setVistaActiva('plantas-pdf')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                vistaActiva === 'plantas-pdf'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 PDFs de Plantas
            </button>
          </nav>
        </div>

        {/* Contenido según la vista activa */}
        {vistaActiva === 'principal' && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#2d5a27' }}>Navegación</h3>
            <p className="text-sm text-gray-600 mb-4">
              Ahora puedes navegar por todas las secciones de V-Health de forma segura.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => navigate('/')}
                className="px-3 py-1 rounded text-sm font-medium transition duration-200"
                style={{ 
                  backgroundColor: '#97b892',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#7a9a75'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#97b892'}
              >
                Inicio
              </button>
              <button 
                onClick={() => navigate('/plantas')}
                className="px-3 py-1 rounded text-sm font-medium transition duration-200"
                style={{ 
                  backgroundColor: '#97b892',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#7a9a75'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#97b892'}
              >
                Plantas Medicinales
              </button>
              <button 
                onClick={() => navigate('/enfermedades')}
                className="px-3 py-1 rounded text-sm font-medium transition duration-200"
                style={{ 
                  backgroundColor: '#97b892',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#7a9a75'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#97b892'}
              >
                Enfermedades
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">📄 Nueva Funcionalidad</h4>
              <p className="text-green-700">
                ¡Ahora puedes generar PDFs firmados digitalmente de plantas medicinales! 
                Ve a la sección "Plantas Medicinales" y haz clic en "Descargar PDF Firmado" 
                en cualquier planta para obtener un documento con firma digital RSA-SHA256.
              </p>
            </div>
          </div>
        )}

        {vistaActiva === 'plantas-pdf' && (
          <PanelPlantasPDF />
        )}
      </div>
    </div>
  );
};

export default Dashboard;