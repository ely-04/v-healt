@echo off
echo ================================
echo  CONFIGURACION V-HEALTH MYSQL
echo ================================
echo.

echo 🔧 Instalando dependencias MySQL...
call npm install mysql2 bcryptjs

echo.
echo 📁 Ejecutando script de creacion de BD...
node setup_mysql_database.js

echo.
echo ✅ Proceso completado!
echo.
echo 📝 SIGUIENTES PASOS:
echo 1. Abre XAMPP Control Panel
echo 2. Inicia el servicio MySQL
echo 3. Ve a phpMyAdmin: http://localhost/phpmyadmin
echo 4. Verifica que la BD 'vhealth' este creada
echo.
echo 🔑 CREDENCIALES DE PRUEBA:
echo Admin: admin@vhealth.com / Admin123!
echo Usuario: user@vhealth.com / User123!
echo.
pause