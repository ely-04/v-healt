-- Migración para agregar campos de reconocimiento facial
-- Ejecutar este script en tu base de datos MySQL

USE vhealth_db;

-- Agregar campos para reconocimiento facial a la tabla users
ALTER TABLE users 
ADD COLUMN faceDescriptor TEXT NULL,
ADD COLUMN faceRegisteredAt DATETIME NULL,
ADD COLUMN faceMetadata TEXT NULL,
ADD COLUMN loginMethod ENUM('password', 'facial') DEFAULT 'password';

-- Crear índice para mejorar búsquedas de usuarios con rostro registrado
CREATE INDEX idx_face_registered ON users(faceRegisteredAt);

-- Verificar que los campos se agregaron correctamente
DESCRIBE users;

-- Mostrar usuarios existentes (para verificar que no se perdieron datos)
SELECT id, name, email, createdAt, faceRegisteredAt, loginMethod FROM users LIMIT 5;