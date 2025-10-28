import vHealthCrypto from './src/utils/vHealthCrypto.js';

/**
 * Demostración del Sistema de Cifrado Híbrido V-Health
 * RSA-2048 + AES-256-GCM
 */

console.log('🔐 === DEMOSTRACIÓN SISTEMA CIFRADO HÍBRIDO V-HEALTH ===\n');

// 1. Datos médicos sensibles de ejemplo
const datosMedicosSensibles = {
  paciente: {
    nombre: "María García",
    edad: 45,
    nss: "12345678901"
  },
  diagnostico: "Diabetes mellitus tipo 2",
  tratamiento: {
    medicamentos: ["Metformina 850mg", "Insulina lantus"],
    dosis: "2 veces al día",
    duracion: "6 meses"
  },
  fechaConsulta: "2025-10-28",
  medico: "Dr. Juan Pérez"
};

console.log('📋 DATOS ORIGINALES:');
console.log(JSON.stringify(datosMedicosSensibles, null, 2));

try {
  // 2. CIFRADO HÍBRIDO
  console.log('\n🔒 PROCESO DE CIFRADO HÍBRIDO:');
  console.log('   1️⃣ Generando clave AES-256 aleatoria...');
  console.log('   2️⃣ Cifrando datos con AES-256-GCM...');
  console.log('   3️⃣ Cifrando clave AES con RSA-2048...');
  
  const datosCifrados = vHealthCrypto.encryptMedicalData(datosMedicosSensibles);
  
  console.log('\n✅ RESULTADO DEL CIFRADO:');
  console.log(`   🔐 Algoritmo: ${datosCifrados.algorithm}`);
  console.log(`   📅 Timestamp: ${datosCifrados.timestamp}`);
  console.log(`   🔑 Clave AES cifrada (RSA): ${datosCifrados.encryptedKey.substring(0, 60)}...`);
  console.log(`   📦 Datos cifrados (AES): ${datosCifrados.encryptedData.substring(0, 60)}...`);
  console.log(`   🎲 IV (Vector inicial): ${datosCifrados.iv}`);

  // 3. DESCIFRADO HÍBRIDO
  console.log('\n🔓 PROCESO DE DESCIFRADO HÍBRIDO:');
  console.log('   1️⃣ Descifrando clave AES con RSA-2048...');
  console.log('   2️⃣ Descifrando datos con AES-256-GCM...');
  console.log('   3️⃣ Reconstruyendo datos originales...');
  
  const datosDescifrados = vHealthCrypto.decryptMedicalData(datosCifrados);
  
  console.log('\n✅ DATOS DESCIFRADOS:');
  console.log(JSON.stringify(datosDescifrados, null, 2));

  // 4. VERIFICACIÓN DE INTEGRIDAD
  const datosOriginales = JSON.stringify(datosMedicosSensibles);
  const datosRecuperados = JSON.stringify(datosDescifrados);
  const integridad = datosOriginales === datosRecuperados;
  
  console.log(`\n🔍 VERIFICACIÓN DE INTEGRIDAD: ${integridad ? '✅ CORRECTA' : '❌ FALLIDA'}`);

  // 5. FIRMA DIGITAL
  console.log('\n📝 PROCESO DE FIRMA DIGITAL:');
  const datosFirmados = vHealthCrypto.signData(JSON.stringify(datosMedicosSensibles));
  
  console.log(`   📋 Algoritmo: ${datosFirmados.algorithm}`);
  console.log(`   🔗 Hash SHA-256: ${datosFirmados.hash.substring(0, 32)}...`);
  console.log(`   ✍️ Firma RSA: ${datosFirmados.signature.substring(0, 60)}...`);

  // 6. VERIFICACIÓN DE FIRMA
  const verificacion = vHealthCrypto.verifySignature(datosFirmados);
  console.log(`\n🔍 VERIFICACIÓN DE FIRMA: ${verificacion.valid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
  console.log(`   💬 Resultado: ${verificacion.reason}`);

  console.log('\n🎉 === DEMOSTRACIÓN COMPLETADA EXITOSAMENTE ===');
  console.log('\n📊 ESPECIFICACIONES TÉCNICAS IMPLEMENTADAS:');
  console.log('   ✅ RSA-2048 para cifrado asimétrico');
  console.log('   ✅ AES-256-GCM para cifrado simétrico');
  console.log('   ✅ Cifrado híbrido (RSA + AES)');
  console.log('   ✅ Firma digital con SHA-256 + RSA');
  console.log('   ✅ Verificación de integridad');
  console.log('   ✅ Gestión segura de claves');

} catch (error) {
  console.error('❌ Error en la demostración:', error.message);
}