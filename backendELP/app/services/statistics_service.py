from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_, extract, text
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import calendar

from ..models.user import User
from ..models.role import Role
from ..models.document import Document, DocumentAccess
from ..models.hours import Hours


class StatisticsService:
    """Servicio para generar estadísticas y métricas del sistema"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_general_stats(self) -> Dict[str, Any]:
        """Estadísticas generales del sistema"""
        
        # Conteos básicos
        total_users = self.db.query(User).count()
        total_documents = self.db.query(Document).count()
        total_hours = self.db.query(func.sum(Hours.horas_dictadas)).scalar() or 0
        
        # Documentos por estado
        docs_by_status = self.db.query(
            Document.estado, func.count(Document.id)
        ).group_by(Document.estado).all()
        
        docs_status_dict = {status: count for status, count in docs_by_status}
        
        # Usuarios por rol
        users_by_role = self.db.query(
            Role.nombre_rol, func.count(User.id)
        ).join(User, Role.id == User.rol_id).group_by(Role.nombre_rol).all()
        
        users_role_dict = {role: count for role, count in users_by_role}
        
        # Documentos subidos por mes (últimos 6 meses)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_docs = self.db.query(
            extract('year', Document.fecha_creacion).label('year'),
            extract('month', Document.fecha_creacion).label('month'),
            func.count(Document.id).label('count')
        ).filter(
            Document.fecha_creacion >= six_months_ago
        ).group_by(
            extract('year', Document.fecha_creacion),
            extract('month', Document.fecha_creacion)
        ).order_by('year', 'month').all()
        
        monthly_data = []
        for year, month, count in monthly_docs:
            month_name = calendar.month_name[int(month)]
            monthly_data.append({
                "period": f"{month_name} {int(year)}",
                "documents": count
            })
        
        # Actividad reciente (últimos 7 días)
        week_ago = datetime.now() - timedelta(days=7)
        recent_activity = self.db.query(func.count(DocumentAccess.id)).filter(
            DocumentAccess.fecha_acceso >= week_ago
        ).scalar() or 0
        
        return {
            "resumen": {
                "total_usuarios": total_users,
                "total_documentos": total_documents,
                "total_horas_dictadas": float(total_hours),
                "actividad_reciente": recent_activity
            },
            "documentos_por_estado": docs_status_dict,
            "usuarios_por_rol": users_role_dict,
            "documentos_mensuales": monthly_data,
            "fecha_actualizacion": datetime.now().isoformat()
        }
    
    def get_rrhh_stats(self) -> Dict[str, Any]:
        """Estadísticas específicas para RRHH"""
        
        # Usuarios activos vs inactivos
        active_users = self.db.query(User).filter(User.is_active == True).count()
        inactive_users = self.db.query(User).filter(User.is_active == False).count()
        
        # Documentos pendientes de aprobación
        pending_docs = self.db.query(Document).filter(
            Document.estado == "pendiente"
        ).count()
        
        # Horas por docente (top 10)
        hours_by_teacher = self.db.query(
            User.nombre, User.apellido, func.sum(Hours.horas_dictadas)
        ).join(Hours, User.id == Hours.usuario_id).join(
            Role, User.rol_id == Role.id
        ).filter(
            Role.nombre_rol == "Docente"
        ).group_by(User.id, User.nombre, User.apellido).order_by(
            desc(func.sum(Hours.horas_dictadas))
        ).limit(10).all()
        
        teachers_hours = [{
            "nombre": f"{nombre} {apellido}",
            "horas": float(horas or 0)
        } for nombre, apellido, horas in hours_by_teacher]
        
        # Documentos por tipo
        docs_by_type = self.db.query(
            Document.tipo_documento, func.count(Document.id)
        ).group_by(Document.tipo_documento).all()
        
        docs_type_dict = {tipo: count for tipo, count in docs_by_type}
        
        # Solicitudes del mes actual
        current_month = datetime.now().replace(day=1)
        monthly_requests = self.db.query(Document).filter(
            Document.fecha_creacion >= current_month
        ).count()
        
        return {
            "usuarios": {
                "activos": active_users,
                "inactivos": inactive_users,
                "total": active_users + inactive_users
            },
            "documentos": {
                "pendientes_aprobacion": pending_docs,
                "solicitudes_mes": monthly_requests,
                "por_tipo": docs_type_dict
            },
            "docentes": {
                "top_horas": teachers_hours,
                "total_docentes": len(teachers_hours)
            },
            "fecha_actualizacion": datetime.now().isoformat()
        }
    
    def get_docentes_stats(self, user_id: int) -> Dict[str, Any]:
        """Estadísticas específicas para un docente"""
        
        # Información del docente
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return {}
        
        # Horas del docente
        total_hours = self.db.query(func.sum(Hours.horas_dictadas)).filter(
            Hours.usuario_id == user_id
        ).scalar() or 0
        
        # Horas por mes (últimos 6 meses)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_hours = self.db.query(
            extract('year', Hours.fecha_clase).label('year'),
            extract('month', Hours.fecha_clase).label('month'),
            func.sum(Hours.horas_dictadas).label('total_hours')
        ).filter(
            and_(Hours.usuario_id == user_id, Hours.fecha_clase >= six_months_ago)
        ).group_by(
            extract('year', Hours.fecha_clase),
            extract('month', Hours.fecha_clase)
        ).order_by('year', 'month').all()
        
        monthly_data = []
        for year, month, hours in monthly_hours:
            month_name = calendar.month_name[int(month)]
            monthly_data.append({
                "period": f"{month_name} {int(year)}",
                "horas": float(hours or 0)
            })
        
        # Documentos del docente
        user_docs = self.db.query(Document).filter(
            Document.usuario_id == user_id
        ).count()
        
        # Documentos por estado
        docs_status = self.db.query(
            Document.estado, func.count(Document.id)
        ).filter(
            Document.usuario_id == user_id
        ).group_by(Document.estado).all()
        
        docs_status_dict = {status: count for status, count in docs_status}
        
        # Promedio mensual de horas
        months_with_hours = len(monthly_data)
        avg_monthly_hours = float(total_hours) / max(months_with_hours, 1)
        
        return {
            "docente": {
                "nombre": f"{user.nombre} {user.apellido}",
                "email": user.email,
                "activo": user.is_active
            },
            "horas": {
                "total": float(total_hours),
                "promedio_mensual": round(avg_monthly_hours, 2),
                "por_mes": monthly_data
            },
            "documentos": {
                "total": user_docs,
                "por_estado": docs_status_dict
            },
            "fecha_actualizacion": datetime.now().isoformat()
        }
    
    def get_contabilidad_stats(self) -> Dict[str, Any]:
        """Estadísticas específicas para Contabilidad"""
        
        # Cálculos de horas y pagos (simulado)
        total_hours = self.db.query(func.sum(Hours.horas_dictadas)).scalar() or 0
        
        # Horas por docente para cálculos de pago
        payment_data = self.db.query(
            User.nombre, User.apellido, User.email,
            func.sum(Hours.horas_dictadas).label('total_hours')
        ).join(Hours, User.id == Hours.usuario_id).join(
            Role, User.rol_id == Role.id
        ).filter(
            Role.nombre_rol == "Docente"
        ).group_by(User.id, User.nombre, User.apellido, User.email).all()
        
        # Simular cálculo de pagos (valor por hora ficticio)
        VALOR_HORA = 25000  # Valor en pesos
        payment_summary = []
        total_to_pay = 0
        
        for nombre, apellido, email, hours in payment_data:
            hours_float = float(hours or 0)
            payment = hours_float * VALOR_HORA
            total_to_pay += payment
            
            payment_summary.append({
                "docente": f"{nombre} {apellido}",
                "email": email,
                "horas": hours_float,
                "pago_calculado": payment
            })
        
        # Documentos relacionados con contabilidad
        contabilidad_docs = self.db.query(Document).filter(
            or_(
                Document.tipo_documento.like('%contab%'),
                Document.tipo_documento.like('%pago%'),
                Document.tipo_documento.like('%factur%')
            )
        ).count()
        
        # Resumen por mes para presupuesto
        current_month = datetime.now().replace(day=1)
        monthly_hours = self.db.query(func.sum(Hours.horas_dictadas)).filter(
            Hours.fecha_clase >= current_month
        ).scalar() or 0
        
        monthly_payment = float(monthly_hours) * VALOR_HORA
        
        return {
            "resumen_pagos": {
                "total_horas": float(total_hours),
                "valor_por_hora": VALOR_HORA,
                "total_a_pagar": total_to_pay,
                "docentes_activos": len(payment_summary)
            },
            "mes_actual": {
                "horas": float(monthly_hours),
                "pago_estimado": monthly_payment
            },
            "detalle_docentes": payment_summary,
            "documentos_contabilidad": contabilidad_docs,
            "fecha_actualizacion": datetime.now().isoformat()
        }
    
    def get_ti_stats(self) -> Dict[str, Any]:
        """Estadísticas específicas para TI"""
        
        # Actividad del sistema
        total_accesses = self.db.query(DocumentAccess).count()
        
        # Accesos por día (últimos 7 días)
        week_ago = datetime.now() - timedelta(days=7)
        daily_accesses = self.db.query(
            func.date(DocumentAccess.fecha_acceso).label('date'),
            func.count(DocumentAccess.id).label('accesses')
        ).filter(
            DocumentAccess.fecha_acceso >= week_ago
        ).group_by(
            func.date(DocumentAccess.fecha_acceso)
        ).order_by('date').all()
        
        daily_data = [{
            "fecha": date.isoformat(),
            "accesos": count
        } for date, count in daily_accesses]
        
        # Tipos de archivos más comunes
        file_types = self.db.query(
            Document.tipo_mime, func.count(Document.id)
        ).group_by(Document.tipo_mime).order_by(
            desc(func.count(Document.id))
        ).limit(10).all()
        
        file_types_data = [{
            "tipo": tipo or "Desconocido",
            "cantidad": count
        } for tipo, count in file_types]
        
        # Espacio utilizado (simulado basado en tamaño de archivos)
        total_size = self.db.query(func.sum(Document.tamaño_archivo)).scalar() or 0
        total_size_mb = total_size / (1024 * 1024)  # Convertir a MB
        
        # Usuarios más activos
        active_users = self.db.query(
            User.nombre, User.apellido, func.count(DocumentAccess.id)
        ).join(DocumentAccess, User.id == DocumentAccess.usuario_id).group_by(
            User.id, User.nombre, User.apellido
        ).order_by(
            desc(func.count(DocumentAccess.id))
        ).limit(10).all()
        
        active_users_data = [{
            "usuario": f"{nombre} {apellido}",
            "accesos": count
        } for nombre, apellido, count in active_users]
        
        # Errores simulados (en un sistema real vendría de logs)
        errors_count = 0  # Placeholder
        
        return {
            "sistema": {
                "total_accesos": total_accesses,
                "espacio_usado_mb": round(total_size_mb, 2),
                "errores_recientes": errors_count,
                "total_archivos": self.db.query(Document).count()
            },
            "actividad_diaria": daily_data,
            "tipos_archivos": file_types_data,
            "usuarios_activos": active_users_data,
            "rendimiento": {
                "avg_response_time": "120ms",  # Simulado
                "uptime": "99.8%",  # Simulado
                "requests_per_minute": 45  # Simulado
            },
            "fecha_actualizacion": datetime.now().isoformat()
        }
    
    def get_alerts_and_notifications(self, user_role: str) -> List[Dict[str, Any]]:
        """Obtener alertas y notificaciones según el rol"""
        
        alerts = []
        
        if user_role in ["RRHH", "Administración"]:
            # Documentos pendientes de aprobación
            pending_count = self.db.query(Document).filter(
                Document.estado == "pendiente"
            ).count()
            
            if pending_count > 0:
                alerts.append({
                    "tipo": "warning",
                    "titulo": "Documentos Pendientes",
                    "mensaje": f"{pending_count} documentos esperan aprobación",
                    "prioridad": "alta"
                })
        
        if user_role == "Área TI":
            # Verificar espacio en disco (simulado)
            total_size = self.db.query(func.sum(Document.tamaño_archivo)).scalar() or 0
            size_gb = total_size / (1024 * 1024 * 1024)
            
            if size_gb > 5:  # Más de 5GB
                alerts.append({
                    "tipo": "error",
                    "titulo": "Espacio en Disco",
                    "mensaje": f"Uso alto de almacenamiento: {size_gb:.1f}GB",
                    "prioridad": "alta"
                })
        
        # Alertas generales
        inactive_users = self.db.query(User).filter(User.is_active == False).count()
        if inactive_users > 5:
            alerts.append({
                "tipo": "info",
                "titulo": "Usuarios Inactivos",
                "mensaje": f"{inactive_users} usuarios inactivos en el sistema",
                "prioridad": "media"
            })
        
        return alerts