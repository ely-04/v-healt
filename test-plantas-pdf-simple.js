// Test simple de API plantas-pdf
const plantaData = {
  nombre: "Manzanilla",
  nombre_cientifico: "Matricaria chamomilla",
  familia: "Asteraceae",
  descripcion: "Planta herbácea anual de flores blancas y amarillas",
  propiedades: ["Antiinflamatoria", "Digestiva", "Relajante"],
  usos: ["Infusión para problemas digestivos", "Compresas para la piel"],
  preparacion: "Infusión: 1 cucharadita por taza de agua caliente, reposar 5 minutos",
  precauciones: "No usar en personas alérgicas a las asteráceas"
};

console.log('🧪 Iniciando test de plantas-pdf...');
console.log('📋 Datos de prueba:', JSON.stringify(plantaData, null, 2));

async function testPlantasPDF() {
  try {
    const response = await fetch('http://localhost:3000/api/plantas-pdf/completo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plantaData)
    });

    console.log('📤 Status:', response.status);
    console.log('📤 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Respuesta exitosa:', result);
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

testPlantasPDF();