const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function resetPassword() {
  try {
    console.log('🔐 Reseteando contraseña para Elizabeth...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    // Nueva contraseña simple
    const newPassword = 'elizabeth123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar la contraseña en la base de datos
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'elygonzalez9044@gmail.com']
    );
    
    await connection.end();
    
    if (result.affectedRows > 0) {
      console.log('✅ Contraseña actualizada exitosamente!');
      console.log('📧 Email: elygonzalez9044@gmail.com');
      console.log('🔑 Nueva contraseña: elizabeth123');
      console.log('');
      console.log('🧪 Ahora puedes usar estas credenciales para hacer login');
    } else {
      console.log('❌ No se encontró el usuario');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

resetPassword();