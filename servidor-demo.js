import express from 'express';
import cors from 'cors';
import vHealthCrypto from './src/utils/vHealthCrypto.js';

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

console.log('🚀 === SERVIDOR DEMO CIFRADO V-HEALTH ===\n');

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔐 Servidor Demo Cifrado V-Health',
    endpoints: {
      '/demo/encrypt': 'POST - Cifrar datos (RSA+AES)',
      '/demo/decrypt': 'POST - Descifrar datos',
      '/demo/sign': 'POST - Firmar datos',
      '/demo/verify': 'POST - Verificar firma',
      '/demo/public-key': 'GET - Obtener clave pública RSA-2048'
    }
  });
});

// Obtener clave pública RSA
app.get('/demo/public-key', (req, res) => {
  try {
    const publicKeyPem = vHealthCrypto.publicKey.exportKey('pkcs8-public-pem');
    
    res.json({
      success: true,
      message: 'Clave pública RSA-2048',
      publicKey: publicKeyPem,
      algorithm: 'RSA-2048',
      usage: ['encryption', 'signature-verification'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clave pública',
      error: error.message
    });
  }
});

// Cifrar datos con sistema híbrido
app.post('/demo/encrypt', (req, res) => {
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
      message: '🔐 Datos cifrados exitosamente con sistema híbrido',
      encrypted: encryptedPackage,
      process: {
        step1: 'Clave AES-256 generada aleatoriamente',
        step2: 'Datos cifrados con AES-256-CTR + IV',
        step3: 'Clave AES cifrada con RSA-2048',
        step4: 'Paquete seguro generado'
      },
      security: {
        asymmetric: 'RSA-2048',
        symmetric: 'AES-256-CTR',
        keySize: '2048 bits (RSA) + 256 bits (AES)',
        ivLength: '96 bits'
      }
    });

  } catch (error) {
    console.error('Error en cifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en el cifrado',
      error: error.message
    });
  }
});

// Descifrar datos
app.post('/demo/decrypt', (req, res) => {
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
      decryptedData = vHealthCrypto.decryptMedicalData(encryptedPackage);
    } else {
      decryptedData = vHealthCrypto.decryptData(encryptedPackage);
    }

    res.json({
      success: true,
      message: '🔓 Datos descifrados exitosamente',
      decrypted: decryptedData,
      process: {
        step1: 'Clave AES descifrada con RSA-2048 (clave privada)',
        step2: 'Datos descifrados con AES-256-CTR',
        step3: 'Integridad verificada',
        step4: 'Datos originales recuperados'
      }
    });

  } catch (error) {
    console.error('Error en descifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en el descifrado',
      error: error.message
    });
  }
});

// Firmar datos
app.post('/demo/sign', (req, res) => {
  try {
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
      message: '✍️ Datos firmados exitosamente',
      signed: signedPackage,
      process: {
        step1: 'Hash SHA-256 generado de los datos',
        step2: 'Hash firmado con clave privada RSA-2048',
        step3: 'Firma digital creada',
        step4: 'Paquete firmado completo'
      }
    });

  } catch (error) {
    console.error('Error en firma:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en la firma',
      error: error.message
    });
  }
});

// Verificar firma
app.post('/demo/verify', (req, res) => {
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
      message: '🔍 Verificación de firma completada',
      verification: verification,
      process: {
        step1: 'Hash SHA-256 recalculado de los datos',
        step2: 'Integridad del hash verificada',
        step3: 'Firma verificada con clave pública RSA-2048',
        step4: 'Resultado de verificación determinado'
      }
    });

  } catch (error) {
    console.error('Error en verificación:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno en la verificación',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor Demo ejecutándose en: http://localhost:${PORT}`);
  console.log('🔐 Endpoints disponibles:');
  console.log(`   📋 Info: http://localhost:${PORT}/`);
  console.log(`   🔑 Clave pública: http://localhost:${PORT}/demo/public-key`);
  console.log(`   🔒 Cifrar: POST http://localhost:${PORT}/demo/encrypt`);
  console.log(`   🔓 Descifrar: POST http://localhost:${PORT}/demo/decrypt`);
  console.log(`   ✍️ Firmar: POST http://localhost:${PORT}/demo/sign`);
  console.log(`   🔍 Verificar: POST http://localhost:${PORT}/demo/verify`);
  console.log('\n🎯 ¡Listo para demostrar el cifrado híbrido RSA+AES!');
});

export default app;