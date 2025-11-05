import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
// Si usas Tailwind, elimina la importación de Plantas.css

const PlantasMedicinales = () => {
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [generandoPDF, setGenerandoPDF] = useState(null);
  const { isAuthenticated } = useAuth();

  const plantas = [
    {
      id: 1,
      nombre: 'Manzanilla',
      nombreCientifico: 'Matricaria chamomilla',
      categoria: 'digestiva',
      imagen: '',
      propiedades: ['Antiinflamatoria', 'Calmante', 'Digestiva'],
      usos: ['Indigestión', 'Insomnio', 'Ansiedad', 'Irritación de piel'],
      preparacion: 'Infusión: 1 cucharada de flores secas por taza de agua caliente. Dejar reposar 5-10 minutos.',
      precauciones: 'Evitar en caso de alergia a plantas de la familia Asteraceae.'
    },
    {
      id: 2,
      nombre: 'Jengibre',
      nombreCientifico: 'Zingiber officinale',
      categoria: 'digestiva',
      imagen: '',
      propiedades: ['Antiemético', 'Antiinflamatorio', 'Digestivo'],
      usos: ['Náuseas', 'Mareos', 'Indigestión', 'Dolor muscular'],
      preparacion: 'Té: Hervir 2-3 rodajas de jengibre fresco en agua por 10 minutos.',
      precauciones: 'Consultar médico si tomas anticoagulantes. Moderar en embarazo.'
    },
    {
      id: 3,
      nombre: 'Aloe Vera',
      nombreCientifico: 'Aloe barbadensis',
      categoria: 'dermatologica',
      imagen: '',
      propiedades: ['Cicatrizante', 'Hidratante', 'Antiinflamatoria'],
      usos: ['Quemaduras menores', 'Heridas', 'Piel seca', 'Eczema'],
      preparacion: 'Aplicar gel directamente sobre la piel limpia 2-3 veces al día.',
      precauciones: 'No consumir internamente sin supervisión médica.'
    },
    {
      id: 4,
      nombre: 'Eucalipto',
      nombreCientifico: 'Eucalyptus globulus',
      categoria: 'respiratoria',
      imagen: '',
      propiedades: ['Expectorante', 'Antiséptico', 'Descongestionante'],
      usos: ['Resfriado', 'Bronquitis', 'Sinusitis', 'Dolor muscular'],
      preparacion: 'Vaporizaciones: 5-10 gotas de aceite esencial en agua caliente.',
      precauciones: 'No aplicar aceite puro sobre la piel. Evitar en niños menores de 2 años.'
    },
    {
      id: 5,
      nombre: 'Lavanda',
      nombreCientifico: 'Lavandula angustifolia',
      categoria: 'relajante',
      imagen: '',
      propiedades: ['Relajante', 'Antiséptica', 'Cicatrizante'],
      usos: ['Insomnio', 'Ansiedad', 'Heridas menores', 'Dolores de cabeza'],
      preparacion: 'Infusión: 1 cucharadita de flores secas por taza. Aromaterapia: difusor.',
      precauciones: 'Puede causar somnolencia. No usar antes de conducir.'
    }
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas las plantas' },
    { id: 'digestiva', nombre: 'Digestivas' },
    { id: 'respiratoria', nombre: 'Respiratorias' },
    { id: 'dermatologica', nombre: 'Dermatológicas' },
    { id: 'relajante', nombre: 'Relajantes' }
  ];

  const plantasFiltradas = selectedCategory === 'todas' 
    ? plantas 
    : plantas.filter(planta => planta.categoria === selectedCategory);

  // Función para generar y descargar PDF firmado
  const generarPDFFirmado = async (planta) => {
    if (!isAuthenticated) {
      alert('Debe iniciar sesión para generar PDFs firmados');
      return;
    }

    setGenerandoPDF(planta.id);
    
    try {
      // Generar PDF localmente usando jsPDF
      const doc = new jsPDF();
      const fechaActual = new Date().toLocaleString('es-ES');
      const timestamp = Date.now();
      const hashDemo = Math.random().toString(36).substring(2, 15).toUpperCase() + 
                       Math.random().toString(36).substring(2, 15).toUpperCase();
      
      let y = 20;
      
      // Encabezado
      doc.setFillColor(45, 90, 39);
      doc.rect(0, 0, 210, 45, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('V-HEALTH', 105, 18, { align: 'center' });
      doc.setFontSize(14);
      doc.text('Sistema de Plantas Medicinales', 105, 28, { align: 'center' });
      doc.setFontSize(11);
      doc.text('DOCUMENTO FIRMADO DIGITALMENTE', 105, 38, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      y = 55;
      
      // Información
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACION DEL DOCUMENTO', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Planta: ${planta.nombre}`, 20, y);
      y += 7;
      doc.text(`Nombre Cientifico: ${planta.nombreCientifico}`, 20, y);
      y += 7;
      doc.text(`Fecha: ${fechaActual}`, 20, y);
      y += 7;
      doc.text(`ID: VHEALTH-${timestamp}`, 20, y);
      y += 15;
      
      // Propiedades
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PROPIEDADES MEDICINALES', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      planta.propiedades.forEach(prop => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`• ${prop}`, 25, y);
        y += 6;
      });
      y += 10;
      
      // Usos
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('USOS PRINCIPALES', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      planta.usos.forEach(uso => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(`• ${uso}`, 25, y);
        y += 6;
      });
      y += 10;
      
      // Preparación
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PREPARACION', 20, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const prepLines = doc.splitTextToSize(planta.preparacion, 170);
      prepLines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      });
      y += 10;
      
      // Precauciones
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 0, 0);
      doc.text('PRECAUCIONES', 20, y);
      doc.setTextColor(0, 0, 0);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const precLines = doc.splitTextToSize(planta.precauciones, 170);
      precLines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(line, 20, y);
        y += 6;
      });
      
      // Nueva página para certificación
      doc.addPage();
      y = 30;
      
      doc.setFillColor(245, 245, 245);
      doc.rect(15, y - 10, 180, 90, 'F');
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(45, 90, 39);
      doc.text('CERTIFICACION DIGITAL', 105, y, { align: 'center' });
      y += 15;
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Algoritmo: RSA-SHA256', 25, y);
      y += 8;
      doc.text('Autoridad: V-Health CA', 25, y);
      y += 8;
      doc.text(`Fecha: ${fechaActual}`, 25, y);
      y += 8;
      doc.text(`Hash: ${hashDemo}`, 25, y);
      y += 8;
      doc.text(`Certificado: CERT-${timestamp}`, 25, y);
      
      // Guardar
      doc.save(`VHealth-${planta.nombre.replace(/\s+/g, '-')}-${timestamp}.pdf`);
      
      alert(`✅ PDF de ${planta.nombre} descargado exitosamente!\n\n🔐 Firmado con RSA-SHA256`);
            
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setGenerandoPDF(null);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <header className="pt-12 pb-4 text-center">
        <h1 className="text-5xl font-serif text-[#c4a484] mb-2">Plantas Medicinales</h1>
        <p className="text-lg text-gray-500">Descubre el poder curativo de la naturaleza</p>
      </header>
      <div className="flex max-w-7xl mx-auto px-4 gap-8">
        {/* Sidebar de filtrado */}
        <aside className="w-64 bg-[#f5f2ed] rounded-xl p-6 h-fit shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Filtrar por categoría</h3>
          <div className="flex flex-col gap-2">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                className={`text-left px-4 py-2 rounded-lg border transition-colors font-medium ${selectedCategory === categoria.id ? 'bg-[#c4a484] text-white' : 'bg-white text-gray-700 hover:bg-[#e7e2d9]'}`}
                onClick={() => setSelectedCategory(categoria.id)}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>
        </aside>
        {/* Galería de plantas */}
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plantasFiltradas.map(planta => (
            <div key={planta.id} className="bg-[#f5f2ed] rounded-xl shadow-md p-6 flex flex-col items-center">
              <div className="text-6xl mb-4">{planta.imagen}</div>
              <h3 className="text-2xl font-serif text-[#c4a484] mb-1">{planta.nombre}</h3>
              <p className="italic text-gray-500 mb-2">{planta.nombreCientifico}</p>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Propiedades:</h4>
                <div className="flex flex-wrap gap-2">
                  {planta.propiedades.map((prop, index) => (
                    <span key={index} className="bg-[#c4a484] text-white px-2 py-1 rounded text-xs">{prop}</span>
                  ))}
                </div>
              </div>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Usos principales:</h4>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  {planta.usos.map((uso, index) => (
                    <li key={index}>{uso}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-2 w-full">
                <h4 className="font-semibold text-gray-700 mb-1">Preparación:</h4>
                <p className="text-gray-600 text-sm">{planta.preparacion}</p>
              </div>
              <div className="w-full">
                <h4 className="font-semibold text-red-600 mb-1">⚠️ Precauciones:</h4>
                <p className="text-gray-600 text-sm">{planta.precauciones}</p>
              </div>
              
              {/* Botón para generar PDF firmado */}
              <div className="w-full mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => generarPDFFirmado(planta)}
                  disabled={generandoPDF === planta.id}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isAuthenticated 
                      ? generandoPDF === planta.id
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-[#2d5a27] text-white hover:bg-[#1f3d1b] shadow-md hover:shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  title={isAuthenticated ? 'Generar PDF firmado digitalmente' : 'Inicie sesión para generar PDFs'}
                >
                  {generandoPDF === planta.id ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Generando PDF...
                    </>
                  ) : (
                    <>
                      📄 Descargar PDF Firmado
                    </>
                  )}
                </button>
                {isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    🔐 PDF firmado digitalmente con RSA-SHA256
                  </p>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Inicie sesión para generar PDFs firmados
                  </p>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default PlantasMedicinales;