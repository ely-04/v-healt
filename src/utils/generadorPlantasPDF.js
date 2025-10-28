import fs from 'fs';
import path from 'path';
import vHealthCrypto from '../utils/vHealthCrypto.js';

/**
 * Sistema de Generación de PDFs de Plantas Medicinales con Firma Digital
 * Especializado para información detallada de plantas medicinales
 */

class GeneradorPlantasPDF {
  constructor() {
    this.basePath = path.join(process.cwd(), 'generated-plantas-pdfs');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Generar PDF con información detallada de una planta medicinal
   */
  async generarPDFPlanta(plantaData) {
    try {
      if (!plantaData || !plantaData.nombre) {
        throw new Error('Datos de planta requeridos');
      }

      // Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const plantaNombre = plantaData.nombre.toLowerCase().replace(/\s+/g, '-');
      const fileName = `planta-${plantaNombre}-${timestamp}`;
      const htmlPath = path.join(this.basePath, `${fileName}.html`);

      // Generar contenido HTML detallado
      const htmlContent = this.generarContenidoHTML(plantaData);
      
      // Guardar HTML
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');

      // Crear información del PDF
      const pdfInfo = {
        titulo: `Guía Completa: ${plantaData.nombre}`,
        planta: plantaData.nombre,
        nombreCientifico: plantaData.nombreCientifico,
        fileName: fileName,
        htmlPath: htmlPath,
        fechaGeneracion: new Date().toISOString(),
        contenido: {
          propiedades: plantaData.propiedades?.length || 0,
          usos: plantaData.usos?.length || 0,
          categoria: plantaData.categoria || 'general'
        },
        hash: null,
        firmado: false
      };

      console.log(`📄 PDF de planta generado: ${plantaData.nombre}`);
      return pdfInfo;

    } catch (error) {
      console.error('Error generando PDF de planta:', error.message);
      throw error;
    }
  }

  /**
   * Generar contenido HTML para PDF de planta medicinal
   */
  generarContenidoHTML(planta) {
    const fechaActual = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guía Completa: ${planta.nombre}</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #2d5a27;
            max-width: 900px;
            margin: 0 auto;
            padding: 30px;
            background-color: #f8fdf8;
        }
        .header {
            background: linear-gradient(135deg, #97b892, #2d5a27);
            color: white;
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 40px;
            box-shadow: 0 8px 16px rgba(0,0,0,0.15);
        }
        .header h1 {
            margin: 0 0 10px 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.95;
            margin: 5px 0;
        }
        .header .scientific-name {
            font-style: italic;
            font-size: 1.1em;
            opacity: 0.9;
            margin-top: 10px;
        }
        .section {
            background: white;
            margin: 30px 0;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            border-left: 5px solid #97b892;
        }
        .section h2 {
            color: #2d5a27;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 1.8em;
            border-bottom: 2px solid #e8f5e8;
            padding-bottom: 10px;
        }
        .propiedades-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .propiedad-item {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #c4e6c1;
        }
        .propiedad-item .emoji {
            font-size: 2em;
            margin-bottom: 10px;
            display: block;
        }
        .usos-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        .uso-item {
            background: #f0f8f0;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #4caf50;
        }
        .uso-item h4 {
            color: #2e7d32;
            margin: 0 0 10px 0;
            font-size: 1.1em;
        }
        .preparacion-box {
            background: #fff3e0;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #ffb74d;
            margin: 20px 0;
        }
        .preparacion-box h3 {
            color: #f57c00;
            margin-top: 0;
            font-size: 1.3em;
        }
        .precauciones-box {
            background: #ffebee;
            padding: 25px;
            border-radius: 12px;
            border: 2px solid #ef5350;
            margin: 20px 0;
        }
        .precauciones-box h3 {
            color: #c62828;
            margin-top: 0;
            font-size: 1.3em;
        }
        .categoria-badge {
            background: #97b892;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #e8f5e8;
            border-radius: 10px;
            color: #555;
        }
        .footer .logo {
            font-size: 1.5em;
            font-weight: bold;
            color: #2d5a27;
            margin-bottom: 5px;
        }
        .metadata {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 0.9em;
            color: #666;
        }
        @media print {
            body { background-color: white; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 ${planta.nombre}</h1>
        <div class="subtitle">Guía Completa de Plantas Medicinales</div>
        <div class="scientific-name">${planta.nombreCientifico || 'Nombre científico no disponible'}</div>
        <div class="categoria-badge">${planta.categoria || 'General'}</div>
    </div>

    <div class="section">
        <h2>🌟 Propiedades Medicinales</h2>
        <div class="propiedades-grid">
            ${(planta.propiedades || []).map(prop => `
                <div class="propiedad-item">
                    <span class="emoji">🌱</span>
                    <strong>${prop}</strong>
                </div>
            `).join('')}
        </div>
        ${(planta.propiedades || []).length === 0 ? '<p>No se han especificado propiedades medicinales.</p>' : ''}
    </div>

    <div class="section">
        <h2>💊 Usos Medicinales Principales</h2>
        <div class="usos-list">
            ${(planta.usos || []).map(uso => `
                <div class="uso-item">
                    <h4>🎯 ${uso}</h4>
                    <p>Aplicación terapéutica tradicional y respaldada por estudios.</p>
                </div>
            `).join('')}
        </div>
        ${(planta.usos || []).length === 0 ? '<p>No se han especificado usos medicinales.</p>' : ''}
    </div>

    <div class="section">
        <div class="preparacion-box">
            <h3>📝 Preparación y Uso</h3>
            <p>${planta.preparacion || 'Información de preparación no disponible.'}</p>
        </div>
    </div>

    <div class="section">
        <div class="precauciones-box">
            <h3>⚠️ Precauciones Importantes</h3>
            <p>${planta.precauciones || 'Consulte siempre con un profesional de la salud antes de usar plantas medicinales.'}</p>
            <br>
            <p><strong>Advertencia general:</strong> Esta información es únicamente educativa y no sustituye el consejo médico profesional. Siempre consulte con un médico antes de usar plantas medicinales, especialmente si está embarazada, amamantando, o tomando medicamentos.</p>
        </div>
    </div>

    <div class="metadata">
        <strong>Información del documento:</strong><br>
        📅 Fecha de generación: ${fechaActual}<br>
        🏥 Fuente: V-Health - Sistema de Medicina Natural<br>
        📋 Categoría: ${planta.categoria || 'General'}<br>
        🔍 ID de planta: ${planta.id || 'N/A'}
    </div>

    <div class="footer">
        <div class="logo">V-Health</div>
        <p>Sistema de Información de Plantas Medicinales</p>
        <p style="font-size: 0.8em;">Documento generado automáticamente • ${fechaActual}</p>
    </div>
</body>
</html>`;
  }

  /**
   * Firmar PDF digitalmente
   */
  async firmarPDF(pdfInfo) {
    try {
      // Leer contenido del archivo HTML
      const contenidoHTML = fs.readFileSync(pdfInfo.htmlPath, 'utf8');
      
      // Crear datos para firma
      const datosParaFirmar = {
        titulo: pdfInfo.titulo,
        planta: pdfInfo.planta,
        nombreCientifico: pdfInfo.nombreCientifico,
        fechaGeneracion: pdfInfo.fechaGeneracion,
        contenidoHash: vHealthCrypto.generateHash(contenidoHTML),
        autoridad: "V-Health Sistema de Plantas Medicinales",
        version: "1.0",
        categoria: pdfInfo.contenido.categoria
      };

      // Firmar los datos
      const firma = vHealthCrypto.signData(JSON.stringify(datosParaFirmar));

      // Actualizar información del PDF
      pdfInfo.hash = datosParaFirmar.contenidoHash;
      pdfInfo.firmado = true;
      pdfInfo.firma = firma;

      // Crear carpeta de firmas si no existe
      const firmasPath = path.join(this.basePath, 'firmas');
      if (!fs.existsSync(firmasPath)) {
        fs.mkdirSync(firmasPath, { recursive: true });
      }

      // Guardar información de la firma
      const firmaPath = path.join(firmasPath, `${pdfInfo.fileName}-firma.json`);
      fs.writeFileSync(firmaPath, JSON.stringify({
        pdfInfo: pdfInfo,
        firma: firma,
        certificacion: {
          autoridad: "V-Health",
          algoritmo: "RSA-SHA256",
          fechaFirma: new Date().toISOString(),
          validez: "Este documento ha sido firmado digitalmente por V-Health",
          verificacion: "Use la API para verificar la autenticidad",
          tipoDocumento: "Guía de Planta Medicinal"
        }
      }, null, 2), 'utf8');

      console.log(`✍️ PDF de planta firmado digitalmente: ${pdfInfo.planta}`);
      console.log(`🔗 Hash del documento: ${pdfInfo.hash.substring(0, 32)}...`);
      console.log(`📁 Firma guardada en: ${firmaPath}`);

      return {
        pdfInfo,
        firmaPath,
        verificado: true
      };

    } catch (error) {
      console.error('Error firmando PDF de planta:', error.message);
      throw error;
    }
  }

  /**
   * Verificar autenticidad de PDF de planta firmado
   */
  async verificarPDF(fileName) {
    try {
      const firmaPath = path.join(this.basePath, 'firmas', `${fileName}-firma.json`);
      
      if (!fs.existsSync(firmaPath)) {
        return {
          valido: false,
          razon: "No se encontró la firma digital del documento"
        };
      }

      const firmaData = JSON.parse(fs.readFileSync(firmaPath, 'utf8'));
      const { pdfInfo, firma } = firmaData;

      // Verificar que el archivo HTML original existe
      if (!fs.existsSync(pdfInfo.htmlPath)) {
        return {
          valido: false,
          razon: "El documento original no se encuentra disponible"
        };
      }

      // Leer contenido actual y verificar integridad
      const contenidoActual = fs.readFileSync(pdfInfo.htmlPath, 'utf8');
      const hashActual = vHealthCrypto.generateHash(contenidoActual);

      if (hashActual !== pdfInfo.hash) {
        return {
          valido: false,
          razon: "El contenido del documento ha sido modificado después de la firma"
        };
      }

      // Verificar firma digital
      const verificacionFirma = vHealthCrypto.verifySignature(firma);

      if (!verificacionFirma.valid) {
        return {
          valido: false,
          razon: "La firma digital no es válida"
        };
      }

      return {
        valido: true,
        razon: "Documento auténtico y sin modificaciones",
        documento: {
          titulo: pdfInfo.titulo,
          planta: pdfInfo.planta,
          fechaGeneracion: pdfInfo.fechaGeneracion,
          hashVerificado: hashActual
        },
        certificacion: firmaData.certificacion
      };

    } catch (error) {
      console.error('Error verificando PDF de planta:', error.message);
      return {
        valido: false,
        razon: `Error en la verificación: ${error.message}`
      };
    }
  }

  /**
   * Obtener lista de PDFs de plantas generados
   */
  obtenerPDFsGenerados() {
    try {
      const archivos = fs.readdirSync(this.basePath);
      const pdfs = archivos
        .filter(archivo => archivo.endsWith('.html'))
        .map(archivo => {
          const fileName = archivo.replace('.html', '');
          const firmaPath = path.join(this.basePath, 'firmas', `${fileName}-firma.json`);
          const firmado = fs.existsSync(firmaPath);
          
          return {
            fileName,
            fechaCreacion: fs.statSync(path.join(this.basePath, archivo)).birthtime,
            firmado,
            enlaceDescarga: `/api/plantas-pdf/contenido/${fileName}`,
            enlaceVerificacion: firmado ? `/api/plantas-pdf/verificar` : null
          };
        })
        .sort((a, b) => b.fechaCreacion - a.fechaCreacion);

      return pdfs;
    } catch (error) {
      console.error('Error obteniendo lista de PDFs:', error.message);
      return [];
    }
  }
}

// Exportar instancia singleton
const generadorPlantasPDF = new GeneradorPlantasPDF();
export default generadorPlantasPDF;