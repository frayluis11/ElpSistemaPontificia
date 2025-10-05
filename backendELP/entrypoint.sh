#!/bin/bash
set -e

# Función para esperar a que PostgreSQL esté listo
wait_for_postgres() {
    echo "Esperando a que PostgreSQL esté listo..."
    
    while ! pg_isready -h "${DB_HOST:-localhost}" -p "5432" -U "${DB_USER:-postgres}"; do
        echo "PostgreSQL no está listo - esperando..."
        sleep 2
    done
    
    echo "PostgreSQL está listo - iniciando aplicación"
}

# Esperar a PostgreSQL
wait_for_postgres

# Ejecutar migraciones de Alembic si existen
if [ -f "alembic.ini" ]; then
    echo "Ejecutando migraciones de base de datos..."
    alembic upgrade head || echo "No se pudieron ejecutar las migraciones, continuando..."
fi

# Ejecutar el comando pasado como argumentos
exec "$@"