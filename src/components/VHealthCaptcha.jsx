import React, { useState, useEffect } from 'react';

const VHealthCaptcha = ({ onCaptchaChange, onCaptchaValidate }) => {
  const [captchaCode, setCaptchaCode] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Generar código CAPTCHA desde el backend
  const generateCaptcha = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/captcha/generate');
      const data = await response.json();
      
      if (data.success) {
        setCaptchaCode(data.code);
        setSessionId(data.sessionId);
        setUserInput('');
        setIsValid(false);
        onCaptchaChange && onCaptchaChange(false);
      }
    } catch (error) {
      console.error('Error generando CAPTCHA:', error);
      // Fallback a generación local
      generateLocalCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // Generar código CAPTCHA local como fallback
  const generateLocalCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setSessionId('local-' + Date.now());
  };

  // Regenerar CAPTCHA
  const refreshCaptcha = () => {
    generateCaptcha();
  };

  // Validar CAPTCHA
  const validateCaptcha = async (input) => {
    if (sessionId.startsWith('local-')) {
      // Validación local
      const valid = input.toLowerCase() === captchaCode.toLowerCase();
      setIsValid(valid);
      onCaptchaValidate && onCaptchaValidate(valid);
      return valid;
    }

    try {
      const response = await fetch('/api/captcha/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          code: input
        })
      });

      const data = await response.json();
      const valid = data.success && data.valid;
      
      setIsValid(valid);
      onCaptchaValidate && onCaptchaValidate(valid);
      return valid;
    } catch (error) {
      console.error('Error validando CAPTCHA:', error);
      // Fallback a validación local
      const valid = input.toLowerCase() === captchaCode.toLowerCase();
      setIsValid(valid);
      onCaptchaValidate && onCaptchaValidate(valid);
      return valid;
    }
  };

  // Manejar cambio de input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    if (value.length === captchaCode.length) {
      validateCaptcha(value);
    } else {
      setIsValid(false);
      onCaptchaValidate && onCaptchaValidate(false);
    }
  };

  // Inicializar CAPTCHA
  useEffect(() => {
    generateCaptcha();
  }, []);

  return (
    <div className="captcha-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Verificación de Seguridad
      </label>
      
      {/* Código CAPTCHA Visual */}
      <div className="mb-3 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="captcha-code-display">
            <span 
              className="text-2xl font-bold text-green-800 select-none tracking-widest"
              style={{
                fontFamily: 'monospace',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                transform: 'rotate(-2deg)',
                display: 'inline-block'
              }}
            >
              {captchaCode.split('').map((char, index) => (
                <span 
                  key={index}
                  style={{
                    display: 'inline-block',
                    transform: `rotate(${Math.random() * 20 - 10}deg)`,
                    margin: '0 2px',
                    color: `hsl(${120 + Math.random() * 60}, 70%, ${30 + Math.random() * 20}%)`
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </div>
          
          <button
            type="button"
            onClick={refreshCaptcha}
            disabled={isLoading}
            className="ml-3 p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50"
            title="Generar nuevo código"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
          </button>
        </div>
        
        <p className="text-xs text-green-600 mt-2">
          🌿 Ingresa el código mostrado arriba para verificar que eres humano
        </p>
      </div>

      {/* Input para el código */}
      <div className="relative">
        <input
          type="text"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Ingresa el código CAPTCHA"
          className={`w-full px-4 py-3 border-2 rounded-lg text-center tracking-widest font-mono text-lg transition-colors ${
            userInput.length === 0 
              ? 'border-gray-300 focus:border-green-500' 
              : isValid 
                ? 'border-green-500 bg-green-50 text-green-800' 
                : 'border-red-500 bg-red-50 text-red-800'
          } focus:outline-none focus:ring-2 focus:ring-green-200`}
          maxLength={captchaCode.length}
          autoComplete="off"
          spellCheck="false"
        />
        
        {/* Indicador visual de validación */}
        {userInput.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isValid ? (
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            ) : userInput.length === captchaCode.length ? (
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            ) : null}
          </div>
        )}
      </div>

      {/* Mensaje de estado */}
      {userInput.length > 0 && (
        <div className={`mt-2 text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
          {isValid ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
              ✅ Verificación completada
            </span>
          ) : userInput.length === captchaCode.length ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              ❌ Código incorrecto, intenta de nuevo
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default VHealthCaptcha;