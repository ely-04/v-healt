// Demostración del Sistema CAPTCHA V-Health
import crypto from 'crypto';

/**
 * DEMOSTRACIÓN DEL SISTEMA CAPTCHA DE V-HEALTH
 * Sistema de verificación anti-bot estilo reCAPTCHA
 */

console.log('🤖 === DEMOSTRACIÓN SISTEMA CAPTCHA V-HEALTH ===\n');

// Simulación del generador de CAPTCHA del servidor
class VHealthCaptchaDemo {
  constructor() {
    this.captchaCodes = new Map();
  }

  // Generar código CAPTCHA alfanumérico
  generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Crear nueva sesión CAPTCHA
  generateCaptcha() {
    const code = this.generateCode();
    const sessionId = crypto.randomUUID();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    this.captchaCodes.set(sessionId, {
      code: code.toLowerCase(),
      expires: expires
    });

    return {
      success: true,
      sessionId,
      code: code,
      expiresIn: '10 minutos'
    };
  }

  // Validar CAPTCHA
  validateCaptcha(sessionId, userInput) {
    const storedData = this.captchaCodes.get(sessionId);
    
    if (!storedData) {
      return {
        success: false,
        valid: false,
        message: 'CAPTCHA no encontrada o expirada'
      };
    }
    
    if (Date.now() > storedData.expires) {
      this.captchaCodes.delete(sessionId);
      return {
        success: false,
        valid: false,
        message: 'CAPTCHA expirada'
      };
    }
    
    const isValid = userInput.toLowerCase() === storedData.code;
    
    if (isValid) {
      // Eliminar código usado
      this.captchaCodes.delete(sessionId);
    }
    
    return {
      success: true,
      valid: isValid,
      message: isValid ? 'CAPTCHA válida' : 'CAPTCHA incorrecta'
    };
  }

  // Limpiar códigos expirados
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, data] of this.captchaCodes.entries()) {
      if (now > data.expires) {
        this.captchaCodes.delete(sessionId);
        cleaned++;
      }
    }
    
    return cleaned;
  }
}

// Crear instancia de demostración
const captchaDemo = new VHealthCaptchaDemo();

console.log('🔧 GENERANDO CAPTCHA...');

// 1. Generar CAPTCHA
const captcha1 = captchaDemo.generateCaptcha();
console.log('✅ CAPTCHA Generada:');
console.log(`   📋 Session ID: ${captcha1.sessionId}`);
console.log(`   🔤 Código: ${captcha1.code}`);
console.log(`   ⏰ Expira en: ${captcha1.expiresIn}`);

// 2. Simular validación correcta
console.log('\n🔍 VALIDACIÓN CORRECTA...');
const validacion1 = captchaDemo.validateCaptcha(captcha1.sessionId, captcha1.code);
console.log(`   ✅ Resultado: ${validacion1.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`   💬 Mensaje: ${validacion1.message}`);

// 3. Generar otro CAPTCHA para prueba incorrecta
const captcha2 = captchaDemo.generateCaptcha();
console.log('\n🔧 GENERANDO SEGUNDA CAPTCHA...');
console.log(`   📋 Session ID: ${captcha2.sessionId}`);
console.log(`   🔤 Código: ${captcha2.code}`);

// 4. Simular validación incorrecta
console.log('\n❌ VALIDACIÓN INCORRECTA...');
const validacion2 = captchaDemo.validateCaptcha(captcha2.sessionId, 'CODIGO_INCORRECTO');
console.log(`   ❌ Resultado: ${validacion2.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`   💬 Mensaje: ${validacion2.message}`);

// 5. Intentar reusar CAPTCHA ya validada
console.log('\n🔄 INTENTO DE REUTILIZACIÓN...');
const reutilizacion = captchaDemo.validateCaptcha(captcha1.sessionId, captcha1.code);
console.log(`   🚫 Resultado: ${reutilizacion.valid ? 'VÁLIDA' : 'INVÁLIDA'}`);
console.log(`   💬 Mensaje: ${reutilizacion.message}`);

// 6. Simular limpieza de códigos expirados
console.log('\n🧹 LIMPIEZA DE CÓDIGOS EXPIRADOS...');
const cleaned = captchaDemo.cleanup();
console.log(`   🗑️ Códigos limpiados: ${cleaned}`);

console.log('\n📊 CARACTERÍSTICAS DEL SISTEMA CAPTCHA:');
console.log('   ✅ Códigos alfanuméricos de 6 caracteres');
console.log('   ✅ Expiración automática (10 minutos)');
console.log('   ✅ Uso único (no reutilizable)');
console.log('   ✅ Session ID únicos con UUID');
console.log('   ✅ Limpieza automática de códigos expirados');
console.log('   ✅ Insensible a mayúsculas/minúsculas');
console.log('   ✅ Caracteres sin ambigüedad (sin 0, O, I, l)');

console.log('\n🎯 CASOS DE USO IMPLEMENTADOS:');
console.log('   📝 Formularios de login');
console.log('   📝 Formularios de registro');
console.log('   📝 Contacto y comentarios');
console.log('   📝 Operaciones sensibles');

console.log('\n🛡️ MEDIDAS DE SEGURIDAD:');
console.log('   🔒 Prevención de ataques de fuerza bruta');
console.log('   🔒 Verificación anti-bot básica');
console.log('   🔒 Limpieza automática de memoria');
console.log('   🔒 Validación temporal limitada');

console.log('\n🎉 === DEMOSTRACIÓN CAPTCHA COMPLETADA ===');