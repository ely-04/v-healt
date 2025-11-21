import React, { useState, useRef } from 'react';
import FaceRecognition from './FaceRecognition';

const FaceRegistration = ({ userData, onComplete, onSkip }) => {
  const [step, setStep] = useState(1); // 1: instrucciones, 2: captura, 3: confirmación
  const [capturedFaces, setCapturedFaces] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState('ready');
  const [message, setMessage] = useState('');
  const captureCount = useRef(0);
  const requiredCaptures = 5; // Número de capturas para mayor precisión

  const startCapture = () => {
    setStep(2);
    setIsCapturing(true);
    setStatus('capturing');
    setMessage('Mantén tu rostro centrado. Capturando...');
    captureCount.current = 0;
    setCapturedFaces([]);
  };

  const handleFaceDetected = async (faceData) => {
    if (!isCapturing || status !== 'capturing') return;

    // Verificar calidad de la detección
    if (faceData.detection.score < 0.8) {
      setMessage('Calidad baja. Mejora la iluminación y mantente centrado.');
      return;
    }

    // Capturar rostro cada 1 segundo aproximadamente
    if (captureCount.current < requiredCaptures) {
      captureCount.current++;
      
      setCapturedFaces(prev => [...prev, {
        id: captureCount.current,
        descriptor: faceData.descriptor,
        score: faceData.detection.score,
        timestamp: new Date()
      }]);

      setMessage(`Captura ${captureCount.current}/${requiredCaptures} completada. ${
        captureCount.current < requiredCaptures ? 'Mantén la posición...' : '¡Excelente!'
      }`);

      // Si completamos todas las capturas
      if (captureCount.current >= requiredCaptures) {
        setIsCapturing(false);
        setStatus('processing');
        setMessage('Procesando datos faciales...');
        
        setTimeout(() => {
          setStep(3);
          setStatus('ready');
          setMessage('Registro facial completado exitosamente');
        }, 2000);
      }
    }
  };

  const handleError = (error) => {
    setStatus('error');
    setMessage(`Error: ${error}`);
    setIsCapturing(false);
  };

  const confirmRegistration = async () => {
    setStatus('saving');
    setMessage('Guardando perfil facial...');

    // DEBUG: Verificar datos antes de enviar
    console.log('🔍 DEBUG FaceRegistration - userData:', userData);
    console.log('🔍 DEBUG FaceRegistration - userData.id:', userData?.id);
    console.log('🔍 DEBUG FaceRegistration - capturedFaces:', capturedFaces.length);

    if (!userData || !userData.id) {
      console.error('❌ ERROR: userData o userData.id no está disponible');
      setStatus('error');
      setMessage('Error: Datos de usuario no disponibles. Reintenta el registro.');
      return;
    }

    try {
      // Calcular descriptor promedio para mayor precisión
      const avgDescriptor = calculateAverageDescriptor(capturedFaces);
      
      if (!avgDescriptor) {
        console.error('❌ ERROR: No se pudo calcular descriptor facial');
        setStatus('error');
        setMessage('Error: No se pudo procesar los datos faciales. Reintenta la captura.');
        return;
      }

      console.log('📤 Enviando datos faciales:', {
        userId: userData.id,
        descriptorLength: avgDescriptor.length,
        capturesCount: capturedFaces.length
      });

      const response = await fetch('/api/auth/register-face', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          faceDescriptor: avgDescriptor,
          captureData: {
            totalCaptures: capturedFaces.length,
            avgConfidence: capturedFaces.reduce((sum, face) => sum + face.score, 0) / capturedFaces.length,
            timestamps: capturedFaces.map(face => face.timestamp)
          }
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('¡Registro facial completado exitosamente!');
        setTimeout(() => onComplete(result), 2000);
      } else {
        throw new Error(result.message || 'Error guardando datos faciales');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setStatus('error');
      setMessage('Error guardando el registro facial. Intenta nuevamente.');
    }
  };

  const calculateAverageDescriptor = (faces) => {
    if (!faces.length) return null;
    
    const descriptorLength = faces[0].descriptor.length;
    const avgDescriptor = new Array(descriptorLength).fill(0);
    
    faces.forEach(face => {
      face.descriptor.forEach((value, index) => {
        avgDescriptor[index] += value;
      });
    });
    
    return avgDescriptor.map(sum => sum / faces.length);
  };

  const restartCapture = () => {
    setStep(2);
    setIsCapturing(true);
    setStatus('capturing');
    captureCount.current = 0;
    setCapturedFaces([]);
    setMessage('Reiniciando captura...');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-600">Paso {step} de 3</span>
          <span className="text-sm text-gray-500">Registro Facial</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Step 1: Instrucciones */}
      {step === 1 && (
        <div className="text-center">
          <div className="text-6xl mb-6">👤</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Configurar Reconocimiento Facial
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Para habilitar el acceso con reconocimiento facial, necesitamos capturar algunas imágenes de tu rostro. 
            Este proceso es seguro y los datos se almacenan de forma encriptada.
          </p>

          {/* Instrucciones detalladas */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-blue-800 mb-4">📋 Instrucciones importantes:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-700 mb-2">✅ Lo que SÍ debes hacer:</h4>
                <ul className="text-blue-600 space-y-1 text-sm">
                  <li>• Buena iluminación frontal</li>
                  <li>• Rostro centrado y completo</li>
                  <li>• Mirar directamente a la cámara</li>
                  <li>• Mantener expresión neutra</li>
                  <li>• Estar en un lugar tranquilo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">❌ Lo que NO debes hacer:</h4>
                <ul className="text-red-600 space-y-1 text-sm">
                  <li>• Usar gafas de sol o máscaras</li>
                  <li>• Moverte durante la captura</li>
                  <li>• Tener poca iluminación</li>
                  <li>• Inclinar demasiado la cabeza</li>
                  <li>• Obstruir parte del rostro</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              ⏭️ Saltar por ahora
            </button>
            <button
              onClick={startCapture}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              📸 Comenzar Captura
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Captura */}
      {step === 2 && (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Capturando Rostro
            </h2>
            <p className="text-gray-600">
              {captureCount.current}/{requiredCaptures} capturas completadas
            </p>
          </div>

          {/* Status Bar */}
          <div className={`p-4 rounded-lg mb-6 text-center ${
            status === 'capturing' ? 'bg-blue-50 border border-blue-200' :
            status === 'processing' ? 'bg-purple-50 border border-purple-200' :
            status === 'error' ? 'bg-red-50 border border-red-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center justify-center space-x-2">
              {status === 'processing' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              )}
              <span className={`font-medium ${
                status === 'capturing' ? 'text-blue-700' :
                status === 'processing' ? 'text-purple-700' :
                status === 'error' ? 'text-red-700' :
                'text-green-700'
              }`}>
                {message}
              </span>
            </div>
          </div>

          {/* Face Recognition Component */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <FaceRecognition
              onFaceDetected={handleFaceDetected}
              onError={handleError}
            />
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center space-x-2 mb-6">
            {[...Array(requiredCaptures)].map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  index < captureCount.current ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Volver a instrucciones
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmación */}
      {step === 3 && (
        <div className="text-center">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            ¡Captura Completada!
          </h2>
          <p className="text-gray-600 mb-8">
            Hemos capturado {capturedFaces.length} imágenes de tu rostro exitosamente.
          </p>

          {/* Resumen */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-800 mb-4">📊 Resumen de Captura</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{capturedFaces.length}</div>
                <div className="text-sm text-gray-600">Capturas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(capturedFaces.reduce((sum, face) => sum + face.score, 0) / capturedFaces.length * 100)}%
                </div>
                <div className="text-sm text-gray-600">Confianza</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">Alta</div>
                <div className="text-sm text-gray-600">Calidad</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4 justify-center">
            <button
              onClick={restartCapture}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              🔄 Capturar Nuevamente
            </button>
            <button
              onClick={confirmRegistration}
              disabled={status === 'saving'}
              className={`px-8 py-3 rounded-lg font-medium ${
                status === 'saving' 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {status === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                  Guardando...
                </>
              ) : (
                '💾 Confirmar Registro'
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default FaceRegistration;