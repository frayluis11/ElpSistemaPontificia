from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine, create_tables
from app.routers import user_router, role_router, document_router, hours_router, auth, dashboard, file_manager, reports_stats, dashboard_stats, system_monitor, health
from dotenv import load_dotenv
import os
import time
from datetime import datetime

# Cargar variables de entorno
load_dotenv()

# Configuración de tags para documentación Swagger
tags_metadata = [
    {
        "name": "authentication",
        "description": "Operaciones de autenticación: login, registro, validación de tokens",
    },
    {
        "name": "users",
        "description": "Gestión de usuarios: CRUD, perfiles, asignación de roles",
    },
    {
        "name": "roles",
        "description": "Gestión de roles: CRUD, permisos, autorización",
    },
    {
        "name": "documents",
        "description": "Gestión de documentos: subida, descarga, metadatos, control de acceso",
    },
    {
        "name": "hours",
        "description": "Registro de horas trabajadas: CRUD, reportes, estadísticas",
    },
    {
        "name": "reports",
        "description": "Reportes estadísticos: usuarios, documentos, horas, exportación",
    },
    {
        "name": "dashboard",
        "description": "Dashboards dinámicos: métricas, gráficos, indicadores KPI",
    },
    {
        "name": "file-manager",
        "description": "Gestión de archivos: subida, validación, almacenamiento",
    },
    {
        "name": "system",
        "description": "Monitoreo del sistema: salud, métricas, estado de servicios",
    },
    {
        "name": "health",
        "description": "Endpoints de verificación de salud y estado del sistema",
    }
]

# Crear instancia de FastAPI
app = FastAPI(
    title="Sistema ELP Pontificia API",
    description="""
    ## Sistema ELP Pontificia - Backend API

    Este sistema proporciona una API completa para la gestión de:

    * **👥 Usuarios y Roles**: Sistema de autenticación JWT con 5 roles específicos
    * **📄 Documentos**: Gestión completa de archivos con control de acceso
    * **⏰ Horas Trabajadas**: Registro y seguimiento de actividades laborales
    * **📊 Reportes**: Estadísticas avanzadas y exportación de datos
    * **🔧 Monitoreo**: Dashboards y métricas del sistema

    ### Roles del Sistema:
    - **Docente**: Registro de horas y acceso a documentos propios
    - **RRHH**: Gestión de usuarios y reportes de personal
    - **Contabilidad**: Acceso a reportes financieros y documentos contables
    - **Administración**: Gestión administrativa y reportes generales
    - **Área TI**: Acceso completo al sistema y configuración

    ### Tecnologías:
    - **FastAPI** 0.115.6 - Framework web moderno y rápido
    - **PostgreSQL** 15 - Base de datos relacional robusta
    - **SQLAlchemy** 2.0 - ORM Python avanzado
    - **JWT** - Autenticación segura con tokens
    - **Docker** - Containerización completa
    - **Pytest** - Testing automatizado

    ### Funcionalidades Principales:
    - ✅ Autenticación JWT con roles granulares
    - ✅ CRUD completo para usuarios, roles, documentos y horas
    - ✅ Sistema de archivos con validación y control de acceso
    - ✅ Reportes estadísticos con exportación a Excel/PDF
    - ✅ Dashboards dinámicos con métricas en tiempo real
    - ✅ Monitoreo del sistema y health checks
    - ✅ CI/CD con GitHub Actions
    - ✅ Documentación completa con Swagger UI

    **Versión**: 2.1.0 | **Entorno**: {environment}
    """.format(environment=os.getenv("ENVIRONMENT", "development")),
    version="2.1.0",
    terms_of_service="https://pontificia.edu.co/terms/",
    contact={
        "name": "Soporte Técnico - Sistema ELP",
        "url": "https://pontificia.edu.co/soporte",
        "email": "soporte@pontificia.edu.co",
    },
    license_info={
        "name": "Licencia Pontificia",
        "url": "https://pontificia.edu.co/license",
    },
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Variable para tracking de inicio del sistema
app.start_time = time.time()

# Crear tablas al iniciar la aplicación
@app.on_event("startup")
async def startup_event():
    create_tables()

# Incluir routers
app.include_router(health.router)  # Health check (Docker)
app.include_router(auth.router)  # Autenticación (no requiere auth)
app.include_router(dashboard.router)  # Dashboards (requiere auth)
app.include_router(user_router.router)  # CRUD usuarios
app.include_router(role_router.router)  # CRUD roles
app.include_router(document_router.router)  # CRUD documentos
app.include_router(hours_router.router)  # CRUD horas
app.include_router(file_manager.router)  # Gestión de archivos
app.include_router(reports_stats.router)  # Reportes estadísticos
app.include_router(dashboard_stats.router)  # Dashboard dinámico
app.include_router(system_monitor.router)  # Monitoreo del sistema

@app.get(
    "/",
    tags=["system"],
    summary="Bienvenida al Sistema ELP",
    description="Endpoint raíz que proporciona información básica del sistema",
    responses={
        200: {
            "description": "Información del sistema",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Bienvenido al Sistema ELP Pontificia API",
                        "version": "2.1.0",
                        "status": "active",
                        "environment": "development",
                        "uptime_seconds": 3600.5,
                        "docs_url": "/docs"
                    }
                }
            }
        }
    }
)
async def root():
    """
    ## Endpoint de Bienvenida
    
    Proporciona información básica del sistema y estado actual.
    
    **Información devuelta:**
    - Mensaje de bienvenida
    - Versión actual del sistema
    - Estado del servicio
    - Tiempo de funcionamiento
    - Enlaces útiles
    """
    uptime = time.time() - app.start_time
    return {
        "message": "Bienvenido al Sistema ELP Pontificia API",
        "version": "2.1.0",
        "status": "active",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "uptime_seconds": round(uptime, 2),
        "uptime_hours": round(uptime / 3600, 2),
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "started_at": datetime.fromtimestamp(app.start_time).isoformat()
    }

@app.get(
    "/health",
    tags=["health"],
    summary="Health Check",
    description="Verificación básica de salud del servicio",
    responses={
        200: {
            "description": "Servicio saludable",
            "content": {
                "application/json": {
                    "example": {
                        "status": "healthy",
                        "service": "Sistema ELP Pontificia Backend"
                    }
                }
            }
        }
    }
)
async def health_check():
    """
    ## Health Check Básico
    
    Endpoint simple para verificar que el servicio está funcionando.
    Usado por Docker, Kubernetes y sistemas de monitoreo.
    """
    return {
        "status": "healthy",
        "service": "Sistema ELP Pontificia Backend",
        "timestamp": datetime.now().isoformat()
    }

@app.get(
    "/status",
    tags=["system"],
    summary="Estado del Sistema",
    description="Información detallada del estado del sistema incluyendo base de datos",
    responses={
        200: {
            "description": "Estado del sistema",
            "content": {
                "application/json": {
                    "example": {
                        "status": "operational",
                        "version": "2.1.0",
                        "uptime_seconds": 7200.5,
                        "database": {
                            "status": "connected",
                            "response_time_ms": 15.2
                        },
                        "system": {
                            "environment": "development",
                            "started_at": "2024-01-15T10:30:00",
                            "memory_usage": "45.2 MB"
                        }
                    }
                }
            }
        },
        503: {
            "description": "Servicio no disponible",
            "content": {
                "application/json": {
                    "example": {
                        "status": "unavailable",
                        "error": "Database connection failed"
                    }
                }
            }
        }
    }
)
async def system_status(db: Session = Depends(get_db)):
    """
    ## Estado Completo del Sistema
    
    Proporciona información detallada sobre:
    - Estado general del sistema
    - Conectividad de base de datos
    - Tiempo de funcionamiento
    - Información del entorno
    - Métricas básicas de rendimiento
    
    **Usado para:**
    - Monitoreo de infraestructura
    - Dashboards de operaciones
    - Diagnóstico de problemas
    - Health checks avanzados
    """
    try:
        # Test de conectividad a base de datos
        db_start_time = time.time()
        result = db.execute(text("SELECT 1 as test, NOW() as current_time"))
        test_result = result.fetchone()
        db_response_time = (time.time() - db_start_time) * 1000  # En milisegundos
        
        uptime = time.time() - app.start_time
        
        # Información básica del sistema
        import psutil
        process = psutil.Process()
        memory_info = process.memory_info()
        
        return {
            "status": "operational",
            "version": "2.1.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "uptime": {
                "seconds": round(uptime, 2),
                "hours": round(uptime / 3600, 2),
                "days": round(uptime / 86400, 2)
            },
            "database": {
                "status": "connected",
                "response_time_ms": round(db_response_time, 2),
                "current_time": test_result[1].isoformat() if test_result else None,
                "connection_pool": "active"
            },
            "system": {
                "started_at": datetime.fromtimestamp(app.start_time).isoformat(),
                "current_time": datetime.now().isoformat(),
                "memory_usage_mb": round(memory_info.rss / 1024 / 1024, 2),
                "cpu_percent": psutil.cpu_percent(),
                "process_id": os.getpid()
            },
            "features": {
                "authentication": "JWT enabled",
                "database": "PostgreSQL",
                "file_uploads": "enabled",
                "reporting": "enabled",
                "monitoring": "enabled"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "unavailable",
                "error": f"System check failed: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        )

@app.get("/db-test")
async def test_database_connection(db: Session = Depends(get_db)):
    """Endpoint para probar la conexión a la base de datos"""
    try:
        # Ejecutar una consulta simple para verificar la conexión
        result = db.execute(text("SELECT 1 as test"))
        test_value = result.fetchone()
        
        return {
            "status": "success",
            "message": "Conexión a PostgreSQL exitosa",
            "database": os.getenv("DB_NAME", "sistemaelp_db"),
            "test_query_result": test_value[0] if test_value else None
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error conectando a la base de datos: {str(e)}"
        )

@app.get("/info")
async def app_info():
    """Endpoint con información de la aplicación"""
    return {
        "app_name": "Sistema ELP Pontificia Backend",
        "version": "1.0.0",
        "framework": "FastAPI",
        "database": "PostgreSQL",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)