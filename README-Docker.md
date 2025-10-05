# Sistema ELP Pontificia - Docker Deployment

Este archivo describe cómo ejecutar el Sistema ELP Pontificia completo usando Docker y docker-compose.

## Arquitectura

El sistema consta de los siguientes servicios:

- **Frontend**: React + Vite + Nginx (Puerto 3000)
- **Backend**: FastAPI + Python (Puerto 8000)
- **Database**: PostgreSQL 15 (Puerto 5432)
- **Adminer**: Interfaz web para administrar la base de datos (Puerto 8080)

## Prerrequisitos

- Docker v20.10+
- Docker Compose v2.0+

## Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd SistemaElpPontificia
```

### 2. Construir y ejecutar todos los servicios
```bash
docker-compose up --build
```

### 3. Ejecutar en modo detached (background)
```bash
docker-compose up -d --build
```

## Acceso a los Servicios

Una vez que todos los contenedores estén ejecutándose:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **Database Admin (Adminer)**: http://localhost:8080
  - Sistema: PostgreSQL
  - Servidor: db
  - Usuario: postgres
  - Contraseña: postgres_secure_2024!
  - Base de datos: sistemaelp_db

## Comandos Útiles

### Ver logs de todos los servicios
```bash
docker-compose logs -f
```

### Ver logs de un servicio específico
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Detener todos los servicios
```bash
docker-compose down
```

### Detener y eliminar volúmenes (CUIDADO: Borra datos de BD)
```bash
docker-compose down -v
```

### Reconstruir un servicio específico
```bash
docker-compose build backend
docker-compose up -d backend
```

### Acceder a un contenedor
```bash
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec db psql -U postgres -d sistemaelp_db
```

## Configuración

### Variables de Entorno

Las variables de entorno se configuran en:
- `backendELP/.env` - Configuración del backend
- `frontendELP/.env` - Configuración del frontend para desarrollo local
- `frontendELP/.env.docker` - Configuración del frontend para Docker

### Volúmenes Persistentes

- `postgres_data`: Datos de la base de datos PostgreSQL
- `./backendELP/uploads`: Archivos subidos al sistema
- `./backendELP/logs`: Logs del backend

## Desarrollo

### Ejecutar solo la base de datos
```bash
docker-compose up db adminer
```

### Ejecutar servicios individualmente para desarrollo
```bash
# Solo base de datos
docker-compose up db

# Backend en modo desarrollo (fuera de Docker)
cd backendELP
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend en modo desarrollo (fuera de Docker)
cd frontendELP
npm run dev
```

## Solución de Problemas

### El backend no puede conectar a la base de datos
```bash
# Verificar que PostgreSQL esté ejecutándose
docker-compose ps db

# Ver logs de PostgreSQL
docker-compose logs db

# Verificar conectividad
docker-compose exec backend curl http://db:5432
```

### El frontend no puede conectar al backend
```bash
# Verificar que el backend esté ejecutándose
docker-compose ps backend

# Probar la API directamente
curl http://localhost:8000/health
```

### Reiniciar todo el sistema
```bash
docker-compose down
docker-compose up --build
```

### Limpiar contenedores e imágenes (CUIDADO)
```bash
docker-compose down --rmi all -v
docker system prune -a
```

## Estructura del Proyecto

```
SistemaElpPontificia/
├── docker-compose.yml          # Orquestación de contenedores
├── README.md                   # Este archivo
├── backendELP/
│   ├── Dockerfile             # Imagen del backend
│   ├── .env                   # Variables de entorno del backend
│   ├── requirements.txt       # Dependencias Python
│   └── app/                   # Código fuente del backend
├── frontendELP/
│   ├── Dockerfile            # Imagen del frontend
│   ├── nginx.conf            # Configuración de Nginx
│   ├── .env                  # Variables de entorno (desarrollo)
│   ├── .env.docker           # Variables de entorno (Docker)
│   └── src/                  # Código fuente del frontend
```

## Seguridad

En producción, asegúrate de:

1. Cambiar todas las contraseñas por defecto
2. Usar variables de entorno seguras
3. Configurar HTTPS con certificados SSL
4. Limitar acceso a puertos sensibles
5. Usar secrets de Docker para credenciales
6. Configurar firewall apropiadamente

## Monitoreo

Los servicios incluyen health checks que permiten monitorear su estado:

```bash
# Ver estado de todos los servicios
docker-compose ps

# Ver detalles de health checks
docker inspect elp-backend --format='{{.State.Health}}'
```