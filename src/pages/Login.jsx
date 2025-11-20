import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import FacialLogin from '../components/FacialLogin';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFacialLogin, setShowFacialLogin] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // ...existing code for normal login...

  const handleFacialLoginSuccess = (result) => {
    console.log('Login facial exitoso:', result);
    navigate('/dashboard');
  };

  if (showFacialLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
        <FacialLogin
          onSuccess={handleFacialLoginSuccess}
          onCancel={() => setShowFacialLogin(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#2d5a27' }}>
            V-Health
          </h1>
          <p className="text-gray-600 mt-2">Iniciar Sesión</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ...existing form fields... */}

          {/* Login Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              style={{ backgroundColor: loading ? '#9ca3af' : '#2d5a27' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                '🔐 Iniciar Sesión'
              )}
            </button>

            {/* Facial Login Button */}
            <button
              type="button"
              onClick={() => setShowFacialLogin(true)}
              className="w-full py-3 px-4 border border-blue-300 rounded-md shadow-sm bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              📷 Iniciar con Reconocimiento Facial
            </button>
          </div>
        </form>

        {/* Links */}
        <div className="mt-6 text-center space-y-2">
          <Link 
            to="/forgot-password" 
            className="text-sm text-green-600 hover:text-green-500"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <div>
            <span className="text-sm text-gray-600">¿No tienes cuenta? </span>
            <Link 
              to="/register" 
              className="text-sm text-green-600 hover:text-green-500 font-medium"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;