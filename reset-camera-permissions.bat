@echo off
echo ===============================================
echo    RESETEAR PERMISOS DE CAMARA - V-HEALTH
echo ===============================================
echo.

echo [1] Cerrando navegadores...
taskkill /F /IM chrome.exe 2>nul
taskkill /F /IM msedge.exe 2>nul
taskkill /F /IM firefox.exe 2>nul
timeout /t 2 >nul

echo [2] Limpiando cache de permisos de Chrome...
set CHROME_DATA="%LOCALAPPDATA%\Google\Chrome\User Data\Default"
if exist %CHROME_DATA%\Preferences (
    echo    - Encontrado perfil de Chrome
)

echo [3] Instrucciones manuales:
echo.
echo Para Chrome/Edge:
echo 1. Ve a chrome://settings/content/camera
echo 2. Busca localhost:5174 y eliminalo
echo 3. O cambia de "Bloquear" a "Permitir"
echo.
echo Para Firefox:
echo 1. Ve a about:preferences#privacy  
echo 2. Busca "Permisos" - "Camara"
echo 3. Busca localhost:5174 y eliminalo
echo.

echo [4] Probando acceso a camara...
echo Ve a: http://localhost:5174/test-camera.html
echo.

pause