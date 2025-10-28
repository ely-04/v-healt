const mysql = require('mysql2/promise');

async function fixUserDates() {
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
    const currentDate = new Date();
    
    // Buscar usuarios con fechas NULL
    console.log('\n🔍 Buscando usuarios con fechas NULL...');
    const [usersWithNullDates] = await connection.execute(
      'SELECT id, email, name, createdAt, updatedAt FROM users WHERE createdAt IS NULL OR updatedAt IS NULL'
    );

    if (usersWithNullDates.length === 0) {
      console.log('✅ No hay usuarios con fechas NULL');
      return;
    }

    console.log(`\n📋 Encontrados ${usersWithNullDates.length} usuarios con fechas NULL:`);
    console.table(usersWithNullDates);

    // Actualizar usuarios con fechas NULL
    console.log('\n🔧 Actualizando fechas...');
    const [result] = await connection.execute(`
      UPDATE users 
      SET 
        createdAt = CASE WHEN createdAt IS NULL THEN ? ELSE createdAt END,
        updatedAt = CASE WHEN updatedAt IS NULL THEN ? ELSE updatedAt END,
        isActive = CASE WHEN isActive IS NULL THEN 1 ELSE isActive END
      WHERE createdAt IS NULL OR updatedAt IS NULL OR isActive IS NULL
    `, [currentDate, currentDate]);

    console.log(`✅ ${result.affectedRows} usuarios actualizados`);

    // Verificar resultados
    console.log('\n📊 Verificando usuarios actualizados...');
    const [updatedUsers] = await connection.execute(
      'SELECT id, email, name, createdAt, updatedAt, isActive FROM users WHERE id IN (SELECT id FROM (SELECT id FROM users WHERE createdAt IS NOT NULL AND updatedAt IS NOT NULL ORDER BY id DESC LIMIT 10) as subquery) ORDER BY id DESC'
    );
    
    console.table(updatedUsers);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

fixUserDates();