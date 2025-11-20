const fs = require('fs');
const path = require('path');
const https = require('https');

const models = [
  {
    name: 'tiny_face_detector_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json'
  },
  {
    name: 'tiny_face_detector_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-shard1'
  },
  {
    name: 'face_landmark_68_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json'
  },
  {
    name: 'face_landmark_68_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-shard1'
  },
  {
    name: 'face_recognition_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json'
  },
  {
    name: 'face_recognition_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard1'
  },
  {
    name: 'face_recognition_model-shard2',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-shard2'
  },
  {
    name: 'face_expression_model-weights_manifest.json',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-weights_manifest.json'
  },
  {
    name: 'face_expression_model-shard1',
    url: 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_expression_model-shard1'
  }
];

const modelsDir = path.join(process.cwd(), 'public', 'models');

// Crear directorio si no existe
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
  console.log('📁 Carpeta models creada');
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Error ${response.statusCode}: ${response.statusMessage}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Eliminar archivo parcial
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function downloadModels() {
  console.log('🚀 Iniciando descarga de modelos de face-api.js...');
  console.log('📍 Destino:', modelsDir);
  console.log('');
  
  let downloaded = 0;
  let failed = 0;
  
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const filepath = path.join(modelsDir, model.name);
    
    // Verificar si el archivo ya existe
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  ${model.name} ya existe, saltando...`);
      downloaded++;
      continue;
    }
    
    try {
      console.log(`⬇️  Descargando ${model.name} (${i + 1}/${models.length})`);
      await downloadFile(model.url, filepath);
      console.log(`✅ ${model.name} descargado exitosamente`);
      downloaded++;
    } catch (error) {
      console.error(`❌ Error descargando ${model.name}:`, error.message);
      failed++;
    }
  }
  
  console.log('');
  console.log('📊 Resumen de descarga:');
  console.log(`   ✅ Exitosos: ${downloaded}`);
  console.log(`   ❌ Fallidos: ${failed}`);
  console.log(`   📁 Total: ${models.length}`);
  
  if (failed === 0) {
    console.log('');
    console.log('🎉 ¡Todos los modelos descargados exitosamente!');
    console.log('🔧 Ahora puedes usar el reconocimiento facial en tu aplicación.');
  } else {
    console.log('');
    console.log('⚠️  Algunos modelos fallaron. Intenta descargarlos manualmente.');
  }
}

// Verificar conexión a internet antes de descargar
https.get('https://www.google.com', (res) => {
  downloadModels();
}).on('error', (err) => {
  console.error('❌ No hay conexión a internet:', err.message);
  process.exit(1);
});