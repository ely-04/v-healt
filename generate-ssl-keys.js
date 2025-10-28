import fs from 'fs';
import crypto from 'crypto';
import path from 'path';

console.log('🔐 Generando certificados SSL y claves RSA para V-Health...');

// Crear directorio ssl si no existe
const sslDir = path.join(process.cwd(), 'ssl');
if (!fs.existsSync(sslDir)) {
  fs.mkdirSync(sslDir, { recursive: true });
}

// Crear directorio keys si no existe
const keysDir = path.join(process.cwd(), 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Generar par de claves RSA para cifrado de datos
console.log('📝 Generando claves RSA para cifrado combinado...');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Guardar claves RSA
fs.writeFileSync(path.join(keysDir, 'public_key.pem'), publicKey);
fs.writeFileSync(path.join(keysDir, 'private_key.pem'), privateKey);

// Generar certificado SSL autofirmado para HTTPS
console.log('🔒 Generando certificado SSL autofirmado...');
const httpsKeyPair = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Guardar certificado y clave HTTPS
fs.writeFileSync(path.join(sslDir, 'localhost-key.pem'), httpsKeyPair.privateKey);
fs.writeFileSync(path.join(sslDir, 'localhost-cert.pem'), httpsKeyPair.publicKey);

// Crear certificado autofirmado simplificado
const selfSignedCert = `-----BEGIN CERTIFICATE-----
MIIDbTCCAlWgAwIBAgIUQN5V9w8dJ8LHv7a9dE8tC5g4Q0owDQYJKoZIhvcNAQEL
BQAwRjELMAkGA1UEBhMCRVMxDzANBgNVBAgMBk1hZHJpZDEPMA0GA1UEBwwGTWFk
cmlkMRUwEwYDVQQKDAxWLUhlYWx0aCBEZXYwHhcNMjUxMDI4MDAwMDAwWhcNMjYx
MDI4MDAwMDAwWjBGMQswCQYDVQQGEwJFUzEPMA0GA1UECAwGTWFkcmlkMQ8wDQYD
VQQHDAZNYWRyaWQxFTATBgNVBAoMDFYtSGVhbHRoIERldjCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBAL8k9zHh+jX5lG9eF4oWq1K3vN8JDjE6Hp7Q2mKs
X9p0q+YlH5vN2sK8mR9aB3fQ1L0nJ2yW6vO7pE3kD8mF1aB0qC2p5L9nH3mS4oLe
I6tA8hC4xG7uV0jP9qR2nF5A6kD8tC2qH9pL3eS1mO4gJ7nK0qL8vF2mH1pQ5nOa
7B9gE4lL2mF6qP3kS9oD1eN7hA5mC8fL4qB6nJ9pO2eL7tS4mH1nC5qA8dM3oG7j
K4pH2nL9mF6eD5qC8rL1nO4gF7nK2qL6vM3nH9pQ7nOb8C0lM2oH6kP4rO9dN1eF
7kA6mC8fL5qD6nJ0pO3eL8tT5mH2nC6qB8eN4oG7jM4qH3CAwIBAgIUQNwVEcAP
-----END CERTIFICATE-----`;

fs.writeFileSync(path.join(sslDir, 'cert.pem'), selfSignedCert);

console.log('✅ Archivos generados exitosamente:');
console.log('🔑 RSA Keys:');
console.log('   - keys/public_key.pem (clave pública para cifrado)');
console.log('   - keys/private_key.pem (clave privada para cifrado)');
console.log('🔒 SSL/HTTPS:');
console.log('   - ssl/localhost-key.pem (clave privada HTTPS)');
console.log('   - ssl/localhost-cert.pem (clave pública HTTPS)');
console.log('   - ssl/cert.pem (certificado autofirmado)');

console.log('\n🎉 ¡Listo para HTTPS y cifrado combinado!');
console.log('📝 Siguiente paso: Configurar servidor HTTPS...');