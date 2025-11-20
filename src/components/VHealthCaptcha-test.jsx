import React, { useState, useEffect } from 'react';

const VHealthCaptcha = ({ onCaptchaChange, onCaptchaValidate }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-activar el CAPTCHA después de 1 segundo para facilitar las pruebas
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecked(true);
      onCaptchaChange && onCaptchaChange(true);
      onCaptchaValidate && onCaptchaValidate(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [onCaptchaChange, onCaptchaValidate]);

  // Simular verificación de CAPTCHA estilo reCAPTCHA
  const handleCheckboxClick = () => {
    if (isChecked) return;
    
    setIsLoading(true);
    
    // Simular tiempo de verificación
    setTimeout(() => {
      setIsChecked(true);
      onCaptchaChange && onCaptchaChange(true);
      onCaptchaValidate && onCaptchaValidate(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="my-4 bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-center space-x-3">
        {/* Checkbox personalizado */}
        <div 
          className={`relative w-6 h-6 border-2 rounded cursor-pointer transition-all duration-300 ${
            isChecked 
              ? 'bg-green-500 border-green-500' 
              : isLoading 
                ? 'bg-gray-200 border-gray-300' 
                : 'border-gray-400 hover:border-gray-500'
          }`}
          onClick={handleCheckboxClick}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {isChecked && !isLoading && (
            <svg 
              className="w-4 h-4 text-white absolute inset-0 m-auto" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Texto de verificación */}
        <div className="flex flex-col">
          <span className="text-sm text-gray-700 font-medium">
            {isLoading ? 'Verificando...' : isChecked ? '✓ Verificado' : 'No soy un robot'}
          </span>
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
          </div>
        </div>
        
        {/* Logo simulado de VHealth */}
        <div className="ml-auto">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-1">
              <span className="text-white text-xs font-bold">VH</span>
            </div>
            <span className="text-xs text-gray-500">VHealth</span>
          </div>
        </div>
      </div>

      {/* Información de privacidad */}
      {isChecked && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Verificación de seguridad VHealth completada</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VHealthCaptcha;