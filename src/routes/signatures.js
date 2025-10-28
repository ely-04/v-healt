import express from 'express';
import generadorGuias from '../utils/generadorGuiasPDF.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Buscar firmas digitales internas
// @route   GET /api/signatures/search
// @access  Private
router.get('/search', authenticate, async (req, res) => {
  try {
    const { documentType, fechaDesde, fechaHasta, status } = req.query;
    
    const criterios = {};
    if (documentType) criterios.documentType = documentType;
    if (fechaDesde) criterios.fechaDesde = fechaDesde;
    if (fechaHasta) criterios.fechaHasta = fechaHasta;
    if (status) criterios.status = status;

    const resultados = generadorGuias.buscarFirmasInternas(criterios);

    res.json({
      success: true,
      message: '🔍 Búsqueda de firmas completada',
      busqueda: {
        criterios: criterios,
        resultados: resultados.found,
        total: resultados.total
      },
      filtros: {
        documentType: 'Tipo de documento (tos, indigestion, etc.)',
        fechaDesde: 'Fecha desde (YYYY-MM-DD)',
        fechaHasta: 'Fecha hasta (YYYY-MM-DD)', 
        status: 'Estado (active, archived, etc.)'
      }
    });

  } catch (error) {
    console.error('Error buscando firmas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno buscando firmas'
    });
  }
});

// @desc    Obtener estadísticas de firmas digitales
// @route   GET /api/signatures/stats
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const estadisticas = generadorGuias.obtenerEstadisticasFirmas();

    res.json({
      success: true,
      message: '📊 Estadísticas de firmas digitales',
      estadisticas: {
        resumen: {
          totalFirmas: estadisticas.totalFirmas,
          ultimaFirma: estadisticas.ultimaFirma,
          actualizadoEn: estadisticas.actualizadoEn
        },
        distribucion: {
          porTipoDocumento: estadisticas.tiposDocumento,
          porFecha: estadisticas.porFecha
        }
      },
      sistema: {
        almacenamiento: 'Apartado interno organizado',
        indexacion: 'Índice maestro automático',
        auditoria: 'Log completo de operaciones'
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo estadísticas'
    });
  }
});

// @desc    Obtener información del sistema de almacenamiento interno
// @route   GET /api/signatures/system-info
// @access  Private
router.get('/system-info', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      message: '🗄️ Sistema de Almacenamiento de Firmas Digitales V-Health',
      sistema: {
        nombre: 'V-Health Internal Signature Manager',
        version: '1.0',
        descripcion: 'Sistema organizado de almacenamiento interno para firmas digitales'
      },
      estructura: {
        apartado_principal: '/internal-signatures',
        organizacion: 'Por fecha (YYYY-MM-DD) > Por tipo de documento',
        archivo_general: '/document-archive',
        componentes: [
          'signatures/ - Índice maestro de firmas',
          'documents/ - Metadatos de documentos',
          'certificates/ - Certificados digitales',
          'logs/ - Auditoría y logs del sistema'
        ]
      },
      funcionalidades: [
        '🗂️ Organización automática por fecha y tipo',
        '📇 Índice maestro para búsquedas rápidas',
        '🔍 Búsqueda por múltiples criterios',
        '📊 Estadísticas y reportes automáticos',
        '📝 Log de auditoría completo',
        '🔐 Almacenamiento seguro con metadatos'
      ],
      endpoints: {
        buscar: 'GET /api/signatures/search?documentType=&fechaDesde=&fechaHasta=',
        estadisticas: 'GET /api/signatures/stats',
        info_sistema: 'GET /api/signatures/system-info'
      }
    });

  } catch (error) {
    console.error('Error obteniendo info del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo información del sistema'
    });
  }
});

// @desc    Listar firmas recientes
// @route   GET /api/signatures/recent
// @access  Private
router.get('/recent', authenticate, async (req, res) => {
  try {
    const limite = parseInt(req.query.limit) || 10;
    const todas = generadorGuias.buscarFirmasInternas({});
    
    // Ordenar por fecha más reciente y limitar
    const recientes = todas.found
      .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt))
      .slice(0, limite);

    res.json({
      success: true,
      message: `📋 Últimas ${recientes.length} firmas digitales`,
      firmas: recientes.map(firma => ({
        internalId: firma.internalId,
        documentTitle: firma.documentTitle,
        documentType: firma.documentType,
        signedAt: firma.signedAt,
        hash: firma.hash,
        status: firma.status
      })),
      total: todas.total,
      limite: limite
    });

  } catch (error) {
    console.error('Error obteniendo firmas recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno obteniendo firmas recientes'
    });
  }
});

export default router;