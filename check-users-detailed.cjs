const mysql = require('mysql2/promise');

async function checkUserData() {
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

    // Verificar estructura de la tabla
    console.log('\n📋 Estructura de la tabla users:');
    const [structure] = await connection.execute('DESCRIBE users');
    console.table(structure);

    // Verificar datos de usuarios
    console.log('\n👥 Usuarios en la base de datos:');
    const [users] = await connection.execute('SELECT id, email, name, role, createdAt FROM users ORDER BY id DESC LIMIT 10');
    console.table(users);

    // Verificar usuario específico de Andrés
    console.log('\n🔍 Datos completos del usuario andres@gmail.com:');
    const [andresUser] = await connection.execute('SELECT * FROM users WHERE email = ?', ['andres@gmail.com']);
    if (andresUser.length > 0) {
      console.log('Usuario encontrado:');
      console.log(JSON.stringify(andresUser[0], null, 2));
    } else {
      console.log('❌ Usuario andres@gmail.com no encontrado');
    }

    // Verificar todos los usuarios con nombres NULL
    console.log('\n⚠️  Usuarios con nombre NULL:');
    const [nullUsers] = await connection.execute('SELECT id, email, name FROM users WHERE name IS NULL OR name = ""');
    if (nullUsers.length > 0) {
      console.table(nullUsers);
    } else {
      console.log('✅ No hay usuarios con nombre NULL');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexión cerrada');
    }
  }
}

checkUserData();