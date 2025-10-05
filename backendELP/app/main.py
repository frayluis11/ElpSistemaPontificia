from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine, create_tables
from app.routers import user_router, role_router, document_router, hours_router, auth, dashboard, file_manager, reports_stats, dashboard_stats, system_monitor, health
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Crear instancia de FastAPI
app = FastAPI(
    title="Sistema ELP Pontificia API",
    description="Backend del Sistema ELP Pontificia con FastAPI, PostgreSQL, JWT Auth y Roles",
    version="2.0.0"
)

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

@app.get("/")
async def root():
    """Endpoint raíz de bienvenida"""
    return {
        "message": "Bienvenido al Sistema ELP Pontificia API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Endpoint de verificación de salud del servicio"""
    return {
        "status": "healthy",
        "service": "Sistema ELP Pontificia Backend"
    }

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