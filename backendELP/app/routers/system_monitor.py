import psutil
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta
import json

from ..core.database import get_db
from ..core.auth_deps import require_ti, require_rrhh_or_admin
from ..models.user import User
from ..models.document import DocumentAccess

router = APIRouter(prefix="/system", tags=["system-monitor"])

# Configurar logging para capturar métricas
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@router.get("/status", response_model=Dict[str, Any])
async def get_system_status(
    current_user: User = Depends(require_ti),
    db: Session = Depends(get_db)
):
    """
    Estado general del sistema - CPU, memoria, disco, red
    Solo accesible para el área de TI
    """
    try:
        # Métricas de CPU
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()
        
        # Métricas de memoria
        memory = psutil.virtual_memory()
        swap = psutil.swap_memory()
        
        # Métricas de disco
        disk_usage = psutil.disk_usage('/')
        disk_io = psutil.disk_io_counters()
        
        # Métricas de red
        network_io = psutil.net_io_counters()
        
        # Procesos activos
        process_count = len(psutil.pids())
        
        # Uptime del sistema
        boot_time = psutil.boot_time()
        uptime_seconds = datetime.now().timestamp() - boot_time
        uptime_days = uptime_seconds / (24 * 3600)
        
        system_status = {
            "timestamp": datetime.now().isoformat(),
            "cpu": {
                "usage_percent": cpu_percent,
                "cores": cpu_count,
                "frequency_mhz": cpu_freq.current if cpu_freq else None,
                "load_average": os.getloadavg() if hasattr(os, 'getloadavg') else None
            },
            "memory": {
                "total_gb": round(memory.total / (1024**3), 2),
                "used_gb": round(memory.used / (1024**3), 2),
                "available_gb": round(memory.available / (1024**3), 2),
                "usage_percent": memory.percent,
                "swap_total_gb": round(swap.total / (1024**3), 2),
                "swap_used_gb": round(swap.used / (1024**3), 2),
                "swap_percent": swap.percent
            },
            "disk": {
                "total_gb": round(disk_usage.total / (1024**3), 2),
                "used_gb": round(disk_usage.used / (1024**3), 2),
                "free_gb": round(disk_usage.free / (1024**3), 2),
                "usage_percent": (disk_usage.used / disk_usage.total) * 100,
                "read_count": disk_io.read_count if disk_io else 0,
                "write_count": disk_io.write_count if disk_io else 0
            },
            "network": {
                "bytes_sent": network_io.bytes_sent if network_io else 0,
                "bytes_recv": network_io.bytes_recv if network_io else 0,
                "packets_sent": network_io.packets_sent if network_io else 0,
                "packets_recv": network_io.packets_recv if network_io else 0
            },
            "system": {
                "process_count": process_count,
                "uptime_days": round(uptime_days, 2),
                "boot_time": datetime.fromtimestamp(boot_time).isoformat(),
                "platform": psutil.WINDOWS if os.name == 'nt' else psutil.LINUX
            }
        }
        
        return system_status
        
    except Exception as e:
        logger.error(f"Error al obtener estado del sistema: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener métricas del sistema: {str(e)}"
        )


@router.get("/performance", response_model=Dict[str, Any])
async def get_performance_metrics(
    current_user: User = Depends(require_ti),
    db: Session = Depends(get_db)
):
    """
    Métricas de rendimiento y performance de la aplicación
    """
    try:
        # Métricas de la base de datos
        db_connections = db.execute("SELECT count(*) FROM pg_stat_activity").scalar()
        
        # Actividad de usuarios (últimas 24 horas)
        yesterday = datetime.now() - timedelta(days=1)
        user_activity = db.query(DocumentAccess).filter(
            DocumentAccess.fecha_acceso >= yesterday
        ).count()
        
        # Top procesos por CPU
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
            try:
                proc_info = proc.info
                if proc_info['cpu_percent'] > 0:
                    processes.append(proc_info)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
        
        # Ordenar por uso de CPU y tomar top 10
        top_processes = sorted(processes, key=lambda x: x['cpu_percent'], reverse=True)[:10]
        
        # Métricas de red por interfaz
        network_interfaces = psutil.net_io_counters(pernic=True)
        network_stats = {}
        for interface, stats in network_interfaces.items():
            network_stats[interface] = {
                "bytes_sent": stats.bytes_sent,
                "bytes_recv": stats.bytes_recv,
                "packets_sent": stats.packets_sent,
                "packets_recv": stats.packets_recv,
                "errors_in": stats.errin,
                "errors_out": stats.errout,
                "drops_in": stats.dropin,
                "drops_out": stats.dropout
            }
        
        # Temperatura del sistema (si está disponible)
        temperatures = {}
        try:
            temps = psutil.sensors_temperatures()
            for name, entries in temps.items():
                temperatures[name] = [
                    {"label": entry.label or "N/A", "current": entry.current, "high": entry.high}
                    for entry in entries
                ]
        except AttributeError:
            temperatures = {"info": "Sensores de temperatura no disponibles en este sistema"}
        
        performance_data = {
            "timestamp": datetime.now().isoformat(),
            "database": {
                "active_connections": db_connections,
                "user_activity_24h": user_activity
            },
            "top_processes": top_processes,
            "network_interfaces": network_stats,
            "temperatures": temperatures,
            "system_health": {
                "cpu_healthy": psutil.cpu_percent() < 80,
                "memory_healthy": psutil.virtual_memory().percent < 85,
                "disk_healthy": psutil.disk_usage('/').percent < 90
            }
        }
        
        return performance_data
        
    except Exception as e:
        logger.error(f"Error al obtener métricas de rendimiento: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener métricas de rendimiento: {str(e)}"
        )


@router.get("/logs", response_model=Dict[str, Any])
async def get_system_logs(
    current_user: User = Depends(require_ti),
    lines: int = 100,
    level: str = "INFO"
):
    """
    Obtener logs del sistema y aplicación
    """
    try:
        # Logs simulados (en producción se leerían de archivos reales)
        log_entries = [
            {
                "timestamp": (datetime.now() - timedelta(minutes=i)).isoformat(),
                "level": "INFO" if i % 3 == 0 else ("WARNING" if i % 5 == 0 else "ERROR"),
                "message": f"Sistema funcionando correctamente - Entry {i}",
                "module": "system_monitor",
                "user_id": None
            }
            for i in range(min(lines, 100))
        ]
        
        # Filtrar por nivel si se especifica
        if level and level != "ALL":
            log_entries = [log for log in log_entries if log["level"] == level]
        
        # Estadísticas de logs
        log_stats = {
            "total_entries": len(log_entries),
            "levels": {
                "INFO": len([log for log in log_entries if log["level"] == "INFO"]),
                "WARNING": len([log for log in log_entries if log["level"] == "WARNING"]),
                "ERROR": len([log for log in log_entries if log["level"] == "ERROR"])
            }
        }
        
        return {
            "timestamp": datetime.now().isoformat(),
            "filter": {
                "lines": lines,
                "level": level
            },
            "statistics": log_stats,
            "entries": log_entries[:50]  # Limitar a 50 para evitar respuestas muy grandes
        }
        
    except Exception as e:
        logger.error(f"Error al obtener logs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener logs del sistema: {str(e)}"
        )


@router.get("/health", response_model=Dict[str, Any])
async def get_health_check(
    current_user: User = Depends(require_rrhh_or_admin),
    db: Session = Depends(get_db)
):
    """
    Health check del sistema - disponible para RRHH y Admin
    """
    try:
        health_status = {
            "timestamp": datetime.now().isoformat(),
            "status": "healthy",
            "checks": {},
            "overall_score": 0
        }
        
        score = 0
        total_checks = 0
        
        # Check de base de datos
        try:
            db.execute("SELECT 1")
            health_status["checks"]["database"] = {
                "status": "healthy",
                "message": "Conexión a base de datos OK",
                "response_time_ms": 15  # Simulado
            }
            score += 25
        except Exception as e:
            health_status["checks"]["database"] = {
                "status": "unhealthy",
                "message": f"Error en base de datos: {str(e)}",
                "response_time_ms": None
            }
        total_checks += 25
        
        # Check de CPU
        cpu_usage = psutil.cpu_percent()
        if cpu_usage < 80:
            health_status["checks"]["cpu"] = {
                "status": "healthy",
                "message": f"CPU usage normal: {cpu_usage}%",
                "value": cpu_usage
            }
            score += 25
        else:
            health_status["checks"]["cpu"] = {
                "status": "warning",
                "message": f"CPU usage high: {cpu_usage}%",
                "value": cpu_usage
            }
            score += 10
        total_checks += 25
        
        # Check de memoria
        memory = psutil.virtual_memory()
        if memory.percent < 85:
            health_status["checks"]["memory"] = {
                "status": "healthy",
                "message": f"Memory usage normal: {memory.percent}%",
                "value": memory.percent
            }
            score += 25
        else:
            health_status["checks"]["memory"] = {
                "status": "warning", 
                "message": f"Memory usage high: {memory.percent}%",
                "value": memory.percent
            }
            score += 10
        total_checks += 25
        
        # Check de disco
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        if disk_percent < 90:
            health_status["checks"]["disk"] = {
                "status": "healthy",
                "message": f"Disk usage normal: {disk_percent:.1f}%",
                "value": disk_percent
            }
            score += 25
        else:
            health_status["checks"]["disk"] = {
                "status": "warning",
                "message": f"Disk usage high: {disk_percent:.1f}%", 
                "value": disk_percent
            }
            score += 10
        total_checks += 25
        
        # Calcular score general
        health_status["overall_score"] = (score / total_checks) * 100
        
        # Determinar status general
        if health_status["overall_score"] >= 90:
            health_status["status"] = "healthy"
        elif health_status["overall_score"] >= 70:
            health_status["status"] = "degraded"
        else:
            health_status["status"] = "unhealthy"
        
        return health_status
        
    except Exception as e:
        logger.error(f"Error en health check: {str(e)}")
        return {
            "timestamp": datetime.now().isoformat(),
            "status": "error",
            "message": f"Error al realizar health check: {str(e)}",
            "overall_score": 0
        }


@router.get("/alerts", response_model=Dict[str, Any])
async def get_system_alerts(
    current_user: User = Depends(require_ti)
):
    """
    Alertas del sistema basadas en métricas actuales
    """
    try:
        alerts = []
        
        # Alert por CPU
        cpu_usage = psutil.cpu_percent(interval=1)
        if cpu_usage > 85:
            alerts.append({
                "type": "critical",
                "component": "cpu",
                "message": f"Uso de CPU crítico: {cpu_usage}%",
                "threshold": 85,
                "current_value": cpu_usage,
                "timestamp": datetime.now().isoformat()
            })
        elif cpu_usage > 70:
            alerts.append({
                "type": "warning",
                "component": "cpu", 
                "message": f"Uso de CPU alto: {cpu_usage}%",
                "threshold": 70,
                "current_value": cpu_usage,
                "timestamp": datetime.now().isoformat()
            })
        
        # Alert por memoria
        memory = psutil.virtual_memory()
        if memory.percent > 90:
            alerts.append({
                "type": "critical",
                "component": "memory",
                "message": f"Uso de memoria crítico: {memory.percent}%",
                "threshold": 90,
                "current_value": memory.percent,
                "timestamp": datetime.now().isoformat()
            })
        elif memory.percent > 80:
            alerts.append({
                "type": "warning",
                "component": "memory",
                "message": f"Uso de memoria alto: {memory.percent}%",
                "threshold": 80,
                "current_value": memory.percent,
                "timestamp": datetime.now().isoformat()
            })
        
        # Alert por disco
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        if disk_percent > 95:
            alerts.append({
                "type": "critical",
                "component": "disk",
                "message": f"Espacio en disco crítico: {disk_percent:.1f}%",
                "threshold": 95,
                "current_value": disk_percent,
                "timestamp": datetime.now().isoformat()
            })
        elif disk_percent > 85:
            alerts.append({
                "type": "warning",
                "component": "disk",
                "message": f"Espacio en disco alto: {disk_percent:.1f}%",
                "threshold": 85,
                "current_value": disk_percent,
                "timestamp": datetime.now().isoformat()
            })
        
        return {
            "timestamp": datetime.now().isoformat(),
            "total_alerts": len(alerts),
            "critical_count": len([a for a in alerts if a["type"] == "critical"]),
            "warning_count": len([a for a in alerts if a["type"] == "warning"]),
            "alerts": alerts
        }
        
    except Exception as e:
        logger.error(f"Error al obtener alertas del sistema: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener alertas: {str(e)}"
        )