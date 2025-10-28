// Script para mostrar la estructura de la tabla users
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vhealth'
});

try {
  console.log('🔍 ESTRUCTURA DE LA TABLA USERS:');
  console.log('================================');
  
  // Mostrar estructura de la tabla
  const [structure] = await connection.execute('DESCRIBE users');
  console.table(structure);
  
  console.log('\n👥 USUARIOS EN LA BASE DE DATOS:');
  console.log('================================');
  
  // Mostrar usuarios
  const [users] = await connection.execute('SELECT id, nombre, email, rol, activo, createdAt FROM users');
  console.table(users);
  
  console.log('\n📊 ESTADÍSTICAS:');
  console.log('================');
  
  const [stats] = await connection.execute(`
    SELECT 
      COUNT(*) as total_usuarios,
      SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as administradores,
      SUM(CASE WHEN rol = 'usuario' THEN 1 ELSE 0 END) as usuarios_regulares,
      SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as usuarios_activos
    FROM users
  `);
  
  console.table(stats[0]);
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}