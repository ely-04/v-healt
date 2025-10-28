import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configurar variables de entorno
dotenv.config();

const app = express();

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

// Función para obtener conexión
async function getDBConnection() {
  try {
    return await mysql.createConnection(dbConfig);
  } catch (error) {
    console.error('❌ Error de conexión a la base de datos:', error);
    throw error;
  }
}

// Ruta básica
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🌿 V-Health API funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
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
    const connection = await getDBConnection();
    
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
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'vhealth-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
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
    console.error('❌ Error en login:', error);
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
    const connection = await getDBConnection();
    
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

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await connection.execute(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, fullName, 'user']
    );
    
    await connection.end();

    const token = jwt.sign(
      { userId: result.insertId, email: email, role: 'user' },
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
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Generar CAPTCHA simple
app.get('/api/captcha/generate', (req, res) => {
  const captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
  res.json({
    success: true,
    captcha: captcha
  });
});

// Verificar CAPTCHA
app.post('/api/captcha/verify', (req, res) => {
  const { captcha, userInput } = req.body;
  const isValid = captcha && userInput && captcha.toUpperCase() === userInput.toUpperCase();
  
  res.json({
    success: true,
    valid: isValid,
    message: isValid ? 'CAPTCHA válido' : 'CAPTCHA inválido'
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('🌿🚀 V-Health Server iniciado exitosamente!');
  console.log(`📡 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`🕒 Iniciado en: ${new Date().toLocaleString()}`);
  console.log('🔄 Presiona Ctrl+C para detener el servidor');
});

// Manejo correcto de cierre
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor V-Health...');
  server.close(() => {
    console.log('✅ Servidor detenido correctamente');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Señal SIGTERM recibida, cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Evitar que el proceso termine inesperadamente
process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  // No cerrar el servidor por errores menores
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Rechazo no manejado en:', promise, 'razón:', reason);
  // No cerrar el servidor por errores menores
});

console.log('🎯 V-Health Backend cargado y listo para recibir requests!');