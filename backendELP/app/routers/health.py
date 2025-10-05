# Health check endpoint para Docker
from fastapi import APIRouter
from typing import Dict

router = APIRouter()

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Endpoint de health check para Docker
    """
    return {
        "status": "healthy",
        "service": "Sistema ELP Backend",
        "version": "2.0.0"
    }