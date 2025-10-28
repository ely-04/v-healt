-- Script simple para crear la BD V-Health
-- Ejecutar línea por línea en phpMyAdmin

-- 1. Crear base de datos
CREATE DATABASE IF NOT EXISTS vhealth;

-- 2. Seleccionar la base de datos
USE vhealth;

-- 3. Crear tabla usuarios
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario',
    activo TINYINT(1) DEFAULT 1,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 4. Verificar que se creó la tabla
SHOW TABLES;

-- 5. Ver estructura de la tabla
DESCRIBE users;