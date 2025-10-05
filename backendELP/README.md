# 🎓 Sistema ELP Pontificia - Backend API

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-lightblue)
![Tests](https://img.shields.io/badge/Tests-Pytest-orange)
![License](https://img.shields.io/badge/License-Pontificia-purple)

Backend completo del Sistema ELP (Evaluación de Labor Pontificia) desarrollado con FastAPI, PostgreSQL, autenticación JWT y sistema de roles granular. Incluye gestión de usuarios, documentos, registro de horas, reportes estadísticos y dashboards dinámicos.

## 🚀 Características Principales

### ✅ **Sistema de Autenticación y Autorización**
- **JWT Tokens**: Autenticación segura con tokens de acceso
- **5 Roles Específicos**: Control granular de permisos
  - 👨‍🏫 **Docente**: Registro de horas y acceso a documentos propios
  - 👥 **RRHH**: Gestión de usuarios y reportes de personal
  - 💰 **Contabilidad**: Reportes financieros y documentos contables
  - 🏢 **Administración**: Gestión administrativa y reportes generales
  - 🔧 **Área TI**: Acceso completo al sistema y configuración

### ✅ **Gestión Completa de Usuarios**
- CRUD completo de usuarios con validaciones
- Gestión de perfiles y información personal
- Sistema de activación/desactivación
- Asignación dinámica de roles

### ✅ **Sistema de Documentos Avanzado**
- Subida de archivos con validación de tipos y tamaños
- Control de acceso basado en roles
- Metadatos automáticos (fecha, usuario, tipo)
- Descarga segura de documentos
- Gestión de versiones

### ✅ **Registro de Horas Trabajadas**
- Registro detallado de actividades laborales
- Tipos de actividad: docencia, administrativa, investigación
- Reportes por rango de fechas
- Validaciones de horas excesivas
- Exportación a Excel

### ✅ **Reportes Estadísticos y Analytics**
- **Estadísticas de Usuarios**: Por rol, actividad, registros
- **Estadísticas de Documentos**: Por tipo, mes, usuario
- **Estadísticas de Horas**: Por actividad, usuario, periodo
- **Exportación**: Excel y PDF para reportes
- **Dashboards Dinámicos**: Métricas en tiempo real

### ✅ **Monitoreo y Salud del Sistema**
- Health checks para Docker/Kubernetes
- Endpoint `/status` con métricas detalladas
- Monitoreo de base de datos y rendimiento
- Dashboards de sistema con psutil

### ✅ **Dockerización Completa**
- Dockerfile optimizado con Python 3.13
- docker-compose.yml para desarrollo
- Configuración de PostgreSQL con persistencia
- Adminer para administración de BD
- Health checks y networking

### ✅ **Testing y CI/CD**
- Suite completa de tests con pytest
- Tests async con httpx
- GitHub Actions para CI/CD automático
- Validación de código con flake8, black, isort
- Análisis de seguridad con bandit

## 🏗️ Arquitectura del Sistema

```
Sistema ELP Pontificia Backend
├── 📁 app/
│   ├── 📁 core/              # Configuración central
│   │   ├── database.py       # Conexión PostgreSQL
│   │   └── security.py       # JWT y bcrypt
│   ├── 📁 models/            # Modelos SQLAlchemy
│   │   ├── user.py          # Usuario
│   │   ├── role.py          # Roles
│   │   ├── document.py      # Documentos
│   │   └── hours.py         # Horas trabajadas
│   ├── 📁 routers/          # Endpoints API
│   │   ├── auth.py          # Autenticación
│   │   ├── user_router.py   # Gestión usuarios
│   │   ├── role_router.py   # Gestión roles
│   │   ├── document_router.py # Gestión documentos
│   │   ├── hours_router.py  # Registro horas
│   │   ├── reports_stats.py # Reportes estadísticos
│   │   ├── dashboard_stats.py # Dashboards
│   │   ├── system_monitor.py # Monitoreo
│   │   └── health.py        # Health checks
│   ├── 📁 services/         # Lógica de negocio
│   │   └── statistics_service.py # Servicios de estadísticas
│   └── main.py              # Aplicación FastAPI
├── 📁 tests/                # Suite de pruebas
│   ├── conftest.py          # Configuración pytest
│   ├── test_auth.py         # Tests autenticación
│   ├── test_users.py        # Tests usuarios
│   ├── test_roles.py        # Tests roles
│   ├── test_documents.py    # Tests documentos
│   ├── test_hours.py        # Tests horas
│   └── test_reports_stats.py # Tests reportes
├── 📁 .github/workflows/    # CI/CD
│   └── ci.yml               # GitHub Actions
├── 📁 uploads/              # Archivos subidos
├── Dockerfile               # Contenedor optimizado
├── docker-compose.yml       # Orquestación servicios
├── requirements.txt         # Dependencias Python
├── pytest.ini              # Configuración tests
├── .env.example             # Variables de entorno
└── README.md                # Documentación
```

## 🔧 Instalación y Configuración

### **Opción 1: Docker (Recomendado)**

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/sistema-elp-pontificia.git
cd sistema-elp-pontificia/backendELP

# 2. Configurar variables de entorno
cp .env.example .env
nano .env  # Ajustar según tu entorno

# 3. Construir y ejecutar con Docker Compose
docker-compose up --build -d

# 4. Verificar servicios
docker-compose ps
```

**Servicios disponibles:**
- 🚀 **Backend API**: http://localhost:8000
- 📊 **Swagger Docs**: http://localhost:8000/docs
- 🗃️ **Adminer DB**: http://localhost:8080
- 🗄️ **PostgreSQL**: localhost:5432

### **Opción 2: Instalación Local**

```bash
# 1. Crear entorno virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# .venv\Scripts\activate   # Windows

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar PostgreSQL local
createdb elp_pontificia_db

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración local

# 5. Ejecutar aplicación
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🔐 Configuración de Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Base de datos
DATABASE_URL=postgresql://postgres:password@localhost:5432/elp_pontificia

# Autenticación JWT
SECRET_KEY=tu_clave_super_secreta_aqui_cambiar_en_produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuración de archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# Email (opcional)
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_password_app
MAIL_FROM=tu_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_FROM_NAME=Sistema ELP Pontificia

# Configuración del servidor
HOST=0.0.0.0
PORT=8000
DEBUG=false
ENVIRONMENT=production
```

## 🧪 Testing

### **Ejecutar Tests**

```bash
# Todos los tests
pytest

# Tests específicos
pytest tests/test_auth.py -v
pytest tests/test_users.py -v

# Tests con cobertura
pytest --cov=app --cov-report=html

# Tests en paralelo
pytest -n 4
```

### **Tipos de Tests Implementados**

- ✅ **Tests de Autenticación**: Login, registro, tokens
- ✅ **Tests de Usuarios**: CRUD, permisos, validaciones
- ✅ **Tests de Roles**: Creación, asignación, autorización
- ✅ **Tests de Documentos**: Subida, descarga, validaciones
- ✅ **Tests de Horas**: Registro, reportes, exportación
- ✅ **Tests de Reportes**: Estadísticas, exportación

## 📊 API Endpoints

### **🔐 Autenticación**
```http
POST   /auth/login           # Iniciar sesión
POST   /auth/register        # Registrar usuario
GET    /auth/me              # Usuario actual
```

### **👥 Usuarios**
```http
GET    /users/               # Listar usuarios
POST   /users/               # Crear usuario
GET    /users/{user_id}      # Obtener usuario
PUT    /users/{user_id}      # Actualizar usuario
DELETE /users/{user_id}      # Eliminar usuario
POST   /users/{user_id}/activate   # Activar usuario
POST   /users/{user_id}/deactivate # Desactivar usuario
```

### **🎭 Roles**
```http
GET    /roles/               # Listar roles
POST   /roles/               # Crear rol
GET    /roles/{role_id}      # Obtener rol
PUT    /roles/{role_id}      # Actualizar rol
DELETE /roles/{role_id}      # Eliminar rol
```

### **📄 Documentos**
```http
GET    /documents/           # Listar documentos
POST   /documents/upload     # Subir documento
GET    /documents/{doc_id}   # Obtener documento
PUT    /documents/{doc_id}   # Actualizar metadatos
DELETE /documents/{doc_id}   # Eliminar documento
GET    /documents/{doc_id}/download # Descargar archivo
```

### **⏰ Horas Trabajadas**
```http
GET    /hours/               # Listar horas (propias)
POST   /hours/               # Registrar horas
GET    /hours/{hour_id}      # Obtener registro
PUT    /hours/{hour_id}      # Actualizar registro
DELETE /hours/{hour_id}      # Eliminar registro
GET    /hours/my-hours       # Mis horas trabajadas
GET    /hours/all            # Todas las horas (Admin/RRHH)
GET    /hours/export/excel   # Exportar a Excel
```

### **📊 Reportes y Estadísticas**
```http
GET    /reports-stats/users     # Estadísticas usuarios
GET    /reports-stats/documents # Estadísticas documentos  
GET    /reports-stats/hours     # Estadísticas horas
GET    /reports-stats/complete  # Estadísticas completas
GET    /reports-stats/export/{type}/excel # Exportar Excel
GET    /reports-stats/export/{type}/pdf   # Exportar PDF
```

### **🔍 Sistema y Monitoreo**
```http
GET    /                     # Información del sistema
GET    /health               # Health check básico
GET    /status               # Estado detallado del sistema
GET    /db-test              # Test conexión BD
GET    /info                 # Información de la app
```

## 🔒 Sistema de Permisos

| Rol | Usuarios | Roles | Documentos | Horas | Reportes | Sistema |
|-----|----------|-------|------------|-------|----------|---------|
| **Docente** | ❌ Propio | ❌ | ✅ Propios | ✅ Propios | ❌ | ❌ |
| **RRHH** | ✅ Todos | ✅ Leer | ✅ Leer | ✅ Todos | ✅ Personal | ❌ |
| **Contabilidad** | ❌ | ❌ | ✅ Financieros | ✅ Leer | ✅ Financieros | ❌ |
| **Administración** | ✅ Gestión | ✅ Gestión | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Leer |
| **Área TI** | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos | ✅ Todos |

## 🚀 Despliegue en Producción

### **Docker en Producción**

```bash
# 1. Configurar variables de producción
cp .env.example .env
# Ajustar SECRET_KEY, DATABASE_URL, etc.

# 2. Construir imagen de producción
docker build -t elp-pontificia-backend:latest .

# 3. Ejecutar con docker-compose
docker-compose -f docker-compose.prod.yml up -d

# 4. Configurar reverse proxy (nginx)
# 5. Configurar SSL/TLS
# 6. Configurar backups de BD
```

### **Variables Críticas de Producción**

```bash
# Cambiar en producción
SECRET_KEY=clave-super-secreta-unica-produccion
DEBUG=false
ENVIRONMENT=production

# Base de datos segura
DATABASE_URL=postgresql://user:password@db-server:5432/elp_db

# Configurar CORS si es necesario
ALLOWED_HOSTS=["tu-dominio.com", "www.tu-dominio.com"]
```

## 🔧 Monitoreo y Mantenimiento

### **Health Checks**

```bash
# Verificar estado del sistema
curl http://localhost:8000/health
curl http://localhost:8000/status

# Monitoreo de logs
docker-compose logs -f backend
docker-compose logs -f db
```

### **Backup de Base de Datos**

```bash
# Backup automático
docker exec postgres_container pg_dump -U postgres elp_pontificia > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker exec -i postgres_container psql -U postgres elp_pontificia < backup.sql
```

## 🧪 CI/CD Pipeline

El proyecto incluye un pipeline completo de CI/CD con GitHub Actions:

### **Workflows Automáticos**
- ✅ **Tests**: Ejecuta suite completa de tests
- ✅ **Linting**: flake8, black, isort para calidad de código
- ✅ **Security**: bandit y safety para análisis de seguridad
- ✅ **Docker**: Construcción y verificación de imágenes
- ✅ **Integration**: Tests de integración con docker-compose

### **Triggers**
- Push a `main`, `develop`, `testing-ci-docs`
- Pull requests a `main`, `develop`
- Despliegue automático en `main`

## 📚 Documentación API

### **Swagger UI**
- 🌐 **URL**: http://localhost:8000/docs
- **Características**: Documentación interactiva completa
- **Testing**: Prueba endpoints directamente
- **Autenticación**: Soporte para Bearer tokens

### **ReDoc**
- 🌐 **URL**: http://localhost:8000/redoc
- **Características**: Documentación estática elegante
- **Exportación**: Generación de documentación PDF

## 🤝 Contribución

### **Cómo Contribuir**

1. **Fork** el repositorio
2. **Crear** una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abrir** un Pull Request

### **Estándares de Código**

```bash
# Formateo automático
black app/ tests/
isort app/ tests/

# Linting
flake8 app/ tests/

# Type checking
mypy app/

# Tests antes del commit
pytest
```

## 📄 Licencia

Este proyecto está bajo la **Licencia Pontificia** - ver [LICENSE](LICENSE) para detalles.

## 📞 Soporte

- **📧 Email**: soporte@pontificia.edu.co
- **🌐 Web**: https://pontificia.edu.co/soporte
- **📚 Docs**: https://pontificia.edu.co/docs
- **🐛 Issues**: [GitHub Issues](https://github.com/tu-usuario/sistema-elp-pontificia/issues)

## 📈 Roadmap

### **Próximas Funcionalidades**
- [ ] 🔔 Sistema de notificaciones push
- [ ] 📱 API móvil optimizada
- [ ] 🤖 Bot de Telegram/Slack
- [ ] 📊 Dashboards más avanzados
- [ ] 🔍 Búsqueda full-text con Elasticsearch
- [ ] 📈 Métricas avanzadas con Prometheus
- [ ] 🎨 Temas personalizables
- [ ] 🌍 Soporte multi-idioma

---

**Desarrollado con ❤️ para la Pontificia Universidad**

*Sistema ELP Pontificia v2.1.0 - FastAPI Backend con Docker, Testing y CI/CD*