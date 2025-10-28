const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function fixElizabethPassword() {
  try {
    console.log('🔧 Solucionando la contraseña de Elizabeth...');
    
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth'
    });

    // Verificar usuario actual
    const [current] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE email = ?',
      ['elygonzalez9044@gmail.com']
    );
    
    if (current.length === 0) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('👤 Usuario encontrado:', current[0]);

    // Crear contraseña simple y clara
    const newPassword = 'elizabeth123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('🔐 Nueva contraseña (texto):', newPassword);
    console.log('🔐 Hash generado:', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar en la base de datos
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'elygonzalez9044@gmail.com']
    );
    
    console.log('💾 Filas afectadas:', result.affectedRows);
    
    // Verificar que se guardó correctamente
    const [updated] = await connection.execute(
      'SELECT password FROM users WHERE email = ?',
      ['elygonzalez9044@gmail.com']
    );
    
    console.log('✅ Hash en BD:', updated[0].password.substring(0, 20) + '...');
    
    // Probar la comparación
    const isValid = await bcrypt.compare(newPassword, updated[0].password);
    console.log('🧪 Test de comparación:', isValid);
    
    await connection.end();
    
    if (isValid) {
      console.log('\n🎉 ¡Contraseña actualizada exitosamente!');
      console.log('📧 Email: elygonzalez9044@gmail.com');
      console.log('🔑 Contraseña: elizabeth123');
    } else {
      console.log('❌ Error en la comparación de contraseñas');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

fixElizabethPassword();