import express from 'express';
import vHealthCrypto from '../utils/vHealthCrypto.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Cifrar datos sensibles
// @route   POST /api/crypto/encrypt
// @access  Private
router.post('/encrypt', authenticate, async (req, res) => {
  try {
    const { data, type = 'general' } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos para cifrado'
      });
    }

    let encryptedPackage;
    
    if (type === 'medical') {
      // Cifrado especial para datos médicos
      encryptedPackage = vHealthCrypto.encryptMedicalData(data);
    } else {
      // Cifrado general
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      encryptedPackage = vHealthCrypto.encryptData(dataString);
    }

    res.json({
      success: true,
      message: 'Datos cifrados exitosamente',
      encrypted: encryptedPackage,
      meta: {
        algorithm: encryptedPackage.algorithm,
        timestamp: encryptedPackage.timestamp,
        userId: req.user.id
      }
    });

  } catch (error) {
    console.error('Error en cifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en el cifrado'
    });
  }
});

// @desc    Descifrar datos sensibles
// @route   POST /api/crypto/decrypt
// @access  Private
router.post('/decrypt', authenticate, async (req, res) => {
  try {
    const { encryptedPackage, type = 'general' } = req.body;

    if (!encryptedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Paquete cifrado requerido'
      });
    }

    let decryptedData;
    
    if (type === 'medical') {
      // Descifrado especial para datos médicos
      decryptedData = vHealthCrypto.decryptMedicalData(encryptedPackage);
    } else {
      // Descifrado general
      const dataString = vHealthCrypto.decryptData(encryptedPackage);
      try {
        decryptedData = JSON.parse(dataString);
      } catch {
        decryptedData = dataString;
      }
    }

    res.json({
      success: true,
      message: 'Datos descifrados exitosamente',
      data: decryptedData,
      meta: {
        originalAlgorithm: encryptedPackage.algorithm,
        originalTimestamp: encryptedPackage.timestamp,
        userId: req.user.id
      }
    });

  } catch (error) {
    console.error('Error en descifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en el descifrado'
    });
  }
});

// @desc    Firmar datos digitalmente
// @route   POST /api/crypto/sign
// @access  Private (Admin only)
router.post('/sign', authenticate, async (req, res) => {
  try {
    // Solo administradores pueden firmar
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo administradores pueden firmar documentos'
      });
    }

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Datos requeridos para firma'
      });
    }

    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const signedPackage = vHealthCrypto.signData(dataString);

    res.json({
      success: true,
      message: 'Datos firmados exitosamente',
      signed: signedPackage,
      meta: {
        signedBy: req.user.name,
        userId: req.user.id,
        timestamp: signedPackage.timestamp
      }
    });

  } catch (error) {
    console.error('Error en firma digital:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en la firma digital'
    });
  }
});

// @desc    Verificar firma digital
// @route   POST /api/crypto/verify
// @access  Private
router.post('/verify', authenticate, async (req, res) => {
  try {
    const { signedPackage } = req.body;

    if (!signedPackage) {
      return res.status(400).json({
        success: false,
        message: 'Paquete firmado requerido'
      });
    }

    const verification = vHealthCrypto.verifySignature(signedPackage);

    res.json({
      success: true,
      message: verification.valid ? 'Firma válida' : 'Firma inválida',
      verification: verification,
      meta: {
        verifiedBy: req.user.name,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error en verificación de firma:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en la verificación'
    });
  }
});

// @desc    Obtener información de las claves públicas
// @route   GET /api/crypto/public-key
// @access  Public (para verificaciones externas)
router.get('/public-key', (req, res) => {
  try {
    const publicKeyPem = vHealthCrypto.publicKey.exportKey('public');
    
    res.json({
      success: true,
      message: 'Clave pública obtenida',
      publicKey: publicKeyPem,
      algorithm: 'RSA-2048',
      usage: ['encryption', 'signature-verification'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo clave pública:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo clave pública'
    });
  }
});

// @desc    Test de cifrado combinado
// @route   POST /api/crypto/test
// @access  Private
router.post('/test', authenticate, async (req, res) => {
  try {
    const testData = {
      message: 'Test de cifrado combinado V-Health',
      timestamp: new Date().toISOString(),
      user: req.user.name
    };

    // Cifrar
    const encrypted = vHealthCrypto.encryptData(JSON.stringify(testData));
    
    // Descifrar
    const decrypted = vHealthCrypto.decryptData(encrypted);
    const decryptedObj = JSON.parse(decrypted);

    // Firmar
    const signed = vHealthCrypto.signData(JSON.stringify(testData));
    
    // Verificar
    const verification = vHealthCrypto.verifySignature(signed);

    res.json({
      success: true,
      message: 'Test de cifrado combinado completado',
      results: {
        original: testData,
        encrypted: encrypted,
        decrypted: decryptedObj,
        signed: signed,
        verification: verification,
        integritySelf: JSON.stringify(testData) === JSON.stringify(decryptedObj)
      }
    });

  } catch (error) {
    console.error('Error en test de cifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error en test de cifrado',
      error: error.message
    });
  }
});

export default router;