const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function checkTableStructure() {
  try {
    console.log('🔍 Consultando estructura de la base de datos...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    // Verificar estructura de la tabla users
    console.log('\n📋 Estructura de la tabla users:');
    const [columns] = await connection.execute('DESCRIBE users');
    console.table(columns);

    // Consultar todos los usuarios
    console.log('\n👥 Usuarios en la base de datos:');
    const [users] = await connection.execute('SELECT * FROM users');
    console.table(users);

    await connection.end();
    console.log('\n✅ Consulta completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTableStructure();