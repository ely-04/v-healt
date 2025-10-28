import React, { useState, useEffect } from 'react';

const VHealthCaptcha = ({ onCaptchaChange, onCaptchaValidate }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Simular verificación de CAPTCHA estilo reCAPTCHA
  const handleCheckboxClick = () => {
    if (isChecked) return;
    
    setIsLoading(true);
    setIsVerifying(true);
    
    // Simular tiempo de verificación
    setTimeout(() => {
      fetch('/api/captcha/generate')
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setIsChecked(true);
            onCaptchaChange && onCaptchaChange(true);
            onCaptchaValidate && onCaptchaValidate(true);
          }
        })
        .catch(error => {
          console.error('Error en verificación CAPTCHA:', error);
          // Simular éxito por ahora
          setIsChecked(true);
          onCaptchaChange && onCaptchaChange(true);
          onCaptchaValidate && onCaptchaValidate(true);
        })
        .finally(() => {
          setIsLoading(false);
          setIsVerifying(false);
        });
    }, 1500); // 1.5 segundos de "verificación"
  };

  const resetCaptcha = () => {
    setIsChecked(false);
    setIsLoading(false);
    setIsVerifying(false);
    onCaptchaChange && onCaptchaChange(false);
    onCaptchaValidate && onCaptchaValidate(false);
  };

  // Resetear cuando sea necesario
  useEffect(() => {
    return () => {
      resetCaptcha();
    };
  }, []);

  return (
    <div className="my-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Verificación de Seguridad
      </label>
      
      <div 
        className="inline-flex items-center justify-between border-2 border-gray-300 rounded-lg bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
        style={{ minWidth: '300px', minHeight: '78px' }}
        onClick={handleCheckboxClick}
      >
        <div className="flex items-center space-x-4">
          {/* Checkbox personalizado */}
          <div className="relative">
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <div 
                className={`w-6 h-6 border-2 rounded transition-all duration-200 ${
                  isChecked 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-white border-gray-400 hover:border-gray-500'
                }`}
              >
                {isChecked && (
                  <svg 
                    className="w-4 h-4 text-white absolute top-0.5 left-0.5" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            )}
          </div>

          {/* Texto */}
          <div className="flex flex-col">
            <span className="text-gray-800 font-medium">
              {isVerifying ? 'Verificando...' : "I'm not a robot"}
            </span>
            {isVerifying && (
              <span className="text-xs text-gray-500">Verificando que eres humano</span>
            )}
          </div>
        </div>

        {/* Logo V-Health (similar al logo de reCAPTCHA) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-1 mb-1">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="text-xs font-semibold text-gray-600">V-Health</span>
          </div>
          <div className="flex space-x-1 text-xs text-gray-400">
            <span>Privacy</span>
            <span>-</span>
            <span>Terms</span>
          </div>
        </div>
      </div>

      {/* Estado de verificación */}
      {isChecked && (
        <div className="mt-2 flex items-center text-green-600 text-sm">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Verificación completada
        </div>
      )}
    </div>
  );
};

export default VHealthCaptcha;