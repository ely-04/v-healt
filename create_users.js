// Script para crear usuarios después de crear la BD
// Ejecutar: node create_users.js

import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vhealth'
});

try {
  console.log('🔧 Conectando a la base de datos...');
  
  // Verificar conexión
  await connection.execute('SELECT 1');
  console.log('✅ Conectado a MySQL');
  
  // Verificar si ya existen usuarios
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
  
  if (rows[0].count > 0) {
    console.log('⚠️ Ya existen usuarios. Eliminando...');
    await connection.execute('DELETE FROM users');
  }
  
  // Crear contraseñas encriptadas
  const adminPassword = await bcryptjs.hash('Admin123!', 10);
  const userPassword = await bcryptjs.hash('User123!', 10);
  
  // Insertar usuarios
  await connection.execute(
    'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    ['Administrador V-Health', 'admin@vhealth.com', adminPassword, 'admin']
  );
  
  await connection.execute(
    'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
    ['Usuario Demo', 'user@vhealth.com', userPassword, 'usuario']
  );
  
  console.log('✅ Usuarios creados exitosamente');
  console.log('');
  console.log('🔑 CREDENCIALES:');
  console.log('Admin: admin@vhealth.com / Admin123!');
  console.log('Usuario: user@vhealth.com / User123!');
  
  // Mostrar usuarios creados
  const [users] = await connection.execute('SELECT id, nombre, email, rol FROM users');
  console.log('');
  console.log('👥 Usuarios en la base de datos:');
  console.table(users);
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await connection.end();
}