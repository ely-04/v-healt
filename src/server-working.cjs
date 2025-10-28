const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vhealth'
};

// Función para obtener conexión a la base de datos
async function getConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
    throw error;
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
    const connection = await getConnection();
    
    // Buscar usuario en la base de datos
    const [rows] = await connection.execute(
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );
    
    await connection.end();
    
    if (rows.length === 0) {
      console.log(`❌ Usuario no encontrado: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    const user = rows[0];
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

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'vhealth-secret-key',
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Login exitoso: ${user.name}`);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('💥 Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  const { fullName, email, password, confirmPassword } = req.body;
  
  if (!fullName || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Las contraseñas no coinciden'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    });
  }

  try {
    const connection = await getConnection();
    
    // Verificar si el usuario ya existe
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    
    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear nuevo usuario
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, 'user']
    );
    
    await connection.end();

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email: email, 
        role: 'user' 
      },
      process.env.JWT_SECRET || 'vhealth-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      token,
      user: {
        id: result.insertId,
        email: email,
        fullName: fullName,
        role: 'user'
      }
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta de verificación de token
app.get('/api/auth/verify', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token no proporcionado'
    });
  }

  try {
    // Verificar JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vhealth-secret-key');
    
    const connection = await getConnection();
    
    // Buscar usuario en la base de datos
    const [rows] = await connection.execute(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [decoded.userId]
    );
    
    await connection.end();
    
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = rows[0];

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
});

// Rutas de CAPTCHA (simuladas)
app.get('/api/captcha/generate', (req, res) => {
  const code = Math.random().toString(36).substring(2, 7).toUpperCase();
  const sessionId = 'session-' + Date.now();
  
  res.status(200).json({
    success: true,
    code: code,
    sessionId: sessionId
  });
});

app.post('/api/captcha/verify', (req, res) => {
  const { code, userInput } = req.body;
  
  const isValid = code && userInput && code.toLowerCase() === userInput.toLowerCase();
  
  res.status(200).json({
    success: true,
    valid: isValid
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// INICIAR SERVIDOR
const server = app.listen(PORT, () => {
  console.log('🎉 ¡V-Health Server iniciado correctamente!');
  console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log('🔄 Mantener esta ventana abierta para que funcione el login');
  console.log('🛑 Presiona Ctrl+C para detener');
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor V-Health...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Error handlers
server.on('error', (error) => {
  console.error('💥 Error del servidor:', error);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
});

console.log('🚀 Iniciando V-Health Server...');