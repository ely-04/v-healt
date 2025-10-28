# V-Health - Servidor Persistente

## 🚀 Inicio Rápido

### **Opción 1: Inicio Automático (Recomendado)**
Ejecuta el archivo `start-vhealth.bat` que iniciará automáticamente ambos servidores:
```batch
start-vhealth.bat
```

### **Opción 2: Inicio Manual**

#### Backend:
```bash
cd src
node server-stable-persistent.cjs
```

#### Frontend (en otra terminal):
```bash
npm run dev
```

## 📊 Servidores

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5183 (o puerto automático)

## 🔧 Características del Servidor Persistente

### ✅ **Mejoras Implementadas**

1. **Pool de Conexiones MySQL**
   - Conexiones persistentes y reutilizables
   - Gestión automática de conexiones
   - Límite de 10 conexiones simultáneas

2. **Manejo Robusto de Errores**
   - Logging detallado de todas las peticiones
   - Manejo de errores de base de datos
   - Respuestas JSON consistentes

3. **CORS Ampliado**
   - Soporte para múltiples puertos (5173-5184)
   - Headers y métodos configurados
   - Credentials habilitadas

4. **Seguridad Mejorada**
   - JWT con expiración de 24 horas
   - Bcrypt con salt rounds aumentados (12)
   - Validación de entrada mejorada

5. **Monitoreo y Salud**
   - Endpoint `/api/health` con verificación de BD
   - Logging de timestamp en todas las operaciones
   - Cierre limpio con señales del sistema

## 🔍 Endpoints de la API

### **Salud del Servidor**
```
GET /api/health
```
Respuesta:
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente",
  "database": "Conectada",
  "timestamp": "2025-10-28T07:13:04.667Z"
}
```

### **Login**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "elygonzalez9044@gmail.com",
  "password": "elizabeth123"
}
```

### **Registro**
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña",
  "name": "Nombre Completo"
}
```

### **Perfil (Protegido)**
```
GET /api/user/profile
Authorization: Bearer <token>
```

## 🛠️ Scripts de Utilidad

### **Monitoreo del Servidor**
```bash
node monitor-server.js
```
- Verifica el estado cada 30 segundos
- Alerta tras 3 fallos consecutivos
- Logging con timestamps

### **Supervisor con Reinicio Automático**
```batch
start-server-supervised.bat
```
- Reinicia automáticamente si el servidor falla
- Monitoreo continuo
- Ideal para producción

## 🔒 Credenciales de Prueba

```
Email: elygonzalez9044@gmail.com
Password: elizabeth123
```

## 📝 Logs del Servidor

El servidor registra automáticamente:
- ✅ Inicialización exitosa
- 📨 Todas las peticiones HTTP con timestamp
- 🔍 Intentos de login con email
- 👤 Usuarios encontrados/no encontrados
- ❌ Errores de base de datos
- 🛑 Cierre limpio del servidor

## ⚡ Solución de Problemas

### **Error "Failed to fetch"**
1. Verificar que el backend esté funcionando: http://localhost:3000/api/health
2. Verificar que el frontend tenga la URL correcta del backend
3. Comprobar que no haya problemas de CORS

### **Error de Base de Datos**
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales en archivo `.env`
3. Verificar que la base de datos `vhealth` exista

### **Puerto en Uso**
- El servidor automáticamente busca puertos disponibles
- Backend siempre usa puerto 3000
- Frontend busca desde 5173 hasta 5184

## 🚦 Estado del Sistema

**Servidor Backend**: ✅ Funcionando (Puerto 3000)
**Servidor Frontend**: ✅ Funcionando (Puerto 5183)
**Base de Datos**: ✅ Conectada
**Login Sistema**: ✅ Operativo
**Monitoreo**: ✅ Disponible

---

## 💡 Recomendaciones

1. **Mantener las ventanas del servidor abiertas** durante el uso
2. **Usar el script de inicio automático** para facilidad
3. **Monitorear regularmente** el estado con `/api/health`
4. **Hacer backup** de la base de datos regularmente