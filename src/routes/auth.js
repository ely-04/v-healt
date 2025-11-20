import express from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { authenticate, createSendToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import cifradoAuto from '../utils/cifradoAutomatico.js';

const router = express.Router();

// Validaciones
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
];

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
router.post('/register', registerValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      lastLogin: new Date()
    });

    createSendToken(user, 201, res);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Verificar si el usuario existe y obtener la contraseña
    const user = await User.scope('withPassword').findOne({ 
      where: { email } 
    });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
      });
    }

    // Actualizar última conexión
    await user.update({ lastLogin: new Date() });

    // Cifrado automático de datos de sesión (interno, no visible al usuario)
    const datosSession = {
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    // Cifrar automáticamente los datos de sesión
    const sessionId = cifradoAuto.cifrarDatosUsuario(datosSession);
    console.log(`🔐 [LOGIN] Datos de sesión cifrados automáticamente: ${sessionId}`);

    createSendToken(user, 200, res);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @desc    Cerrar sesión
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    success: true,
    message: 'Sesión cerrada exitosamente'
  });
});

// @desc    Obtener perfil del usuario actual
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @desc    Verificar token JWT
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
});

// @desc    Login con reconocimiento facial
// @route   POST /api/auth/facial-login
// @access  Public
router.post('/facial-login', async (req, res) => {
  try {
    const { faceDescriptor, confidence } = req.body;

    if (!faceDescriptor || confidence < 0.6) {
      return res.status(400).json({
        success: false,
        message: 'Confianza de reconocimiento muy baja. Intenta nuevamente.'
      });
    }

    // Buscar todos los usuarios con descriptor facial
    const users = await User.findAll({
      where: {
        faceDescriptor: {
          [Op.ne]: null
        }
      }
    });

    let matchedUser = null;
    let bestMatch = { distance: Infinity, user: null };

    // Comparar con descriptores almacenados
    for (const user of users) {
      if (user.faceDescriptor) {
        try {
          const storedDescriptor = JSON.parse(user.faceDescriptor);
          const distance = euclideanDistance(faceDescriptor, storedDescriptor);
          
          if (distance < 0.6 && distance < bestMatch.distance) {
            bestMatch = { distance, user };
          }
        } catch (error) {
          console.error('Error parsing face descriptor:', error);
        }
      }
    }

    if (bestMatch.user) {
      matchedUser = bestMatch.user;
      
      // Actualizar último login
      await matchedUser.update({
        lastLogin: new Date(),
        loginMethod: 'facial'
      });

      // Generar token
      const token = createSendToken(matchedUser);

      res.json({
        success: true,
        message: 'Login facial exitoso',
        user: {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email
        },
        token
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Rostro no reconocido. Asegúrate de haber registrado tu rostro previamente.'
      });
    }

  } catch (error) {
    console.error('Error en login facial:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @desc    Registrar datos faciales
// @route   POST /api/auth/register-face
// @access  Public
router.post('/register-face', async (req, res) => {
  try {
    const { userId, faceDescriptor, captureData } = req.body;

    if (!userId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: 'Datos incompletos'
      });
    }

    // Buscar usuario
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Actualizar usuario con datos faciales
    await user.update({
      faceDescriptor: JSON.stringify(faceDescriptor),
      faceRegisteredAt: new Date(),
      faceMetadata: JSON.stringify(captureData)
    });

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

export default router;