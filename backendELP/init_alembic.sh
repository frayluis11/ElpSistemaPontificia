#!/bin/bash
# Script para inicializar Alembic en el proyecto BackendELP

echo "🔄 Inicializando Alembic para gestión de migraciones..."

# Verificar si Alembic ya está inicializado
if [ -d "alembic" ]; then
    echo "⚠️ Alembic ya está inicializado"
    exit 0
fi

# Inicializar Alembic
echo "📦 Inicializando Alembic..."
alembic init alembic

# Configurar alembic.ini
echo "⚙️ Configurando alembic.ini..."
sed -i 's|sqlalchemy.url = driver://user:pass@localhost/dbname|sqlalchemy.url = postgresql://postgres:postgres_secure_2024!@db:5432/sistemaelp_db|g' alembic.ini

# Configurar env.py para importar modelos
echo "📝 Configurando env.py..."
cat >> alembic/env.py << 'EOF'

# Importar modelos para autogeneración
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app.models.user import User, Role
from app.models.document import Document  
from app.models.hours import Hours
from app.core.database import Base

# Configurar metadata para autogeneración
target_metadata = Base.metadata
EOF

# Crear migración inicial
echo "🏗️ Creando migración inicial..."
alembic revision --autogenerate -m "Initial migration - Users, Roles, Documents, Hours"

echo "✅ Alembic inicializado exitosamente!"
echo "📝 Próximos pasos:"
echo "   1. Revisar el archivo de migración generado"
echo "   2. Ejecutar: alembic upgrade head"
echo "   3. Para futuras migraciones: alembic revision --autogenerate -m 'Description'"