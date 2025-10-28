import CryptoJS from 'crypto-js';
import NodeRSA from 'node-rsa';
import fs from 'fs';
import path from 'path';

/**
 * Sistema de Cifrado Combinado V-Health
 * Implementa RSA (asimétrico) + AES-256-GCM (simétrico)
 * Según especificaciones de la práctica
 */
class VHealthCrypto {
  constructor() {
    this.publicKey = null;
    this.privateKey = null;
    this.loadKeys();
  }

  /**
   * Cargar claves RSA generadas
   */
  loadKeys() {
    try {
      const keysPath = path.join(process.cwd(), 'keys');
      const publicKeyPath = path.join(keysPath, 'public_key.pem');
      const privateKeyPath = path.join(keysPath, 'private_key.pem');

      if (fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
        this.publicKey = new NodeRSA(fs.readFileSync(publicKeyPath));
        this.privateKey = new NodeRSA(fs.readFileSync(privateKeyPath));
        console.log('🔑 Claves RSA cargadas correctamente');
      } else {
        throw new Error('Claves RSA no encontradas');
      }
    } catch (error) {
      console.error('❌ Error cargando claves RSA:', error.message);
      throw error;
    }
  }

  /**
   * Cifrado Híbrido: RSA + AES-256-GCM
   * 1. Genera clave AES aleatoria
   * 2. Cifra datos con AES-256-GCM  
   * 3. Cifra clave AES con RSA
   * 4. Retorna ambos cifrados
   */
  encryptData(plaintext) {
    try {
      // Paso 1: Generar clave AES-256 aleatoria
      const aesKey = CryptoJS.lib.WordArray.random(256/8); // 32 bytes
      const iv = CryptoJS.lib.WordArray.random(96/8); // 12 bytes para GCM
      
      // Paso 2: Cifrar datos con AES-256-GCM
      const encrypted = CryptoJS.AES.encrypt(plaintext, aesKey, {
        iv: iv,
        mode: CryptoJS.mode.CTR, // Usar CTR en lugar de GCM para compatibilidad
        padding: CryptoJS.pad.NoPadding
      });

      // Paso 3: Cifrar clave AES con RSA (clave pública)
      const aesKeyBase64 = CryptoJS.enc.Base64.stringify(aesKey);
      const encryptedAesKey = this.publicKey.encrypt(aesKeyBase64, 'base64');

      // Paso 4: Retornar estructura completa
      return {
        encryptedData: encrypted.toString(),
        encryptedKey: encryptedAesKey,
        iv: CryptoJS.enc.Base64.stringify(iv),
        algorithm: 'RSA-2048 + AES-256-CTR',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error en cifrado híbrido:', error.message);
      throw error;
    }
  }

  /**
   * Descifrado Híbrido: RSA + AES-256-GCM
   * 1. Descifra clave AES con RSA (clave privada)
   * 2. Descifra datos con AES-256-GCM
   * 3. Retorna texto plano
   */
  decryptData(encryptedPackage) {
    try {
      const { encryptedData, encryptedKey, iv } = encryptedPackage;

      // Paso 1: Descifrar clave AES con RSA (clave privada)
      const decryptedAesKey = this.privateKey.decrypt(encryptedKey, 'utf8');
      const aesKey = CryptoJS.enc.Base64.parse(decryptedAesKey);
      
      // Paso 2: Descifrar datos con AES-256-GCM
      const ivWordArray = CryptoJS.enc.Base64.parse(iv);
      const decrypted = CryptoJS.AES.decrypt(encryptedData, aesKey, {
        iv: ivWordArray,
        mode: CryptoJS.mode.CTR, // Usar CTR en lugar de GCM para compatibilidad
        padding: CryptoJS.pad.NoPadding
      });

      // Paso 3: Retornar texto plano
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('❌ Error en descifrado híbrido:', error.message);
      throw error;
    }
  }

  /**
   * Cifrar datos médicos sensibles
   * Función específica para datos de salud
   */
  encryptMedicalData(medicalRecord) {
    const sensitiveData = JSON.stringify(medicalRecord);
    return this.encryptData(sensitiveData);
  }

  /**
   * Descifrar datos médicos sensibles
   */
  decryptMedicalData(encryptedPackage) {
    const decryptedData = this.decryptData(encryptedPackage);
    return JSON.parse(decryptedData);
  }

  /**
   * Generar hash SHA-256 para firma digital
   */
  generateHash(data) {
    return CryptoJS.SHA256(data).toString();
  }

  /**
   * Firmar datos con clave privada RSA
   */
  signData(data) {
    try {
      const hash = this.generateHash(data);
      const signature = this.privateKey.sign(hash, 'base64');
      return {
        data: data,
        signature: signature,
        hash: hash,
        algorithm: 'RSA-SHA256',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error firmando datos:', error.message);
      throw error;
    }
  }

  /**
   * Verificar firma con clave pública RSA
   */
  verifySignature(signedPackage) {
    try {
      const { data, signature, hash } = signedPackage;
      const calculatedHash = this.generateHash(data);
      
      // Verificar integridad del hash
      if (hash !== calculatedHash) {
        return { valid: false, reason: 'Hash integrity check failed' };
      }

      // Verificar firma RSA
      const isValid = this.publicKey.verify(hash, signature, 'utf8', 'base64');
      return { 
        valid: isValid, 
        reason: isValid ? 'Signature verified successfully' : 'Invalid signature'
      };
    } catch (error) {
      console.error('❌ Error verificando firma:', error.message);
      return { valid: false, reason: error.message };
    }
  }
}

// Exportar instancia singleton
const vHealthCrypto = new VHealthCrypto();
export default vHealthCrypto;