import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

// Middlewares básicos
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177'],
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

// Ruta de prueba
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
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    const user = rows[0];
    
    console.log('🔍 DEBUG LOGIN:');
    console.log('📧 Email recibido:', email);
    console.log('🔑 Password recibido:', password);
    console.log('👤 Usuario encontrado:', user.email);
    console.log('🔐 Hash en BD:', user.password.substring(0, 20) + '...');
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('✅ Password válido:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Contraseña incorrecta');
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
    console.error('Error en login:', error);
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

// Rutas de CAPTCHA
app.get('/api/captcha/generate', (req, res) => {
  // Generar código CAPTCHA simple
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let captchaCode = '';
  for (let i = 0; i < 5; i++) {
    captchaCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  const sessionId = 'session-' + Date.now();
  
  res.status(200).json({
    success: true,
    code: captchaCode,
    sessionId: sessionId
  });
});

app.post('/api/captcha/validate', (req, res) => {
  const { sessionId, userInput, expectedCode } = req.body;
  
  if (!sessionId || !userInput || !expectedCode) {
    return res.status(400).json({
      success: false,
      message: 'Datos de CAPTCHA incompletos'
    });
  }
  
  const isValid = userInput.toLowerCase() === expectedCode.toLowerCase();
  
  res.status(200).json({
    success: true,
    valid: isValid,
    message: isValid ? 'CAPTCHA válido' : 'CAPTCHA inválido'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de V-Health - Sistema de Salud',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Mantener el servidor corriendo
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// export default app;