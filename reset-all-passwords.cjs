const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function resetAllPasswords() {
  try {
    console.log('🔐 Reseteando contraseñas para todos los usuarios...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    // Definir contraseñas simples
    const users = [
      { email: 'admin@vhealth.com', password: 'admin123' },
      { email: 'user@vhealth.com', password: 'user123' },
      { email: 'elygonzalez9044@gmail.com', password: 'elizabeth123' },
      { email: 'crypto@vhealth.com', password: 'crypto123' }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, user.email]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ${user.email} -> contraseña: ${user.password}`);
      }
    }
    
    await connection.end();
    console.log('\n🎉 Todas las contraseñas han sido actualizadas!');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

resetAllPasswords();