from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import date

from ..core.database import get_db
from ..core.auth_deps import (
    get_current_active_user, require_rrhh_or_admin, 
    require_docente, require_contabilidad, require_ti
)
from ..models.user import User
from ..models.role import Role
from ..services.statistics_service import StatisticsService

router = APIRouter(prefix="/reports", tags=["reports-statistics"])


@router.get("/general", response_model=Dict[str, Any])
async def get_general_reports(
    current_user: User = Depends(require_rrhh_or_admin),
    db: Session = Depends(get_db)
):
    """
    Reportes estadísticos generales del sistema
    Solo accesible para RRHH y Administración
    """
    stats_service = StatisticsService(db)
    return stats_service.get_general_stats()


@router.get("/rrhh", response_model=Dict[str, Any])
async def get_rrhh_reports(
    current_user: User = Depends(require_rrhh_or_admin),
    db: Session = Depends(get_db)
):
    """
    Reportes específicos para Recursos Humanos
    Incluye estadísticas de usuarios, documentos y horas docentes
    """
    stats_service = StatisticsService(db)
    return stats_service.get_rrhh_stats()


@router.get("/docentes", response_model=Dict[str, Any])
async def get_docentes_reports(
    current_user: User = Depends(require_docente),
    db: Session = Depends(get_db)
):
    """
    Reportes específicos para docentes
    Muestra estadísticas personales del docente autenticado
    """
    stats_service = StatisticsService(db)
    return stats_service.get_docentes_stats(current_user.id)


@router.get("/docentes/{docente_id}", response_model=Dict[str, Any])
async def get_specific_docente_reports(
    docente_id: int,
    current_user: User = Depends(require_rrhh_or_admin),
    db: Session = Depends(get_db)
):
    """
    Reportes de un docente específico
    Solo accesible para RRHH y Administración
    """
    # Verificar que el usuario solicitado sea docente
    target_user = db.query(User).filter(User.id == docente_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Docente no encontrado"
        )
    
    user_role = db.query(Role).filter(Role.id == target_user.rol_id).first()
    if not user_role or user_role.nombre_rol != "Docente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario especificado no es un docente"
        )
    
    stats_service = StatisticsService(db)
    return stats_service.get_docentes_stats(docente_id)


@router.get("/contabilidad", response_model=Dict[str, Any])
async def get_contabilidad_reports(
    current_user: User = Depends(require_contabilidad),
    db: Session = Depends(get_db)
):
    """
    Reportes específicos para Contabilidad
    Incluye cálculos de pagos, horas docentes y presupuestos
    """
    stats_service = StatisticsService(db)
    return stats_service.get_contabilidad_stats()


@router.get("/ti", response_model=Dict[str, Any])
async def get_ti_reports(
    current_user: User = Depends(require_ti),
    db: Session = Depends(get_db)
):
    """
    Reportes específicos para el área de TI
    Incluye métricas del sistema, actividad y rendimiento
    """
    stats_service = StatisticsService(db)
    return stats_service.get_ti_stats()


# NUEVOS ENDPOINTS DE REPORTES DE HORAS
@router.get("/hours", response_model=Dict[str, Any])
async def get_hours_stats(
    current_user: User = Depends(get_current_active_user),  
    db: Session = Depends(get_db)
):
    """
    Estadísticas específicas de horas trabajadas
    """
    stats_service = StatisticsService(db)
    
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        # RRHH y Admin ven estadísticas completas
        return stats_service.get_hours_stats()
    else:
        # Usuario normal ve solo sus estadísticas
        return stats_service.get_user_hours_stats(current_user.id)


@router.get("/export/hours/excel")
async def export_hours_report_excel(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    usuario_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Exportar reporte completo de horas a Excel
    """
    import pandas as pd
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    from ..models.hours import Hours
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    query = db.query(Hours, User).join(User, Hours.usuario_id == User.id)
    
    # Filtros de acceso por rol
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        if usuario_id:
            query = query.filter(Hours.usuario_id == usuario_id)
    else:
        query = query.filter(Hours.usuario_id == current_user.id)
    
    # Filtros por fecha
    if fecha_inicio:
        query = query.filter(Hours.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Hours.fecha <= fecha_fin)
    
    results = query.all()
    
    # Preparar datos para Excel
    data = []
    for hours, user in results:
        data.append({
            'ID': hours.id,
            'Usuario': f"{user.nombre} {user.apellido}",
            'DNI': user.dni,
            'Fecha': hours.fecha.strftime('%Y-%m-%d'),
            'Horas Totales': hours.horas_totales,
            'Observaciones': hours.observaciones or '',
            'Fecha Creación': hours.fecha_creacion.strftime('%Y-%m-%d %H:%M:%S'),
        })
    
    df = pd.DataFrame(data)
    
    excel_buffer = BytesIO()
    with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Reporte Horas', index=False)
    
    excel_buffer.seek(0)
    filename = f"reporte_horas_{date.today().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        BytesIO(excel_buffer.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/alerts", response_model=Dict[str, Any])
async def get_system_alerts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener alertas y notificaciones del sistema según el rol del usuario
    """
    # Obtener rol del usuario
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    role_name = user_role.nombre_rol if user_role else "Usuario"
    
    stats_service = StatisticsService(db)
    alerts = stats_service.get_alerts_and_notifications(role_name)
    
    return {
        "usuario": f"{current_user.nombre} {current_user.apellido}",
        "rol": role_name,
        "alertas": alerts,
        "total_alertas": len(alerts)
    }


@router.get("/summary", response_model=Dict[str, Any])
async def get_reports_summary(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Resumen de reportes disponibles según el rol del usuario
    """
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    role_name = user_role.nombre_rol if user_role else "Usuario"
    
    available_reports = []
    
    # Definir reportes disponibles por rol
    if role_name in ["RRHH", "Administración"]:
        available_reports.extend([
            {
                "endpoint": "/reports/general",
                "titulo": "Reportes Generales",
                "descripcion": "Estadísticas globales del sistema"
            },
            {
                "endpoint": "/reports/rrhh",
                "titulo": "Reportes RRHH",
                "descripcion": "Gestión de usuarios y documentos"
            }
        ])
    
    if role_name == "Docente":
        available_reports.append({
            "endpoint": "/reports/docentes",
            "titulo": "Mis Estadísticas",
            "descripcion": "Horas dictadas y documentos personales"
        })
    
    if role_name == "Contabilidad":
        available_reports.append({
            "endpoint": "/reports/contabilidad",
            "titulo": "Reportes Contabilidad",
            "descripcion": "Cálculos de pagos y presupuestos"
        })
    
    if role_name == "Área TI":
        available_reports.append({
            "endpoint": "/reports/ti",
            "titulo": "Reportes TI",
            "descripcion": "Métricas del sistema y rendimiento"
        })
    
    # Todos pueden ver alertas
    available_reports.append({
        "endpoint": "/reports/alerts",
        "titulo": "Alertas del Sistema",
        "descripcion": "Notificaciones y avisos importantes"
    })
    
    return {
        "usuario": f"{current_user.nombre} {current_user.apellido}",
        "rol": role_name,
        "reportes_disponibles": available_reports,
        "total_reportes": len(available_reports)
    }