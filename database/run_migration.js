const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Crear conexión
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vhealth_db',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL de migración
    const sqlPath = path.join(__dirname, 'add_facial_recognition.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en comandos individuales (por punto y coma)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log('🚀 Ejecutando migración...');

    // Ejecutar cada comando
    for (const command of commands) {
      if (command.toUpperCase().startsWith('USE')) continue; // Saltar USE database
      if (command.toUpperCase().startsWith('SELECT') || 
          command.toUpperCase().startsWith('DESCRIBE')) {
        // Para comandos de consulta, mostrar resultados
        const [results] = await connection.execute(command);
        console.log('📋 Resultado:', results);
      } else {
        // Para comandos DDL, ejecutar sin mostrar resultados
        await connection.execute(command);
        console.log('✅ Comando ejecutado:', command.substring(0, 50) + '...');
      }
    }

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('🔧 Campos agregados:');
    console.log('   - faceDescriptor: Almacena las características faciales');
    console.log('   - faceRegisteredAt: Fecha de registro facial');
    console.log('   - faceMetadata: Metadatos de la captura');
    console.log('   - loginMethod: Método de login (password/facial)');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

// Ejecutar la migración
runMigration();