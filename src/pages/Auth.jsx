import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, isLoading } = useAuth();

  // Si ya está autenticado, redirigir al dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Mostrar loading mientras se verifica el token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#97b892' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título principal */}
        <div className="text-center">
          <div className="mx-auto mb-4">
            <span className="text-6xl">🌿</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: "'Dancing Script', cursive", 
            color: '#222',
            letterSpacing: '0.1em'
          }}>V-Health</h1>
          <p className="text-gray-700 font-medium">Sistema de Salud Inteligente</p>
        </div>

        {/* Formularios */}
        <div className="mt-8">
          {isLogin ? (
            <LoginForm onToggle={toggleForm} />
          ) : (
            <RegisterForm onToggle={toggleForm} />
          )}
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <div className="mt-6 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
            <h3 className="text-sm font-medium mb-2" style={{ color: '#2d5a27' }}>¿Por qué elegir V-Health?</h3>
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-700">
              <div className="flex items-center justify-center">
                <span className="mr-2">🌱</span>
                Información confiable sobre plantas medicinales
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">📚</span>
                Base de datos actualizada de enfermedades
              </div>
              <div className="flex items-center justify-center">
                <span className="mr-2">🔒</span>
                Interfaz segura y fácil de usar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;