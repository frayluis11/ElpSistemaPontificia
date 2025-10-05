from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, engine
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

# Crear instancia de FastAPI
app = FastAPI(
    title="Sistema ELP Pontificia API",
    description="Backend del Sistema ELP Pontificia con FastAPI y PostgreSQL",
    version="1.0.0"
)

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