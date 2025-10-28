import express from 'express';
import generadorGuias from '../utils/generadorGuiasPDF.js';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @desc    Obtener lista de guías disponibles
// @route   GET /api/pdf/guias
// @access  Public
router.get('/guias', async (req, res) => {
  try {
    const guiasDisponibles = generadorGuias.obtenerGuiasDisponibles();
    
    res.json({
      success: true,
      message: 'Guías de plantas medicinales disponibles',
      guias: guiasDisponibles,
      total: guiasDisponibles.length,
      descripcion: 'Guías informativas sobre plantas medicinales para enfermedades básicas'
    });

  } catch (error) {
    console.error('Error obteniendo guías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo guías'
    });
  }
});

// @desc    Generar guía PDF sobre planta medicinal
// @route   POST /api/pdf/generar
// @access  Private
router.post('/generar', authenticate, async (req, res) => {
  try {
    const { enfermedad } = req.body;

    if (!enfermedad) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el tipo de enfermedad'
      });
    }

    // Generar la guía PDF
    const pdfInfo = await generadorGuias.generarGuiaPDF(enfermedad);

    res.json({
      success: true,
      message: '📄 Guía PDF generada exitosamente',
      pdf: {
        titulo: pdfInfo.titulo,
        enfermedad: pdfInfo.enfermedad,
        fileName: pdfInfo.fileName,
        fechaGeneracion: pdfInfo.fechaGeneracion,
        contenido: pdfInfo.contenido
      },
      siguiente: {
        accion: 'firmar',
        endpoint: '/api/pdf/firmar',
        descripcion: 'Firme digitalmente el PDF para garantizar autenticidad'
      }
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('No existe guía') ? 
        'Tipo de enfermedad no disponible' : 
        'Error interno generando PDF'
    });
  }
});

// @desc    Firmar PDF digitalmente
// @route   POST /api/pdf/firmar
// @access  Private
router.post('/firmar', authenticate, async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el nombre del archivo PDF'
      });
    }

    // Crear información del PDF desde el fileName
    const basePath = path.join(process.cwd(), 'generated-pdfs');
    const htmlPath = path.join(basePath, `${fileName}.html`);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF no encontrado para firmar'
      });
    }

    // Recrear pdfInfo básico para firmar
    const pdfInfo = {
      titulo: "Guía de Plantas Medicinales",
      enfermedad: "Tratamiento natural",
      fileName: fileName,
      htmlPath: htmlPath,
      fechaGeneracion: new Date().toISOString()
    };

    // Firmar el PDF
    const resultado = await generadorGuias.firmarPDF(pdfInfo);

    res.json({
      success: true,
      message: '✍️ PDF firmado digitalmente exitosamente',
      firmado: {
        titulo: resultado.pdfInfo.titulo,
        hash: resultado.pdfInfo.hash.substring(0, 32) + '...',
        algoritmo: resultado.pdfInfo.firma.algorithm,
        fechaFirma: resultado.pdfInfo.firma.timestamp,
        autoridad: 'V-Health Sistema de Medicina Natural'
      },
      verificacion: {
        endpoint: '/api/pdf/verificar',
        instrucciones: 'Use este endpoint para verificar la autenticidad del documento'
      }
    });

  } catch (error) {
    console.error('Error firmando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno firmando PDF'
    });
  }
});

// @desc    Verificar autenticidad de PDF firmado
// @route   POST /api/pdf/verificar
// @access  Public
router.post('/verificar', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el nombre del archivo PDF'
      });
    }

    // Verificar el PDF
    const verificacion = await generadorGuias.verificarPDF(fileName);

    res.json({
      success: true,
      message: '🔍 Verificación de PDF completada',
      verificacion: {
        valido: verificacion.valido,
        razon: verificacion.razon,
        estado: verificacion.valido ? '✅ AUTÉNTICO' : '❌ NO VÁLIDO'
      },
      documento: verificacion.documento || null,
      certificacion: verificacion.certificacion || null
    });

  } catch (error) {
    console.error('Error verificando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno verificando PDF'
    });
  }
});

// @desc    Obtener contenido HTML del PDF
// @route   GET /api/pdf/contenido/:fileName
// @access  Public
router.get('/contenido/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const basePath = path.join(process.cwd(), 'generated-pdfs');
    const htmlPath = path.join(basePath, `${fileName}.html`);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    const contenidoHTML = fs.readFileSync(htmlPath, 'utf8');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(contenidoHTML);

  } catch (error) {
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo contenido'
    });
  }
});

// @desc    Generar y firmar PDF completo (proceso automático)
// @route   POST /api/pdf/completo
// @access  Private
router.post('/completo', authenticate, async (req, res) => {
  try {
    const { enfermedad } = req.body;

    if (!enfermedad) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el tipo de enfermedad'
      });
    }

    // Paso 1: Generar PDF
    console.log(`🔄 Generando guía para: ${enfermedad}`);
    const pdfInfo = await generadorGuias.generarGuiaPDF(enfermedad);

    // Paso 2: Firmar automáticamente
    console.log(`✍️ Firmando documento: ${pdfInfo.titulo}`);
    const resultado = await generadorGuias.firmarPDF(pdfInfo);

    res.json({
      success: true,
      message: '🎉 Guía PDF generada y firmada exitosamente',
      documento: {
        titulo: resultado.pdfInfo.titulo,
        enfermedad: resultado.pdfInfo.enfermedad,
        fileName: resultado.pdfInfo.fileName,
        fechaGeneracion: resultado.pdfInfo.fechaGeneracion,
        totalPlantas: resultado.pdfInfo.contenido.totalPlantas,
        totalRecomendaciones: resultado.pdfInfo.contenido.totalRecomendaciones
      },
      seguridad: {
        firmado: true,
        algoritmo: resultado.pdfInfo.firma.algorithm,
        hash: resultado.pdfInfo.hash.substring(0, 32) + '...',
        autoridad: 'V-Health',
        fechaFirma: resultado.pdfInfo.firma.timestamp
      },
      acciones: {
        ver: `/api/pdf/contenido/${resultado.pdfInfo.fileName}`,
        verificar: `/api/pdf/verificar (POST con fileName: "${resultado.pdfInfo.fileName}")`
      }
    });

  } catch (error) {
    console.error('Error en proceso completo:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('No existe guía') ? 
        'Tipo de enfermedad no disponible' : 
        'Error interno en el proceso'
    });
  }
});

export default router;