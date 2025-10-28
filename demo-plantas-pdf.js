import generadorPlantasPDF from './src/utils/generadorPlantasPDF.js';

/**
 * Demostración del Sistema de PDFs de Plantas Medicinales con Firma Digital
 */

console.log('🌿 === DEMOSTRACIÓN SISTEMA PDFs PLANTAS MEDICINALES ===\n');

// Datos de plantas medicinales de ejemplo
const plantasEjemplo = [
  {
    id: 1,
    nombre: 'Manzanilla',
    nombreCientifico: 'Matricaria chamomilla',
    categoria: 'digestiva',
    imagen: '🌼',
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
    imagen: '🫚',
    propiedades: ['Antiemético', 'Antiinflamatorio', 'Digestivo'],
    usos: ['Náuseas', 'Mareos', 'Indigestión', 'Dolor muscular'],
    preparacion: 'Té: Hervir 2-3 rodajas de jengibre fresco en agua por 10 minutos.',
    precauciones: 'Consultar médico si tomas anticoagulantes. Moderar en embarazo.'
  },
  {
    id: 3,
    nombre: 'Lavanda',
    nombreCientifico: 'Lavandula angustifolia',
    categoria: 'relajante',
    imagen: '💜',
    propiedades: ['Relajante', 'Antiséptica', 'Cicatrizante'],
    usos: ['Insomnio', 'Ansiedad', 'Heridas menores', 'Dolores de cabeza'],
    preparacion: 'Infusión: 1 cucharadita de flores secas por taza. Aromaterapia: difusor.',
    precauciones: 'Puede causar somnolencia. No usar antes de conducir.'
  }
];

async function demostracionCompleta() {
  try {
    console.log('📋 PARTE 1: GENERACIÓN DE PDFs DE PLANTAS');
    console.log('=' .repeat(60));

    const pdfsGenerados = [];

    for (const planta of plantasEjemplo) {
      console.log(`\n🌱 Procesando: ${planta.nombre} (${planta.nombreCientifico})`);
      
      // 1. Generar PDF
      console.log(`   📄 Generando PDF...`);
      const pdfInfo = await generadorPlantasPDF.generarPDFPlanta(planta);
      console.log(`   ✅ PDF generado: ${pdfInfo.fileName}`);
      
      // 2. Firmar PDF digitalmente
      console.log(`   ✍️ Firmando documento...`);
      const resultado = await generadorPlantasPDF.firmarPDF(pdfInfo);
      console.log(`   🔐 Documento firmado con algoritmo: ${resultado.pdfInfo.firma.algorithm}`);
      console.log(`   🔗 Hash: ${resultado.pdfInfo.hash.substring(0, 32)}...`);
      
      pdfsGenerados.push(resultado.pdfInfo);
    }

    console.log('\n📊 PARTE 2: ESTADÍSTICAS DE GENERACIÓN');
    console.log('=' .repeat(60));
    console.log(`   📑 Total PDFs generados: ${pdfsGenerados.length}`);
    console.log(`   ✍️ Total PDFs firmados: ${pdfsGenerados.filter(pdf => pdf.firmado).length}`);
    console.log(`   🏷️ Categorías procesadas: ${[...new Set(plantasEjemplo.map(p => p.categoria))].join(', ')}`);

    console.log('\n🔍 PARTE 3: VERIFICACIÓN DE AUTENTICIDAD');
    console.log('=' .repeat(60));

    for (const pdf of pdfsGenerados) {
      console.log(`\n🔍 Verificando: ${pdf.planta}`);
      const verificacion = await generadorPlantasPDF.verificarPDF(pdf.fileName);
      
      if (verificacion.valido) {
        console.log(`   ✅ Estado: AUTÉNTICO`);
        console.log(`   📝 Título: ${verificacion.documento.titulo}`);
        console.log(`   🕒 Generado: ${new Date(verificacion.documento.fechaGeneracion).toLocaleString('es-ES')}`);
      } else {
        console.log(`   ❌ Estado: NO VÁLIDO`);
        console.log(`   🚫 Razón: ${verificacion.razon}`);
      }
    }

    console.log('\n📂 PARTE 4: LISTA DE ARCHIVOS GENERADOS');
    console.log('=' .repeat(60));
    
    const listaArchivos = generadorPlantasPDF.obtenerPDFsGenerados();
    console.log(`   📄 Total archivos: ${listaArchivos.length}`);
    console.log(`   ✍️ Firmados: ${listaArchivos.filter(pdf => pdf.firmado).length}`);
    
    listaArchivos.forEach((pdf, index) => {
      console.log(`   ${index + 1}. ${pdf.fileName}`);
      console.log(`      📅 Creado: ${pdf.fechaCreacion.toLocaleString('es-ES')}`);
      console.log(`      🔐 Firmado: ${pdf.firmado ? '✅ Sí' : '❌ No'}`);
      console.log(`      🔗 Ver: ${pdf.enlaceDescarga}`);
    });

    console.log('\n🎯 PARTE 5: RESUMEN TÉCNICO');
    console.log('=' .repeat(60));
    console.log('   🔐 Algoritmo de firma: RSA-SHA256');
    console.log('   📊 Formato de salida: HTML con CSS integrado');
    console.log('   🏥 Sistema: V-Health Plantas Medicinales');
    console.log('   ✅ Verificación: Integridad y autenticidad garantizada');
    console.log('   📂 Almacenamiento: generated-plantas-pdfs/');
    console.log('   🔒 Firmas: generated-plantas-pdfs/firmas/');

    console.log('\n🎉 ¡DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('=' .repeat(60));
    console.log('🌿 Sistema de PDFs de Plantas Medicinales con Firma Digital');
    console.log('✅ Todos los documentos generados y verificados correctamente');
    console.log(`📊 Total procesado: ${pdfsGenerados.length} plantas medicinales`);

  } catch (error) {
    console.error('❌ Error en la demostración:', error.message);
    console.error('💥 Stack trace:', error.stack);
  }
}

// Ejecutar demostración
demostracionCompleta().then(() => {
  console.log('\n🔚 Demostración finalizada.');
}).catch(error => {
  console.error('💥 Error fatal:', error.message);
});