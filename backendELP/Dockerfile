# Usar Python 3.13 como imagen base
FROM python:3.13-slim

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL, psutil y curl para healthcheck
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    procps \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Crear usuario no-root para seguridad
RUN adduser --disabled-password --gecos '' appuser

# Copiar requirements.txt primero para aprovechar cache de Docker
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el script de entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copiar el código de la aplicación
COPY . .

# Crear directorio uploads con permisos adecuados
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

# Cambiar al usuario no-root
USER appuser

# Exponer puerto 8000
EXPOSE 8000

# Usar entrypoint script
ENTRYPOINT ["/entrypoint.sh"]

# Comando para ejecutar la aplicación
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]