import vHealthCrypto from '../utils/vHealthCrypto.js';

/**
 * Middleware para cifrar automáticamente datos sensibles
 * Funciona internamente sin mostrar nada al usuario
 */

class CifradoAutomatico {
  constructor() {
    this.datosCifrados = new Map(); // Almacén temporal de datos cifrados
    this.logOperaciones = []; // Log de operaciones para demostración
  }

  /**
   * Cifrar datos de usuario automáticamente
   */
  cifrarDatosUsuario(userData) {
    try {
      // Identificar datos sensibles que necesitan cifrado
      const datosSensibles = {
        informacionPersonal: {
          nombre: userData.nombre || '',
          email: userData.email || '',
          timestamp: new Date().toISOString()
        },
        metadatos: {
          ip: userData.ip || 'unknown',
          userAgent: userData.userAgent || 'unknown',
          ultimoAcceso: new Date().toISOString()
        }
      };

      // Cifrar con sistema híbrido
      const paqueteCifrado = vHealthCrypto.encryptData(JSON.stringify(datosSensibles));
      
      // Almacenar temporalmente
      const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.datosCifrados.set(id, {
        paqueteCifrado,
        fechaCifrado: new Date().toISOString(),
        tipo: 'usuario'
      });

      // Log para demostración
      this.logOperaciones.push({
        operacion: 'CIFRADO_AUTOMATICO',
        tipo: 'datos_usuario',
        timestamp: new Date().toISOString(),
        algoritmo: paqueteCifrado.algorithm,
        id: id,
        hash: vHealthCrypto.generateHash(JSON.stringify(datosSensibles)).substring(0, 32) + '...'
      });

      console.log(`🔐 [CIFRADO AUTO] Datos de usuario cifrados: ${id}`);
      return id;

    } catch (error) {
      console.error('❌ Error en cifrado automático:', error.message);
      return null;
    }
  }

  /**
   * Cifrar consultas médicas automáticamente
   */
  cifrarConsultaMedica(consultaData) {
    try {
      const consultaSensible = {
        consulta: {
          plantas: consultaData.plantas || [],
          sintomas: consultaData.sintomas || [],
          recomendaciones: consultaData.recomendaciones || []
        },
        sesion: {
          timestamp: new Date().toISOString(),
          duracion: consultaData.duracion || 0,
          paginas_visitadas: consultaData.paginasVisitadas || []
        }
      };

      // Cifrar consulta
      const paqueteCifrado = vHealthCrypto.encryptMedicalData(consultaSensible);
      
      // Almacenar
      const id = `consulta_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      this.datosCifrados.set(id, {
        paqueteCifrado,
        fechaCifrado: new Date().toISOString(),
        tipo: 'consulta_medica'
      });

      // Log
      this.logOperaciones.push({
        operacion: 'CIFRADO_CONSULTA',
        tipo: 'consulta_medica',
        timestamp: new Date().toISOString(),
        algoritmo: paqueteCifrado.algorithm,
        id: id,
        plantas_consultadas: consultaData.plantas?.length || 0
      });

      console.log(`🌿 [CIFRADO AUTO] Consulta médica cifrada: ${id}`);
      return id;

    } catch (error) {
      console.error('❌ Error cifrando consulta:', error.message);
      return null;
    }
  }

  /**
   * Descifrar datos por ID (para demostración)
   */
  descifrarDatos(id) {
    try {
      const datos = this.datosCifrados.get(id);
      if (!datos) {
        throw new Error('Datos no encontrados');
      }

      let datosDescifrados;
      if (datos.tipo === 'consulta_medica') {
        datosDescifrados = vHealthCrypto.decryptMedicalData(datos.paqueteCifrado);
      } else {
        datosDescifrados = vHealthCrypto.decryptData(datos.paqueteCifrado);
        datosDescifrados = JSON.parse(datosDescifrados);
      }

      // Log de descifrado
      this.logOperaciones.push({
        operacion: 'DESCIFRADO',
        tipo: datos.tipo,
        timestamp: new Date().toISOString(),
        id: id,
        estado: 'exitoso'
      });

      console.log(`🔓 [DESCIFRADO] Datos recuperados: ${id}`);
      return datosDescifrados;

    } catch (error) {
      console.error('❌ Error descifrando:', error.message);
      return null;
    }
  }

  /**
   * Obtener estadísticas para demostración
   */
  obtenerEstadisticas() {
    return {
      totalDatosCifrados: this.datosCifrados.size,
      totalOperaciones: this.logOperaciones.length,
      tiposDatos: {
        usuarios: this.logOperaciones.filter(op => op.tipo === 'datos_usuario').length,
        consultas: this.logOperaciones.filter(op => op.tipo === 'consulta_medica').length
      },
      algoritmoUtilizado: 'RSA-2048 + AES-256-CTR',
      ultimaOperacion: this.logOperaciones[this.logOperaciones.length - 1] || null
    };
  }

  /**
   * Obtener log de operaciones (para demostración al profesor)
   */
  obtenerLogOperaciones(limite = 10) {
    return this.logOperaciones.slice(-limite).reverse();
  }

  /**
   * Limpiar datos antiguos (más de 1 hora)
   */
  limpiarDatosAntiguos() {
    const ahora = new Date();
    const horaAtras = new Date(ahora.getTime() - 60 * 60 * 1000);

    for (const [id, datos] of this.datosCifrados.entries()) {
      const fechaCifrado = new Date(datos.fechaCifrado);
      if (fechaCifrado < horaAtras) {
        this.datosCifrados.delete(id);
        console.log(`🗑️ Datos antiguos eliminados: ${id}`);
      }
    }
  }

  /**
   * Simular cifrado de datos para demostración
   */
  simularCifradoDemo() {
    // Simular varios tipos de datos
    this.cifrarDatosUsuario({
      nombre: 'Usuario Demo',
      email: 'demo@vhealth.com',
      ip: '192.168.1.100'
    });

    this.cifrarConsultaMedica({
      plantas: ['Manzanilla', 'Jengibre'],
      sintomas: ['Dolor de cabeza', 'Indigestión'],
      recomendaciones: ['Té de manzanilla', 'Descanso'],
      duracion: 300,
      paginasVisitadas: ['/plantas', '/enfermedades']
    });

    console.log('🎭 Simulación de cifrado completada para demostración');
  }
}

// Instancia singleton
const cifradoAuto = new CifradoAutomatico();

// Limpiar datos antiguos cada 30 minutos
setInterval(() => {
  cifradoAuto.limpiarDatosAntiguos();
}, 30 * 60 * 1000);

export default cifradoAuto;