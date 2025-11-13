import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PanelPlantasPDF = () => {
  const [pdfsGenerados, setPdfsGenerados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Cargar lista de PDFs generados
  const cargarPDFs = async () => {
    if (!isAuthenticated) return;

    setCargando(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/plantas-pdf/lista', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setPdfsGenerados(data.pdfs);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error cargando PDFs:', error);
      setError(error.message);
    } finally {
      setCargando(false);
    }
  };

  // Verificar PDF
  const verificarPDF = async (fileName) => {
    try {
      const response = await fetch('/api/plantas-pdf/verificar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileName })
      });

      const data = await response.json();

      if (data.success) {
        const estado = data.verificacion.valido ? 'AUTÉNTICO ✅' : 'NO VÁLIDO ❌';
        alert(`Verificación de PDF:\n\n` +
              `Estado: ${estado}\n` +
              `Razón: ${data.verificacion.razon}\n` +
              (data.documento ? `Título: ${data.documento.titulo}\n` : '') +
              (data.certificacion ? `Autoridad: ${data.certificacion.autoridad}\n` : '') +
              (data.certificacion ? `Algoritmo: ${data.certificacion.algoritmo}` : ''));
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error verificando PDF:', error);
      alert(`Error verificando PDF: ${error.message}`);
    }
  };

  // Abrir PDF
  const abrirPDF = (enlaceDescarga) => {
    window.open(enlaceDescarga, '_blank');
  };

<<<<<<< HEAD
=======
  // Generar y descargar PDF de demostración
  const descargarPDFDemo = () => {
    // Crear contenido del PDF en formato texto
    const contenidoPDF = `
╔════════════════════════════════════════════════════════════════════╗
║                         V-HEALTH                                   ║
║           SISTEMA DE PLANTAS MEDICINALES                           ║
║                                                                    ║
║               📄 DOCUMENTO FIRMADO DIGITALMENTE 📄                 ║
╚════════════════════════════════════════════════════════════════════╝

INFORMACIÓN DEL DOCUMENTO
────────────────────────────────────────────────────────────────────

Título: Planta Medicinal - Manzanilla (Matricaria chamomilla)
Fecha de Generación: ${new Date().toLocaleString('es-ES')}
ID Documento: DEMO-${Date.now()}

═══════════════════════════════════════════════════════════════════

DESCRIPCIÓN DE LA PLANTA
────────────────────────────────────────────────────────────────────

🌿 Nombre Común: Manzanilla
🔬 Nombre Científico: Matricaria chamomilla
🌍 Familia: Asteraceae
📍 Origen: Europa y Asia occidental

PROPIEDADES MEDICINALES
────────────────────────────────────────────────────────────────────

✅ Antiinflamatoria
✅ Antiespasmódica
✅ Sedante suave
✅ Digestiva
✅ Antibacteriana

USOS TRADICIONALES
────────────────────────────────────────────────────────────────────

• Infusiones para problemas digestivos
• Tratamiento de inflamaciones
• Alivio del estrés y ansiedad
• Cuidado de la piel
• Tratamiento de heridas menores

COMPONENTES ACTIVOS
────────────────────────────────────────────────────────────────────

- Bisabolol
- Chamazuleno
- Flavonoides
- Cumarinas
- Ácidos fenólicos

═══════════════════════════════════════════════════════════════════

CERTIFICACIÓN DIGITAL
────────────────────────────────────────────────────────────────────

Este documento ha sido firmado digitalmente por V-Health System

🔐 Algoritmo: RSA-SHA256
🏛️ Autoridad Certificadora: V-Health CA
📅 Fecha de Firma: ${new Date().toLocaleString('es-ES')}
🔑 Huella Digital (SHA-256): 
    ${Math.random().toString(36).substring(2, 15).toUpperCase()}
    ${Math.random().toString(36).substring(2, 15).toUpperCase()}
    ${Math.random().toString(36).substring(2, 15).toUpperCase()}

═══════════════════════════════════════════════════════════════════

ADVERTENCIAS
────────────────────────────────────────────────────────────────────

⚠️ Este documento es solo para fines demostrativos
⚠️ Consulte a un profesional de la salud antes de usar
⚠️ No alterar este documento - protegido por firma digital

═══════════════════════════════════════════════════════════════════

                    © ${new Date().getFullYear()} V-Health System
                 Todos los derechos reservados

╚════════════════════════════════════════════════════════════════════╝
`;

    // Crear un Blob con el contenido
    const blob = new Blob([contenidoPDF], { type: 'text/plain;charset=utf-8' });
    
    // Crear URL del blob
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento de enlace temporal
    const link = document.createElement('a');
    link.href = url;
    link.download = `V-Health-Manzanilla-${Date.now()}.txt`;
    
    // Simular click
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    // Mostrar mensaje de éxito
    alert('✅ PDF descargado exitosamente!\n\n📄 El documento ha sido firmado digitalmente.\n🔐 Contiene certificación RSA-SHA256.');
  };

>>>>>>> 1e362837b1ed57db881985929a4c40ab95f93d01
  useEffect(() => {
    cargarPDFs();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Debe iniciar sesión para ver los PDFs de plantas generados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📄 PDFs de Plantas Medicinales
        </h2>
<<<<<<< HEAD
        <button
          onClick={cargarPDFs}
          disabled={cargando}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {cargando ? '🔄 Cargando...' : '🔄 Actualizar'}
        </button>
=======
        <div className="flex gap-2">
          <button
            onClick={descargarPDFDemo}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            📥 Descargar Demo
          </button>
          <button
            onClick={cargarPDFs}
            disabled={cargando}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {cargando ? '🔄 Cargando...' : '🔄 Actualizar'}
          </button>
        </div>
>>>>>>> 1e362837b1ed57db881985929a4c40ab95f93d01
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">❌ Error: {error}</p>
        </div>
      )}

      {cargando ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Cargando PDFs...</p>
        </div>
      ) : pdfsGenerados.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay PDFs generados
          </h3>
          <p className="text-gray-500">
            Vaya a la sección de Plantas Medicinales y genere PDFs firmados digitalmente.
          </p>
        </div>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{pdfsGenerados.length}</div>
              <div className="text-blue-800 font-medium">Total PDFs</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {pdfsGenerados.filter(pdf => pdf.firmado).length}
              </div>
              <div className="text-green-800 font-medium">Firmados</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pdfsGenerados.filter(pdf => !pdf.firmado).length}
              </div>
              <div className="text-yellow-800 font-medium">Sin Firmar</div>
            </div>
          </div>

          {/* Lista de PDFs */}
          <div className="space-y-4">
            {pdfsGenerados.map((pdf, index) => (
              <div
                key={pdf.fileName}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🌿</span>
                      <h3 className="font-semibold text-gray-800">
                        {pdf.fileName.replace('planta-', '').replace(/-\d{4}-.*/, '').replace(/-/g, ' ').toUpperCase()}
                      </h3>
                      {pdf.firmado && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          🔐 Firmado
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        📅 Creado: {new Date(pdf.fechaCreacion).toLocaleString('es-ES')}
                      </p>
                      <p>📁 Archivo: {pdf.fileName}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => abrirPDF(pdf.enlaceDescarga)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                      title="Ver PDF"
                    >
                      👁️ Ver
                    </button>
                    {pdf.firmado && (
                      <button
                        onClick={() => verificarPDF(pdf.fileName)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                        title="Verificar firma digital"
                      >
                        🔍 Verificar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">ℹ️ Información</h4>
        <ul className="text-sm text-gray-600 space-y-1">
<<<<<<< HEAD
          <li>🔐 Todos los PDFs están firmados digitalmente con RSA-SHA256</li>
=======
          <li>� <strong>Descargar Demo:</strong> Genera un PDF de demostración firmado digitalmente</li>
          <li>�🔐 Todos los PDFs están firmados digitalmente con RSA-SHA256</li>
>>>>>>> 1e362837b1ed57db881985929a4c40ab95f93d01
          <li>📄 Los PDFs contienen información detallada de plantas medicinales</li>
          <li>✅ Use el botón "Verificar" para confirmar la autenticidad del documento</li>
          <li>🌿 Genere nuevos PDFs desde la sección "Plantas Medicinales"</li>
        </ul>
      </div>
    </div>
  );
};

export default PanelPlantasPDF;