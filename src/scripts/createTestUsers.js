import User from '../models/User.js';
import { connectDB, closeDB } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();

    // Limpiar usuarios existentes (opcional)
    await User.destroy({ where: {} });

    // Crear usuarios de prueba
    const testUsers = [
      {
        name: 'Administrador',
        email: 'admin@vhealth.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        name: 'Usuario de Prueba',
        email: 'user@vhealth.com',
        password: 'User123!',
        role: 'user'
      },
      {
        name: 'Elizabeth García',
        email: 'elizabeth@vhealth.com',
        password: 'Elizabeth123!',
        role: 'user'
      }
    ];

    // Crear usuarios
    for (const userData of testUsers) {
      const user = await User.create(userData);
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    }

    console.log('\n🎉 Usuarios de prueba creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('Admin: admin@vhealth.com / Admin123!');
    console.log('Usuario: user@vhealth.com / User123!');
    console.log('Elizabeth: elizabeth@vhealth.com / Elizabeth123!');

  } catch (error) {
    console.error('❌ Error creando usuarios:', error);
    if (error.name === 'SequelizeValidationError') {
      error.errors.forEach(err => {
        console.error(`- ${err.path}: ${err.message}`);
      });
    }
  } finally {
    // Cerrar conexión
    await closeDB();
    process.exit(0);
  }
};

createTestUsers();