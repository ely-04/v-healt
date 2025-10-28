const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

console.log('🚀 Iniciando servidor V-Health simple...');

// Base de datos en memoria para pruebas
const users = [
  {
    id: 1,
    name: 'Administrator',
    email: 'admin@vhealth.com',
    password: '$2b$12$tg6Ee3EmFfEU0GnIPJN6uOcqOynJcR5zDnFzTmQ2EAPT5kKGQhjgO' // admin123
  }
];

let nextUserId = 2;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registro de usuario:', { name, email });

    // Validaciones
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y contraseña son requeridos' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = {
      id: nextUserId++,
      name,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      'secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Usuario registrado exitosamente:', user.email);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔑 Intento de login:', email);

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      'secret-key',
      { expiresIn: '24h' }
    );

    console.log('✅ Login exitoso:', user.email);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ Servidor V-Health funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: PORT,
    users_count: users.length
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 ✅ SERVIDOR V-HEALTH SIMPLE INICIADO');
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔗 Salud: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Registro: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log('✅ Listo para registro y login de usuarios');
  console.log(`👤 Usuario admin: admin@vhealth.com / admin123`);
});

module.exports = app;