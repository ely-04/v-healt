const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

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
  const { fullName, name, email, password, confirmPassword } = req.body;
  const userName = fullName || name; // Aceptar ambos
  
  if (!userName || !email || !password || !confirmPassword) {
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
      [email, hashedPassword, userName, 'user']
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

// Ruta para registro facial
app.post('/api/auth/register-face', async (req, res) => {
  try {
    const { userId, faceDescriptor, captureData } = req.body;

    if (!userId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    const connection = await getConnection();

    // Verificar que el usuario existe
    const [userRows] = await connection.execute(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userRows[0];

    // Actualizar usuario con datos faciales
    await connection.execute(
      'UPDATE users SET faceDescriptor = ?, faceRegisteredAt = NOW(), faceMetadata = ? WHERE id = ?',
      [JSON.stringify(faceDescriptor), JSON.stringify(captureData), userId]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Registro facial completado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        hasFaceAuth: true
      }
    });

  } catch (error) {
    console.error('Error en registro facial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para solicitar recuperación de contraseña
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email es requerido'
    });
  }

  try {
    const connection = await getConnection();
    
    // Buscar usuario en la base de datos
    const [rows] = await connection.execute(
      'SELECT id, email, name FROM users WHERE email = ?',
      [email]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    const user = rows[0];

    // Generar token de recuperación (válido por 1 hora)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'vhealth-secret-key',
      { expiresIn: '1h' }
    );
    
    // Configurar el transporte de correo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Envía el correo
    const resetLink = `http://localhost:5173/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      html: `<p>Haz clic <a href="${resetLink}">aquí</a> para restablecer tu contraseña.</p>`
    });

    res.status(200).json({
      success: true,
      message: 'Correo de recuperación enviado'
    });
    
  } catch (error) {
    console.error('Error en recuperación de contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para restablecer la contraseña
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    return res.status(400).json({
      success: false,
      message: 'Token y nueva contraseña son requeridos'
    });
  }

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vhealth-secret-key');
    
    const connection = await getConnection();
    
    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Actualizar la contraseña en la base de datos
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, decoded.userId]
    );
    
    await connection.end();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('Error restableciendo contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
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

// Ruta para login con reconocimiento facial
app.post('/api/auth/facial-login', async (req, res) => {
  try {
    const { faceDescriptor, confidence } = req.body;

    if (!faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Descriptor facial requerido'
      });
    }

    if (!confidence || confidence < 0.6) {
      return res.status(400).json({
        success: false,
        message: 'Confianza de reconocimiento muy baja. Intenta nuevamente.'
      });
    }

    console.log(`🔍 Intentando login facial con confianza: ${confidence}`);

    const connection = await getConnection();

    // Buscar todos los usuarios con descriptor facial registrado
    const [users] = await connection.execute(
      'SELECT id, email, name, role, faceDescriptor FROM users WHERE faceDescriptor IS NOT NULL',
      []
    );

    await connection.end();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay usuarios con reconocimiento facial registrado'
      });
    }

    let matchedUser = null;
    let bestMatch = { distance: Infinity, user: null };

    // Comparar con descriptores almacenados
    for (const user of users) {
      if (user.faceDescriptor) {
        try {
          const storedDescriptor = JSON.parse(user.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, storedDescriptor);
          
          console.log(`🧮 Distancia para ${user.email}: ${distance.toFixed(4)}`);
          
          if (distance < 0.6 && distance < bestMatch.distance) {
            bestMatch = { distance, user };
          }
        } catch (error) {
          console.error('❌ Error parsing face descriptor:', error);
        }
      }
    }

    if (bestMatch.user) {
      matchedUser = bestMatch.user;
      
      console.log(`✅ Usuario reconocido: ${matchedUser.email} (distancia: ${bestMatch.distance.toFixed(4)})`);
      
      // Actualizar último login
      const connection2 = await getConnection();
      await connection2.execute(
        'UPDATE users SET lastLogin = ? WHERE id = ?',
        [new Date(), matchedUser.id]
      );
      await connection2.end();

      // Generar JWT token
      const token = jwt.sign(
        { 
          userId: matchedUser.id, 
          email: matchedUser.email,
          role: matchedUser.role 
        },
        process.env.JWT_SECRET || 'vhealth-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login facial exitoso',
        user: {
          id: matchedUser.id,
          email: matchedUser.email,
          fullName: matchedUser.name,
          role: matchedUser.role
        },
        token,
        matchInfo: {
          confidence: confidence,
          distance: bestMatch.distance.toFixed(4),
          method: 'facial'
        }
      });
    } else {
      console.log('❌ Rostro no reconocido');
      res.status(401).json({
        success: false,
        message: 'Rostro no reconocido. Asegúrate de haber registrado tu rostro previamente.',
        debug: {
          usersWithFace: users.length,
          bestDistance: bestMatch.distance.toFixed(4),
          threshold: 0.6
        }
      });
    }

  } catch (error) {
    console.error('❌ Error en login facial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Función auxiliar para calcular distancia euclidiana
function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2 || desc1.length !== desc2.length) {
    return Infinity;
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
}

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