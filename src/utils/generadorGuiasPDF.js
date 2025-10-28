import fs from 'fs';
import path from 'path';
import vHealthCrypto from '../utils/vHealthCrypto.js';

/**
 * Sistema de Generación de Guías PDF con Firma Digital
 * Para plantas medicinales y enfermedades básicas
 */

// Base de datos de plantas medicinales y enfermedades básicas
const guiasPlantas = {
  tos: {
    titulo: "Guía Natural para Aliviar la Tos",
    enfermedad: "Tos común",
    descripcion: "La tos es un mecanismo de defensa natural del cuerpo para limpiar las vías respiratorias.",
    plantas: [
      {
        nombre: "Miel de Abeja",
        preparacion: "1-2 cucharadas de miel pura, preferiblemente antes de dormir",
        beneficios: "Propiedades antibacterianas y calmantes para la garganta",
        precauciones: "No dar a menores de 1 año"
      },
      {
        nombre: "Jengibre",
        preparacion: "Té de jengibre: hervir 1 trozo pequeño en 1 taza de agua por 10 minutos",
        beneficios: "Propiedades antiinflamatorias y expectorantes",
        precauciones: "Evitar en caso de úlceras gástricas"
      },
      {
        nombre: "Eucalipto",
        preparacion: "Inhalaciones: 3-4 hojas en agua caliente, inhalar vapores por 5-10 minutos",
        beneficios: "Ayuda a despejar las vías respiratorias",
        precauciones: "Solo para inhalaciones, no ingerir"
      }
    ],
    recomendaciones: [
      "Mantenerse hidratado bebiendo abundante agua",
      "Descansar lo suficiente",
      "Evitar irritantes como el humo del cigarrillo",
      "Consultar médico si la tos persiste más de 2 semanas"
    ]
  },
  resfriado: {
    titulo: "Remedios Naturales para el Resfriado Común",
    enfermedad: "Resfriado común",
    descripcion: "El resfriado común es una infección viral leve de las vías respiratorias superiores.",
    plantas: [
      {
        nombre: "Equinácea",
        preparacion: "Té de equinácea: 1 cucharadita de hojas secas en 1 taza de agua caliente, 3 veces al día",
        beneficios: "Fortalece el sistema inmunológico",
        precauciones: "No usar por más de 8 semanas consecutivas"
      },
      {
        nombre: "Ajo",
        preparacion: "1-2 dientes de ajo crudo al día, preferiblemente machacado",
        beneficios: "Propiedades antivirales y antibacterianas",
        precauciones: "Puede causar irritación estomacal en ayunas"
      },
      {
        nombre: "Limón y Miel",
        preparacion: "Jugo de 1 limón + 1 cucharada de miel en agua tibia, 2-3 veces al día",
        beneficios: "Vitamina C y propiedades calmantes",
        precauciones: "Enjuagar la boca después para proteger el esmalte dental"
      }
    ],
    recomendaciones: [
      "Descansar y dormir lo suficiente",
      "Beber líquidos tibios abundantes",
      "Hacer gárgaras con agua salada tibia",
      "Consultar médico si los síntomas empeoran o persisten más de 10 días"
    ]
  },
  dolor_cabeza: {
    titulo: "Alivio Natural para el Dolor de Cabeza",
    enfermedad: "Cefalea tensional",
    descripcion: "El dolor de cabeza tensional es el tipo más común, causado por estrés y tensión muscular.",
    plantas: [
      {
        nombre: "Menta",
        preparacion: "Aceite esencial de menta: aplicar 1-2 gotas en las sienes, masajear suavemente",
        beneficios: "Efecto refrescante y analgésico natural",
        precauciones: "Diluir con aceite portador, evitar contacto con ojos"
      },
      {
        nombre: "Manzanilla",
        preparacion: "Té de manzanilla: 1 bolsita o 1 cucharadita de flores secas en agua caliente por 10 minutos",
        beneficios: "Propiedades relajantes y antiinflamatorias",
        precauciones: "Evitar si hay alergia a las asteráceas"
      },
      {
        nombre: "Lavanda",
        preparacion: "Inhalación: 2-3 gotas de aceite esencial en un pañuelo o difusor",
        beneficios: "Reduce el estrés y la tensión",
        precauciones: "No aplicar puro sobre la piel"
      }
    ],
    recomendaciones: [
      "Aplicar compresas frías o calientes según prefiera",
      "Practicar técnicas de relajación",
      "Mantener horarios regulares de sueño",
      "Consultar médico si el dolor es severo o frecuente"
    ]
  },
  indigestion: {
    titulo: "Plantas Medicinales para la Indigestión",
    enfermedad: "Indigestión o dispepsia",
    descripcion: "La indigestión es una molestia en la parte superior del abdomen durante o después de comer.",
    plantas: [
      {
        nombre: "Manzanilla",
        preparacion: "Té de manzanilla: 1 taza después de las comidas",
        beneficios: "Calma el estómago y reduce la inflamación",
        precauciones: "Evitar si hay alergia conocida"
      },
      {
        nombre: "Hierbabuena",
        preparacion: "Té de hierbabuena: hojas frescas o secas en agua caliente por 5-7 minutos",
        beneficios: "Alivia náuseas y mejora la digestión",
        precauciones: "Evitar en caso de reflujo gastroesofágico severo"
      },
      {
        nombre: "Anís",
        preparacion: "Té de anís: 1 cucharadita de semillas en 1 taza de agua hirviendo por 10 minutos",
        beneficios: "Reduce gases y cólicos intestinales",
        precauciones: "No exceder 3 tazas al día"
      }
    ],
    recomendaciones: [
      "Comer porciones pequeñas y masticar bien",
      "Evitar comidas muy grasosas o picantes",
      "No acostarse inmediatamente después de comer",
      "Consultar médico si los síntomas son recurrentes"
    ]
  }
};

class GeneradorGuiasPDF {
  constructor() {
    this.basePath = path.join(process.cwd(), 'generated-pdfs');
    this.ensureDirectoryExists();
  }

  ensureDirectoryExists() {
    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  /**
   * Generar guía PDF sobre planta medicinal
   */
  async generarGuiaPDF(tipoEnfermedad) {
    try {
      const guia = guiasPlantas[tipoEnfermedad];
      if (!guia) {
        throw new Error(`No existe guía para: ${tipoEnfermedad}`);
      }

      // Generar contenido HTML de la guía
      const htmlContent = this.generarContenidoHTML(guia);
      
      // Crear nombre de archivo único
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `guia-${tipoEnfermedad}-${timestamp}`;
      const htmlPath = path.join(this.basePath, `${fileName}.html`);

      // Guardar HTML temporalmente
      fs.writeFileSync(htmlPath, htmlContent, 'utf8');

      // Crear información del PDF
      const pdfInfo = {
        titulo: guia.titulo,
        enfermedad: guia.enfermedad,
        fileName: fileName,
        htmlPath: htmlPath,
        fechaGeneracion: new Date().toISOString(),
        contenido: {
          totalPlantas: guia.plantas.length,
          totalRecomendaciones: guia.recomendaciones.length
        },
        hash: null,
        firmado: false
      };

      console.log(`📄 Guía PDF generada: ${guia.titulo}`);
      return pdfInfo;

    } catch (error) {
      console.error('Error generando guía PDF:', error.message);
      throw error;
    }
  }

  /**
   * Generar contenido HTML de la guía
   */
  generarContenidoHTML(guia) {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${guia.titulo}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #2d5a27;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #97b892, #2d5a27);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            margin-bottom: 30px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 2.2em;
            font-weight: bold;
        }
        .subtitle {
            font-size: 1.1em;
            margin-top: 10px;
            opacity: 0.9;
        }
        .description {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 25px;
            border-left: 5px solid #97b892;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .section {
            background: white;
            margin-bottom: 25px;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .section h2 {
            color: #2d5a27;
            border-bottom: 2px solid #97b892;
            padding-bottom: 10px;
            margin-bottom: 20px;
            font-size: 1.5em;
        }
        .planta {
            background: #f8f9fa;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        .planta h3 {
            color: #2d5a27;
            margin-top: 0;
            font-size: 1.3em;
            border-bottom: 1px solid #97b892;
            padding-bottom: 5px;
        }
        .info-item {
            margin-bottom: 12px;
        }
        .info-label {
            font-weight: bold;
            color: #2d5a27;
            display: inline-block;
            min-width: 120px;
        }
        .precaucion {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            border-radius: 5px;
            margin-top: 10px;
        }
        .precaucion strong {
            color: #856404;
        }
        .recomendaciones ul {
            padding-left: 20px;
        }
        .recomendaciones li {
            margin-bottom: 8px;
            padding-left: 5px;
        }
        .footer {
            background: #2d5a27;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin-top: 30px;
        }
        .warning {
            background: #f8d7da;
            border: 1px solid #f1aeb5;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
        }
        .warning strong {
            display: block;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌿 ${guia.titulo}</h1>
        <div class="subtitle">V-Health • Medicina Natural</div>
    </div>

    <div class="description">
        <h2>📋 Descripción</h2>
        <p>${guia.descripcion}</p>
    </div>

    <div class="section">
        <h2>🌱 Plantas Medicinales Recomendadas</h2>
        ${guia.plantas.map(planta => `
            <div class="planta">
                <h3>🍃 ${planta.nombre}</h3>
                <div class="info-item">
                    <span class="info-label">📝 Preparación:</span>
                    ${planta.preparacion}
                </div>
                <div class="info-item">
                    <span class="info-label">✅ Beneficios:</span>
                    ${planta.beneficios}
                </div>
                <div class="precaucion">
                    <strong>⚠️ Precauciones:</strong> ${planta.precauciones}
                </div>
            </div>
        `).join('')}
    </div>

    <div class="section recomendaciones">
        <h2>💡 Recomendaciones Generales</h2>
        <ul>
            ${guia.recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>

    <div class="warning">
        <strong>⚠️ IMPORTANTE</strong>
        Esta guía es solo informativa. Los remedios naturales no reemplazan el tratamiento médico profesional. 
        Consulte siempre con un médico antes de usar plantas medicinales, especialmente si está embarazada, 
        amamantando o tomando medicamentos.
    </div>

    <div class="footer">
        <p><strong>🏥 V-Health - Sistema de Salud Natural</strong></p>
        <p>Generado el: ${new Date().toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}</p>
        <p>📧 Contacto: info@v-health.com</p>
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
        enfermedad: pdfInfo.enfermedad,
        fechaGeneracion: pdfInfo.fechaGeneracion,
        contenidoHash: vHealthCrypto.generateHash(contenidoHTML),
        autoridad: "V-Health Sistema de Medicina Natural",
        version: "1.0"
      };

      // Firmar los datos
      const firma = vHealthCrypto.signData(JSON.stringify(datosParaFirmar));

      // Actualizar información del PDF
      pdfInfo.hash = datosParaFirmar.contenidoHash;
      pdfInfo.firmado = true;
      pdfInfo.firma = firma;

      // Guardar información de la firma
      const firmaPath = path.join(this.basePath, `${pdfInfo.fileName}-firma.json`);
      fs.writeFileSync(firmaPath, JSON.stringify({
        pdfInfo: pdfInfo,
        firma: firma,
        certificacion: {
          autoridad: "V-Health",
          algoritmo: "RSA-SHA256",
          fechaFirma: new Date().toISOString(),
          validez: "Este documento ha sido firmado digitalmente por V-Health",
          verificacion: "Use la API /api/pdf/verify para verificar la autenticidad"
        }
      }, null, 2), 'utf8');

      console.log(`✍️ PDF firmado digitalmente: ${pdfInfo.titulo}`);
      console.log(`🔗 Hash del documento: ${pdfInfo.hash.substring(0, 32)}...`);
      console.log(`📁 Firma guardada en: ${firmaPath}`);

      return {
        pdfInfo,
        firmaPath,
        verificado: true
      };

    } catch (error) {
      console.error('Error firmando PDF:', error.message);
      throw error;
    }
  }

  /**
   * Verificar autenticidad de PDF firmado
   */
  async verificarPDF(fileName) {
    try {
      const firmaPath = path.join(this.basePath, `${fileName}-firma.json`);
      
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
          razon: "El documento ha sido modificado después de la firma"
        };
      }

      // Verificar firma digital
      const verificacion = vHealthCrypto.verifySignature(firma);

      return {
        valido: verificacion.valid,
        razon: verificacion.reason,
        documento: {
          titulo: pdfInfo.titulo,
          enfermedad: pdfInfo.enfermedad,
          fechaGeneracion: pdfInfo.fechaGeneracion,
          hash: pdfInfo.hash
        },
        certificacion: firmaData.certificacion
      };

    } catch (error) {
      console.error('Error verificando PDF:', error.message);
      return {
        valido: false,
        razon: `Error en la verificación: ${error.message}`
      };
    }
  }

  /**
   * Listar guías disponibles
   */
  obtenerGuiasDisponibles() {
    return Object.keys(guiasPlantas).map(key => ({
      id: key,
      titulo: guiasPlantas[key].titulo,
      enfermedad: guiasPlantas[key].enfermedad,
      totalPlantas: guiasPlantas[key].plantas.length
    }));
  }
}

// Exportar instancia singleton
const generadorGuias = new GeneradorGuiasPDF();
export default generadorGuias;