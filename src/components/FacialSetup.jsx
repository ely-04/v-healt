import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FaceRegistration from '../components/FaceRegistration';

const FacialSetup = ({ onBack, onComplete }) => {
  const { user } = useAuth();
  const [hasExistingFace, setHasExistingFace] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingFaceRegistration();
  }, []);

  const checkExistingFaceRegistration = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facial/registered-faces');
      if (response.ok) {
        const result = await response.json();
        const userHasFace = result.faces.some(face => face.id === user.id);
        setHasExistingFace(userHasFace);
      }
    } catch (error) {
      console.error('Error verificando registro facial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationComplete = () => {
    setHasExistingFace(true);
    if (onComplete) {
      onComplete();
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuración facial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700"
        >
          ← Volver
        </button>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🔐 Configuración de Login Facial
        </h1>
        <p className="text-gray-600">
          {hasExistingFace 
            ? 'Tu rostro ya está registrado en el sistema'
            : 'Configura el acceso rápido con reconocimiento facial'
          }
        </p>
      </div>

      {hasExistingFace ? (
        /* Usuario ya tiene rostro registrado */
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Reconocimiento Facial Configurado
              </h3>
              <p className="text-green-700 mb-4">
                Tu rostro está registrado correctamente en el sistema
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">✨ Beneficios</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Acceso instantáneo sin contraseña</li>
                    <li>• Mayor seguridad biométrica</li>
                    <li>• Login automático con tu rostro</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-2">🚀 Cómo usar</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Usar el botón "Login Facial"</li>
                    <li>• Posicionar rostro frente a cámara</li>
                    <li>• Acceso automático al sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Opciones para usuario con rostro registrado */}
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="font-semibold text-gray-800 mb-4">⚙️ Opciones de Configuración</h4>
            <div className="space-y-4">
              <button 
                onClick={() => setHasExistingFace(false)}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🔄</span>
                  <div>
                    <h5 className="font-medium text-gray-800">Registrar Nuevamente</h5>
                    <p className="text-sm text-gray-600">Actualizar tu información facial</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={onBack}
                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-4">🏠</span>
                  <div>
                    <h5 className="font-medium text-gray-800">Volver al Dashboard</h5>
                    <p className="text-sm text-gray-600">Continuar usando la aplicación</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Usuario necesita registrar rostro */
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Instrucciones Importantes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• Mantén tu rostro centrado en la cámara</li>
              <li>• No uses gafas oscuras o gorros que cubran tu rostro</li>
              <li>• Se tomarán 5 capturas para mayor precisión</li>
              <li>• Una vez registrado, podrás usar el login facial</li>
            </ul>
          </div>

          <FaceRegistration
            userData={user}
            onComplete={handleRegistrationComplete}
            onSkip={onBack}
          />
        </div>
      )}
    </div>
  );
};

export default FacialSetup;