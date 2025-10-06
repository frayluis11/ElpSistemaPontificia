#!/bin/bash
# Script para iniciar el sistema completo localmente

echo "🚀 Iniciando Sistema ELP Pontificia..."

# Función para verificar si un puerto está ocupado
check_port() {
    local port=$1
    if netstat -tulpn 2>/dev/null | grep ":$port " > /dev/null; then
        return 0  # Puerto ocupado
    else
        return 1  # Puerto libre
    fi
}

# Verificar dependencias
echo "📋 Verificando dependencias..."

# Verificar PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL no está instalado"
    exit 1
fi

# Verificar Python
if ! command -v python &> /dev/null; then
    echo "❌ Python no está instalado"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

echo "✅ Dependencias verificadas"

# Iniciar PostgreSQL (si no está ejecutándose)
echo "🐘 Verificando PostgreSQL..."
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL no está ejecutándose en localhost:5432"
    echo "   Por favor, inicia PostgreSQL manualmente"
    exit 1
fi
echo "✅ PostgreSQL está ejecutándose"

# Configurar base de datos
echo "🗄️ Configurando base de datos..."
cd "$(dirname "$0")/backendELP"
if [ -f ".env" ]; then
    source .env
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f init-scripts/01-init.sql &> /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Base de datos configurada"
    else
        echo "❌ Error configurando base de datos"
    fi
else
    echo "❌ Archivo .env no encontrado"
    exit 1
fi

# Activar entorno virtual Python (si existe)
if [ -f "../.venv/Scripts/activate" ]; then
    source ../.venv/Scripts/activate
    echo "✅ Entorno virtual Python activado"
elif [ -f "../.venv/bin/activate" ]; then
    source ../.venv/bin/activate
    echo "✅ Entorno virtual Python activado"
fi

# Instalar dependencias Python
echo "🐍 Instalando dependencias Python..."
pip install -r requirements.txt &> /dev/null
echo "✅ Dependencias Python instaladas"

# Iniciar backend
echo "🔧 Iniciando backend..."
if check_port 8000; then
    echo "⚠️ Puerto 8000 ya está ocupado"
else
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000 &
    BACKEND_PID=$!
    echo "✅ Backend iniciado en http://127.0.0.1:8000 (PID: $BACKEND_PID)"
fi

# Instalar dependencias Frontend
echo "⚛️ Configurando frontend..."
cd "../frontendELP"
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias npm..."
    npm install &> /dev/null
fi
echo "✅ Dependencias npm instaladas"

# Iniciar frontend
echo "🌐 Iniciando frontend..."
if check_port 3000; then
    echo "⚠️ Puerto 3000 ya está ocupado"
else
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend iniciado en http://localhost:3000 (PID: $FRONTEND_PID)"
fi

echo ""
echo "🎉 Sistema ELP Pontificia iniciado exitosamente!"
echo ""
echo "📍 URLs del sistema:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://127.0.0.1:8000"
echo "   API Docs: http://127.0.0.1:8000/docs"
echo ""
echo "👤 Usuario administrador por defecto:"
echo "   DNI: 12345678"
echo "   Contraseña: admin123"
echo ""
echo "⚠️ Para detener el sistema, presiona Ctrl+C"

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo servicios..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend detenido"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend detenido"
    fi
    echo "👋 Sistema ELP Pontificia detenido"
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Mantener el script ejecutándose
wait