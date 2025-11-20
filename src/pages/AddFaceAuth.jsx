import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FaceRegistration from '../components/FaceRegistration';

const AddFaceAuth = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('intro'); // intro, register, success

  const handleRegistrationComplete = (result) => {
    setStep('success');
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para configurar el reconocimiento facial
          </p>
          <button 
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {step === 'intro' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">🔐</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Configurar Reconocimiento Facial
              </h1>
              <p className="text-gray-600 mb-6">
                Hola <strong>{user.name}</strong>, puedes agregar reconocimiento facial 
                a tu cuenta para acceder de forma más rápida y segura.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">✅</div>
                  <h3 className="font-semibold text-green-800 mb-2">Ventajas</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Acceso instantáneo sin contraseña</li>
                    <li>• Mayor seguridad biométrica</li>
                    <li>• Proceso de login más rápido</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-semibold text-blue-800 mb-2">Seguridad</h3>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Datos encriptados localmente</li>
                    <li>• No se almacenan imágenes</li>
                    <li>• Solo características matemáticas</li>
                  </ul>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={handleSkip}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  ⏭️ Quizás más tarde
                </button>
                <button
                  onClick={() => setStep('register')}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  🚀 Configurar Ahora
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'register' && (
          <FaceRegistration
            userData={user}
            onComplete={handleRegistrationComplete}
            onSkip={handleSkip}
          />
        )}

        {step === 'success' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                ¡Reconocimiento Facial Configurado!
              </h1>
              <p className="text-gray-600 mb-8">
                Tu rostro ha sido registrado exitosamente. Ahora puedes usar 
                el reconocimiento facial para acceder a tu cuenta.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h3 className="font-bold text-green-800 mb-3">
                  🎯 ¿Cómo usar el login facial?
                </h3>
                <ol className="text-green-700 space-y-2 text-left">
                  <li>1. Ve a la página de login</li>
                  <li>2. Haz clic en "Acceder con Reconocimiento Facial"</li>
                  <li>3. Permite el acceso a la cámara</li>
                  <li>4. Posiciona tu rostro frente a la cámara</li>
                  <li>5. ¡Acceso automático!</li>
                </ol>
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  📊 Ir al Dashboard
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                >
                  🧪 Probar Login Facial
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddFaceAuth;