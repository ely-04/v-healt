import http from 'http';

// Configuración
const SERVER_URL = 'http://localhost:3000';
const CHECK_INTERVAL = 30000; // 30 segundos
const MAX_RETRIES = 3;

let consecutiveFailures = 0;

// Función para verificar el estado del servidor
async function checkServerHealth() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const req = http.get(`${SERVER_URL}/api/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const responseTime = Date.now() - startTime;
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            resolve({
              success: true,
              responseTime,
              data: response
            });
          } catch (error) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              responseTime
            });
          }
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}`,
            responseTime
          });
        }
      });
    });
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        success: false,
        error: error.message,
        responseTime
      });
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        responseTime: Date.now() - startTime
      });
    });
  });
}

// Función para realizar el monitoreo
async function monitorServer() {
  const timestamp = new Date().toLocaleString('es-ES');
  
  try {
    const result = await checkServerHealth();
    
    if (result.success) {
      consecutiveFailures = 0;
      console.log(`✅ [${timestamp}] Servidor OK - ${result.responseTime}ms - DB: ${result.data.database}`);
    } else {
      consecutiveFailures++;
      console.log(`❌ [${timestamp}] Error: ${result.error} - ${result.responseTime}ms`);
      
      if (consecutiveFailures >= MAX_RETRIES) {
        console.log(`🚨 [${timestamp}] ALERTA: ${consecutiveFailures} fallos consecutivos!`);
        console.log('💡 Sugerencia: Verificar que el servidor esté ejecutándose');
        
        // Resetear contador para evitar spam
        consecutiveFailures = 0;
      }
    }
  } catch (error) {
    consecutiveFailures++;
    console.log(`💥 [${timestamp}] Error inesperado: ${error.message}`);
  }
}

// Función principal
function startMonitoring() {
  console.log('🔍 Iniciando monitoreo del servidor V-Health...');
  console.log(`📡 URL: ${SERVER_URL}`);
  console.log(`⏱️  Intervalo: ${CHECK_INTERVAL / 1000} segundos`);
  console.log(`🔄 Máximo reintentos: ${MAX_RETRIES}`);
  console.log('➡️  Presiona Ctrl+C para detener el monitoreo\n');
  
  // Verificación inicial
  monitorServer();
  
  // Programar verificaciones periódicas
  const interval = setInterval(monitorServer, CHECK_INTERVAL);
  
  // Manejo de señales de cierre
  process.on('SIGINT', () => {
    console.log('\n🛑 Deteniendo monitoreo...');
    clearInterval(interval);
    console.log('✅ Monitoreo detenido');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Deteniendo monitoreo...');
    clearInterval(interval);
    console.log('✅ Monitoreo detenido');
    process.exit(0);
  });
}

// Iniciar monitoreo
startMonitoring();