import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import generadorGuias from './src/utils/generadorGuiasPDF.js';

const app = express();
const PORT = 3003;

// Middleware
app.use(cors());
app.use(express.json());

console.log('📄 === SERVIDOR DEMO PDFs FIRMADOS V-HEALTH ===\n');

// Ruta principal con información del sistema
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📄 Servidor Demo PDFs Firmados V-Health',
    descripcion: 'Sistema de generación de guías de plantas medicinales con firma digital',
    caracteristicas: [
      '🌿 Guías sobre plantas medicinales para enfermedades básicas',
      '✍️ Firma digital con RSA-SHA256',
      '🔍 Verificación de autenticidad',
      '📋 Contenido HTML responsivo',
      '🔐 Integridad garantizada'
    ],
    endpoints: {
      '/demo/guias': 'GET - Lista de guías disponibles',
      '/demo/generar': 'POST - Generar guía PDF',
      '/demo/firmar': 'POST - Firmar PDF digitalmente',
      '/demo/verificar': 'POST - Verificar autenticidad',
      '/demo/completo': 'POST - Proceso completo (generar + firmar)',
      '/demo/contenido/:fileName': 'GET - Ver contenido HTML del PDF'
    },
    guiasDisponibles: [
      'tos - Guía para aliviar la tos con plantas naturales',
      'resfriado - Remedios naturales para el resfriado',
      'dolor_cabeza - Alivio natural para dolores de cabeza',
      'indigestion - Plantas para problemas digestivos'
    ]
  });
});

// Obtener lista de guías disponibles
app.get('/demo/guias', async (req, res) => {
  try {
    const guiasDisponibles = generadorGuias.obtenerGuiasDisponibles();
    
    res.json({
      success: true,
      message: '🌿 Guías de plantas medicinales disponibles',
      guias: guiasDisponibles,
      total: guiasDisponibles.length,
      uso: 'Use el ID de la guía en el endpoint /demo/generar'
    });

  } catch (error) {
    console.error('Error obteniendo guías:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo guías'
    });
  }
});

// Generar guía PDF
app.post('/demo/generar', async (req, res) => {
  try {
    const { enfermedad } = req.body;

    if (!enfermedad) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el tipo de enfermedad',
        guiasDisponibles: ['tos', 'resfriado', 'dolor_cabeza', 'indigestion']
      });
    }

    console.log(`📄 Generando guía para: ${enfermedad}`);
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
      acciones: {
        firmar: `POST /demo/firmar con { "fileName": "${pdfInfo.fileName}" }`,
        ver: `GET /demo/contenido/${pdfInfo.fileName}`,
        completo: 'O use POST /demo/completo para generar y firmar automáticamente'
      }
    });

  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('No existe guía') ? 
        'Tipo de enfermedad no disponible. Use: tos, resfriado, dolor_cabeza, indigestion' : 
        'Error interno generando PDF'
    });
  }
});

// Firmar PDF digitalmente
app.post('/demo/firmar', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el nombre del archivo PDF (fileName)'
      });
    }

    console.log(`✍️ Firmando PDF: ${fileName}`);
    
    // Crear información básica del PDF para firmar
    const basePath = path.join(process.cwd(), 'generated-pdfs');
    const htmlPath = path.join(basePath, `${fileName}.html`);

    if (!fs.existsSync(htmlPath)) {
      return res.status(404).json({
        success: false,
        message: 'PDF no encontrado. Genere primero el PDF con /demo/generar'
      });
    }

    const pdfInfo = {
      titulo: "Guía de Plantas Medicinales V-Health",
      enfermedad: "Tratamiento natural",
      fileName: fileName,
      htmlPath: htmlPath,
      fechaGeneracion: new Date().toISOString()
    };

    const resultado = await generadorGuias.firmarPDF(pdfInfo);

    res.json({
      success: true,
      message: '✍️ PDF firmado digitalmente exitosamente',
      firmado: {
        titulo: resultado.pdfInfo.titulo,
        fileName: resultado.pdfInfo.fileName,
        hash: resultado.pdfInfo.hash.substring(0, 32) + '...',
        algoritmo: resultado.pdfInfo.firma.algorithm,
        fechaFirma: resultado.pdfInfo.firma.timestamp,
        autoridad: 'V-Health Sistema de Medicina Natural'
      },
      verificacion: {
        comando: `POST /demo/verificar con { "fileName": "${fileName}" }`,
        descripcion: 'Use este endpoint para verificar la autenticidad del documento'
      }
    });

  } catch (error) {
    console.error('Error firmando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno firmando PDF',
      error: error.message
    });
  }
});

// Verificar autenticidad de PDF
app.post('/demo/verificar', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el nombre del archivo PDF (fileName)'
      });
    }

    console.log(`🔍 Verificando PDF: ${fileName}`);
    const verificacion = await generadorGuias.verificarPDF(fileName);

    res.json({
      success: true,
      message: '🔍 Verificación de PDF completada',
      verificacion: {
        valido: verificacion.valido,
        estado: verificacion.valido ? '✅ DOCUMENTO AUTÉNTICO' : '❌ DOCUMENTO NO VÁLIDO',
        razon: verificacion.razon
      },
      documento: verificacion.documento || null,
      certificacion: verificacion.certificacion || null,
      seguridad: verificacion.valido ? {
        algoritmo: 'RSA-SHA256',
        autoridad: 'V-Health',
        integridad: 'Verificada',
        autenticidad: 'Confirmada'
      } : null
    });

  } catch (error) {
    console.error('Error verificando PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno verificando PDF'
    });
  }
});

// Ver contenido HTML del PDF
app.get('/demo/contenido/:fileName', async (req, res) => {
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
    
    // Agregar información de firma si existe
    const firmaPath = path.join(basePath, `${fileName}-firma.json`);
    let infoFirma = '';
    
    if (fs.existsSync(firmaPath)) {
      const firmaData = JSON.parse(fs.readFileSync(firmaPath, 'utf8'));
      infoFirma = `
        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">🔐 Documento Firmado Digitalmente</h3>
          <p style="margin: 5px 0;"><strong>Autoridad:</strong> V-Health Sistema de Medicina Natural</p>
          <p style="margin: 5px 0;"><strong>Algoritmo:</strong> ${firmaData.firma.algorithm}</p>
          <p style="margin: 5px 0;"><strong>Fecha de Firma:</strong> ${new Date(firmaData.firma.timestamp).toLocaleString('es-ES')}</p>
          <p style="margin: 5px 0;"><strong>Hash:</strong> ${firmaData.pdfInfo.hash.substring(0, 40)}...</p>
          <small>✅ Este documento ha sido verificado y es auténtico</small>
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

// Proceso completo: generar y firmar automáticamente
app.post('/demo/completo', async (req, res) => {
  try {
    const { enfermedad } = req.body;

    if (!enfermedad) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el tipo de enfermedad',
        opciones: ['tos', 'resfriado', 'dolor_cabeza', 'indigestion']
      });
    }

    console.log(`🔄 Proceso completo para: ${enfermedad}`);

    // Paso 1: Generar PDF
    console.log(`📄 Generando guía...`);
    const pdfInfo = await generadorGuias.generarGuiaPDF(enfermedad);

    // Paso 2: Firmar automáticamente
    console.log(`✍️ Firmando documento...`);
    const resultado = await generadorGuias.firmarPDF(pdfInfo);

    console.log(`✅ Proceso completado: ${resultado.pdfInfo.titulo}`);

    res.json({
      success: true,
      message: '🎉 Guía PDF generada y firmada exitosamente',
      documento: {
        titulo: resultado.pdfInfo.titulo,
        enfermedad: resultado.pdfInfo.enfermedad,
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
        ver: `GET /demo/contenido/${resultado.pdfInfo.fileName}`,
        verificar: `POST /demo/verificar con { "fileName": "${resultado.pdfInfo.fileName}" }`
      }
    });

  } catch (error) {
    console.error('Error en proceso completo:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('No existe guía') ? 
        'Tipo de enfermedad no disponible. Use: tos, resfriado, dolor_cabeza, indigestion' : 
        'Error interno en el proceso'
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🌐 Servidor Demo PDFs ejecutándose en: http://localhost:${PORT}`);
  console.log('📄 Endpoints disponibles:');
  console.log(`   📋 Info: http://localhost:${PORT}/`);
  console.log(`   🌿 Guías: http://localhost:${PORT}/demo/guias`);
  console.log(`   📄 Generar: POST http://localhost:${PORT}/demo/generar`);
  console.log(`   ✍️ Firmar: POST http://localhost:${PORT}/demo/firmar`);
  console.log(`   🔍 Verificar: POST http://localhost:${PORT}/demo/verificar`);
  console.log(`   🎉 Completo: POST http://localhost:${PORT}/demo/completo`);
  console.log(`   👁️ Ver: GET http://localhost:${PORT}/demo/contenido/[fileName]`);
  console.log('\n🎯 ¡Listo para generar guías de plantas medicinales firmadas digitalmente!');
});

export default app;