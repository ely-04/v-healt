// Script para actualizar los datos de usuarios
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vhealth'
});

try {
  console.log('🔧 Actualizando datos de usuarios...');
  
  // Actualizar admin
  await connection.execute(
    "UPDATE users SET name = ?, role = ? WHERE email = ?",
    ['Administrador V-Health', 'admin', 'admin@vhealth.com']
  );
  
  // Actualizar usuario regular
  await connection.execute(
    "UPDATE users SET name = ?, role = ? WHERE email = ?",
    ['Usuario Demo', 'user', 'user@vhealth.com']
  );
  
  console.log('✅ Usuarios actualizados correctamente');
  
  // Mostrar resultado
  const [users] = await connection.execute('SELECT id, name, email, role, isActive, createdAt FROM users');
  console.log('\n👥 USUARIOS ACTUALIZADOS:');
  console.table(users);
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}