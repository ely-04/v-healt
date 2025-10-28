@echo off
title V-Health - Inicio Completo
color 0B

echo.
echo ================================================
echo      V-HEALTH - INICIO COMPLETO
echo ================================================
echo.

cd /d "C:\Users\Elizabeth\Desktop\V-Healt\v-healt"

echo [%TIME%] Iniciando servidor backend...
start "V-Health Backend" cmd /k "cd src && node server-stable-persistent.cjs"

echo [%TIME%] Esperando 3 segundos...
timeout /t 3 /nobreak >nul

echo [%TIME%] Iniciando servidor frontend...
start "V-Health Frontend" cmd /k "npm run dev"

echo [%TIME%] Esperando 2 segundos...
timeout /t 2 /nobreak >nul

echo.
echo ================================================
echo      SERVIDORES INICIADOS
echo ================================================
echo.
echo Backend:  http://localhost:3000
echo Frontend: http://localhost:5183 (o el puerto mostrado)
echo.
echo Las ventanas del servidor se abrieron por separado.
echo Cierra esta ventana cuando termines.
echo.

pause