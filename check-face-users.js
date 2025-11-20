const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vhealth'
};

async function checkFaceUsers() {
  let connection;
  
  try {
    console.log('🔍 Verificando usuarios con registro facial...\n');
    
    // Conectar a la base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado a la base de datos');
    
    // Consultar todos los usuarios
    const [allUsers] = await connection.execute(
      'SELECT id, name, email, faceDescriptor, faceRegisteredAt, createdAt FROM users ORDER BY id'
    );
    
    console.log(`\n👥 Total de usuarios en la base de datos: ${allUsers.length}\n`);
    
    // Separar usuarios con y sin rostro
    const usersWithFace = allUsers.filter(user => user.faceDescriptor !== null);
    const usersWithoutFace = allUsers.filter(user => user.faceDescriptor === null);
    
    console.log('📊 RESUMEN:');
    console.log(`✅ Usuarios CON rostro registrado: ${usersWithFace.length}`);
    console.log(`❌ Usuarios SIN rostro registrado: ${usersWithoutFace.length}`);
    
    if (usersWithFace.length > 0) {
      console.log('\n🔐 USUARIOS CON REGISTRO FACIAL:');
      console.log('='.repeat(60));
      usersWithFace.forEach((user, index) => {
        const descriptorLength = user.faceDescriptor ? JSON.parse(user.faceDescriptor).length : 0;
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Nombre: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rostro registrado: ${user.faceRegisteredAt ? new Date(user.faceRegisteredAt).toLocaleString('es-ES') : 'Fecha no disponible'}`);
        console.log(`   Descriptor (dimensiones): ${descriptorLength} valores`);
        console.log('   ' + '-'.repeat(50));
      });
    }
    
    if (usersWithoutFace.length > 0) {
      console.log('\n❌ USUARIOS SIN REGISTRO FACIAL:');
      console.log('='.repeat(60));
      usersWithoutFace.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id} - ${user.name} (${user.email})`);
        console.log(`   Registrado: ${new Date(user.createdAt).toLocaleString('es-ES')}`);
      });
    }
    
    // Consultar estadísticas adicionales
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(faceDescriptor) as with_face,
        COUNT(*) - COUNT(faceDescriptor) as without_face,
        MIN(faceRegisteredAt) as first_face_registration,
        MAX(faceRegisteredAt) as last_face_registration
      FROM users
    `);
    
    const stat = stats[0];
    console.log('\n📈 ESTADÍSTICAS DETALLADAS:');
    console.log('='.repeat(40));
    console.log(`Total usuarios: ${stat.total}`);
    console.log(`Con rostro: ${stat.with_face} (${((stat.with_face / stat.total) * 100).toFixed(1)}%)`);
    console.log(`Sin rostro: ${stat.without_face} (${((stat.without_face / stat.total) * 100).toFixed(1)}%)`);
    
    if (stat.first_face_registration) {
      console.log(`Primer registro facial: ${new Date(stat.first_face_registration).toLocaleString('es-ES')}`);
      console.log(`Último registro facial: ${new Date(stat.last_face_registration).toLocaleString('es-ES')}`);
    }
    
    console.log('\n💡 RECOMENDACIONES:');
    if (usersWithoutFace.length > 0) {
      console.log('• Los usuarios sin registro facial deben:');
      console.log('  1. Hacer login normal');
      console.log('  2. Ir al Dashboard');
      console.log('  3. Usar "🔐 Configurar Login Facial"');
    }
    
    if (usersWithFace.length > 0) {
      console.log('• Los usuarios con registro facial pueden:');
      console.log('  1. Usar el botón "🔐 Acceder con Reconocimiento Facial" en login');
      console.log('  2. La cámara detectará su rostro automáticamente');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 Problema de acceso a la base de datos.');
      console.log('Verifica las credenciales en el archivo .env:');
      console.log('- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 No se puede conectar a MySQL.');
      console.log('Asegúrate de que MySQL esté ejecutándose.');
    }
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Conexión cerrada');
    }
  }
}

// Ejecutar la verificación
checkFaceUsers();