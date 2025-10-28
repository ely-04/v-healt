import generadorGuias from './src/utils/generadorGuiasPDF.js';

/**
 * DEMOSTRACIÓN DEL SISTEMA DE FIRMAS DIGITALES INTERNAS
 * V-Health - Almacenamiento Organizado de Firmas Digitales
 */

console.log('🗄️ === DEMO SISTEMA DE FIRMAS DIGITALES INTERNAS ===\n');

async function demostracionFirmasInternas() {
  try {
    console.log('📋 PARTE 1: GENERACIÓN Y ALMACENAMIENTO AUTOMÁTICO DE FIRMAS');
    console.log('=' .repeat(60));

    // 1. Generar varios documentos para demostrar el sistema de almacenamiento
    const tiposEnfermedades = ['tos', 'indigestion', 'dolor_cabeza'];
    const documentosGenerados = [];

    for (const enfermedad of tiposEnfermedades) {
      console.log(`\n🔄 Generando documento para: ${enfermedad}`);
      
      // Generar PDF
      const pdfInfo = await generadorGuias.generarGuiaPDF(enfermedad);
      console.log(`   📄 Documento creado: ${pdfInfo.titulo}`);
      
      // Firmar PDF (esto automáticamente lo guarda en el apartado interno)
      const resultado = await generadorGuias.firmarPDF(pdfInfo);
      console.log(`   ✍️ Firma digital creada: ${resultado.pdfInfo.hash.substring(0, 32)}...`);
      
      documentosGenerados.push(resultado.pdfInfo);
      
      // Pequeña pausa para diferencia en timestamps
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n✅ ${documentosGenerados.length} documentos generados y firmados`);

    console.log('\n📊 PARTE 2: ESTADÍSTICAS DEL SISTEMA INTERNO');
    console.log('=' .repeat(60));

    // 2. Obtener estadísticas del sistema
    const estadisticas = generadorGuias.obtenerEstadisticasFirmas();
    
    console.log('📈 RESUMEN ESTADÍSTICO:');
    console.log(`   • Total de firmas almacenadas: ${estadisticas.totalFirmas}`);
    console.log(`   • Última actualización: ${estadisticas.actualizadoEn}`);
    
    if (estadisticas.ultimaFirma) {
      console.log(`   • Última firma: ${estadisticas.ultimaFirma.documentTitle}`);
      console.log(`   • Fecha: ${estadisticas.ultimaFirma.signedAt}`);
    }

    console.log('\n📂 DISTRIBUCIÓN POR TIPO DE DOCUMENTO:');
    Object.entries(estadisticas.tiposDocumento).forEach(([tipo, cantidad]) => {
      console.log(`   • ${tipo}: ${cantidad} documento(s)`);
    });

    console.log('\n📅 DISTRIBUCIÓN POR FECHA:');
    Object.entries(estadisticas.porFecha).forEach(([fecha, cantidad]) => {
      console.log(`   • ${fecha}: ${cantidad} firma(s)`);
    });

    console.log('\n🔍 PARTE 3: BÚSQUEDAS EN EL SISTEMA INTERNO');
    console.log('=' .repeat(60));

    // 3. Demostrar búsquedas por diferentes criterios
    
    // Búsqueda por tipo de documento
    console.log('🔎 Búsqueda por tipo "indigestion":');
    const busquedaIndigestion = generadorGuias.buscarFirmasInternas({
      documentType: 'indigestion'
    });
    console.log(`   📋 Encontrados: ${busquedaIndigestion.total} resultados`);
    busquedaIndigestion.found.forEach(firma => {
      console.log(`   • ${firma.documentTitle} - ${firma.signedAt.split('T')[0]}`);
    });

    // Búsqueda por fecha
    const fechaHoy = new Date().toISOString().split('T')[0];
    console.log(`\n🗓️ Búsqueda por fecha (hoy: ${fechaHoy}):`);
    const busquedaFecha = generadorGuias.buscarFirmasInternas({
      fechaDesde: fechaHoy
    });
    console.log(`   📋 Encontrados: ${busquedaFecha.total} resultados`);
    busquedaFecha.found.forEach(firma => {
      console.log(`   • ${firma.documentTitle} - ${firma.documentType}`);
    });

    // Búsqueda general (todas las firmas)
    console.log('\n📚 Todas las firmas almacenadas:');
    const todasLasFirmas = generadorGuias.buscarFirmasInternas({});
    console.log(`   📋 Total en sistema: ${todasLasFirmas.total} firmas`);
    
    todasLasFirmas.found.forEach((firma, index) => {
      console.log(`   ${index + 1}. ${firma.documentTitle}`);
      console.log(`      📂 Tipo: ${firma.documentType}`);
      console.log(`      📅 Firmado: ${new Date(firma.signedAt).toLocaleString('es-ES')}`);
      console.log(`      🔗 Hash: ${firma.hash}`);
      console.log(`      🆔 ID Interno: ${firma.internalId}`);
      console.log(`      📍 Estado: ${firma.status}`);
      console.log('');
    });

    console.log('\n🗂️ PARTE 4: ESTRUCTURA DEL APARTADO INTERNO');
    console.log('=' .repeat(60));
    
    console.log('📁 DIRECTORIOS CREADOS AUTOMÁTICAMENTE:');
    console.log('   /internal-signatures/');
    console.log(`   ├── ${fechaHoy}/`);
    console.log('   │   ├── tos/');
    console.log('   │   ├── indigestion/');
    console.log('   │   └── dolor_cabeza/');
    console.log('   /document-archive/');
    console.log('   ├── signatures/');
    console.log('   │   └── master_index.json');
    console.log('   ├── documents/');
    console.log('   ├── certificates/');
    console.log('   └── logs/');
    console.log('       └── audit.log');

    console.log('\n🔐 CARACTERÍSTICAS DEL SISTEMA:');
    console.log('   ✅ Organización automática por fecha y tipo');
    console.log('   ✅ Índice maestro para búsquedas rápidas');
    console.log('   ✅ Metadatos completos de cada firma');
    console.log('   ✅ Auditoría completa de operaciones');
    console.log('   ✅ Compatibilidad con sistema existente');
    console.log('   ✅ Búsquedas por múltiples criterios');

    console.log('\n🎉 ¡DEMOSTRACIÓN COMPLETADA!');
    console.log('🌐 Puedes probar las APIs en: http://localhost:3000/api/signatures/');
    console.log('   • GET /api/signatures/stats - Estadísticas');
    console.log('   • GET /api/signatures/search - Búsquedas');
    console.log('   • GET /api/signatures/recent - Firmas recientes');
    console.log('   • GET /api/signatures/system-info - Info del sistema');

  } catch (error) {
    console.error('❌ Error en demostración:', error.message);
  }
}

// Ejecutar demostración
demostracionFirmasInternas();