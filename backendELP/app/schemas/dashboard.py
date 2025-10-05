from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Dict, Optional, Any

# Schemas para Dashboard Docente
class DocenteStats(BaseModel):
    total_horas_mes: float
    total_documentos: int
    documentos_pendientes: int
    documentos_aprobados: int

class DocenteDashboard(BaseModel):
    usuario: str
    rol: str
    estadisticas: DocenteStats
    horas_recientes: List[Dict[str, Any]]
    documentos_recientes: List[Dict[str, Any]]
    observaciones: List[str]

# Schemas para Dashboard RRHH
class RRHHStats(BaseModel):
    total_usuarios: int
    documentos_pendientes: int
    accesos_hoy: int
    usuarios_activos: int

class RRHHDashboard(BaseModel):
    usuario: str
    rol: str
    estadisticas: RRHHStats
    documentos_por_revisar: List[Dict[str, Any]]
    reportes_accesos: List[Dict[str, Any]]
    notificaciones: List[str]

# Schemas para Dashboard Contabilidad
class ContabilidadStats(BaseModel):
    total_pagos_mes: float
    boletas_generadas: int
    reportes_pendientes: int

class ContabilidadDashboard(BaseModel):
    usuario: str
    rol: str
    estadisticas: ContabilidadStats
    pagos_recientes: List[Dict[str, Any]]
    boletas_pendientes: List[Dict[str, Any]]

# Schemas para Dashboard Administración
class AdministracionStats(BaseModel):
    total_usuarios: int
    total_documentos: int
    actividad_sistema: int
    indicadores_generales: Dict[str, Any]

class AdministracionDashboard(BaseModel):
    usuario: str
    rol: str
    estadisticas: AdministracionStats
    resumen_actividades: List[Dict[str, Any]]
    indicadores: Dict[str, Any]

# Schemas para Dashboard Área TI
class TIStats(BaseModel):
    usuarios_sistema: int
    logs_errores: int
    uptime_sistema: float
    consultas_bd: int

class TIDashboard(BaseModel):
    usuario: str
    rol: str
    estadisticas: TIStats
    logs_sistema: List[Dict[str, Any]]
    usuarios_conectados: List[Dict[str, Any]]
    mantenimientos: List[str]