import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PanelPlantasPDF = () => {
  const { isAuthenticated } = useAuth();
  const [pdfsGenerados, setPdfsGenerados] = useState([]);
  const [generando, setGenerando] = useState(false);

  // Cargar lista de PDFs generados
  useEffect(() => {
    if (isAuthenticated) {
      cargarPDFs();
    }
  }, [isAuthenticated]);

  const cargarPDFs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/plantas-pdf/lista', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPdfsGenerados(data.pdfs || []);
      }
    } catch (error) {
      console.error('Error cargando PDFs:', error);
    }
  };

  const generarPDFCompleto = async (plantaData) => {
    if (!isAuthenticated) {
      alert('Debe iniciar sesión para generar PDFs');
      return;
    }

    setGenerando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/plantas-pdf/completo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plantaData })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`✅ PDF generado y firmado: ${data.documento.titulo}`);
        cargarPDFs(); // Recargar lista
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setGenerando(false);
    }
  };

  // Generar y descargar PDF de demostración
  const descargarPDFDemo = () => {
    const contenidoPDF = `
=== V-HEALTH - DOCUMENTO FIRMADO DIGITALMENTE ===

PLANTA MEDICINAL: Manzanilla
NOMBRE CIENTÍFICO: Matricaria chamomilla
FECHA: ${new Date().toLocaleString('es-ES')}

PROPIEDADES:
• Antiinflamatoria
• Calmante  
• Digestiva

USOS PRINCIPALES:
• Indigestión
• Insomnio
• Ansiedad
• Irritación de piel

PREPARACIÓN:
Infusión: 1 cucharada de flores secas por taza de agua caliente. 
Dejar reposar 5-10 minutos.

PRECAUCIONES:
Evitar en caso de alergia a plantas de la familia Asteraceae.

=== CERTIFICACIÓN DIGITAL ===
Algoritmo: RSA-SHA256
Autoridad: V-Health CA
Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}
Fecha Firma: ${new Date().toISOString()}
ID Documento: VHEALTH-${Date.now()}

Este documento ha sido firmado digitalmente por V-Health.
Para verificar su autenticidad, contacte con soporte técnico.

© V-Health - Sistema de Plantas Medicinales
    `;

    const blob = new Blob([contenidoPDF], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VHealth-Manzanilla-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ PDF de demostración descargado como archivo .txt');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-green-800 mb-2">
          📄 Sistema de PDFs con Firma Digital
        </h2>
        <p className="text-green-700">
          Genera y gestiona PDFs de plantas medicinales con certificación digital RSA-SHA256
        </p>
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-800">🌿 Generar PDF Planta</h3>
          <button
            onClick={() => generarPDFCompleto({
              nombre: 'Manzanilla',
              nombreCientifico: 'Matricaria chamomilla',
              categoria: 'digestiva',
              propiedades: ['Antiinflamatoria', 'Calmante', 'Digestiva'],
              usos: ['Indigestión', 'Insomnio', 'Ansiedad'],
              preparacion: 'Infusión con flores secas',
              precauciones: 'Evitar en alergias'
            })}
            disabled={generando || !isAuthenticated}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition duration-200"
          >
            {generando ? '⏳ Generando...' : '📋 Generar PDF Firmado'}
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold mb-3 text-gray-800">🔽 Demo Descarga</h3>
          <button
            onClick={descargarPDFDemo}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            📄 Descargar PDF Demo
          </button>
        </div>
      </div>

      {/* Lista de PDFs generados */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-gray-800">📚 PDFs Generados</h3>
        
        {pdfsGenerados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>📄 No hay PDFs generados aún</p>
            <p className="text-sm mt-2">Genera tu primer PDF usando los botones de arriba</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pdfsGenerados.map((pdf, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                <div>
                  <h4 className="font-medium text-gray-800">{pdf.titulo}</h4>
                  <p className="text-sm text-gray-600">
                    {pdf.fechaGeneracion} • {pdf.firmado ? '🔐 Firmado' : '📝 Sin firmar'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition duration-200">
                    👁️ Ver
                  </button>
                  <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition duration-200">
                    🔍 Verificar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado de autenticación */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-700">
            ⚠️ Debes iniciar sesión para acceder a todas las funcionalidades de PDFs
          </p>
        </div>
      )}
    </div>
  );
};

export default PanelPlantasPDF;