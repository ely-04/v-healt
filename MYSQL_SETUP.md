# Configuración de V-Health con XAMPP y MySQL

## Pasos para configurar XAMPP

### 1. Instalar XAMPP
- Descarga XAMPP desde: https://www.apachefriends.org/
- Instalar con Apache y MySQL habilitados

### 2. Iniciar Servicios
- Abrir XAMPP Control Panel
- Iniciar **Apache** (puerto 80)
- Iniciar **MySQL** (puerto 3306)

### 3. Crear Base de Datos
Opción A - Usando phpMyAdmin:
1. Ir a http://localhost/phpmyadmin
2. Crear nueva base de datos llamada `vhealth`
3. Seleccionar collation: `utf8mb4_unicode_ci`

Opción B - Usando el script SQL:
1. Ir a phpMyAdmin
2. Importar el archivo `database/create_database.sql`

### 4. Configurar Variables de Entorno
El archivo `.env` ya está configurado con:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=vhealth
DB_USER=root
DB_PASSWORD=
```

### 5. Probar la Conexión
```bash
node src/scripts/createTestUsers.js
```

### 6. Iniciar el Servidor
```bash
node src/server.js
```

## Credenciales por Defecto de XAMPP
- **Usuario MySQL:** root
- **Contraseña MySQL:** (vacía por defecto)
- **Puerto MySQL:** 3306
- **phpMyAdmin:** http://localhost/phpmyadmin

## Solución de Problemas

### Error de Conexión
- Verificar que MySQL esté ejecutándose en XAMPP
- Comprobar que el puerto 3306 no esté ocupado
- Verificar credenciales en `.env`

### Error de Puerto Ocupado
- Apache: Cambiar puerto en XAMPP o detener IIS
- MySQL: Cambiar puerto en XAMPP config

### Acceso a phpMyAdmin
- URL: http://localhost/phpmyadmin
- Usuario: root
- Contraseña: (dejar vacío)

## Ventajas de MySQL vs MongoDB
✅ Más estable y confiable
✅ Mejor soporte en Windows
✅ Interface gráfica con phpMyAdmin
✅ Transacciones ACID
✅ Consultas SQL familiares
✅ Mejor rendimiento para relaciones