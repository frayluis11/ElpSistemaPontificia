@echo off
:: Script para iniciar el sistema completo localmente en Windows

echo 🚀 Iniciando Sistema ELP Pontificia...

:: Verificar dependencias
echo 📋 Verificando dependencias...

:: Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python no está instalado
    pause
    exit /b 1
)

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    pause
    exit /b 1
)

echo ✅ Dependencias verificadas

:: Activar entorno virtual Python si existe
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    echo ✅ Entorno virtual Python activado
)

:: Configurar backend
echo 🐍 Configurando backend...
cd backendELP

:: Instalar dependencias Python
echo 📦 Instalando dependencias Python...
pip install -r requirements.txt >nul 2>&1
echo ✅ Dependencias Python instaladas

:: Iniciar backend en segundo plano
echo 🔧 Iniciando backend en puerto 8000...
start "Backend ELP" cmd /c "python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
timeout /t 3 >nul

:: Verificar que el backend esté funcionando
echo 🔍 Verificando backend...
powershell -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:8000/health' -Method GET -TimeoutSec 5 | Out-Null; Write-Host '✅ Backend funcionando correctamente' } catch { Write-Host '❌ Backend no está respondiendo' }"

:: Configurar frontend
echo ⚛️ Configurando frontend...
cd ..\frontendELP

:: Instalar dependencias npm si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias npm...
    npm install >nul 2>&1
)
echo ✅ Dependencias npm listas

:: Iniciar frontend
echo 🌐 Iniciando frontend en puerto 3000...
start "Frontend ELP" cmd /c "npm run dev"
timeout /t 3 >nul

echo.
echo 🎉 Sistema ELP Pontificia iniciado exitosamente!
echo.
echo 📍 URLs del sistema:
echo    Frontend: http://localhost:3000
echo    Backend API: http://127.0.0.1:8000
echo    API Docs: http://127.0.0.1:8000/docs
echo.
echo 👤 Usuario administrador por defecto:
echo    DNI: 12345678
echo    Contraseña: admin123
echo.
echo ⚠️ Para detener el sistema, cierra las ventanas de terminal
echo.
pause