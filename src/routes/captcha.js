import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Almacén temporal para los códigos CAPTCHA (en producción usar Redis)
const captchaCodes = new Map();

// Generar código CAPTCHA
const generateCaptchaCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// @desc    Generar nuevo CAPTCHA
// @route   GET /api/captcha/generate
// @access  Public
router.get('/generate', (req, res) => {
  try {
    const code = generateCaptchaCode();
    const sessionId = crypto.randomUUID();
    
    // Almacenar código con expiración de 10 minutos
    captchaCodes.set(sessionId, {
      code: code.toLowerCase(),
      expires: Date.now() + 10 * 60 * 1000
    });
    
    // Limpiar códigos expirados
    cleanupExpiredCodes();
    
    res.json({
      success: true,
      sessionId,
      code: code,
      expires: 10 * 60 * 1000 // 10 minutos en ms
    });
  } catch (error) {
    console.error('Error generando CAPTCHA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// @desc    Validar CAPTCHA
// @route   POST /api/captcha/validate
// @access  Public
router.post('/validate', (req, res) => {
  try {
    const { sessionId, code } = req.body;
    
    if (!sessionId || !code) {
      return res.status(400).json({
        success: false,
        message: 'SessionId y código son requeridos'
      });
    }
    
    const storedData = captchaCodes.get(sessionId);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA expirado o inválido'
      });
    }
    
    if (Date.now() > storedData.expires) {
      captchaCodes.delete(sessionId);
      return res.status(400).json({
        success: false,
        message: 'CAPTCHA expirado'
      });
    }
    
    const isValid = code.toLowerCase() === storedData.code;
    
    if (isValid) {
      // Eliminar código usado para evitar reutilización
      captchaCodes.delete(sessionId);
    }
    
    res.json({
      success: true,
      valid: isValid,
      message: isValid ? 'CAPTCHA válido' : 'CAPTCHA incorrecto'
    });
    
  } catch (error) {
    console.error('Error validando CAPTCHA:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Función para limpiar códigos expirados
const cleanupExpiredCodes = () => {
  const now = Date.now();
  for (const [sessionId, data] of captchaCodes.entries()) {
    if (now > data.expires) {
      captchaCodes.delete(sessionId);
    }
  }
};

// Limpiar códigos expirados cada 5 minutos
setInterval(cleanupExpiredCodes, 5 * 60 * 1000);

export default router;