import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function migrateFacialRecognition() {
  let connection;
  
  try {
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    console.log('🔌 Conectado a la base de datos');

    // Definir comandos SQL
    const commands = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS faceDescriptor TEXT NULL',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS faceRegisteredAt DATETIME NULL', 
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS faceMetadata TEXT NULL',
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS loginMethod ENUM('password', 'facial') DEFAULT 'password'",
      'CREATE INDEX IF NOT EXISTS idx_face_registered ON users(faceRegisteredAt)'
    ];

    console.log('📝 Ejecutando migración de reconocimiento facial...');

    for (const command of commands) {
      try {
        await connection.execute(command);
        console.log(`✅ Ejecutado: ${command.substring(0, 60)}...`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  Ya existe: ${command.substring(0, 60)}...`);
        } else {
          throw error;
        }
      }
    }

    // Verificar estructura de la tabla
    const [rows] = await connection.execute('DESCRIBE users');
    console.log('\n📊 Estructura actual de la tabla users:');
    
    const faceFields = rows.filter(row => 
      ['faceDescriptor', 'faceRegisteredAt', 'faceMetadata', 'loginMethod'].includes(row.Field)
    );

    if (faceFields.length >= 4) {
      console.log('✅ Campos de reconocimiento facial agregados:');
      faceFields.forEach(field => {
        console.log(`   - ${field.Field}: ${field.Type}`);
      });
    } else {
      console.log('❌ Algunos campos no se agregaron correctamente');
    }

    console.log('\n🎉 Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Solución: Verifica las credenciales de la base de datos');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solución: Asegúrate de que MySQL esté ejecutándose');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

migrateFacialRecognition();