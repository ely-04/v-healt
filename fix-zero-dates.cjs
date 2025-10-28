const mysql = require('mysql2/promise');

async function fixZeroDates() {
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

    // Obtener fecha actual
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    console.log(`📅 Fecha actual a usar: ${currentDate}`);

    // Buscar usuarios con fechas cero o NULL
    console.log('\n🔍 Buscando usuarios con fechas problemáticas...');
    const [problematicUsers] = await connection.execute(`
      SELECT id, email, name, createdAt, updatedAt, lastLogin
      FROM users 
      WHERE createdAt = '0000-00-00 00:00:00' 
         OR updatedAt = '0000-00-00 00:00:00'
         OR createdAt IS NULL 
         OR updatedAt IS NULL
    `);

    if (problematicUsers.length === 0) {
      console.log('✅ No hay usuarios con fechas problemáticas');
    } else {
      console.log(`\n📋 Encontrados ${problematicUsers.length} usuarios con fechas problemáticas:`);
      problematicUsers.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Name: ${user.name}`);
        console.log(`  CreatedAt: ${user.createdAt}, UpdatedAt: ${user.updatedAt}`);
      });

      // Actualizar fechas problemáticas
      console.log('\n🔧 Actualizando fechas problemáticas...');
      const [result] = await connection.execute(`
        UPDATE users 
        SET 
          createdAt = ?,
          updatedAt = ?,
          isActive = 1
        WHERE createdAt = '0000-00-00 00:00:00' 
           OR updatedAt = '0000-00-00 00:00:00'
           OR createdAt IS NULL 
           OR updatedAt IS NULL
      `, [currentDate, currentDate]);

      console.log(`✅ ${result.affectedRows} usuarios actualizados`);
    }

    // Mostrar todos los usuarios con sus fechas actuales
    console.log('\n📊 Estado actual de todos los usuarios:');
    const [allUsers] = await connection.execute(`
      SELECT id, email, name, 
             DATE_FORMAT(createdAt, '%Y-%m-%d %H:%i:%s') as createdAt_formatted,
             DATE_FORMAT(updatedAt, '%Y-%m-%d %H:%i:%s') as updatedAt_formatted,
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

fixZeroDates();