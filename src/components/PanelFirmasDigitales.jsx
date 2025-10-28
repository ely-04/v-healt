import React, { useState, useEffect } from 'react';

const PanelFirmasDigitales = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [firmasRecientes, setFirmasRecientes] = useState([]);
  const [busqueda, setBusqueda] = useState({
    documentType: '',
    fechaDesde: '',
    fechaHasta: '',
    status: ''
  });
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('stats');

  // Obtener estadísticas al cargar
  useEffect(() => {
    obtenerEstadisticas();
    obtenerFirmasRecientes();
  }, []);

  const obtenerEstadisticas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/signatures/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.estadisticas);
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
    }
  };

  const obtenerFirmasRecientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/signatures/recent?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFirmasRecientes(data.firmas);
      }
    } catch (error) {
      console.error('Error obteniendo firmas recientes:', error);
    }
  };

  const buscarFirmas = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      Object.entries(busqueda).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/signatures/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setResultadosBusqueda(data.busqueda.resultados);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🗄️ Sistema de Firmas Digitales Internas
        </h2>
        <p className="text-gray-600">
          Gestión y consulta del apartado interno de firmas digitales V-Health
        </p>
      </div>

      {/* Pestañas */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-medium ${activeTab === 'stats' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          📊 Estadísticas
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium ${activeTab === 'search' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          🔍 Búsqueda
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium ${activeTab === 'recent' 
            ? 'text-blue-600 border-b-2 border-blue-600' 
            : 'text-gray-500 hover:text-gray-700'}`}
        >
          📋 Recientes
        </button>
      </div>

      {/* Pestaña de Estadísticas */}
      {activeTab === 'stats' && estadisticas && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Total de Firmas</h3>
              <p className="text-2xl font-bold text-blue-600">
                {estadisticas.resumen.totalFirmas}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Última Firma</h3>
              <p className="text-sm text-green-600">
                {estadisticas.resumen.ultimaFirma ? 
                  formatFecha(estadisticas.resumen.ultimaFirma.signedAt) : 
                  'Sin firmas'
                }
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Actualizado</h3>
              <p className="text-sm text-purple-600">
                {estadisticas.resumen.actualizadoEn ? 
                  formatFecha(estadisticas.resumen.actualizadoEn) : 
                  'N/A'
                }
              </p>
            </div>
          </div>

          {/* Distribución por tipo */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">📂 Distribución por Tipo de Documento</h3>
            <div className="space-y-2">
              {Object.entries(estadisticas.distribucion.porTipoDocumento).map(([tipo, cantidad]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="capitalize text-gray-700">{tipo.replace('_', ' ')}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {cantidad} documento{cantidad !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución por fecha */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">📅 Distribución por Fecha</h3>
            <div className="space-y-2">
              {Object.entries(estadisticas.distribucion.porFecha).map(([fecha, cantidad]) => (
                <div key={fecha} className="flex justify-between items-center">
                  <span className="text-gray-700">{fecha}</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {cantidad} firma{cantidad !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pestaña de Búsqueda */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-4">🔍 Criterios de Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento
                </label>
                <select
                  value={busqueda.documentType}
                  onChange={(e) => setBusqueda({...busqueda, documentType: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos los tipos</option>
                  <option value="tos">Tos</option>
                  <option value="indigestion">Indigestión</option>
                  <option value="dolor_cabeza">Dolor de cabeza</option>
                  <option value="resfriado">Resfriado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={busqueda.status}
                  onChange={(e) => setBusqueda({...busqueda, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={busqueda.fechaDesde}
                  onChange={(e) => setBusqueda({...busqueda, fechaDesde: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={busqueda.fechaHasta}
                  onChange={(e) => setBusqueda({...busqueda, fechaHasta: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              onClick={buscarFirmas}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '🔄 Buscando...' : '🔍 Buscar Firmas'}
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {resultadosBusqueda.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">
                  📋 Resultados ({resultadosBusqueda.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {resultadosBusqueda.map((firma, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{firma.documentTitle}</h4>
                        <p className="text-sm text-gray-600">Tipo: {firma.documentType}</p>
                        <p className="text-sm text-gray-500">
                          Firmado: {formatFecha(firma.signedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {firma.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Hash: {firma.hash}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pestaña de Recientes */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">📋 Firmas Recientes</h3>
            <button
              onClick={obtenerFirmasRecientes}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              🔄 Actualizar
            </button>
          </div>

          {firmasRecientes.length > 0 ? (
            <div className="space-y-3">
              {firmasRecientes.map((firma, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{firma.documentTitle}</h4>
                      <p className="text-sm text-gray-600">
                        📂 {firma.documentType} • ⏰ {formatFecha(firma.signedAt)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        🔗 {firma.hash} • 🆔 {firma.internalId}
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {firma.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              📄 No hay firmas digitales disponibles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PanelFirmasDigitales;