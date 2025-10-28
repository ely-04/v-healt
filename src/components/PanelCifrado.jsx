import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PanelCifrado = () => {
  const { user } = useAuth();
  const [mensaje, setMensaje] = useState('');
  const [resultado, setResultado] = useState(null);
  const [operacion, setOperacion] = useState('cifrar');
  const [loading, setLoading] = useState(false);

  // Solo permitir acceso a administradores
  if (!user || user.rol !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ❌ Acceso denegado. Solo administradores.
        </div>
      </div>
    );
  }

  const manejarOperacion = async () => {
    if (!mensaje.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response;

      if (operacion === 'cifrar') {
        response = await fetch('/api/crypto/encrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: mensaje,
            type: 'medical'
          })
        });
      } else {
        // Para descifrar, asumir que mensaje contiene un JSON del paquete cifrado
        const paqueteCifrado = JSON.parse(mensaje);
        response = await fetch('/api/crypto/decrypt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            encryptedPackage: paqueteCifrado,
            type: 'medical'
          })
        });
      }

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      setResultado({
        success: false,
        message: 'Error: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const copiarAlPortapapeles = (texto) => {
    navigator.clipboard.writeText(texto);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header oculto */}
        <div className="bg-gray-800 text-white p-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold">🔐 Panel de Cifrado Interno</h1>
          <p className="text-gray-300 mt-2">
            Sistema de demostración RSA-2048 + AES-256 | Solo para evaluación académica
          </p>
          <div className="text-sm text-yellow-200 mt-2">
            ⚠️ Acceso restringido - Usuario: {user.nombre} | Rol: {user.rol}
          </div>
        </div>

        {/* Panel de operaciones */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Operación
            </label>
            <select
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="cifrar">🔒 Cifrar Datos</option>
              <option value="descifrar">🔓 Descifrar Datos</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {operacion === 'cifrar' ? 'Datos a cifrar' : 'Paquete cifrado (JSON)'}
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder={operacion === 'cifrar' 
                ? 'Ej: Información médica confidencial del paciente...'
                : 'Pegar aquí el JSON del paquete cifrado completo'
              }
              className="w-full p-3 border border-gray-300 rounded-md h-32"
              style={{
                backgroundColor: '#ffffff',
                color: '#1f2937',
                fontSize: '16px'
              }}
            />
          </div>

          <button
            onClick={manejarOperacion}
            disabled={loading || !mensaje.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : (operacion === 'cifrar' ? '🔒 Cifrar' : '🔓 Descifrar')}
          </button>
        </div>

        {/* Resultados */}
        {resultado && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">
              📊 Resultado de {operacion === 'cifrar' ? 'Cifrado' : 'Descifrado'}
            </h3>
            
            {resultado.success ? (
              <div className="space-y-4">
                {operacion === 'cifrar' && resultado.encrypted && (
                  <>
                    <div className="bg-green-50 border border-green-200 p-4 rounded">
                      <p className="text-sm text-green-700 mb-2">
                        ✅ <strong>Algoritmo:</strong> {resultado.encrypted.algorithm}
                      </p>
                      <p className="text-sm text-green-700">
                        📅 <strong>Timestamp:</strong> {resultado.encrypted.timestamp}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🔑 Clave AES cifrada (RSA-2048):
                        </label>
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                          {resultado.encrypted.encryptedKey.substring(0, 100)}...
                          <button
                            onClick={() => copiarAlPortapapeles(resultado.encrypted.encryptedKey)}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            📋 Copiar
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          📦 Datos cifrados (AES-256):
                        </label>
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all">
                          {resultado.encrypted.encryptedData.substring(0, 100)}...
                          <button
                            onClick={() => copiarAlPortapapeles(resultado.encrypted.encryptedData)}
                            className="ml-2 text-blue-600 hover:underline"
                          >
                            📋 Copiar
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          🎲 Vector de Inicialización (IV):
                        </label>
                        <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                          {resultado.encrypted.iv}
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                        <p className="text-sm text-blue-700 mb-2">
                          📋 <strong>Paquete completo para descifrar:</strong>
                        </p>
                        <textarea
                          readOnly
                          value={JSON.stringify(resultado.encrypted, null, 2)}
                          className="w-full text-xs font-mono bg-white border p-2 rounded h-32"
                        />
                        <button
                          onClick={() => copiarAlPortapapeles(JSON.stringify(resultado.encrypted, null, 2))}
                          className="mt-2 text-blue-600 hover:underline text-sm"
                        >
                          📋 Copiar paquete completo
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {operacion === 'descifrar' && resultado.decrypted && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-sm text-green-700 mb-2">
                      ✅ <strong>Datos descifrados exitosamente:</strong>
                    </p>
                    <div className="bg-white border p-3 rounded font-mono text-sm">
                      {typeof resultado.decrypted === 'object' 
                        ? JSON.stringify(resultado.decrypted, null, 2)
                        : resultado.decrypted}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded">
                <p className="text-red-700">❌ {resultado.message}</p>
              </div>
            )}
          </div>
        )}

        {/* Información técnica */}
        <div className="bg-gray-50 border border-gray-200 p-4 rounded mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            🔧 Especificaciones Técnicas Implementadas:
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✅ RSA-2048 para cifrado asimétrico de claves</li>
            <li>✅ AES-256-CTR para cifrado simétrico de datos</li>
            <li>✅ Cifrado híbrido (combinación RSA + AES)</li>
            <li>✅ Vectores de inicialización únicos por operación</li>
            <li>✅ Firma digital SHA-256 + RSA</li>
            <li>✅ APIs RESTful con autenticación JWT</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PanelCifrado;