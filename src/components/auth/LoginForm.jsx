import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VHealthCaptcha from '../VHealthCaptcha-test';

const LoginForm = ({ onToggle }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar CAPTCHA antes de enviar
    if (!captchaValid) {
      clearError();
      // Mostrar error de CAPTCHA
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      // El redirect se maneja en el componente padre
    } catch (err) {
      // El error se maneja en el contexto
    }
  };

  const handleCaptchaValidate = (isValid) => {
    setCaptchaValid(isValid);
  };

  // NUEVA FUNCIÓN: navegar a recuperar contraseña
  const handleForgotPassword = () => {
    if (clearError) clearError();
    navigate('/forgot-password');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-8" style={{ boxShadow: '0 4px 8px rgba(241, 228, 190, 0.3)' }}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: '#2d5a27' }}>Iniciar Sesión</h2>
        <p className="text-gray-600 mt-2">Accede a tu cuenta de V-Health</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: '#2d5a27' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition duration-200"
            style={{ 
              focusRingColor: '#97b892',
              '--tw-ring-color': '#97b892',
              backgroundColor: '#ffffff',
              color: '#1f2937',
              fontSize: '16px'
            }}
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: '#2d5a27' }}>
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent pr-12 transition duration-200"
              style={{ 
                focusRingColor: '#97b892',
                '--tw-ring-color': '#97b892',
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontSize: '16px'
              }}
              placeholder="Tu contraseña"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5" style={{ color: '#97b892' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" style={{ color: '#97b892' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* CAPTCHA de Seguridad */}
        <div className="pt-2">
          <VHealthCaptcha 
            onCaptchaValidate={handleCaptchaValidate}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !captchaValid}
          className="w-full text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          style={{ 
            backgroundColor: '#2d5a27',
            focusRingColor: '#97b892'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1e3e1a'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2d5a27'}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Iniciando sesión...
            </div>
          ) : (
            'Iniciar Sesión'
          )}
        </button>

        {/* Botón para recuperar contraseña */}
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-medium"
            style={{ color: '#2d5a27' }}
            onMouseEnter={(e) => e.target.style.color = '#97b892'}
            onMouseLeave={(e) => e.target.style.color = '#2d5a27'}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <button
            onClick={onToggle}
            className="font-medium transition duration-200"
            style={{ color: '#2d5a27' }}
            onMouseEnter={(e) => e.target.style.color = '#97b892'}
            onMouseLeave={(e) => e.target.style.color = '#2d5a27'}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;