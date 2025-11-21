import React, { useState, useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import FaceRecognition from './FaceRecognition-fixed';

const FacialLogin = ({ onBack }) => {
  const { loginDirect } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, scanning, processing, success, error
  const [message, setMessage] = useState('');
  const [registeredFaces, setRegisteredFaces] = useState([]);
  const [isLoadingFaces, setIsLoadingFaces] = useState(false);

  // Cargar rostros registrados al inicializar
  useEffect(() => {
    loadRegisteredFaces();
  }, []);

  const loadRegisteredFaces = async () => {
    setIsLoadingFaces(true);
    try {
      const response = await fetch('/api/facial/registered-faces');
      if (response.ok) {
        const result = await response.json();
        setRegisteredFaces(result.faces || []);
        console.log(`✅ Cargados ${result.faces?.length || 0} rostros registrados`);
      } else {
        console.warn('No se pudieron cargar rostros registrados');
        setRegisteredFaces([]);
      }
    } catch (error) {
      console.error('Error cargando rostros registrados:', error);
      setRegisteredFaces([]);
    } finally {
      setIsLoadingFaces(false);
    }
  };

  const startFacialLogin = () => {
    setIsScanning(true);
    setStatus('scanning');
    setMessage('Posiciona tu rostro frente a la cámara...');
  };

  const handleFaceDetected = async (faceData) => {
    if (status !== 'scanning') return;

    // ✅ Solo procesar si el rostro está autorizado
    if (!faceData.accessGranted) {
      setMessage(`❌ ${faceData.message || 'Rostro no autorizado'}`);
      return; // No continuar con login
    }

    setStatus('processing');
    setMessage(`🔄 Verificando usuario: ${faceData.matchedUser?.name || 'Usuario'}...`);

    // DEBUG: Logs para ver qué datos se están enviando
    console.log('🔍 DEBUG FacialLogin - faceData completo:', faceData);
    console.log('🔍 DEBUG FacialLogin - matchedUser:', faceData.matchedUser);
    console.log('🔍 DEBUG FacialLogin - isAuthorized:', faceData.isAuthorized);

    const dataToSend = {
      userId: faceData.matchedUser?.id || faceData.matchedUser?.userId,
      userName: faceData.matchedUser?.name || faceData.matchedUser?.fullName,
      faceDescriptor: faceData.descriptor,
      confidence: faceData.confidence,
      isAuthorized: faceData.isAuthorized,
      matchedUser: faceData.matchedUser
    };

    console.log('🔍 DEBUG FacialLogin - Datos a enviar:', dataToSend);

    try {
      // Enviar datos del usuario autorizado al backend
      const response = await fetch('/api/auth/facial-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setMessage(`¡Bienvenido ${result.user.fullName || result.user.name || faceData.matchedUser?.name}!`);
        
        // Usar el contexto para establecer la sesión
        await loginDirect(result.user, result.token);
        
        // Redirigir al dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
        
      } else {
        setStatus('error');
        setMessage(result.message || 'Rostro no reconocido. Intenta nuevamente.');
        setTimeout(() => {
          setStatus('scanning');
          setMessage('Posiciona tu rostro frente a la cámara...');
        }, 3000);
      }
    } catch (error) {
      console.error('Error en login facial:', error);
      setStatus('error');
      setMessage('Error de conexión. Verifica tu internet.');
    }
  };

  const handleError = (error) => {
    setStatus('error');
    setMessage(error);
    setIsScanning(false);
  };

  const stopScanning = () => {
    setIsScanning(false);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          🔐 Login Facial
        </h2>
        <p className="text-gray-600">
          Accede de forma segura usando reconocimiento facial
        </p>
      </div>

      {/* Status Bar */}
      <div className={`p-4 rounded-lg mb-6 text-center ${
        status === 'idle' ? 'bg-blue-50 border border-blue-200' :
        status === 'scanning' ? 'bg-yellow-50 border border-yellow-200' :
        status === 'processing' ? 'bg-purple-50 border border-purple-200' :
        status === 'success' ? 'bg-green-50 border border-green-200' :
        'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {status === 'processing' && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
          )}
          {status === 'success' && <span className="text-green-600">✅</span>}
          {status === 'error' && <span className="text-red-600">❌</span>}
          {status === 'scanning' && <span className="text-yellow-600">👁️</span>}
          {status === 'idle' && <span className="text-blue-600">🎯</span>}
          
          <span className={`font-medium ${
            status === 'idle' ? 'text-blue-700' :
            status === 'scanning' ? 'text-yellow-700' :
            status === 'processing' ? 'text-purple-700' :
            status === 'success' ? 'text-green-700' :
            'text-red-700'
          }`}>
            {message || 'Listo para comenzar reconocimiento facial'}
          </span>
        </div>
      </div>

      {/* Face Recognition Area */}
      {isLoadingFaces ? (
        <div className="bg-yellow-50 rounded-xl p-12 text-center mb-6">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-yellow-700 font-medium">Cargando base de datos facial...</p>
        </div>
      ) : isScanning ? (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <FaceRecognition
            onFaceDetected={handleFaceDetected}
            onError={handleError}
            registeredFaces={registeredFaces}
          />
          
          {/* Info de rostros registrados */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Base de datos:</span> {registeredFaces.length} rostro(s) registrado(s)
            </p>
            {registeredFaces.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ No hay rostros registrados. Solo administradores pueden registrar usuarios.
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 rounded-xl p-12 text-center mb-6">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-gray-600 mb-4">
            Haz clic para iniciar el reconocimiento facial
          </p>
          <button
            onClick={startFacialLogin}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Iniciar Reconocimiento
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center space-x-2"
        >
          <span>←</span>
          <span>Volver al login tradicional</span>
        </button>
        
        {isScanning && (
          <button
            onClick={stopScanning}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            🛑 Detener
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">📋 Instrucciones:</h3>
        <ul className="text-blue-700 space-y-1 text-sm">
          <li>• Asegúrate de tener buena iluminación</li>
          <li>• Mantén tu rostro centrado en la cámara</li>
          <li>• No uses gafas de sol o máscaras</li>
          <li>• Mantén el rostro estable por unos segundos</li>
          <li>• El sistema te reconocerá automáticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default FacialLogin;