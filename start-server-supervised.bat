@echo off
title V-Health Server - Supervisor
color 0A

echo.
echo ================================================
echo      V-HEALTH SERVER - SUPERVISOR
echo ================================================
echo.
echo Iniciando servidor V-Health con supervision...
echo.

:START_SERVER
echo [%TIME%] Iniciando servidor backend...

cd /d "C:\Users\Elizabeth\Desktop\V-Healt\v-healt\src"
start "V-Health Backend" /MIN node server-stable-persistent.cjs

echo Esperando 5 segundos para que el servidor inicie...
timeout /t 5 /nobreak >nul

:CHECK_SERVER
echo [%TIME%] Verificando servidor...

curl -s -o nul -w "%%{http_code}" http://localhost:3000/api/health > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [%TIME%] ✓ Servidor funcionando correctamente
    goto MONITOR
) else (
    echo [%TIME%] ✗ Servidor no responde (Status: %STATUS%)
    echo [%TIME%] Reintentando en 10 segundos...
    timeout /t 10 /nobreak >nul
    goto CHECK_SERVER
)

:MONITOR
echo.
echo ================================================
echo      SERVIDOR FUNCIONANDO
echo ================================================
echo.
echo Backend: http://localhost:3000
echo Frontend: Ejecutar 'npm run dev' en otra terminal
echo.
echo Monitoreo activo... Presiona Ctrl+C para detener
echo.

:MONITOR_LOOP
timeout /t 30 /nobreak >nul

curl -s -o nul -w "%%{http_code}" http://localhost:3000/api/health > temp_status.txt
set /p STATUS=<temp_status.txt
del temp_status.txt

if "%STATUS%"=="200" (
    echo [%TIME%] ✓ Servidor OK
) else (
    echo [%TIME%] ✗ Servidor caído - Reiniciando...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 5 /nobreak >nul
    goto START_SERVER
)

goto MONITOR_LOOP