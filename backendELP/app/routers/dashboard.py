from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, date, timedelta
from typing import Union
from ..core.database import get_db
from ..core.auth_deps import (
    get_current_active_user, 
    require_docente, 
    require_rrhh, 
    require_contabilidad, 
    require_administracion, 
    require_ti
)
from ..models.user import User
from ..models.role import Role
from ..models.document import Document
from ..models.hours import Hours
from ..schemas.dashboard import (
    DocenteDashboard, DocenteStats,
    RRHHDashboard, RRHHStats,
    ContabilidadDashboard, ContabilidadStats,
    AdministracionDashboard, AdministracionStats,
    TIDashboard, TIStats
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/", response_model=Union[DocenteDashboard, RRHHDashboard, ContabilidadDashboard, AdministracionDashboard, TIDashboard])
def get_dashboard(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Obtener dashboard según el rol del usuario"""
    
    # Obtener rol del usuario
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if not user_role:
        raise HTTPException(status_code=404, detail="Rol no encontrado")
    
    # Redirigir según el rol
    if user_role.nombre_rol == "Docente":
        return get_docente_dashboard(current_user, db)
    elif user_role.nombre_rol == "RRHH":
        return get_rrhh_dashboard(current_user, db)
    elif user_role.nombre_rol == "Contabilidad":
        return get_contabilidad_dashboard(current_user, db)
    elif user_role.nombre_rol == "Administración":
        return get_administracion_dashboard(current_user, db)
    elif user_role.nombre_rol == "Área TI":
        return get_ti_dashboard(current_user, db)
    else:
        raise HTTPException(status_code=403, detail="Rol no reconocido")

@router.get("/docente", response_model=DocenteDashboard)
def get_docente_dashboard(current_user: User = Depends(require_docente), db: Session = Depends(get_db)):
    """Dashboard específico para Docentes"""
    
    # Obtener fecha actual y del mes
    hoy = date.today()
    inicio_mes = hoy.replace(day=1)
    
    # Estadísticas del docente
    total_horas_mes = db.query(func.sum(Hours.horas_totales)).filter(
        Hours.usuario_id == current_user.id,
        Hours.fecha >= inicio_mes
    ).scalar() or 0.0
    
    total_documentos = db.query(Document).filter(Document.usuario_id == current_user.id).count()
    documentos_pendientes = db.query(Document).filter(
        Document.usuario_id == current_user.id,
        Document.estado == "pendiente"
    ).count()
    documentos_aprobados = db.query(Document).filter(
        Document.usuario_id == current_user.id,
        Document.estado == "aprobado"
    ).count()
    
    # Horas trabajadas recientes (últimos 7 días)
    hace_7_dias = hoy - timedelta(days=7)
    horas_recientes = db.query(Hours).filter(
        Hours.usuario_id == current_user.id,
        Hours.fecha >= hace_7_dias
    ).order_by(desc(Hours.fecha)).limit(10).all()
    
    # Documentos recientes
    documentos_recientes = db.query(Document).filter(
        Document.usuario_id == current_user.id
    ).order_by(desc(Document.fecha_creacion)).limit(5).all()
    
    return DocenteDashboard(
        usuario=f"{current_user.nombre} {current_user.apellido}",
        rol="Docente",
        estadisticas=DocenteStats(
            total_horas_mes=total_horas_mes,
            total_documentos=total_documentos,
            documentos_pendientes=documentos_pendientes,
            documentos_aprobados=documentos_aprobados
        ),
        horas_recientes=[
            {
                "fecha": hr.fecha.isoformat(),
                "horas": hr.horas_totales,
                "observaciones": hr.observaciones or ""
            } for hr in horas_recientes
        ],
        documentos_recientes=[
            {
                "titulo": doc.titulo,
                "tipo": doc.tipo_documento,
                "estado": doc.estado,
                "fecha": doc.fecha_creacion.isoformat()
            } for doc in documentos_recientes
        ],
        observaciones=[
            "Recuerda registrar tus horas trabajadas diariamente",
            "Tienes documentos pendientes de aprobación" if documentos_pendientes > 0 else "Todos tus documentos están al día"
        ]
    )

@router.get("/rrhh", response_model=RRHHDashboard)
def get_rrhh_dashboard(current_user: User = Depends(require_rrhh), db: Session = Depends(get_db)):
    """Dashboard específico para RRHH"""
    
    # Estadísticas RRHH
    total_usuarios = db.query(User).count()
    documentos_pendientes = db.query(Document).filter(Document.estado == "pendiente").count()
    accesos_hoy = 0  # Placeholder - implementar sistema de logs
    usuarios_activos = total_usuarios  # Placeholder
    
    # Documentos por revisar
    documentos_por_revisar = db.query(Document).filter(
        Document.estado == "pendiente"
    ).order_by(desc(Document.fecha_creacion)).limit(10).all()
    
    return RRHHDashboard(
        usuario=f"{current_user.nombre} {current_user.apellido}",
        rol="RRHH",
        estadisticas=RRHHStats(
            total_usuarios=total_usuarios,
            documentos_pendientes=documentos_pendientes,
            accesos_hoy=accesos_hoy,
            usuarios_activos=usuarios_activos
        ),
        documentos_por_revisar=[
            {
                "id": doc.id,
                "titulo": doc.titulo,
                "tipo": doc.tipo_documento,
                "usuario": f"Usuario ID: {doc.usuario_id}",
                "fecha": doc.fecha_creacion.isoformat()
            } for doc in documentos_por_revisar
        ],
        reportes_accesos=[],  # Placeholder
        notificaciones=[
            f"Tienes {documentos_pendientes} documentos pendientes de revisión",
            "Sistema funcionando correctamente"
        ]
    )

@router.get("/contabilidad", response_model=ContabilidadDashboard)
def get_contabilidad_dashboard(current_user: User = Depends(require_contabilidad), db: Session = Depends(get_db)):
    """Dashboard específico para Contabilidad"""
    
    return ContabilidadDashboard(
        usuario=f"{current_user.nombre} {current_user.apellido}",
        rol="Contabilidad",
        estadisticas=ContabilidadStats(
            total_pagos_mes=0.0,  # Placeholder
            boletas_generadas=0,  # Placeholder
            reportes_pendientes=0  # Placeholder
        ),
        pagos_recientes=[],  # Placeholder
        boletas_pendientes=[]  # Placeholder
    )

@router.get("/administracion", response_model=AdministracionDashboard)
def get_administracion_dashboard(current_user: User = Depends(require_administracion), db: Session = Depends(get_db)):
    """Dashboard específico para Administración"""
    
    total_usuarios = db.query(User).count()
    total_documentos = db.query(Document).count()
    
    return AdministracionDashboard(
        usuario=f"{current_user.nombre} {current_user.apellido}",
        rol="Administración",
        estadisticas=AdministracionStats(
            total_usuarios=total_usuarios,
            total_documentos=total_documentos,
            actividad_sistema=100,  # Placeholder
            indicadores_generales={"uptime": "99.9%", "usuarios_activos": total_usuarios}
        ),
        resumen_actividades=[
            {"actividad": "Usuarios registrados", "cantidad": total_usuarios},
            {"actividad": "Documentos totales", "cantidad": total_documentos}
        ],
        indicadores={"rendimiento": "Óptimo", "estado": "Activo"}
    )

@router.get("/ti", response_model=TIDashboard)
def get_ti_dashboard(current_user: User = Depends(require_ti), db: Session = Depends(get_db)):
    """Dashboard específico para Área TI"""
    
    usuarios_sistema = db.query(User).count()
    
    return TIDashboard(
        usuario=f"{current_user.nombre} {current_user.apellido}",
        rol="Área TI",
        estadisticas=TIStats(
            usuarios_sistema=usuarios_sistema,
            logs_errores=0,  # Placeholder
            uptime_sistema=99.9,  # Placeholder
            consultas_bd=1000  # Placeholder
        ),
        logs_sistema=[],  # Placeholder
        usuarios_conectados=[
            {"usuario": user.nombre, "último_acceso": "Activo"} 
            for user in db.query(User).limit(5).all()
        ],
        mantenimientos=[
            "Sistema actualizado y funcionando correctamente",
            "Base de datos optimizada"
        ]
    )