const mysql = require('mysql2/promise');

async function checkUserDates() {
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

    // Verificar fechas del usuario Andrés
    console.log('\n📊 Fechas del usuario andres@gmail.com:');
    const [andresData] = await connection.execute(`
      SELECT id, email, name,
             DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
             DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') as updatedAt,
             DATE_FORMAT(lastLogin, '%Y-%m-%d %H:%i:%s') as lastLogin,
             isActive
      FROM users 
      WHERE email = 'andres@gmail.com'
    `);
    
    if (andresData.length > 0) {
      console.log('Usuario Andrés:');
      console.log(JSON.stringify(andresData[0], null, 2));
    }

    // Verificar fechas del usuario Ximena
    console.log('\n📊 Fechas del usuario ximenal@gmail.com:');
    const [ximenaData] = await connection.execute(`
      SELECT id, email, name,
             DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt,
             DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') as updatedAt,
             DATE_FORMAT(lastLogin, '%Y-%m-%d %H:%i:%s') as lastLogin,
             isActive
      FROM users 
      WHERE email = 'ximenal@gmail.com'
    `);
    
    if (ximenaData.length > 0) {
      console.log('Usuario Ximena:');
      console.log(JSON.stringify(ximenaData[0], null, 2));
    }

    // Mostrar resumen de todos los usuarios
    console.log('\n📋 Resumen de todos los usuarios:');
    const [allUsers] = await connection.execute(`
      SELECT id, email, name,
             CASE 
               WHEN createdAt = '0000-00-00 00:00:00' THEN 'FECHA CERO'
               WHEN createdAt IS NULL THEN 'NULL'
               ELSE DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s')
             END as createdAt,
             CASE 
               WHEN lastLogin = '0000-00-00 00:00:00' THEN 'FECHA CERO'
               WHEN lastLogin IS NULL THEN 'NULL'
               ELSE DATE_FORMAT(lastLogin, '%Y-%m-%d %H:%i:%s')
             END as lastLogin,
             isActive
      FROM users 
      ORDER BY id DESC
    `);
    
    console.table(allUsers);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

checkUserDates();