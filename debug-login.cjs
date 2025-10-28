const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function debugLogin() {
  try {
    console.log('🔍 Debug del proceso de login...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    const email = 'elygonzalez9044@gmail.com';
    const password = 'elizabeth123';
    
    // Buscar usuario
    const [rows] = await connection.execute(
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );
    
    console.log('👤 Usuario encontrado:', rows.length > 0);
    
    if (rows.length > 0) {
      const user = rows[0];
      console.log('📧 Email DB:', user.email);
      console.log('👤 Nombre:', user.name);
      console.log('🔑 Rol:', user.role);
      console.log('🔐 Hash en DB:', user.password.substring(0, 20) + '...');
      
      // Probar la comparación de contraseñas
      const isValid = await bcrypt.compare(password, user.password);
      console.log('✅ Contraseña válida:', isValid);
      
      if (!isValid) {
        console.log('🔧 Creando nuevo hash...');
        const newHash = await bcrypt.hash(password, 12);
        console.log('🆕 Nuevo hash:', newHash.substring(0, 20) + '...');
        
        // Actualizar con el nuevo hash
        await connection.execute(
          'UPDATE users SET password = ? WHERE email = ?',
          [newHash, email]
        );
        console.log('💾 Hash actualizado en la base de datos');
      }
    }
    
    await connection.end();

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

debugLogin();