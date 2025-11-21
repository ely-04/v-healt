/**
 * Script para limpiar descriptores faciales confundidos
 * Permite eliminar los descriptores de usuarios específicos para que puedan re-registrarse
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vhealth'
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function clearFacialData() {
  let connection;
  
  try {
    console.log('🧹 Script para limpiar datos faciales confundidos\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos\n');
    
    // Obtener usuarios con rostros registrados
    const [users] = await connection.execute(
      'SELECT id, name, email, faceDescriptor, faceRegisteredAt FROM users WHERE faceDescriptor IS NOT NULL ORDER BY id'
    );
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios con rostros registrados');
      rl.close();
      return;
    }
    
    console.log('📋 Usuarios con reconocimiento facial:\n');
    users.forEach(user => {
      const registeredDate = user.faceRegisteredAt ? new Date(user.faceRegisteredAt).toLocaleString('es-ES') : 'Sin fecha';
      console.log(`   ${user.id}. ${user.name} (${user.email})`);
      console.log(`      Registrado: ${registeredDate}\n`);
    });
    
    console.log('⚠️  ADVERTENCIA: Esta operación eliminará los datos faciales de los usuarios seleccionados.');
    console.log('   Los usuarios afectados deberán re-registrar sus rostros.\n');
    
    const answer = await question('¿Deseas continuar? (si/no): ');
    
    if (answer.toLowerCase() !== 'si' && answer.toLowerCase() !== 's') {
      console.log('\n❌ Operación cancelada');
      rl.close();
      await connection.end();
      return;
    }
    
    console.log('\nOpciones:');
    console.log('1. Limpiar usuarios específicos (ingresar IDs)');
    console.log('2. Limpiar todos excepto uno (útil para mantener solo un registro válido)');
    console.log('3. Limpiar todos los usuarios');
    console.log('4. Cancelar\n');
    
    const option = await question('Selecciona una opción (1-4): ');
    
    let usersToClean = [];
    
    switch(option) {
      case '1':
        const ids = await question('\nIngresa los IDs a limpiar (separados por comas): ');
        usersToClean = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        break;
        
      case '2':
        const keepId = await question('\nIngresa el ID del usuario a MANTENER: ');
        const keepIdNum = parseInt(keepId.trim());
        usersToClean = users.filter(u => u.id !== keepIdNum).map(u => u.id);
        break;
        
      case '3':
        usersToClean = users.map(u => u.id);
        break;
        
      case '4':
      default:
        console.log('\n❌ Operación cancelada');
        rl.close();
        await connection.end();
        return;
    }
    
    if (usersToClean.length === 0) {
      console.log('\n❌ No se seleccionaron usuarios para limpiar');
      rl.close();
      await connection.end();
      return;
    }
    
    // Mostrar resumen
    console.log('\n📊 RESUMEN DE OPERACIÓN:');
    console.log('   Usuarios a limpiar:');
    usersToClean.forEach(id => {
      const user = users.find(u => u.id === id);
      if (user) {
        console.log(`      → ${user.name} (ID: ${id})`);
      }
    });
    
    const confirm = await question('\n¿Confirmas la operación? (si/no): ');
    
    if (confirm.toLowerCase() !== 'si' && confirm.toLowerCase() !== 's') {
      console.log('\n❌ Operación cancelada');
      rl.close();
      await connection.end();
      return;
    }
    
    // Limpiar datos faciales
    console.log('\n🔄 Limpiando datos faciales...');
    
    for (const userId of usersToClean) {
      await connection.execute(
        'UPDATE users SET faceDescriptor = NULL, faceRegisteredAt = NULL, faceMetadata = NULL WHERE id = ?',
        [userId]
      );
      
      const user = users.find(u => u.id === userId);
      console.log(`   ✅ Limpiado: ${user.name} (ID: ${userId})`);
    }
    
    console.log('\n✅ Operación completada exitosamente\n');
    
    console.log('📝 SIGUIENTES PASOS:');
    console.log('   1. Los usuarios afectados deben hacer login con email/contraseña');
    console.log('   2. Ir al Dashboard');
    console.log('   3. Usar "🔐 Configurar Login Facial"');
    console.log('   4. Capturar el rostro con buena iluminación');
    console.log('   5. Ejecutar nuevamente "node test-facial-confusion.cjs" para verificar');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar
clearFacialData();
