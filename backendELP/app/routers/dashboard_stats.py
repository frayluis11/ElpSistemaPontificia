from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime

from ..core.database import get_db
from ..core.auth_deps import get_current_active_user
from ..models.user import User
from ..models.role import Role
from ..services.statistics_service import StatisticsService

router = APIRouter(prefix="/dashboard", tags=["dashboard-dynamic"])


@router.get("/data", response_model=Dict[str, Any])
async def get_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint principal del dashboard dinámico
    Retorna datos estructurados según el rol del usuario autenticado
    """
    # Obtener rol del usuario
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    role_name = user_role.nombre_rol if user_role else "Usuario"
    
    stats_service = StatisticsService(db)
    
    # Estructura base del dashboard
    dashboard_data = {
        "usuario": {
            "nombre": f"{current_user.nombre} {current_user.apellido}",
            "email": current_user.email,
            "rol": role_name,
            "activo": current_user.is_active
        },
        "fecha_actualizacion": datetime.now().isoformat(),
        "resumen_general": {},
        "por_rol": {},
        "indicadores": [],
        "alertas": [],
        "widgets": []
    }
    
    # Obtener alertas para el rol
    alertas = stats_service.get_alerts_and_notifications(role_name)
    dashboard_data["alertas"] = alertas
    
    # Configurar datos según el rol
    if role_name in ["RRHH", "Administración"]:
        # Datos completos para RRHH y Administración
        general_stats = stats_service.get_general_stats()
        rrhh_stats = stats_service.get_rrhh_stats()
        
        dashboard_data["resumen_general"] = general_stats["resumen"]
        dashboard_data["por_rol"] = {
            "tipo": "rrhh_admin",
            "datos": {
                "usuarios": rrhh_stats["usuarios"],
                "documentos": rrhh_stats["documentos"],
                "docentes": rrhh_stats["docentes"]
            }
        }
        
        # Indicadores clave para RRHH
        dashboard_data["indicadores"] = [
            {
                "titulo": "Usuarios Activos",
                "valor": rrhh_stats["usuarios"]["activos"],
                "tipo": "number",
                "icono": "users",
                "color": "green"
            },
            {
                "titulo": "Documentos Pendientes",
                "valor": rrhh_stats["documentos"]["pendientes_aprobacion"],
                "tipo": "number",
                "icono": "clock",
                "color": "orange"
            },
            {
                "titulo": "Total Documentos",
                "valor": general_stats["resumen"]["total_documentos"],
                "tipo": "number",
                "icono": "file",
                "color": "blue"
            },
            {
                "titulo": "Horas Dictadas",
                "valor": f"{general_stats['resumen']['total_horas_dictadas']:.1f}",
                "tipo": "decimal",
                "icono": "clock",
                "color": "purple"
            }
        ]
        
        # Widgets específicos para RRHH
        dashboard_data["widgets"] = [
            {
                "tipo": "chart",
                "titulo": "Documentos por Mes",
                "datos": general_stats["documentos_mensuales"],
                "configuracion": {"tipo_grafico": "line"}
            },
            {
                "tipo": "chart",
                "titulo": "Top Docentes por Horas",
                "datos": rrhh_stats["docentes"]["top_horas"][:5],
                "configuracion": {"tipo_grafico": "bar"}
            },
            {
                "tipo": "table",
                "titulo": "Usuarios por Rol",
                "datos": general_stats["usuarios_por_rol"],
                "configuracion": {"mostrar_totales": True}
            }
        ]
    
    elif role_name == "Docente":
        # Datos específicos para docentes
        docente_stats = stats_service.get_docentes_stats(current_user.id)
        
        dashboard_data["por_rol"] = {
            "tipo": "docente",
            "datos": docente_stats
        }
        
        # Indicadores para docentes
        dashboard_data["indicadores"] = [
            {
                "titulo": "Total Horas",
                "valor": f"{docente_stats['horas']['total']:.1f}",
                "tipo": "decimal",
                "icono": "clock",
                "color": "blue"
            },
            {
                "titulo": "Promedio Mensual",
                "valor": f"{docente_stats['horas']['promedio_mensual']:.1f}",
                "tipo": "decimal",
                "icono": "trending-up",
                "color": "green"
            },
            {
                "titulo": "Mis Documentos",
                "valor": docente_stats["documentos"]["total"],
                "tipo": "number",
                "icono": "file",
                "color": "purple"
            }
        ]
        
        # Widgets para docentes
        dashboard_data["widgets"] = [
            {
                "tipo": "chart",
                "titulo": "Mis Horas por Mes",
                "datos": docente_stats["horas"]["por_mes"],
                "configuracion": {"tipo_grafico": "area"}
            },
            {
                "tipo": "table",
                "titulo": "Estado de Documentos",
                "datos": docente_stats["documentos"]["por_estado"],
                "configuracion": {"mostrar_porcentajes": True}
            }
        ]
    
    elif role_name == "Contabilidad":
        # Datos específicos para contabilidad
        contab_stats = stats_service.get_contabilidad_stats()
        
        dashboard_data["por_rol"] = {
            "tipo": "contabilidad",
            "datos": contab_stats
        }
        
        # Indicadores para contabilidad
        dashboard_data["indicadores"] = [
            {
                "titulo": "Total a Pagar",
                "valor": f"${contab_stats['resumen_pagos']['total_a_pagar']:,.0f}",
                "tipo": "currency",
                "icono": "dollar-sign",
                "color": "green"
            },
            {
                "titulo": "Horas Totales",
                "valor": f"{contab_stats['resumen_pagos']['total_horas']:.1f}",
                "tipo": "decimal",
                "icono": "clock",
                "color": "blue"
            },
            {
                "titulo": "Docentes Activos",
                "valor": contab_stats["resumen_pagos"]["docentes_activos"],
                "tipo": "number",
                "icono": "users",
                "color": "purple"
            },
            {
                "titulo": "Pago Mes Actual",
                "valor": f"${contab_stats['mes_actual']['pago_estimado']:,.0f}",
                "tipo": "currency",
                "icono": "calendar",
                "color": "orange"
            }
        ]
        
        # Widgets para contabilidad
        dashboard_data["widgets"] = [
            {
                "tipo": "table",
                "titulo": "Pagos por Docente",
                "datos": contab_stats["detalle_docentes"][:10],
                "configuracion": {"mostrar_totales": True, "formato_moneda": True}
            }
        ]
    
    elif role_name == "Área TI":
        # Datos específicos para TI
        ti_stats = stats_service.get_ti_stats()
        
        dashboard_data["por_rol"] = {
            "tipo": "ti",
            "datos": ti_stats
        }
        
        # Indicadores para TI
        dashboard_data["indicadores"] = [
            {
                "titulo": "Total Accesos",
                "valor": ti_stats["sistema"]["total_accesos"],
                "tipo": "number",
                "icono": "activity",
                "color": "blue"
            },
            {
                "titulo": "Espacio Usado",
                "valor": f"{ti_stats['sistema']['espacio_usado_mb']:.1f} MB",
                "tipo": "storage",
                "icono": "hard-drive",
                "color": "orange"
            },
            {
                "titulo": "Uptime",
                "valor": ti_stats["rendimiento"]["uptime"],
                "tipo": "percentage",
                "icono": "server",
                "color": "green"
            },
            {
                "titulo": "Req/Min",
                "valor": ti_stats["rendimiento"]["requests_per_minute"],
                "tipo": "number",
                "icono": "zap",
                "color": "purple"
            }
        ]
        
        # Widgets para TI
        dashboard_data["widgets"] = [
            {
                "tipo": "chart",
                "titulo": "Actividad Diaria",
                "datos": ti_stats["actividad_diaria"],
                "configuracion": {"tipo_grafico": "line"}
            },
            {
                "tipo": "chart",
                "titulo": "Tipos de Archivos",
                "datos": ti_stats["tipos_archivos"][:5],
                "configuracion": {"tipo_grafico": "pie"}
            },
            {
                "tipo": "table",
                "titulo": "Usuarios Más Activos",
                "datos": ti_stats["usuarios_activos"][:5],
                "configuracion": {"ordenar_por": "accesos"}
            }
        ]
    
    else:
        # Usuario genérico - datos básicos
        general_stats = stats_service.get_general_stats()
        
        dashboard_data["resumen_general"] = {
            "total_documentos": general_stats["resumen"]["total_documentos"],
            "actividad_reciente": general_stats["resumen"]["actividad_reciente"]
        }
        
        dashboard_data["indicadores"] = [
            {
                "titulo": "Documentos en Sistema",
                "valor": general_stats["resumen"]["total_documentos"],
                "tipo": "number",
                "icono": "file",
                "color": "blue"
            }
        ]
    
    return dashboard_data


@router.get("/widgets/{widget_type}", response_model=Dict[str, Any])
async def get_specific_widget_data(
    widget_type: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Obtener datos específicos para un widget del dashboard
    Permite cargar widgets individuales de forma asíncrona
    """
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    role_name = user_role.nombre_rol if user_role else "Usuario"
    
    stats_service = StatisticsService(db)
    
    widget_data = {
        "tipo": widget_type,
        "usuario_rol": role_name,
        "datos": {},
        "fecha_actualizacion": datetime.now().isoformat()
    }
    
    # Determinar qué datos cargar según el tipo de widget y rol
    if widget_type == "activity_chart" and role_name == "Área TI":
        ti_stats = stats_service.get_ti_stats()
        widget_data["datos"] = {
            "titulo": "Actividad del Sistema",
            "series": ti_stats["actividad_diaria"],
            "configuracion": {"tipo_grafico": "line", "color": "#3B82F6"}
        }
    
    elif widget_type == "hours_chart" and role_name == "Docente":
        docente_stats = stats_service.get_docentes_stats(current_user.id)
        widget_data["datos"] = {
            "titulo": "Mis Horas por Mes",
            "series": docente_stats["horas"]["por_mes"],
            "configuracion": {"tipo_grafico": "area", "color": "#10B981"}
        }
    
    elif widget_type == "documents_chart" and role_name in ["RRHH", "Administración"]:
        general_stats = stats_service.get_general_stats()
        widget_data["datos"] = {
            "titulo": "Documentos Mensuales",
            "series": general_stats["documentos_mensuales"],
            "configuracion": {"tipo_grafico": "bar", "color": "#8B5CF6"}
        }
    
    elif widget_type == "payments_table" and role_name == "Contabilidad":
        contab_stats = stats_service.get_contabilidad_stats()
        widget_data["datos"] = {
            "titulo": "Resumen de Pagos",
            "filas": contab_stats["detalle_docentes"][:10],
            "configuracion": {"formato_moneda": True, "columnas": ["docente", "horas", "pago_calculado"]}
        }
    
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Widget '{widget_type}' no encontrado o no disponible para el rol '{role_name}'"
        )
    
    return widget_data


@router.get("/refresh", response_model=Dict[str, Any])
async def refresh_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint para refrescar los datos del dashboard
    Retorna timestamp de última actualización y resumen de cambios
    """
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    role_name = user_role.nombre_rol if user_role else "Usuario"
    
    stats_service = StatisticsService(db)
    
    # Obtener conteos básicos para verificar cambios
    general_stats = stats_service.get_general_stats()
    alertas = stats_service.get_alerts_and_notifications(role_name)
    
    return {
        "usuario": f"{current_user.nombre} {current_user.apellido}",
        "rol": role_name,
        "ultima_actualizacion": datetime.now().isoformat(),
        "resumen_cambios": {
            "total_documentos": general_stats["resumen"]["total_documentos"],
            "actividad_reciente": general_stats["resumen"]["actividad_reciente"],
            "alertas_pendientes": len(alertas)
        },
        "status": "actualizado"
    }