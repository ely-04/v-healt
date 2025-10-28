/**
 * Script de prueba simple para diagnosticar el problema con la API de plantas PDF
 */

async function probarAPI() {
  console.log('🧪 Probando API de plantas PDF...\n');

  // Datos de prueba simple
  const plantaTest = {
    id: 1,
    nombre: 'Manzanilla Test',
    nombreCientifico: 'Matricaria chamomilla',
    categoria: 'digestiva',
    imagen: '🌼',
    propiedades: ['Antiinflamatoria', 'Calmante'],
    usos: ['Indigestión', 'Insomnio'],
    preparacion: 'Infusión: 1 cucharada por taza.',
    precauciones: 'Evitar en caso de alergia.'
  };

  try {
    console.log('1. Probando endpoint de salud...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Salud del servidor:', healthData.message);

    console.log('\n2. Probando endpoint de plantas PDF (sin token)...');
    const response = await fetch('http://localhost:3000/api/plantas-pdf/completo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plantaData: plantaTest })
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Content-Type:', response.headers.get('content-type'));

    const responseText = await response.text();
    console.log('Respuesta cruda:', responseText);

    // Intentar parsear como JSON si es posible
    try {
      const jsonData = JSON.parse(responseText);
      console.log('Respuesta JSON:', jsonData);
    } catch (e) {
      console.log('❌ No es JSON válido');
    }

  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar prueba
probarAPI();