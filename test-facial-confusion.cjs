/**
 * Script para probar y detectar confusión de datos faciales entre usuarios
 * Verifica que cada usuario solo coincida con su propio descriptor facial
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vhealth'
};

// Calcular distancia euclidiana entre dos descriptores
function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    return Infinity;
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

async function testFacialConfusion() {
  let connection;
  
  try {
    console.log('🔍 Probando confusión de datos faciales entre usuarios...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');
    
    // Obtener todos los usuarios con rostros registrados
    const [users] = await connection.execute(
      'SELECT id, name, email, faceDescriptor FROM users WHERE faceDescriptor IS NOT NULL'
    );
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios con rostros registrados');
      return;
    }
    
    console.log(`📊 Total de usuarios con reconocimiento facial: ${users.length}\n`);
    console.log('='.repeat(80));
    
    const threshold = 0.6; // Mismo threshold del backend
    let confusionDetected = false;
    let confusionCount = 0;
    
    // Probar cada usuario contra todos los demás
    for (let i = 0; i < users.length; i++) {
      const user1 = users[i];
      const desc1 = JSON.parse(user1.faceDescriptor);
      
      console.log(`\n🧑 Usuario: ${user1.name} (ID: ${user1.id})`);
      console.log('   Comparando con otros usuarios...');
      
      let matches = [];
      
      for (let j = 0; j < users.length; j++) {
        if (i === j) continue; // No comparar consigo mismo
        
        const user2 = users[j];
        const desc2 = JSON.parse(user2.faceDescriptor);
        
        const distance = euclideanDistance(desc1, desc2);
        
        if (distance < threshold) {
          matches.push({
            userId: user2.id,
            name: user2.name,
            distance: distance.toFixed(3)
          });
          confusionDetected = true;
          confusionCount++;
        }
      }
      
      if (matches.length > 0) {
        console.log(`   ⚠️ ¡CONFUSIÓN DETECTADA! ${matches.length} coincidencia(s):`);
        matches.forEach(match => {
          console.log(`      → ${match.name} (ID: ${match.userId}) - Distancia: ${match.distance}`);
        });
      } else {
        console.log(`   ✅ Sin confusión - Descriptor único`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log(`   Total usuarios analizados: ${users.length}`);
    console.log(`   Threshold utilizado: ${threshold}`);
    
    if (confusionDetected) {
      console.log(`   ❌ PROBLEMA: ${confusionCount} confusión(es) detectada(s)`);
      console.log('\n💡 RECOMENDACIONES:');
      console.log('   1. Los usuarios con confusión deben re-registrar sus rostros');
      console.log('   2. Asegurar buena iluminación al capturar el rostro');
      console.log('   3. Capturar el rostro desde diferentes ángulos');
      console.log('   4. Los umbrales han sido ajustados a 0.5 (frontend) y 0.6 (backend)');
      console.log('   5. El sistema ahora valida contra TODOS los usuarios registrados');
    } else {
      console.log('   ✅ Sin confusiones detectadas - Sistema funcionando correctamente');
    }
    
    // Mostrar matriz de distancias
    console.log('\n📊 MATRIZ DE DISTANCIAS:');
    console.log('='.repeat(80));
    console.log('Usuario 1                    vs Usuario 2                    | Distancia');
    console.log('-'.repeat(80));
    
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];
        const desc1 = JSON.parse(user1.faceDescriptor);
        const desc2 = JSON.parse(user2.faceDescriptor);
        
        const distance = euclideanDistance(desc1, desc2);
        const status = distance < threshold ? '⚠️ CONFUSIÓN' : '✅ OK';
        
        console.log(
          `${user1.name.padEnd(25)} vs ${user2.name.padEnd(25)} | ${distance.toFixed(3)} ${status}`
        );
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar prueba
testFacialConfusion();
