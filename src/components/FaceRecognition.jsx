import React, { useRef, useEffect, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js';

const FaceRecognition = ({ onFaceDetected, onError, debug = true }) => {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('Inicializando...');
  const [debugInfo, setDebugInfo] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    init();
    return () => stopVideo?.();
  }, []);

  const init = async () => {
    try {
      // Seleccionar backend con fallback
      try {
        await tf.setBackend('webgl');
        await tf.ready();
      } catch (e) {
        console.warn('WebGL no disponible, usando CPU:', e);
        await tf.setBackend('cpu');
        await tf.ready();
      }

      const MODEL_URL = '/models';
      // Verificar disponibilidad de modelos antes de cargarlos
      try {
        const checks = [
          'tiny_face_detector_model-weights_manifest.json',
          'face_landmark_68_model-weights_manifest.json',
          'face_recognition_model-weights_manifest.json',
        ];
        const results = await Promise.all(
          checks.map((f) => fetch(`${MODEL_URL}/${f}`, { method: 'HEAD' }))
        );
        const missing = results
          .map((r, i) => (!r.ok ? checks[i] : null))
          .filter(Boolean);
        if (missing.length) {
          const msg = `Modelos faltantes/404: ${missing.join(', ')}`;
          console.error(msg);
          setDetectionStatus(`Error cargando modelos: ${missing[0]}`);
          onError?.(msg);
          return;
        }
      } catch (e) {
        console.warn('No se pudo verificar modelos por adelantado:', e);
      }

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      // Marcar modelos como cargados para habilitar la detección
      setIsLoaded(true);

      // Inicia cámara/detección después de que TF esté listo
      await startVideo();
    } catch (err) {
      console.error(err);
      onError?.('No se pudieron inicializar modelos/backends');
    }
  };

  const startVideo = async () => {
    try {
      // Info de permisos
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const status = await navigator.permissions.query({ name: 'camera' });
          setDebugInfo((d) => ({ ...d, cameraPermission: status.state }));
        }
      } catch {}

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setDetectionStatus('Cámara lista. Posiciona tu rostro...');
        // Asegurar inicio cuando las dimensiones estén listas
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo((d) => ({
            ...d,
            backend: tf.getBackend(),
            videoSize: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
            tracks: stream.getVideoTracks().length,
            secureContext: window.isSecureContext,
          }));
          handleVideoPlay();
        };
      }
    } catch (error) {
      console.error('Error accediendo a la cámara:', error);
      setDetectionStatus('Error: No se pudo acceder a la cámara');
      onError?.('No se pudo acceder a la cámara');
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
    
    // Configurar canvas
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    intervalRef.current = setInterval(async () => {
      if (!video || video.paused || video.ended) return;

      try {
        // Usar configuración más simple para evitar errores WebGL
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,  // Reducido para mejor rendimiento
            scoreThreshold: 0.5
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        // Limpiar canvas
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        if (detections.length > 0) {
          setDetectionStatus(`Rostro detectado con ${Math.round(detections[0].detection.score * 100)}% confianza`);
          
          // Redimensionar detecciones
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          // Dibujar solo la caja de detección (sin landmarks para evitar errores)
          faceapi.draw.drawDetections(canvas, resizedDetections);

          // Enviar datos del rostro
          if (onFaceDetected) {
            onFaceDetected({
              descriptor: Array.from(detections[0].descriptor),
              detection: {
                box: detections[0].detection.box,
                score: detections[0].detection.score
              }
            });
          }
        } else {
          setDetectionStatus('No se detecta rostro. Acércate más a la cámara.');
        }
      } catch (error) {
        console.error('Error en detección:', error);
        setDetectionStatus('Error en detección facial');
        
        // Si hay error, intentar reiniciar la detección después de un momento
        setTimeout(() => {
          if (intervalRef.current) {
            setDetectionStatus('Reintentando detección...');
          }
        }, 2000);
      }
    }, 200); // Aumentado el intervalo para reducir carga
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
          playsInline
          width="640"
          height="480"
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
        {debug && (
          <pre className="mt-2 text-xs text-blue-800 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        )}
      </div>
      
      {isDetecting && (
        <button
          onClick={stopVideo}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Detener Detección
        </button>
      )}

      {/* Botón para reiniciar si hay errores */}
      {!isDetecting && isLoaded && (
        <button
          onClick={startVideo}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Reiniciar Cámara
        </button>
      )}
    </div>
  );
};

export default FaceRecognition;