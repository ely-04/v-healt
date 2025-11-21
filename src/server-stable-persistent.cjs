const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Cargar variables de entorno
dotenv.config();

// Import dinámico para módulos ES6
let generadorGuias;
let generadorPlantasPDF;
(async () => {
  try {
    const module = await import('./utils/generadorGuiasPDF.js');
    generadorGuias = module.default;
    console.log('✅ Generador de guías PDF cargado');
    
    const plantasModule = await import('./utils/generadorPlantasPDF.js');
    generadorPlantasPDF = plantasModule.default;
    console.log('✅ Generador de plantas PDF cargado');
  } catch (error) {
    console.error('❌ Error cargando generadores:', error.message);
  }
})();

const app = express();
const PORT = process.env.PORT || 3000;

// Pool de conexiones para mejor gestión
let connectionPool;

// Configuración de base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vhealth',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Inicializar pool de conexiones
async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando pool de conexiones...');
    connectionPool = mysql.createPool(dbConfig);
    
    // Probar conexión
    const connection = await connectionPool.getConnection();
    console.log('✅ Conexión a base de datos establecida correctamente');
    connection.release();
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    return false;
  }
}

// Configuración de email y helpers
let emailTransporter;

function mask(value) {
  if (!value) return '';
  const s = String(value);
  return s.length <= 4 ? '****' : `${s.slice(0, 2)}****${s.slice(-2)}`;
}

function getEmailConfig() {
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587', 10);
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || (user ? `V-Health <${user}>` : undefined);
  return { host, port, secure, user, pass, from };
}

async function initializeEmailService() {
  const { host, port, secure, user, pass } = getEmailConfig();

  if (!user || !pass) {
    console.warn('⚠️ Config de email incompleta. EMAIL_USER/EMAIL_PASSWORD no presentes.');
    emailTransporter = null;
    return false;
  }

  console.log('📧 Email config efectiva:', {
    host,
    port,
    secure,
    user: mask(user),
    pass: mask(pass)
  });

  try {
    const isGmail = /gmail\.com$/i.test(user) || /gmail\.com$/i.test(host);
    emailTransporter = isGmail
      ? nodemailer.createTransport({
          service: 'gmail',
          auth: { user, pass }
        })
      : nodemailer.createTransport({ host, port, secure, auth: { user, pass } });

    await emailTransporter.verify();
    console.log('✅ Servicio de email verificado');
    return true;
  } catch (err) {
    console.error('❌ Error configurando/verificando email:', err.message);
    emailTransporter = null;
    return false;
  }
}

async function sendPasswordResetEmail(toEmail, name, resetToken) {
  if (!emailTransporter) {
    console.warn('⚠️ Transporte de email no disponible.');
    return false;
  }
  const { from } = getEmailConfig();
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
      <div style="background:#2d5a27;color:#fff;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="margin:0">V-Health</h2>
        <p style="margin:0">Recuperación de Contraseña</p>
      </div>
      <div style="background:#fff;padding:24px;border:1px solid #eee;border-top:0;border-radius:0 0 8px 8px">
        <p>Hola ${name || ''},</p>
        <p>Haz clic en el botón para restablecer tu contraseña. El enlace expira en 1 hora.</p>
        <p style="text-align:center;margin:24px 0">
          <a href="${resetLink}" style="background:#2d5a27;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block">Restablecer Contraseña</a>
        </p>
        <p>Si el botón no funciona, copia este enlace:</p>
        <p style="word-break:break-all;color:#2d5a27">${resetLink}</p>
        <p style="color:#666">Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    </div>
  `;

  try {
    await emailTransporter.sendMail({
      from,
      to: toEmail,
      subject: 'Recuperación de Contraseña - V-Health',
      html
    });
    console.log(`✅ Email de recuperación enviado a ${toEmail}`);
    return true;
  } catch (err) {
    console.error('❌ Error enviando email:', err.message);
    return false;
  }
}

async function sendGenericEmail(toEmail, subject, html) {
  if (!emailTransporter) {
    console.warn('⚠️ Transporte de email no disponible.');
    return false;
  }
  const { from } = getEmailConfig();
  try {
    await emailTransporter.sendMail({ from, to: toEmail, subject, html });
    console.log(`✅ Email enviado a ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`❌ Error enviando a ${toEmail}:`, err.message);
    return false;
  }
}

async function getUserEmails(filterEmail) {
  if (filterEmail) {
    return await executeQuery('SELECT id, email, name FROM users WHERE email = ?', [filterEmail]);
  }
  return await executeQuery('SELECT id, email, name FROM users WHERE isActive = 1', []);
}

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'n/a'}`);
  next();
});

// Función helper para ejecutar queries con manejo de errores
async function executeQuery(query, params = []) {
  let connection;
  try {
    connection = await connectionPool.getConnection();
    const [results] = await connection.execute(query, params);
    return results;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// RUTAS DE LA API

// Ruta de salud con verificación de BD
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a BD
    await executeQuery('SELECT 1');
    
    res.status(200).json({
      success: true,
      message: 'Servidor funcionando correctamente',
      database: 'Conectada',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en conexión a base de datos',
      error: error.message
    });
  }
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    console.log(`🔍 Intentando login para: ${email}`);

    // Buscar usuario en la base de datos
    const users = await executeQuery(
      'SELECT id, email, password, name, role FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.log('❌ Usuario no encontrado');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = users[0];
    console.log(`👤 Usuario encontrado: ${user.name}`);

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'v-health-secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso');

    // Actualizar fecha de último login
    try {
      await executeQuery(
        'UPDATE users SET lastLogin = ? WHERE id = ?',
        [new Date(), user.id]
      );
    } catch (error) {
      console.log('⚠️ Error actualizando lastLogin:', error.message);
    }

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta de registro
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos'
      });
    }

    console.log(`📝 Registrando usuario: ${email}`);

    // Verificar si el usuario ya existe
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'El usuario ya existe'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Obtener fecha actual
    const currentDate = new Date();

    // Insertar nuevo usuario con fechas
    const result = await executeQuery(
      'INSERT INTO users (email, password, name, role, createdAt, updatedAt, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, 'user', currentDate, currentDate, 1]
    );

    // Obtener el ID del usuario recién creado
    const newUserId = result.insertId;

    console.log(`✅ Usuario registrado exitosamente con ID: ${newUserId}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUserId,
        email: email,
        name: name,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'v-health-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
    req.user = user;
    next();
  });
}

// Ruta para solicitar recuperación de contraseña
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    console.log('🔑 Recibida solicitud forgot-password:', req.body);
    
    const { email } = req.body;
    if (!email) {
      console.log('❌ Email no proporcionado');
      return res.status(400).json({ success: false, message: 'Email es requerido' });
    }

    console.log(`🔍 Buscando usuario: ${email}`);
    
    let users;
    try {
      users = await executeQuery(
        'SELECT id, email, name FROM users WHERE email = ?',
        [email]
      );
      console.log(`✅ Query ejecutada. Usuarios encontrados: ${users.length}`);
    } catch (dbError) {
      console.error('❌ Error en query de BD:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error al buscar usuario en base de datos',
        error: dbError.message 
      });
    }

    if (users.length === 0) {
      console.log('⚠️ Usuario no encontrado, respondiendo genérico por seguridad');
      return res.json({ 
        success: true, 
        message: 'Si el correo existe, recibirás un enlace de recuperación' 
      });
    }

    const user = users[0];
    console.log(`👤 Usuario encontrado: ${user.name} (ID: ${user.id})`);
    
    // Generar token
    let resetToken;
    try {
      resetToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password-reset' },
        process.env.JWT_SECRET || 'v-health-secret-key',
        { expiresIn: '1h' }
      );
      console.log('✅ Token JWT generado');
    } catch (jwtError) {
      console.error('❌ Error generando JWT:', jwtError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error generando token de recuperación',
        error: jwtError.message 
      });
    }

    // Guardar en BD
    try {
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const createdAt = new Date();
      await executeQuery(
        'INSERT INTO password_reset_tokens (userId, token, expiresAt, createdAt, used) VALUES (?, ?, ?, ?, ?)',
        [user.id, resetToken, expiresAt, createdAt, 0]
      );
      console.log('✅ Token guardado en BD');
    } catch (dbError) {
      console.error('❌ Error guardando token en BD:', dbError);
      return res.status(500).json({ 
        success: false, 
        message: 'Error guardando token de recuperación',
        error: dbError.message 
      });
    }

    // Intentar enviar email
    console.log('📧 Intentando enviar email...');
    const sent = await sendPasswordResetEmail(user.email, user.name, resetToken);
    
    if (sent) {
      console.log('✅ Email enviado exitosamente');
      return res.json({ 
        success: true, 
        message: 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
      });
    }

    // Fallback: devolver link en desarrollo
    const devLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    console.warn('⚠️ Email no enviado. Devolviendo link de desarrollo');
    console.log('🔗 Link de recuperación:', devLink);
    
    return res.json({
      success: true,
      message: 'Se ha generado un enlace de recuperación',
      development: process.env.NODE_ENV === 'development' ? { 
        resetLink: devLink,
        warning: 'Email no enviado - usando modo desarrollo' 
      } : undefined
    });
    
  } catch (error) {
    console.error('❌ Error no capturado en forgot-password:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Ruta para restablecer contraseña
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos'
      });
    }

    // Verificar el token de recuperación
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'v-health-secret-key');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const { userId } = decoded;

    // Verificar si el token existe en la base de datos y está asociado al usuario
    const tokens = await executeQuery(
      'SELECT * FROM password_reset_tokens WHERE userId = ? AND token = ? AND used = 0',
      [userId, token]
    );

    if (tokens.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o ya utilizado'
      });
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar contraseña del usuario
    await executeQuery(
      'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
      [hashedPassword, new Date(), userId]
    );

    // Marcar el token como utilizado
    await executeQuery(
      'UPDATE password_reset_tokens SET used = 1, usedAt = ? WHERE id = ?',
      [new Date(), tokens[0].id]
    );

    console.log('✅ Contraseña restablecida exitosamente');

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// Ruta protegida de ejemplo - perfil de usuario
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para registro facial
app.post('/api/auth/register-face', async (req, res) => {
  try {
    console.log('🔍 DEBUG register-face - Body recibido:', req.body);
    console.log('🔍 DEBUG register-face - Keys:', Object.keys(req.body));
    
    const { userId, faceDescriptor, captureData } = req.body;

    console.log('🔍 DEBUG register-face - userId:', userId, typeof userId);
    console.log('🔍 DEBUG register-face - faceDescriptor presente:', !!faceDescriptor);
    console.log('🔍 DEBUG register-face - faceDescriptor length:', faceDescriptor?.length);

    if (!userId || !faceDescriptor) {
      console.log('❌ Validación fallida:');
      console.log('- userId:', userId, 'presente:', !!userId);
      console.log('- faceDescriptor:', 'presente:', !!faceDescriptor);
      
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos',
        debug: {
          userIdReceived: !!userId,
          faceDescriptorReceived: !!faceDescriptor,
          receivedFields: Object.keys(req.body)
        }
      });
    }

    console.log(`👤 Registrando datos faciales para usuario ID: ${userId}`);

    // Verificar que el usuario existe
    const users = await executeQuery(
      'SELECT id, name, email FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = users[0];

    // Actualizar usuario con datos faciales
    await executeQuery(
      'UPDATE users SET faceDescriptor = ?, faceRegisteredAt = NOW(), faceMetadata = ? WHERE id = ?',
      [JSON.stringify(faceDescriptor), JSON.stringify(captureData), userId]
    );

    console.log('✅ Registro facial completado exitosamente');

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
    console.error('❌ Error en registro facial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Ruta para obtener rostros registrados (para validación en frontend)
app.get('/api/facial/registered-faces', async (req, res) => {
  try {
    console.log('📋 Obteniendo rostros registrados para validación...');

    const [users] = await connectionPool.execute(
      'SELECT id, name, email, faceDescriptor FROM users WHERE faceDescriptor IS NOT NULL AND isActive = 1'
    );

    const registeredFaces = users.map(user => {
      try {
        return {
          id: user.id,
          userId: user.id,
          name: user.name,
          email: user.email,
          descriptor: JSON.parse(user.faceDescriptor)
        };
      } catch (error) {
        console.warn(`⚠️ Error parsing descriptor for user ${user.id}:`, error);
        return null;
      }
    }).filter(face => face !== null);

    console.log(`✅ ${registeredFaces.length} rostros válidos encontrados`);

    res.json({
      success: true,
      faces: registeredFaces,
      count: registeredFaces.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo rostros registrados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      faces: []
    });
  }
});

// Ruta para login con reconocimiento facial
app.post('/api/auth/facial-login', async (req, res) => {
  try {
    console.log('🔍 DEBUG facial-login - Body recibido:', JSON.stringify({
      userId: req.body.userId,
      userName: req.body.userName,
      confidence: req.body.confidence,
      isAuthorized: req.body.isAuthorized,
      hasFaceDescriptor: !!req.body.faceDescriptor,
      faceDescriptorLength: req.body.faceDescriptor?.length,
      hasMatchedUser: !!req.body.matchedUser,
      matchedUserId: req.body.matchedUser?.id
    }, null, 2));
    
    const { userId, userName, faceDescriptor, confidence, isAuthorized, matchedUser } = req.body;

    console.log(`🔍 Login facial - Usuario: ${userName || 'Desconocido'}, Autorizado: ${isAuthorized}`);
    console.log(`🔍 Datos recibidos:`, {
      userId: userId,
      userName: userName,
      confidence: confidence,
      isAuthorized: isAuthorized,
      hasFaceDescriptor: !!faceDescriptor,
      faceDescriptorLength: faceDescriptor?.length
    });

    // ✅ VALIDACIÓN: Verificar que el rostro esté autorizado y coincida con usuario específico
    if (!isAuthorized || !userId || !faceDescriptor) {
      console.log('❌ Validación fallida:');
      console.log('- isAuthorized:', isAuthorized);
      console.log('- userId:', userId);
      console.log('- faceDescriptor presente:', !!faceDescriptor);
      
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado. Rostro no registrado o no coincide.',
        debug: {
          isAuthorized,
          hasUserId: !!userId,
          hasFaceDescriptor: !!faceDescriptor
        }
      });
    }

    // Validar que matchedUser coincida con datos enviados
    if (matchedUser && matchedUser.id && matchedUser.id !== userId) {
      console.log(`❌ Usuario no coincide: enviado ${userId}, detectado ${matchedUser.id}`);
      return res.status(401).json({
        success: false,
        message: 'El rostro detectado no coincide con el usuario esperado.'
      });
    }

    if (!confidence || confidence < 30) { // Reducir umbral de confianza a 30%
      console.log(`❌ Confianza muy baja: ${confidence}%`);
      return res.status(400).json({
        success: false,
        message: 'Confianza de reconocimiento muy baja. Intenta nuevamente.'
      });
    }

    console.log(`✅ Confianza aceptable: ${confidence}%`);

    // Buscar el usuario en la base de datos (cualquier usuario activo)
    const [users] = await connectionPool.execute(
      'SELECT id, email, name, role, faceDescriptor, isActive FROM users WHERE id = ? AND isActive = 1',
      [userId]
    );

    console.log(`🔍 Búsqueda en BD para userId ${userId}:`, users.length, 'usuarios encontrados');

    if (users.length === 0) {
      console.log(`❌ Usuario ${userId} no encontrado en BD`);
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado o inactivo'
      });
    }

    const user = users[0];

    // Verificar que el usuario tiene descriptor facial registrado (OBLIGATORIO)
    if (!user.faceDescriptor) {
      console.log(`❌ Usuario ${userId} sin faceDescriptor registrado`);
      return res.status(400).json({
        success: false,
        message: 'Usuario sin reconocimiento facial registrado. Debe configurar primero su rostro.'
      });
    }

    console.log(`✅ Login facial exitoso para: ${user.name} (${user.email}) - Confianza: ${confidence}%`);
    console.log(`✅ Validación: Usuario autorizado con sus propios datos faciales`);

    // ⚠️ VALIDACIÓN CRUZADA ESTRICTA: Comparar con TODOS los usuarios registrados
    try {
      const storedDescriptor = JSON.parse(user.faceDescriptor);
      const currentDescriptor = faceDescriptor;
      
      const distance = euclideanDistance(currentDescriptor, storedDescriptor);
      const maxDistance = 0.6; // ⚠️ THRESHOLD ESTRICTO: 0.6 para evitar confusión entre usuarios
      
      console.log(`🔍 Comparación de descriptores: distancia=${distance.toFixed(3)}, máximo=${maxDistance}`);
      
      if (distance > maxDistance) {
        console.log(`❌ Distancia muy alta: ${distance.toFixed(3)} > ${maxDistance}`);
        return res.status(401).json({
          success: false,
          message: 'El rostro no coincide con el registrado para este usuario.',
          debug: {
            distance: distance.toFixed(3),
            threshold: maxDistance,
            userId: userId,
            userName: user.name
          }
        });
      }
      
      console.log(`✅ Validación de descriptor exitosa: distancia=${distance.toFixed(3)}`);
      
      // ⚠️ VALIDACIÓN ADICIONAL: Verificar que no coincida mejor con otro usuario
      const [allUsers] = await connectionPool.execute(
        'SELECT id, name, email, faceDescriptor FROM users WHERE faceDescriptor IS NOT NULL AND isActive = 1'
      );
      
      let closestMatch = { userId: user.id, distance: distance, userName: user.name };
      let potentialConflicts = [];
      
      for (const otherUser of allUsers) {
        if (otherUser.id !== userId) {
          try {
            const otherDescriptor = JSON.parse(otherUser.faceDescriptor);
            const otherDistance = euclideanDistance(currentDescriptor, otherDescriptor);
            
            if (otherDistance < maxDistance) {
              potentialConflicts.push({
                userId: otherUser.id,
                userName: otherUser.name,
                distance: otherDistance.toFixed(3)
              });
            }
            
            if (otherDistance < closestMatch.distance) {
              closestMatch = {
                userId: otherUser.id,
                distance: otherDistance,
                userName: otherUser.name
              };
            }
          } catch (err) {
            console.warn(`⚠️ Error comparando con usuario ${otherUser.id}:`, err.message);
          }
        }
      }
      
      // Si el rostro coincide mejor con otro usuario, denegar acceso
      if (closestMatch.userId !== userId) {
        console.log(`❌ ¡CONFUSIÓN DETECTADA! El rostro coincide mejor con otro usuario:`);
        console.log(`   - Usuario solicitado: ${userId} (${user.name}) - distancia: ${distance.toFixed(3)}`);
        console.log(`   - Usuario más cercano: ${closestMatch.userId} (${closestMatch.userName}) - distancia: ${closestMatch.distance.toFixed(3)}`);
        
        return res.status(401).json({
          success: false,
          message: 'Error de identificación: El rostro detectado pertenece a otro usuario.',
          debug: {
            requestedUser: { id: userId, name: user.name, distance: distance.toFixed(3) },
            closestMatch: { id: closestMatch.userId, name: closestMatch.userName, distance: closestMatch.distance.toFixed(3) },
            conflicts: potentialConflicts
          }
        });
      }
      
      // Log de conflictos potenciales para monitoreo
      if (potentialConflicts.length > 0) {
        console.log(`⚠️ Advertencia: Conflictos potenciales detectados (${potentialConflicts.length}):`, potentialConflicts);
      }
      
      console.log(`✅ Validación cruzada exitosa: Usuario ${userId} es el más cercano con distancia ${distance.toFixed(3)}`);
      
    } catch (error) {
      console.error('❌ Error validando descriptor:', error);
      return res.status(500).json({
        success: false,
        message: 'Error validando datos faciales'
      });
    }

    // Actualizar último login
    await connectionPool.execute(
      'UPDATE users SET lastLogin = NOW() WHERE id = ?',
      [user.id]
    );

    // Generar JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        loginMethod: 'facial'
      },
      process.env.JWT_SECRET || 'v-health-secret-key',
      { expiresIn: '24h' }
    );

    // Respuesta exitosa
    res.json({
      success: true,
      message: `Bienvenido ${user.name}`,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.name,
        role: user.role
      },
      token,
      loginMethod: 'facial',
      confidence: confidence
    });

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

// Endpoint para verificar usuarios con registro facial
app.get('/api/auth/face-users', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Consultando usuarios con registro facial...');

    // Obtener todos los usuarios
    const allUsers = await executeQuery(
      'SELECT id, name, email, faceDescriptor, faceRegisteredAt, createdAt FROM users ORDER BY id'
    );

    // Separar usuarios con y sin rostro
    const usersWithFace = allUsers.filter(user => user.faceDescriptor !== null);
    const usersWithoutFace = allUsers.filter(user => user.faceDescriptor === null);

    // Estadísticas
    const stats = {
      total: allUsers.length,
      withFace: usersWithFace.length,
      withoutFace: usersWithoutFace.length,
      percentage: allUsers.length > 0 ? ((usersWithFace.length / allUsers.length) * 100).toFixed(1) : 0
    };

    // Preparar datos de usuarios con rostro
    const faceUsersData = usersWithFace.map(user => {
      let descriptorLength = 0;
      try {
        if (user.faceDescriptor) {
          descriptorLength = JSON.parse(user.faceDescriptor).length;
        }
      } catch (e) {
        console.warn('Error parsing descriptor for user:', user.id);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        faceRegisteredAt: user.faceRegisteredAt,
        descriptorDimensions: descriptorLength,
        canUseFacialLogin: true
      };
    });

    // Preparar datos de usuarios sin rostro
    const noFaceUsersData = usersWithoutFace.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      canUseFacialLogin: false
    }));

    console.log(`✅ Consulta completada: ${stats.withFace}/${stats.total} usuarios con rostro`);

    res.json({
      success: true,
      message: 'Consulta de usuarios con registro facial completada',
      statistics: {
        total: stats.total,
        withFacialAuth: stats.withFace,
        withoutFacialAuth: stats.withoutFace,
        facialAuthPercentage: `${stats.percentage}%`
      },
      usersWithFace: faceUsersData,
      usersWithoutFace: noFaceUsersData,
      recommendations: {
        forUsersWithoutFace: [
          'Hacer login normal con email/contraseña',
          'Ir al Dashboard',
          'Usar la opción "Configurar Login Facial"'
        ],
        forUsersWithFace: [
          'Pueden usar el botón de "Login Facial" en la página principal',
          'El sistema detectará automáticamente su rostro'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Error consultando usuarios con rostro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Utilities endpoints para email
app.post('/api/utils/test-email', async (req, res) => {
  try {
    const to = (req.body && req.body.to) || process.env.EMAIL_USER;
    if (!to) return res.status(400).json({ success: false, message: 'Proporciona "to" en el body o configura EMAIL_USER' });

    const dummyToken = 'TEST_' + Date.now();
    const sent = await sendPasswordResetEmail(to, 'Prueba', dummyToken);
    return res.json({
      success: sent,
      message: sent ? 'Email de prueba enviado' : 'No se pudo enviar el email de prueba'
    });
  } catch (err) {
    console.error('❌ Error en test-email:', err);
    res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
});

// + NUEVO: enviar correo a un usuario existente (body: { email, subject, message })
app.post('/api/utils/send-email', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'email, subject y message requeridos' });
    }

    const rows = await getUserEmails(email);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email no encontrado en la base de datos' });
    }

    const user = rows[0];
    const html = `
      <div style="font-family:Arial;padding:16px">
        <h3 style="color:#2d5a27;margin:0 0 12px">Mensaje V-Health</h3>
        <p>Hola ${user.name || ''},</p>
        <p>${message}</p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #ddd"/>
        <small style="color:#666">Este correo fue enviado por el sistema V-Health.</small>
      </div>
    `;

    const sent = await sendGenericEmail(user.email, subject, html);
    return res.json({
      success: sent,
      message: sent ? 'Correo enviado' : 'No se pudo enviar el correo'
    });
  } catch (err) {
    console.error('❌ Error en /api/utils/send-email:', err);
    res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
});

// + NUEVO: broadcast (body opcional: { subject, message })
app.post('/api/utils/broadcast-email', async (req, res) => {
  try {
    const { subject, message } = req.body || {};
    const finalSubject = subject || 'Notificación V-Health';
    const finalMessage = message || 'Este es un mensaje general del sistema V-Health.';

    const users = await getUserEmails();
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay usuarios activos para enviar' });
    }

    console.log(`📧 Iniciando broadcast a ${users.length} usuarios`);

    let enviados = 0;
    for (const u of users) {
      const html = `
        <div style="font-family:Arial;padding:16px">
          <h3 style="color:#2d5a27;margin:0 0 12px">V-Health Información</h3>
          <p>Hola ${u.name || ''},</p>
          <p>${finalMessage}</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #ddd"/>
          <small style="color:#666">Mensaje automático V-Health.</small>
        </div>
      `;
      const ok = await sendGenericEmail(u.email, finalSubject, html);
      if (ok) enviados++;
    }

    res.json({
      success: true,
      message: 'Broadcast completado',
      totalDestinatarios: users.length,
      enviados
    });
  } catch (err) {
    console.error('❌ Error en /api/utils/broadcast-email:', err);
    res.status(500).json({ success: false, message: 'Error interno', error: err.message });
  }
});

// ===== RUTAS DE SISTEMA DE FIRMAS DIGITALES =====

// Buscar firmas digitales internas
app.get('/api/signatures/search', authenticateToken, async (req, res) => {
  try {
    if (!generadorGuias) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de firmas no disponible'
      });
    }

    const { documentType, fechaDesde, fechaHasta, status } = req.query;
    
    const criterios = {};
    if (documentType) criterios.documentType = documentType;
    if (fechaDesde) criterios.fechaDesde = fechaDesde;
    if (fechaHasta) criterios.fechaHasta = fechaHasta;
    if (status) criterios.status = status;

    const resultados = generadorGuias.buscarFirmasInternas(criterios);

    res.json({
      success: true,
      message: '🔍 Búsqueda de firmas completada',
      busqueda: {
        criterios: criterios,
        resultados: resultados.found,
        total: resultados.total
      },
      filtros: {
        documentType: 'Tipo de documento (tos, indigestion, etc.)',
        fechaDesde: 'Fecha desde (YYYY-MM-DD)',
        fechaHasta: 'Fecha hasta (YYYY-MM-DD)', 
        status: 'Estado (active, archived, etc.)'
      }
    });

  } catch (error) {
    console.error('❌ Error buscando firmas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno buscando firmas'
    });
  }
});

// Obtener estadísticas de firmas digitales
app.get('/api/signatures/stats', authenticateToken, async (req, res) => {
  try {
    if (!generadorGuias) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de firmas no disponible'
      });
    }

    const estadisticas = generadorGuias.obtenerEstadisticasFirmas();

    res.json({
      success: true,
      message: '📊 Estadísticas de firmas digitales',
      estadisticas: {
        resumen: {
          totalFirmas: estadisticas.totalFirmas,
          ultimaFirma: estadisticas.ultimaFirma,
          actualizadoEn: estadisticas.actualizadoEn
        },
        distribucion: {
          porTipoDocumento: estadisticas.tiposDocumento,
          porFecha: estadisticas.porFecha
        }
      },
      sistema: {
        almacenamiento: 'Apartado interno organizado',
        indexacion: 'Índice maestro automático',
        auditoria: 'Log completo de operaciones'
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo estadísticas'
    });
  }
});

// Obtener información del sistema de almacenamiento interno
app.get('/api/signatures/system-info', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '🗄️ Sistema de Almacenamiento de Firmas Digitales V-Health',
      sistema: {
        nombre: 'V-Health Internal Signature Manager',
        version: '1.0',
        descripcion: 'Sistema organizado de almacenamiento interno para firmas digitales'
      },
      estructura: {
        apartado_principal: '/internal-signatures',
        organizacion: 'Por fecha (YYYY-MM-DD) > Por tipo de documento',
        archivo_general: '/document-archive',
        componentes: [
          'signatures/ - Índice maestro de firmas',
          'documents/ - Metadatos de documentos',
          'certificates/ - Certificados digitales',
          'logs/ - Auditoría y logs del sistema'
        ]
      },
      funcionalidades: [
        '🗂️ Organización automática por fecha y tipo',
        '📇 Índice maestro para búsquedas rápidas',
        '🔍 Búsqueda por múltiples criterios',
        '📊 Estadísticas y reportes automáticos',
        '📝 Log de auditoría completo',
        '🔐 Almacenamiento seguro con metadatos'
      ],
      endpoints: {
        buscar: 'GET /api/signatures/search?documentType=&fechaDesde=&fechaHasta=',
        estadisticas: 'GET /api/signatures/stats',
        info_sistema: 'GET /api/signatures/system-info',
        recientes: 'GET /api/signatures/recent'
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo info del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo información del sistema'
    });
  }
});

// Listar firmas recientes
app.get('/api/signatures/recent', authenticateToken, async (req, res) => {
  try {
    if (!generadorGuias) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de firmas no disponible'
      });
    }

    const limite = parseInt(req.query.limit) || 10;
    const todas = generadorGuias.buscarFirmasInternas({});
    
    // Ordenar por fecha más reciente y limitar
    const recientes = todas.found
      .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt))
      .slice(0, limite);

    res.json({
      success: true,
      message: `📋 Últimas ${recientes.length} firmas digitales`,
      firmas: recientes.map(firma => ({
        internalId: firma.internalId,
        documentTitle: firma.documentTitle,
        documentType: firma.documentType,
        signedAt: firma.signedAt,
        hash: firma.hash,
        status: firma.status
      })),
      total: todas.total,
      limite: limite
    });

  } catch (error) {
    console.error('❌ Error obteniendo firmas recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo firmas recientes'
    });
  }
});

// ========================================
// RUTAS DE PLANTAS PDF CON FIRMA DIGITAL
// ========================================

// Generar y firmar PDF completo de planta medicinal
app.post('/api/plantas-pdf/completo', authenticateToken, async (req, res) => {
  try {
    if (!generadorPlantasPDF) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de PDFs de plantas no disponible'
      });
    }

    const { plantaData } = req.body;

    if (!plantaData || !plantaData.nombre) {
      return res.status(400).json({
        success: false,
        message: 'Datos de planta requeridos'
      });
    }

    // Paso 1: Generar PDF
    console.log(`🔄 Generando PDF para planta: ${plantaData.nombre}`);
    const pdfInfo = await generadorPlantasPDF.generarPDFPlanta(plantaData);

    // Paso 2: Firmar automáticamente
    console.log(`✍️ Firmando documento: ${pdfInfo.titulo}`);
    const resultado = await generadorPlantasPDF.firmarPDF(pdfInfo);

    res.json({
      success: true,
      message: '🎉 PDF de planta generado y firmado exitosamente',
      documento: {
        titulo: resultado.pdfInfo.titulo,
        planta: resultado.pdfInfo.planta,
        nombreCientifico: resultado.pdfInfo.nombreCientifico,
        fileName: resultado.pdfInfo.fileName,
        fechaGeneracion: resultado.pdfInfo.fechaGeneracion,
        contenido: resultado.pdfInfo.contenido
      },
      seguridad: {
        firmado: true,
        algoritmo: resultado.pdfInfo.firma.algorithm,
        hash: resultado.pdfInfo.hash.substring(0, 32) + '...',
        autoridad: 'V-Health',
        fechaFirma: resultado.pdfInfo.firma.timestamp
      },
      acciones: {
        ver: `/api/plantas-pdf/contenido/${resultado.pdfInfo.fileName}`,
        verificar: `/api/plantas-pdf/verificar (POST con fileName: "${resultado.pdfInfo.fileName}")`
      }
    });

  } catch (error) {
    console.error('❌ Error en proceso completo:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Datos de planta requeridos') ? 
        'Información de planta incompleta' : 
        'Error interno en el proceso'
    });
  }
});

// Obtener contenido HTML del PDF de planta
app.get('/api/plantas-pdf/contenido/:fileName', async (req, res) => {
  try {
    if (!generadorPlantasPDF) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de PDFs de plantas no disponible'
      });
    }

    const { fileName } = req.params;
    const fs = require('fs');
    const path = require('path');
    const basePath = path.join(process.cwd(), 'generated-plantas-pdfs');
    const htmlPath = path.join(basePath, `${fileName}.html`);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const contenidoHTML = fs.readFileSync(htmlPath, 'utf8');

    // Agregar información de firma si existe
    const firmaPath = path.join(basePath, 'firmas', `${fileName}-firma.json`);
    let infoFirma = '';
    
    if (fs.existsSync(firmaPath)) {
      const firmaData = JSON.parse(fs.readFileSync(firmaPath, 'utf8'));
      infoFirma = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">🔐 Documento Firmado Digitalmente</h3>
          <p style="margin: 5px 0;"><strong>Autoridad:</strong> ${firmaData.certificacion.autoridad}</p>
          <p style="margin: 5px 0;"><strong>Algoritmo:</strong> ${firmaData.certificacion.algoritmo}</p>
          <p style="margin: 5px 0;"><strong>Fecha de firma:</strong> ${new Date(firmaData.certificacion.fechaFirma).toLocaleString('es-ES')}</p>
          <p style="margin: 5px 0; font-size: 0.9em;">✅ Este documento ha sido verificado y es auténtico</p>
        </div>
      `;
    }

    // Insertar información de firma antes del footer
    const contenidoConFirma = contenidoHTML.replace(
      '<div class="footer">',
      infoFirma + '<div class="footer">'
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(contenidoConFirma);

  } catch (error) {
    console.error('❌ Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo contenido'
    });
  }
});

// Verificar autenticidad de PDF de planta firmado
app.post('/api/plantas-pdf/verificar', async (req, res) => {
  try {
    if (!generadorPlantasPDF) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de PDFs de plantas no disponible'
      });
    }

    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del archivo PDF requerido'
      });
    }

    // Verificar el PDF
    const verificacion = await generadorPlantasPDF.verificarPDF(fileName);

    res.json({
      success: true,
      message: '🔍 Verificación de PDF de planta completada',
      verificacion: {
        valido: verificacion.valido,
        razon: verificacion.razon,
        estado: verificacion.valido ? '✅ AUTÉNTICO' : '❌ NO VÁLIDO'
      },
      documento: verificacion.documento || null,
      certificacion: verificacion.certificacion || null
    });

  } catch (error) {
    console.error('❌ Error verificando PDF de planta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno verificando PDF'
    });
  }
});

// Obtener lista de PDFs de plantas generados
app.get('/api/plantas-pdf/lista', authenticateToken, async (req, res) => {
  try {
    if (!generadorPlantasPDF) {
      return res.status(503).json({
        success: false,
        message: 'Sistema de PDFs de plantas no disponible'
      });
    }

    const pdfs = generadorPlantasPDF.obtenerPDFsGenerados();

    res.json({
      success: true,
      message: 'Lista de PDFs de plantas generados',
      pdfs: pdfs,
      total: pdfs.length,
      estadisticas: {
        firmados: pdfs.filter(pdf => pdf.firmado).length,
        sinFirmar: pdfs.filter(pdf => !pdf.firmado).length
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo lista de PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo lista'
    });
  }
});

// Ruta de ejemplo protegida
app.get('/api/protected', (req, res) => {
  res.json({
    success: true,
    message: 'Ruta protegida accedida exitosamente'
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('💥 Error no manejado:', error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de señales de cierre
process.on('SIGINT', async () => {
  console.log('🛑 Cerrando servidor...');
  if (connectionPool) {
    await connectionPool.end();
    console.log('✅ Pool de conexiones cerrado');
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Cerrando servidor...');
  if (connectionPool) {
    await connectionPool.end();
    console.log('✅ Pool de conexiones cerrado');
  }
  process.exit(0);
});

// Inicializar servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando V-Health Server...');
    
    // Inicializar base de datos
    const dbInitialized = await initializeDatabase();
    if (!dbInitialized) {
      console.error('❌ No se pudo inicializar la base de datos');
      process.exit(1);
    }

    // AGREGAR ESTA LÍNEA:
    await initializeEmailService();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('🎉 ¡V-Health Server iniciado correctamente!');
      console.log(`🌐 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
      console.log('🔄 Mantener esta ventana abierta para que funcione el login');
      console.log('🛑 Presiona Ctrl+C para detener');
    });

    server.timeout = 30000;

  } catch (error) {
    console.error('💥 Error del servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();
