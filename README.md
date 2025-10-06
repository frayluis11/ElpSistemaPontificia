# 🚀 Sistema ELP Pontificia

Sistema completo de gestión universitaria con FastAPI (Backend) y React (Frontend).

## ⚡ Inicio Rápido

### Requisitos Previos
- **Python 3.11+** 
- **Node.js 20+**
- **PostgreSQL 15+**
- **Git**

### 🔧 Instalación Automática

**Windows:**
```bash
./start-system.bat
```

**Linux/Mac:**
```bash
chmod +x start-system.sh
./start-system.sh
```

### 🖥️ URLs del Sistema
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **Documentación API**: http://127.0.0.1:8000/docs
- **Adminer DB**: http://localhost:8080 (Docker)

### 👤 Usuario Administrador
```
DNI: 12345678
Contraseña: admin123
```

## 📁 Estructura del Proyecto

```
SistemaElpPontificia/
├── backendELP/           # API FastAPI
│   ├── app/
│   │   ├── main.py       # Aplicación principal
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── routers/      # Endpoints API
│   │   ├── schemas/      # Schemas Pydantic
│   │   └── core/         # Configuración y auth
│   ├── requirements.txt  # Dependencias Python
│   ├── Dockerfile        # Container backend
│   └── .env             # Variables de entorno
├── frontendELP/          # Aplicación React
│   ├── src/
│   │   ├── components/   # Componentes React
│   │   ├── pages/        # Páginas principales
│   │   ├── services/     # Servicios API
│   │   └── utils/        # Utilidades
│   ├── package.json      # Dependencias npm
│   └── Dockerfile        # Container frontend
├── docker-compose.yml    # Orquestación Docker
├── start-system.bat      # Inicio automático Windows
└── start-system.sh       # Inicio automático Linux/Mac
```

## 🏗️ Instalación Manual

### Backend (FastAPI)
```bash
cd backendELP
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend (React)
```bash
cd frontendELP
npm install
npm run dev
```

### Base de Datos (PostgreSQL)
```sql
-- Crear base de datos
CREATE DATABASE sistemaelp_db;

-- Ejecutar script de inicialización
\i backendELP/init-scripts/01-init.sql
```

## 🐳 Docker

### Desarrollo
```bash
docker-compose up --build -d
```

### Producción
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔐 Seguridad

### Características Implementadas
- ✅ **Autenticación JWT** con tokens seguros
- ✅ **Autorización por roles** (5 roles específicos) 
- ✅ **Validación de datos** con Pydantic
- ✅ **Protección CORS** configurada
- ✅ **Hash de contraseñas** con bcrypt
- ✅ **Sanitización SQL** con SQLAlchemy ORM

### Roles del Sistema
1. **Docente** - Registro de horas y documentos propios
2. **RRHH** - Gestión de personal y reportes
3. **Contabilidad** - Reportes financieros
4. **Administración** - Gestión administrativa
5. **Área TI** - Acceso completo al sistema

## 📊 Funcionalidades

### ✅ Implementadas
- **Gestión de Usuarios**: CRUD completo con roles
- **Gestión de Documentos**: Subida, descarga, control de acceso
- **Registro de Horas**: Seguimiento laboral con validaciones
- **Reportes**: Estadísticas y exportación Excel/PDF
- **Dashboard**: Métricas en tiempo real
- **API REST**: Endpoints documentados con Swagger
- **Autenticación**: JWT con refresh tokens
- **Monitoreo**: Health checks y métricas del sistema

### 🔄 En Desarrollo
- Notificaciones por email
- Integración con sistemas externos
- App móvil
- Backup automatizado

## 🧪 Testing

### Backend
```bash
cd backendELP
pytest tests/ -v --cov=app
```

### Frontend
```bash
cd frontendELP
npm test
```

### Integración
```bash
python test_integration.py
```

## 📈 Monitoreo

### Health Checks
- **Backend**: http://127.0.0.1:8000/health
- **Database**: http://127.0.0.1:8000/health/db
- **System**: http://127.0.0.1:8000/system/status

### Métricas
- **Performance**: http://127.0.0.1:8000/system/metrics
- **Logs**: http://127.0.0.1:8000/system/logs

## 🔧 Configuración

### Variables de Entorno (.env)
```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres_secure_2024!
DB_NAME=sistemaelp_db

# JWT
SECRET_KEY=your-super-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Servidor
SERVER_HOST=127.0.0.1
SERVER_PORT=8000
DEBUG=True

# CORS
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Pull Request

## 📝 Changelog

### v2.1.0 (2024-12-28)
- ✅ Sistema de seguridad completo implementado
- ✅ Módulos Users, Roles, Documents y Hours completamente seguros
- ✅ Reportes de seguridad generados
- ✅ Docker configurado con correcciones
- ✅ Scripts de inicio automático

### v2.0.0 (2024-12-27)
- ✅ Backend FastAPI completo con 7 módulos
- ✅ Frontend React con interfaz moderna
- ✅ Sistema de autenticación JWT
- ✅ Base de datos PostgreSQL configurada

## 📞 Soporte

- **Email**: soporte@pontificia.edu.co
- **Documentación**: http://127.0.0.1:8000/docs
- **Issues**: GitHub Issues

## 📄 Licencia

Este proyecto está bajo la Licencia Pontificia - ver archivo [LICENSE](LICENSE) para detalles.

---

**Sistema ELP Pontificia** - Desarrollado con ❤️ para la gestión universitaria moderna