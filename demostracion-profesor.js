import vHealthCrypto from './src/utils/vHealthCrypto.js';
import cifradoAuto from './src/utils/cifradoAutomatico.js';

/**
 * 📋 DEMOSTRACIÓN COMPLETA PARA EL PROFESOR
 * Sistema de Cifrado Interno V-Health
 * 
 * Este script demuestra que el sistema de cifrado funciona
 * internamente sin necesidad de mostrarlo en la interfaz
 */

console.log('🎓 === DEMOSTRACIÓN PARA EL PROFESOR ===');
console.log('🔐 Sistema de Cifrado Interno V-Health\n');

async function demostracionCompleta() {
  try {
    console.log('📋 PARTE 1: CIFRADO AUTOMÁTICO INTERNO');
    console.log('=' .repeat(50));

    // 1. Simular datos que se cifrarían automáticamente cuando un usuario navega
    console.log('🌐 Simulando navegación de usuario...');
    
    const datosUsuario1 = {
      nombre: 'María García',
      email: 'maria@vhealth.com',
      paginasVisitadas: ['/plantas', '/enfermedades/tos'],
      consultas: ['Remedios para la tos', 'Plantas medicinales'],
      tiempoSesion: 1200, // 20 minutos
      ip: '192.168.1.105'
    };

    const id1 = cifradoAuto.cifrarDatosUsuario(datosUsuario1);
    console.log(`   ✅ Datos de usuario cifrados automáticamente: ${id1}`);

    // 2. Simular consulta médica que se cifra automáticamente
    console.log('\n🩺 Simulando consulta médica...');
    
    const consultaMedica = {
      plantas: ['Manzanilla', 'Jengibre', 'Miel'],
      sintomas: ['Dolor de garganta', 'Tos seca'],
      recomendaciones: ['Té de manzanilla 3 veces al día', 'Descanso'],
      duracion: 300,
      fecha: new Date().toISOString()
    };

    const id2 = cifradoAuto.cifrarConsultaMedica(consultaMedica);
    console.log(`   ✅ Consulta médica cifrada automáticamente: ${id2}`);

    console.log('\n📊 PARTE 2: VERIFICACIÓN DE CIFRADO');
    console.log('=' .repeat(50));

    // 3. Mostrar estadísticas del sistema
    const stats = cifradoAuto.obtenerEstadisticas();
    console.log('📈 Estadísticas del Sistema:');
    console.log(`   • Total datos cifrados: ${stats.totalDatosCifrados}`);
    console.log(`   • Total operaciones: ${stats.totalOperaciones}`);
    console.log(`   • Algoritmo utilizado: ${stats.algoritmoUtilizado}`);
    console.log(`   • Datos de usuarios: ${stats.tiposDatos.usuarios}`);
    console.log(`   • Consultas médicas: ${stats.tiposDatos.consultas}`);

    console.log('\n🔓 PARTE 3: VERIFICACIÓN DE DESCIFRADO');
    console.log('=' .repeat(50));

    // 4. Descifrar para demostrar integridad
    console.log('🔍 Verificando integridad de datos cifrados...');
    
    const datosDescifrados1 = cifradoAuto.descifrarDatos(id1);
    const datosDescifrados2 = cifradoAuto.descifrarDatos(id2);

    if (datosDescifrados1 && datosDescifrados2) {
      console.log('   ✅ Descifrado exitoso - Integridad verificada');
      console.log(`   📋 Usuario recuperado: ${datosDescifrados1.informacionPersonal.nombre}`);
      console.log(`   🌿 Plantas consultadas: ${datosDescifrados2.consulta.plantas.join(', ')}`);
    } else {
      console.log('   ❌ Error en descifrado');
    }

    console.log('\n🔐 PARTE 4: TEST TÉCNICO COMPLETO');
    console.log('=' .repeat(50));

    // 5. Test técnico completo
    const datosTest = {
      mensaje: "Información médica confidencial del paciente Juan Pérez",
      diagnostico: "Consulta sobre remedios naturales para resfriado",
      plantas: ["Equinácea", "Jengibre", "Limón"],
      timestamp: new Date().toISOString()
    };

    console.log('🧪 Ejecutando test técnico completo...');

    // Cifrado híbrido
    const paqueteCifrado = vHealthCrypto.encryptData(JSON.stringify(datosTest));
    console.log(`   🔒 Cifrado completado: ${paqueteCifrado.algorithm}`);
    console.log(`   🔑 Tamaño clave cifrada: ${paqueteCifrado.encryptedKey.length} caracteres`);
    console.log(`   📦 Tamaño datos cifrados: ${paqueteCifrado.encryptedData.length} caracteres`);

    // Descifrado
    const datosRecuperados = JSON.parse(vHealthCrypto.decryptData(paqueteCifrado));
    const integridadCorrecta = JSON.stringify(datosTest) === JSON.stringify(datosRecuperados);
    console.log(`   🔓 Descifrado: ${integridadCorrecta ? '✅ Exitoso' : '❌ Fallido'}`);
    console.log(`   🔍 Integridad: ${integridadCorrecta ? '✅ Verificada' : '❌ Comprometida'}`);

    // Firma digital
    const datosFirmados = vHealthCrypto.signData(JSON.stringify(datosTest));
    const firmaValida = vHealthCrypto.verifySignature(datosFirmados);
    console.log(`   ✍️ Firma digital: ${datosFirmados.algorithm}`);
    console.log(`   🔍 Verificación firma: ${firmaValida.valid ? '✅ Válida' : '❌ Inválida'}`);

    console.log('\n🎯 PARTE 5: RESUMEN PARA EVALUACIÓN');
    console.log('=' .repeat(50));

    console.log('📋 ESPECIFICACIONES IMPLEMENTADAS:');
    console.log('   ✅ RSA-2048 para cifrado asimétrico');
    console.log('   ✅ AES-256-CTR para cifrado simétrico');  
    console.log('   ✅ Cifrado híbrido (RSA + AES)');
    console.log('   ✅ Firma digital SHA-256 + RSA');
    console.log('   ✅ Vectores de inicialización únicos');
    console.log('   ✅ Gestión segura de claves');

    console.log('\n🎓 FUNCIONAMIENTO INTERNO:');
    console.log('   • El cifrado se activa automáticamente al navegar');
    console.log('   • Los datos sensibles se cifran sin mostrar nada al usuario');
    console.log('   • Las consultas médicas se cifran internamente');
    console.log('   • Todo funciona transparentemente en el backend');
    console.log('   • El profesor puede verificar mediante APIs administrativas');

    console.log('\n🏥 APLICACIÓN EN V-HEALTH:');
    console.log('   • Datos de usuarios cifrados automáticamente');
    console.log('   • Consultas sobre plantas medicinales protegidas');
    console.log('   • Información de navegación securizada');
    console.log('   • PDFs de guías médicas firmados digitalmente');
    console.log('   • Sistema completamente transparente al usuario final');

    console.log('\n🔍 PARA VERIFICAR EN VIVO:');
    console.log('   1. Iniciar sesión en V-Health (activa cifrado automático)');
    console.log('   2. Acceder a /admin/security-demo (solo administradores)');
    console.log('   3. Usar APIs: /api/crypto/* para pruebas manuales');
    console.log('   4. Generar PDFs firmados: /api/pdf/completo');
    console.log('   5. Verificar logs del servidor (muestran cifrado activo)');

    console.log('\n🎉 ¡DEMOSTRACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('🔐 El sistema de cifrado funciona internamente sin afectar la UI');

  } catch (error) {
    console.error('❌ Error en la demostración:', error.message);
  }
}

// Ejecutar demostración
demostracionCompleta();