import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
              ¡Bienvenido, {user?.name}! 🌿
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

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#2d5a27' }}>Navegación</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ahora puedes navegar por todas las secciones de V-Health de forma segura.
          </p>
          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;