import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthSimple = () => {
  const [currentView, setCurrentView] = useState('login'); // login, register, facial
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

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#97b892' }}>
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título principal */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2" style={{ 
            fontFamily: "'Dancing Script', cursive", 
            color: '#222',
            letterSpacing: '0.1em'
          }}>V-Health</h1>
          <p className="text-gray-700 font-medium">Sistema de Salud Inteligente</p>
        </div>

        {/* Formularios */}
        <div className="mt-8">
          {currentView === 'login' && (
            <>
              <LoginForm onToggle={() => setCurrentView('register')} />
              
              {/* Botón de Login Facial - VERSION SIMPLE */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-gray-600">O</span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    console.log('Botón facial clicked!');
                    alert('Botón de reconocimiento facial funcionando! (Función en desarrollo)');
                    setCurrentView('facial');
                  }}
                  className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
                >
                  <span className="mr-2">🔐</span>
                  Acceder con Reconocimiento Facial
                </button>
              </div>
            </>
          )}

          {currentView === 'register' && (
            <>
              <RegisterForm onToggle={() => setCurrentView('login')} />
              <div className="text-center mt-4">
                <button
                  onClick={() => setCurrentView('login')}
                  className="font-medium text-white hover:text-gray-200"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </div>
            </>
          )}

          {currentView === 'facial' && (
            <div className="text-center p-8 bg-white rounded-lg">
              <h2 className="text-2xl font-bold mb-4">🔐 Reconocimiento Facial</h2>
              <p className="text-gray-600 mb-6">
                Funcionalidad en desarrollo...
              </p>
              <button
                onClick={() => setCurrentView('login')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ← Volver al login
              </button>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {currentView === 'login' && (
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
        )}
      </div>
    </div>
  );
};

export default AuthSimple;