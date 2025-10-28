const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updateAndresPassword() {
  let connection;
  
  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'vhealth'
    });

    console.log('✅ Conectado a la base de datos');

    // Nueva contraseña
    const newPassword = 'andres123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña del usuario Andrés
    const [result] = await connection.execute(
      'UPDATE users SET password = ? WHERE email = ?',
      [hashedPassword, 'andres@gmail.com']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Contraseña de Andrés actualizada exitosamente');
      console.log('📧 Email: andres@gmail.com');
      console.log('🔑 Nueva contraseña: andres123');
    } else {
      console.log('❌ No se encontró el usuario andres@gmail.com');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

updateAndresPassword();