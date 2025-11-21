import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

const FaceRecognition = ({ onFaceDetected, onError, registeredFaces = [] }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Inicializando...');
  const [accessDeniedCount, setAccessDeniedCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopVideo();
    };
  }, []);

  // Función para comparar rostros con base de datos registrada
  const compareFaces = (currentDescriptor, registeredFaces, threshold = 0.5) => { // ⚠️ ESTRICTO: 0.5 para evitar confusión entre usuarios
    if (!registeredFaces || registeredFaces.length === 0) {
      return { isMatch: false, confidence: 0, matchedUser: null, distance: 1 };
    }

    let bestMatch = null;
    let bestDistance = Infinity;
    let allMatches = []; // Para debugging

    registeredFaces.forEach(registeredFace => {
      if (registeredFace.descriptor && registeredFace.descriptor.length === 128) {
        try {
          // Calcular distancia euclidiana entre descriptores
          const distance = faceapi.euclideanDistance(
            currentDescriptor, 
            new Float32Array(registeredFace.descriptor)
          );
          
          // Guardar todas las distancias para debugging
          allMatches.push({
            userId: registeredFace.id,
            userName: registeredFace.name,
            distance: distance
          });
          
          if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = registeredFace;
          }
        } catch (error) {
          console.warn('Error comparando descriptor:', error);
        }
      }
    });

    const isMatch = bestDistance < threshold;
    const confidence = Math.max(0, Math.min(100, Math.round((1 - bestDistance) * 100)));
    
    // Log de debugging para ver todas las comparaciones
    console.log('🔍 Comparación de rostros:', {
      threshold: threshold,
      bestDistance: bestDistance.toFixed(3),
      isMatch: isMatch,
      confidence: confidence,
      bestMatch: bestMatch ? { id: bestMatch.id, name: bestMatch.name } : null,
      allDistances: allMatches.sort((a, b) => a.distance - b.distance).slice(0, 5)
    });

    return {
      isMatch,
      confidence,
      matchedUser: isMatch ? bestMatch : null,
      distance: bestDistance
    };
  };

  const loadModels = async () => {
    try {
      setDetectionStatus('Configurando TensorFlow.js...');
      
      // Configurar backend de TensorFlow.js
      try {
        // Intentar usar WebGL primero
        await faceapi.tf.setBackend('webgl');
        await faceapi.tf.ready();
        console.log('Backend WebGL configurado correctamente');
      } catch (webglError) {
        console.warn('WebGL no disponible, usando CPU:', webglError);
        // Si WebGL falla, usar CPU
        await faceapi.tf.setBackend('cpu');
        await faceapi.tf.ready();
        console.log('Backend CPU configurado correctamente');
      }
      
      setDetectionStatus('Cargando modelos de IA...');
      
      const MODEL_URL = '/models'; // Los modelos deben estar en public/models/
      
      // Cargar modelos uno por uno para mejor manejo de errores
      console.log('Cargando modelo: tinyFaceDetector');
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      
      console.log('Cargando modelo: faceLandmark68Net');
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      
      console.log('Cargando modelo: faceRecognitionNet');
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      
      console.log('Todos los modelos cargados correctamente');
      setIsLoaded(true);
      setDetectionStatus('Modelos cargados. Iniciando cámara...');
      startVideo();
    } catch (error) {
      console.error('Error cargando modelos:', error);
      setDetectionStatus('Error: Modelos no encontrados en /public/models/');
      onError?.('Error cargando modelos de reconocimiento facial');
    }
  };

  const startVideo = async () => {
    try {
      setDetectionStatus('Solicitando permisos de cámara...');
      
      // Verificar si getUserMedia está disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia no está soportado en este navegador');
      }

      // Intentar obtener permisos de cámara con configuración básica primero
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 720 }, 
            height: { ideal: 560 },
            facingMode: 'user'
          }
        });
      } catch (detailedError) {
        console.warn('Configuración avanzada falló, intentando configuración básica:', detailedError);
        // Si falla, intentar con configuración más simple
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        setDetectionStatus('Cámara lista. Posiciona tu rostro...');
        
        // Asegurar que el video se reproduzca
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(playError => {
            console.error('Error reproduciendo video:', playError);
            setDetectionStatus('Error: No se pudo iniciar el video');
            onError?.('No se pudo iniciar el video de la cámara');
          });
        };
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      
      let errorMessage = 'No se pudo acceder a la cámara.';
      
      if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara conectada.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'La configuración de cámara solicitada no está disponible.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Acceso a cámara bloqueado por razones de seguridad.';
      }
      
      setDetectionStatus(`Error: ${errorMessage}`);
      onError?.(errorMessage);
    }
  };

  const handleVideoPlay = () => {
    if (isLoaded && videoRef.current && !isDetecting) {
      setIsDetecting(true);
      detectFaces();
    }
  };

  const detectFaces = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      // Ajustar canvas al video
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      intervalRef.current = setInterval(async () => {
        if (!video || video.paused || video.ended) return;

        try {
          // Usar configuración más simple para evitar errores
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
              inputSize: 320, // Tamaño más pequeño para mejor rendimiento
              scoreThreshold: 0.5
            }))
            .withFaceLandmarks()
            .withFaceDescriptors();

          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Limpiar canvas
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height);
          
          if (resizedDetections.length > 0) {
            const currentDescriptor = resizedDetections[0].descriptor;
            
            // Verificar si el rostro está registrado (threshold estricto para evitar confusiones)
            const matchResult = compareFaces(currentDescriptor, registeredFaces, 0.5); // ⚠️ ESTRICTO: 0.5 para precisión máxima
            
            // Dibujar detecciones
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            
            if (matchResult.isMatch) {
              // ✅ Rostro registrado - ACCESO PERMITIDO
              setDetectionStatus(`✅ Acceso autorizado: ${matchResult.matchedUser.name || 'Usuario'} (${matchResult.confidence}%)`);
              setAccessDeniedCount(0); // Resetear contador de denegaciones
              
              // Dibujar marco verde para acceso permitido
              const ctx = canvas.getContext('2d');
              ctx.strokeStyle = '#10B981'; // Verde
              ctx.lineWidth = 4;
              const box = resizedDetections[0].detection.box;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              
              // Notificar acceso autorizado
              if (onFaceDetected) {
                onFaceDetected({
                  descriptor: Array.from(currentDescriptor),
                  landmarks: resizedDetections[0].landmarks.positions.map(p => ({ x: p.x, y: p.y })),
                  detection: {
                    box: resizedDetections[0].detection.box,
                    score: resizedDetections[0].detection.score
                  },
                  isRegistered: true,
                  isAuthorized: true,
                  matchedUser: matchResult.matchedUser,
                  confidence: matchResult.confidence,
                  accessGranted: true
                });
              }
            } else {
              // ❌ Rostro NO registrado - ACCESO DENEGADO
              setAccessDeniedCount(prev => prev + 1);
              setDetectionStatus(`❌ Acceso denegado: Rostro no registrado (Confianza: ${matchResult.confidence}%)`);
              
              // Dibujar marco rojo para acceso denegado
              const ctx = canvas.getContext('2d');
              ctx.strokeStyle = '#EF4444'; // Rojo
              ctx.lineWidth = 4;
              const box = resizedDetections[0].detection.box;
              ctx.strokeRect(box.x, box.y, box.width, box.height);
              
              // Notificar acceso denegado
              if (onFaceDetected) {
                onFaceDetected({
                  descriptor: Array.from(currentDescriptor),
                  isRegistered: false,
                  isAuthorized: false,
                  confidence: matchResult.confidence,
                  accessGranted: false,
                  deniedCount: accessDeniedCount + 1,
                  message: 'Acceso denegado: Rostro no está registrado en el sistema'
                });
              }
            }
          } else {
            setDetectionStatus('🔍 Buscando rostro...');
          }
        } catch (detectionError) {
          console.warn('Error en detección de rostro:', detectionError);
          // No mostrar error al usuario por errores menores de detección
          setDetectionStatus('🔍 Procesando...');
        }
      }, 300); // Reducir frecuencia para mejor rendimiento
    } catch (error) {
      console.error('Error configurando detección:', error);
      setDetectionStatus('Error: No se pudo configurar la detección');
      onError?.('Error configurando la detección de rostros');
    }
  };

  const stopVideo = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsDetecting(false);
  };

  return (
    <div className="relative">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          width="720"
          height="560"
          onPlay={handleVideoPlay}
          className="w-full h-auto"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Estado:</span> {detectionStatus}
        </p>
        {isDetecting && (
          <div className="mt-2 flex items-center">
            <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-green-700 text-sm">Detectando rostro en tiempo real</span>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex space-x-2">
        {isDetecting && (
          <button
            onClick={stopVideo}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Detener Detección
          </button>
        )}
        
        {detectionStatus.includes('Error') && (
          <button
            onClick={startVideo}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🔄 Reintentar Cámara
          </button>
        )}
        
        {!isLoaded && (
          <button
            onClick={loadModels}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔄 Recargar Modelos
          </button>
        )}
      </div>
      
      {/* Instrucciones para el usuario */}
      {detectionStatus.includes('Error') && detectionStatus.includes('Permisos') && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🔒 Problema de Permisos</h3>
          <p className="text-yellow-700 text-sm mb-3">
            Para usar el reconocimiento facial necesitas permitir el acceso a la cámara.
          </p>
          <ol className="text-yellow-700 text-sm space-y-1">
            <li>1. Haz clic en el icono de cámara en la barra de direcciones</li>
            <li>2. Selecciona "Permitir" para el acceso a la cámara</li>
            <li>3. Recarga la página si es necesario</li>
            <li>4. Haz clic en "Reintentar Cámara"</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;