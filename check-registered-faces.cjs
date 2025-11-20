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

async function checkRegisteredFaces() {
  let connection;
  
  try {
    console.log('🔍 Verificando rostros registrados en la base de datos...\n');
    
    connection = await mysql.createConnection(dbConfig);
    
    // Obtener usuarios con rostros registrados
    const [users] = await connection.execute(
      `SELECT 
        id, 
        name, 
        email, 
        faceDescriptor, 
        faceRegisteredAt,
        isActive
      FROM users 
      WHERE faceDescriptor IS NOT NULL
      ORDER BY faceRegisteredAt DESC`
    );

    console.log(`📊 Total de usuarios con reconocimiento facial: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ No hay usuarios con rostros registrados.');
      console.log('💡 Para registrar rostros:');
      console.log('   1. Ir a http://localhost:3000');
      console.log('   2. Hacer login normal con usuario/contraseña');
      console.log('   3. Ir a "Configuración" > "Registrar Rostro"');
      console.log('   4. Seguir las instrucciones para capturar el rostro\n');
      return;
    }

    users.forEach((user, index) => {
      try {
        const descriptor = JSON.parse(user.faceDescriptor);
        const descriptorLength = descriptor ? descriptor.length : 0;
        const isActive = user.isActive ? '✅ Activo' : '❌ Inactivo';
        const registeredDate = user.faceRegisteredAt 
          ? new Date(user.faceRegisteredAt).toLocaleString('es-ES')
          : 'Fecha desconocida';

        console.log(`${index + 1}. 👤 ${user.name}`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🆔 ID: ${user.id}`);
        console.log(`   📊 Descriptor: ${descriptorLength} valores (${descriptorLength === 128 ? '✅ Válido' : '❌ Inválido'})`);
        console.log(`   📅 Registrado: ${registeredDate}`);
        console.log(`   🔘 Estado: ${isActive}`);
        console.log('');
      } catch (error) {
        console.log(`${index + 1}. ❌ ${user.name} - Error en descriptor facial`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🚨 Problema: Descriptor corrupto o inválido`);
        console.log('');
      }
    });

    // Verificar usuarios activos con rostros válidos
    const activeUsersWithValidFaces = users.filter(user => {
      try {
        if (!user.isActive) return false;
        const descriptor = JSON.parse(user.faceDescriptor);
        return descriptor && descriptor.length === 128;
      } catch {
        return false;
      }
    });

    console.log('📋 RESUMEN:');
    console.log(`   Total de rostros: ${users.length}`);
    console.log(`   Rostros válidos y activos: ${activeUsersWithValidFaces.length}`);
    console.log(`   ✅ Sistema facial: ${activeUsersWithValidFaces.length > 0 ? 'OPERATIVO' : 'SIN ROSTROS VÁLIDOS'}`);

    if (activeUsersWithValidFaces.length > 0) {
      console.log('\n🎯 USUARIOS QUE PUEDEN USAR LOGIN FACIAL:');
      activeUsersWithValidFaces.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    }

  } catch (error) {
    console.error('❌ Error verificando rostros registrados:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar verificación
checkRegisteredFaces().then(() => {
  console.log('\n✅ Verificación completada.');
  process.exit(0);
});