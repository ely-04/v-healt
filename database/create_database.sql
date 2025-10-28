-- Script para crear la base de datos V-Health en MySQL (XAMPP)
-- Ejecutar este script en phpMyAdmin o en MySQL Workbench

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS vhealth 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE vhealth;

-- Crear tabla de usuarios (será creada automáticamente por Sequelize, pero aquí está la estructura de referencia)
/*
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `isActive` BOOLEAN DEFAULT TRUE,
  `lastLogin` DATETIME NULL,
  `passwordChangedAt` DATETIME NULL,
  `passwordResetToken` VARCHAR(255) NULL,
  `passwordResetExpires` DATETIME NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_created` (`createdAt`),
  INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- Mostrar información de la base de datos creada
SELECT 'Base de datos V-Health creada exitosamente' as status;
SHOW DATABASES LIKE 'vhealth';