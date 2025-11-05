const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 
    'http://localhost:5176', 'http://localhost:5177', 'http://localhost:5178', 
    'http://localhost:5179', 'http://localhost:5180', 'http://localhost:5181', 
    'http://localhost:5182'
  ],
  credentials: true
}));

app.use(express.json());

// Configuración de SQLite
const dbPath = path.join(__dirname, '../vhealth.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error abriendo base de datos SQLite:', err);
  } else {
    console.log('✅ Conectado a SQLite en:', dbPath);
    initializeDatabase();
  }
});

// Promisificar métodos de SQLite
function promiseRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function promiseAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function promiseGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Inicializar base de datos
async function initializeDatabase() {
  try {
    // Crear tabla de usuarios
    await promiseRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar usuarios de prueba si no existen
    const existingUser1 = await promiseGet('SELECT * FROM users WHERE email = ?', ['andres@gmail.com']);
    
    if (!existingUser1) {
      const hashedPassword = await bcrypt.hash('123456', 12);
      await promiseRun(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['andres@gmail.com', hashedPassword, 'Andrés', 'user']
      );
      console.log('✅ Usuario de prueba creado: andres@gmail.com / 123456');
    }

    const existingUser2 = await promiseGet('SELECT * FROM users WHERE email = ?', ['elizabeth@gmail.com']);
    
    if (!existingUser2) {
      const hashedPassword = await bcrypt.hash('123456', 12);
      await promiseRun(
        'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
        ['elizabeth@gmail.com', hashedPassword, 'Elizabeth Gonzalez', 'user']
      );
      console.log('✅ Usuario creado: elizabeth@gmail.com / 123456');
    }

    console.log('✅ Base de datos inicializada');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
}

// RUTAS DE LA API

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔍 Intento de login: ${email}`);
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  try {
    // Buscar usuario en la base de datos
    const user = await promiseGet(
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    console.log(`👤 Usuario encontrado: ${user.name}`);
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(`🔐 Contraseña válida: ${isValidPassword}`);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(`✅ Login exitoso para: ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  console.log(`📝 Intento de registro: ${email}`);
  
  if (!email || !password || !name) {
    return res.status(400).json({
      success: false,
      message: 'Email, contraseña y nombre son requeridos'
    });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await promiseGet(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }
    
    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Insertar nuevo usuario
    await promiseRun(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, 'user']
    );
    
    console.log(`✅ Registro exitoso: ${email}`);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente'
    });
    
  } catch (error) {
    console.error('💥 Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar usuario'
    });
  }
});

// Ruta para obtener información del usuario (requiere token)
app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Iniciando V-Health Server (SQLite)...');
  console.log('✅ ¡V-Health Server iniciado correctamente!');
  console.log('🌐 Servidor corriendo en: http://localhost:' + PORT);
  console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
  console.log('🔄 Mantener esta ventana abierta para que funcione el login');
  console.log('🛑 Presiona Ctrl+C para detener');
  console.log('='.repeat(50) + '\n');
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor V-Health...');
  db.close((err) => {
    if (err) {
      console.error('Error cerrando base de datos:', err);
    } else {
      console.log('✅ Servidor cerrado correctamente');
    }
    process.exit(0);
  });
});
