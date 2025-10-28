import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root', 
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    console.log('🔍 Consultando usuarios en la base de datos...\n');
    
    const [rows] = await connection.execute(
      'SELECT id, email, full_name, role, created_at FROM users ORDER BY id'
    );

    if (rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      console.log('✅ Usuarios encontrados:');
      console.table(rows);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error consultando base de datos:', error.message);
  }
}

checkUsers();