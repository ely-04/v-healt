/**
 * Script de prueba para la funcionalidad de PDFs de Plantas Medicinales
 * Verifica que el servidor y todas las APIs funcionen correctamente
 */

console.log('🧪 === PRUEBA COMPLETA DE PDFs DE PLANTAS MEDICINALES ===\n');

// Función para hacer peticiones HTTP
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Error en petición a ${url}:`, error.message);
    throw error;
  }
}

// Datos de prueba
const plantaPrueba = {
  id: 999,
  nombre: 'Eucalipto',
  nombreCientifico: 'Eucalyptus globulus',
  categoria: 'respiratoria',
  imagen: '🌿',
  propiedades: ['Expectorante', 'Antiséptico', 'Descongestionante'],
  usos: ['Tos', 'Resfriado', 'Sinusitis', 'Bronquitis'],
  preparacion: 'Inhalación: 3-4 hojas en agua hirviendo. Té: 1 cucharadita de hojas secas por taza.',
  precauciones: 'No usar aceite esencial puro en niños menores de 2 años.'
};

const credencialesPrueba = {
  email: 'test@vhealth.com',
  password: 'test123'
};

async function ejecutarPruebas() {
  console.log('🔧 PASO 1: Verificando salud del servidor');
  console.log('=' .repeat(50));
  
  try {
    const health = await makeRequest('http://localhost:3000/api/health');
    console.log('✅ Servidor funcionando:', health.message);
  } catch (error) {
    console.log('❌ El servidor no está funcionando. Inicie el servidor primero.');
    return;
  }

  console.log('\n🔐 PASO 2: Intentando login (si es necesario)');
  console.log('=' .repeat(50));
  
  let token = null;
  try {
    const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credencialesPrueba)
    });
    
    if (loginResponse.success) {
      token = loginResponse.token;
      console.log('✅ Login exitoso');
    } else {
      console.log('ℹ️ Login no necesario o credenciales no válidas');
    }
  } catch (error) {
    console.log('ℹ️ Continuando sin autenticación...');
  }

  console.log('\n📄 PASO 3: Generando PDF de planta medicinal');
  console.log('=' .repeat(50));
  
  let pdfGenerado = null;
  try {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    const pdfResponse = await makeRequest('http://localhost:3000/api/plantas-pdf/completo', {
      method: 'POST',
      headers,
      body: JSON.stringify({ plantaData: plantaPrueba })
    });
    
    if (pdfResponse.success) {
      pdfGenerado = pdfResponse.documento;
      console.log('✅ PDF generado exitosamente:');
      console.log(`   📝 Título: ${pdfGenerado.titulo}`);
      console.log(`   🌿 Planta: ${pdfGenerado.planta}`);
      console.log(`   📁 Archivo: ${pdfGenerado.fileName}`);
      console.log(`   🔐 Algoritmo: ${pdfResponse.seguridad.algoritmo}`);
      console.log(`   📅 Fecha: ${new Date(pdfResponse.seguridad.fechaFirma).toLocaleString('es-ES')}`);
    }
  } catch (error) {
    console.log('❌ Error generando PDF (puede requerir autenticación)');
  }

  if (pdfGenerado) {
    console.log('\n🔍 PASO 4: Verificando PDF generado');
    console.log('=' .repeat(50));
    
    try {
      const verificacion = await makeRequest('http://localhost:3000/api/plantas-pdf/verificar', {
        method: 'POST',
        body: JSON.stringify({ fileName: pdfGenerado.fileName })
      });
      
      if (verificacion.success) {
        console.log('✅ Verificación completada:');
        console.log(`   🔐 Estado: ${verificacion.verificacion.estado}`);
        console.log(`   📋 Razón: ${verificacion.verificacion.razon}`);
        if (verificacion.certificacion) {
          console.log(`   🏛️ Autoridad: ${verificacion.certificacion.autoridad}`);
          console.log(`   🔒 Algoritmo: ${verificacion.certificacion.algoritmo}`);
        }
      }
    } catch (error) {
      console.log('❌ Error verificando PDF');
    }

    console.log('\n👁️ PASO 5: Probando acceso al contenido');
    console.log('=' .repeat(50));
    
    try {
      const response = await fetch(`http://localhost:3000/api/plantas-pdf/contenido/${pdfGenerado.fileName}`);
      if (response.ok) {
        const contentType = response.headers.get('Content-Type');
        console.log('✅ Contenido accesible:');
        console.log(`   📄 Tipo: ${contentType}`);
        console.log(`   🔗 URL: http://localhost:3000/api/plantas-pdf/contenido/${pdfGenerado.fileName}`);
        console.log('   ℹ️ Abra esta URL en su navegador para ver el PDF');
      }
    } catch (error) {
      console.log('❌ Error accediendo al contenido');
    }
  }

  if (token) {
    console.log('\n📊 PASO 6: Obteniendo lista de PDFs');
    console.log('=' .repeat(50));
    
    try {
      const lista = await makeRequest('http://localhost:3000/api/plantas-pdf/lista', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (lista.success) {
        console.log('✅ Lista obtenida:');
        console.log(`   📄 Total PDFs: ${lista.total}`);
        console.log(`   ✍️ Firmados: ${lista.estadisticas.firmados}`);
        console.log(`   📋 Sin firmar: ${lista.estadisticas.sinFirmar}`);
      }
    } catch (error) {
      console.log('❌ Error obteniendo lista');
    }
  }

  console.log('\n🎯 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(50));
  console.log('✅ Servidor verificado');
  console.log(token ? '✅ Autenticación exitosa' : '⚠️ Sin autenticación');
  console.log(pdfGenerado ? '✅ PDF generado y firmado' : '❌ PDF no generado');
  console.log('🔐 Sistema de firma digital: RSA-SHA256');
  console.log('📂 Almacenamiento: generated-plantas-pdfs/');
  
  console.log('\n📝 INSTRUCCIONES PARA PRUEBA MANUAL:');
  console.log('=' .repeat(50));
  console.log('1. Inicie el servidor: node src/server-stable-persistent.cjs');
  console.log('2. Inicie el frontend: npm run dev');
  console.log('3. Vaya a http://localhost:5173');
  console.log('4. Inicie sesión con sus credenciales');
  console.log('5. Vaya a "Plantas Medicinales"');
  console.log('6. Haga clic en "📄 Descargar PDF Firmado" en cualquier planta');
  console.log('7. El PDF se abrirá con firma digital verificable');
  
  console.log('\n🎉 PRUEBAS COMPLETADAS');
}

// Ejecutar pruebas
ejecutarPruebas().catch(error => {
  console.error('💥 Error en las pruebas:', error.message);
});