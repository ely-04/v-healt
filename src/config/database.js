import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Configuración de Sequelize para MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'vhealth',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Cambiar a console.log para ver queries SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL conectado correctamente');
    console.log(`📁 Base de datos: ${process.env.DB_NAME || 'vhealth'}`);
    console.log(`🌐 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    
    // Sincronizar modelos con la base de datos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('🔄 Modelos sincronizados con la base de datos');
    
    return sequelize;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
};

// Función para cerrar la conexión de manera elegante
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Conexión a MySQL cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error.message);
  }
};

export { sequelize, connectDB, closeDB };