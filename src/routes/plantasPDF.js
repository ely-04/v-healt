import express from 'express';
import generadorPlantasPDF from '../utils/generadorPlantasPDF.js';
import { authenticate } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @desc    Generar PDF de planta medicinal
// @route   POST /api/plantas-pdf/generar
// @access  Private
router.post('/generar', authenticate, async (req, res) => {
  try {
    const { plantaData } = req.body;

    if (!plantaData || !plantaData.nombre) {
      return res.status(400).json({
        success: false,
        message: 'Datos de planta requeridos'
      });
    }

    // Generar el PDF
    const pdfInfo = await generadorPlantasPDF.generarPDFPlanta(plantaData);

    res.json({
      success: true,
      message: '📄 PDF de planta generado exitosamente',
      pdf: {
        titulo: pdfInfo.titulo,
        planta: pdfInfo.planta,
        nombreCientifico: pdfInfo.nombreCientifico,
        fileName: pdfInfo.fileName,
        fechaGeneracion: pdfInfo.fechaGeneracion,
        contenido: pdfInfo.contenido
      },
      siguiente: {
        accion: 'firmar',
        endpoint: '/api/plantas-pdf/firmar',
        descripcion: 'Firme digitalmente el PDF para garantizar autenticidad'
      }
    });

  } catch (error) {
    console.error('Error generando PDF de planta:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Datos de planta requeridos') ? 
        'Información de planta incompleta' : 
        'Error interno generando PDF'
    });
  }
});

// @desc    Firmar PDF de planta digitalmente
// @route   POST /api/plantas-pdf/firmar
// @access  Private
router.post('/firmar', authenticate, async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Nombre del archivo PDF requerido'
      });
    }

    // Crear información del PDF desde el fileName
    const basePath = path.join(process.cwd(), 'generated-plantas-pdfs');
    const htmlPath = path.join(basePath, `${fileName}.html`);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF no encontrado para firmar'
      });
    }

    // Recrear pdfInfo básico para firmar
    const pdfInfo = {
      titulo: "Guía de Planta Medicinal",
      planta: "Planta medicinal",
      fileName: fileName,
      htmlPath: htmlPath,
      fechaGeneracion: new Date().toISOString()
    };

    // Firmar el PDF
    const resultado = await generadorPlantasPDF.firmarPDF(pdfInfo);

    res.json({
      success: true,
      message: '✍️ PDF de planta firmado digitalmente exitosamente',
      firmado: {
        titulo: resultado.pdfInfo.titulo,
        hash: resultado.pdfInfo.hash.substring(0, 32) + '...',
        algoritmo: resultado.pdfInfo.firma.algorithm,
        fechaFirma: resultado.pdfInfo.firma.timestamp,
        autoridad: 'V-Health Sistema de Plantas Medicinales'
      },
      verificacion: {
        endpoint: '/api/plantas-pdf/verificar',
        instrucciones: 'Use este endpoint para verificar la autenticidad del documento'
      }
    });

  } catch (error) {
    console.error('Error firmando PDF de planta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno firmando PDF'
    });
  }
});

// @desc    Verificar autenticidad de PDF de planta firmado
// @route   POST /api/plantas-pdf/verificar
// @access  Public
router.post('/verificar', async (req, res) => {
  try {
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
    console.error('Error verificando PDF de planta:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno verificando PDF'
    });
  }
});

// @desc    Obtener contenido HTML del PDF de planta
// @route   GET /api/plantas-pdf/contenido/:fileName
// @access  Public
router.get('/contenido/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
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
    console.error('Error obteniendo contenido:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo contenido'
    });
  }
});

// @desc    Generar y firmar PDF completo (proceso automático)
// @route   POST /api/plantas-pdf/completo
// @access  Private
router.post('/completo', authenticate, async (req, res) => {
  try {
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
    console.error('Error en proceso completo:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('Datos de planta requeridos') ? 
        'Información de planta incompleta' : 
        'Error interno en el proceso'
    });
  }
});

// @desc    Obtener lista de PDFs generados
// @route   GET /api/plantas-pdf/lista
// @access  Private
router.get('/lista', authenticate, async (req, res) => {
  try {
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
    console.error('Error obteniendo lista de PDFs:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo lista'
    });
  }
});

export default router;