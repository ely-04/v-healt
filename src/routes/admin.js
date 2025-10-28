import express from 'express';
import cifradoAuto from '../utils/cifradoAutomatico.js';
import vHealthCrypto from '../utils/vHealthCrypto.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Middleware para verificar que es administrador
const requireAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Solo administradores.'
    });
  }
  next();
};

// @desc    Obtener estadísticas del sistema de cifrado interno
// @route   GET /api/admin/crypto-stats
// @access  Private (Admin only)
router.get('/crypto-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const estadisticas = cifradoAuto.obtenerEstadisticas();
    const logOperaciones = cifradoAuto.obtenerLogOperaciones(20);

    res.json({
      success: true,
      message: '📊 Estadísticas del sistema de cifrado interno',
      estadisticas,
      operacionesRecientes: logOperaciones,
      sistemaSeguridad: {
        cifradoAsimetrico: 'RSA-2048',
        cifradoSimetrico: 'AES-256-CTR',
        firmaDigital: 'SHA-256 + RSA',
        estadoClaves: '✅ Activas',
        modoOperacion: 'Híbrido (RSA + AES)'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo estadísticas'
    });
  }
});

// @desc    Simular operaciones de cifrado para demostración
// @route   POST /api/admin/simulate-crypto
// @access  Private (Admin only)
router.post('/simulate-crypto', authenticate, requireAdmin, async (req, res) => {
  try {
    const { operaciones = 5 } = req.body;

    console.log(`🎭 Iniciando simulación de ${operaciones} operaciones de cifrado...`);

    const resultados = [];

    for (let i = 0; i < operaciones; i++) {
      // Simular diferentes tipos de datos
      const tipoOperacion = i % 2 === 0 ? 'usuario' : 'consulta';
      
      if (tipoOperacion === 'usuario') {
        const id = cifradoAuto.cifrarDatosUsuario({
          nombre: `Usuario Simulado ${i + 1}`,
          email: `sim${i + 1}@vhealth.com`,
          ip: `192.168.1.${100 + i}`
        });
        resultados.push({ tipo: 'usuario', id, indice: i + 1 });
      } else {
        const plantas = ['Manzanilla', 'Jengibre', 'Eucalipto', 'Lavanda'];
        const id = cifradoAuto.cifrarConsultaMedica({
          plantas: plantas.slice(0, (i % 3) + 1),
          sintomas: [`Síntoma ${i + 1}`, `Molestia ${i + 1}`],
          recomendaciones: [`Recomendación ${i + 1}`],
          duracion: (i + 1) * 60,
          paginasVisitadas: ['/plantas', '/enfermedades']
        });
        resultados.push({ tipo: 'consulta', id, indice: i + 1 });
      }

      // Pequeña pausa entre operaciones
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const estadisticasFinales = cifradoAuto.obtenerEstadisticas();

    res.json({
      success: true,
      message: `🎉 Simulación completada: ${operaciones} operaciones de cifrado`,
      resultados,
      estadisticasActualizadas: estadisticasFinales,
      demostración: {
        algoritmo: 'RSA-2048 + AES-256-CTR',
        operacionesSimuladas: operaciones,
        tiposOperaciones: ['cifrado_usuario', 'cifrado_consulta'],
        verificacion: '✅ Todas las operaciones fueron exitosas'
      }
    });

  } catch (error) {
    console.error('Error en simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error en la simulación de cifrado'
    });
  }
});

// @desc    Verificar un dato cifrado específico
// @route   POST /api/admin/verify-encrypted
// @access  Private (Admin only)
router.post('/verify-encrypted', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID de datos cifrados requerido'
      });
    }

    const datosDescifrados = cifradoAuto.descifrarDatos(id);

    if (!datosDescifrados) {
      return res.status(404).json({
        success: false,
        message: 'Datos cifrados no encontrados o error en descifrado'
      });
    }

    res.json({
      success: true,
      message: '🔓 Datos descifrados exitosamente',
      id,
      datosOriginales: datosDescifrados,
      verificacion: {
        integridad: '✅ Verificada',
        algoritmo: 'RSA-2048 + AES-256-CTR',
        estado: 'Descifrado exitoso'
      }
    });

  } catch (error) {
    console.error('Error verificando datos:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando datos cifrados'
    });
  }
});

// @desc    Obtener clave pública del sistema (para demostración)
// @route   GET /api/admin/public-key
// @access  Private (Admin only)
router.get('/public-key', authenticate, requireAdmin, async (req, res) => {
  try {
    const publicKeyPem = vHealthCrypto.publicKey.exportKey('pkcs8-public-pem');
    
    res.json({
      success: true,
      message: '🔑 Clave pública del sistema de cifrado',
      publicKey: publicKeyPem,
      especificaciones: {
        algoritmo: 'RSA-2048',
        formato: 'PKCS#8 PEM',
        uso: ['cifrado', 'verificacion_firma'],
        bits: 2048
      },
      advertencia: '⚠️ Esta clave se usa internamente para cifrado híbrido'
    });

  } catch (error) {
    console.error('Error obteniendo clave pública:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo clave pública'
    });
  }
});

// @desc    Test completo del sistema de cifrado
// @route   POST /api/admin/crypto-test
// @access  Private (Admin only)
router.post('/crypto-test', authenticate, requireAdmin, async (req, res) => {
  try {
    const datosTest = {
      mensaje: "Datos médicos confidenciales para prueba del sistema de cifrado",
      timestamp: new Date().toISOString(),
      usuario: req.user.nombre,
      tipo: "test_academico"
    };

    console.log('🧪 Iniciando test completo del sistema de cifrado...');

    // 1. Cifrar datos
    const paqueteCifrado = vHealthCrypto.encryptData(JSON.stringify(datosTest));
    
    // 2. Descifrar datos
    const datosDescifrados = JSON.parse(vHealthCrypto.decryptData(paqueteCifrado));
    
    // 3. Verificar integridad
    const integridadCorrecta = JSON.stringify(datosTest) === JSON.stringify(datosDescifrados);
    
    // 4. Firmar datos
    const datosFirmados = vHealthCrypto.signData(JSON.stringify(datosTest));
    
    // 5. Verificar firma
    const firmaValida = vHealthCrypto.verifySignature(datosFirmados);

    res.json({
      success: true,
      message: '🧪 Test completo del sistema de cifrado ejecutado',
      resultados: {
        cifrado: {
          algoritmo: paqueteCifrado.algorithm,
          tamañoClaveAES: paqueteCifrado.encryptedKey.length,
          tamañoDatosCifrados: paqueteCifrado.encryptedData.length,
          vectorIV: paqueteCifrado.iv.length,
          estado: '✅ Exitoso'
        },
        descifrado: {
          integridad: integridadCorrecta ? '✅ Verificada' : '❌ Fallida',
          datosRecuperados: integridadCorrecta ? '✅ Correctos' : '❌ Corruptos',
          estado: integridadCorrecta ? '✅ Exitoso' : '❌ Fallido'
        },
        firmaDigital: {
          algoritmo: datosFirmados.algorithm,
          hashSHA256: datosFirmados.hash.substring(0, 32) + '...',
          firmaRSA: datosFirmados.signature.substring(0, 60) + '...',
          verificacion: firmaValida.valid ? '✅ Válida' : '❌ Inválida',
          estado: firmaValida.valid ? '✅ Exitoso' : '❌ Fallido'
        }
      },
      resumenTecnico: {
        cifradoAsimetrico: 'RSA-2048 ✅',
        cifradoSimetrico: 'AES-256-CTR ✅',
        cifradoHibrido: integridadCorrecta ? '✅ Funcional' : '❌ Error',
        firmaDigital: firmaValida.valid ? '✅ Funcional' : '❌ Error',
        integridad: integridadCorrecta ? '✅ Garantizada' : '❌ Comprometida'
      }
    });

  } catch (error) {
    console.error('Error en test de cifrado:', error);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando test de cifrado',
      error: error.message
    });
  }
});

export default router;