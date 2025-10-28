#!/usr/bin/env node

/**
 * Script para crear la base de datos V-Health en MySQL
 * Ejecutar: node setup_mysql_database.js
 */

import mysql from 'mysql2/promise';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

const DB_NAME = process.env.DB_NAME || 'vhealth';

async function createDatabase() {
  let connection;
  
  try {
    console.log('🔧 Conectando a MySQL...');
    
    // Conectar a MySQL sin especificar base de datos
    connection = await mysql.createConnection(DB_CONFIG);
    
    console.log('✅ Conectado a MySQL');
    
    // Crear base de datos si no existe
    console.log(`📁 Creando base de datos ${DB_NAME}...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} 
                              DEFAULT CHARACTER SET utf8mb4 
                              DEFAULT COLLATE utf8mb4_unicode_ci`);
    
    // Usar la base de datos
    await connection.execute(`USE ${DB_NAME}`);
    
    // Crear tabla de usuarios
    console.log('👥 Creando tabla users...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol ENUM('admin', 'usuario') DEFAULT 'usuario',
        activo BOOLEAN DEFAULT TRUE,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_rol (rol),
        INDEX idx_activo (activo)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableSQL);
    
    // Verificar si ya existen usuarios
    const [existingUsers] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Ya existen usuarios en la base de datos');
      console.log('🔍 Usuarios existentes:');
      const [users] = await connection.execute('SELECT id, nombre, email, rol FROM users');
      console.table(users);
    } else {
      // Crear usuarios de prueba
      console.log('👤 Creando usuarios de prueba...');
      
      // Hash de contraseñas
      const adminPassword = await bcryptjs.hash('Admin123!', 12);
      const userPassword = await bcryptjs.hash('User123!', 12);
      
      const users = [
        ['Administrador V-Health', 'admin@vhealth.com', adminPassword, 'admin'],
        ['Usuario Demo', 'user@vhealth.com', userPassword, 'usuario'],
        ['Dr. Juan Pérez', 'doctor@vhealth.com', userPassword, 'usuario'],
        ['María García', 'maria@vhealth.com', userPassword, 'usuario']
      ];
      
      const insertSQL = 'INSERT INTO users (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
      
      for (const user of users) {
        await connection.execute(insertSQL, user);
        console.log(`✅ Usuario creado: ${user[1]}`);
      }
    }
    
    // Mostrar estadísticas finales
    const [stats] = await connection.execute(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as administradores,
        SUM(CASE WHEN rol = 'usuario' THEN 1 ELSE 0 END) as usuarios_regulares,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as usuarios_activos
      FROM users
    `);
    
    console.log('\n📊 ESTADÍSTICAS DE LA BASE DE DATOS:');
    console.table(stats[0]);
    
    console.log('\n🎉 Base de datos configurada exitosamente!');
    console.log('\n📝 CREDENCIALES DE PRUEBA:');
    console.log('👨‍💼 Admin: admin@vhealth.com / Admin123!');
    console.log('👤 Usuario: user@vhealth.com / User123!');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔒 Conexión cerrada');
    }
  }
}

// Ejecutar el script
if (import.meta.url === `file://${process.argv[1]}`) {
  createDatabase();
}

export default createDatabase;