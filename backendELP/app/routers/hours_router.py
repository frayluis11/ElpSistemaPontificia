from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import date, timedelta
from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_rrhh_or_admin
from ..models.hours import Hours
from ..models.user import User
from ..models.role import Role
from ..schemas.hours import HoursCreate, HoursUpdate, HoursResponse

router = APIRouter(prefix="/hours", tags=["hours"])

# CREATE - Crear nuevo registro de horas (solo para el usuario actual)
@router.post("/", response_model=HoursResponse, status_code=status.HTTP_201_CREATED)
def create_hours(
    hours: HoursCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verificar si ya existe un registro para el usuario en esa fecha
    existing_hours = db.query(Hours).filter(
        Hours.usuario_id == hours.usuario_id,
        Hours.fecha == hours.fecha
    ).first()
    
    if existing_hours:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe un registro de horas para este usuario en esta fecha"
        )
    
    db_hours = Hours(
        usuario_id=hours.usuario_id,
        fecha=hours.fecha,
        horas_totales=hours.horas_totales,
        observaciones=hours.observaciones
    )
    
    db.add(db_hours)
    db.commit()
    db.refresh(db_hours)
    return db_hours

# READ - Obtener registros de horas según permisos
@router.get("/", response_model=List[HoursResponse])
def get_hours(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    # RRHH y Admin ven todas las horas
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        hours = db.query(Hours).offset(skip).limit(limit).all()
    else:
        # Usuario normal solo ve sus horas
        hours = db.query(Hours).filter(
            Hours.usuario_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return hours

# READ - Obtener registro por ID (solo propietario o RRHH/Admin)
@router.get("/{hours_id}", response_model=HoursResponse)
def get_hours_by_id(
    hours_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if (hours.usuario_id != current_user.id and 
        not (user_role and user_role.nombre_rol in ["RRHH", "Administración"])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este registro"
        )
    
    return hours

# READ - Obtener horas por usuario (solo propietario o RRHH/Admin)
@router.get("/user/{user_id}", response_model=List[HoursResponse])
def get_hours_by_user(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if (user_id != current_user.id and 
        not (user_role and user_role.nombre_rol in ["RRHH", "Administración"])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver las horas de otro usuario"
        )
    
    hours = db.query(Hours).filter(Hours.usuario_id == user_id).all()
    return hours

# READ - Obtener horas por fecha
@router.get("/date/{fecha}", response_model=List[HoursResponse])
def get_hours_by_date(fecha: date, db: Session = Depends(get_db)):
    hours = db.query(Hours).filter(Hours.fecha == fecha).all()
    return hours

# READ - Obtener horas por usuario y rango de fechas
@router.get("/user/{user_id}/range", response_model=List[HoursResponse])
def get_hours_by_user_date_range(
    user_id: int, 
    fecha_inicio: date, 
    fecha_fin: date, 
    db: Session = Depends(get_db)
):
    hours = db.query(Hours).filter(
        Hours.usuario_id == user_id,
        Hours.fecha >= fecha_inicio,
        Hours.fecha <= fecha_fin
    ).all()
    return hours

# UPDATE - Actualizar registro de horas (solo propietario o RRHH/Admin)
@router.put("/{hours_id}", response_model=HoursResponse)
def update_hours(
    hours_id: int, 
    hours_update: HoursUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if (hours.usuario_id != current_user.id and 
        not (user_role and user_role.nombre_rol in ["RRHH", "Administración"])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este registro"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = hours_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hours, field, value)
    
    db.commit()
    db.refresh(hours)
    return hours

# DELETE - Eliminar registro de horas (solo RRHH/Admin)
@router.delete("/{hours_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hours(
    hours_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_rrhh_or_admin)
):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    
    db.delete(hours)
    db.commit()
    return None


# ENDPOINTS ADICIONALES PARA FUNCIONALIDADES FALTANTES

# READ - Obtener mis horas (usuario actual)
@router.get("/my-hours", response_model=List[HoursResponse])
def get_my_hours(
    skip: int = 0,
    limit: int = 100,
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener horas del usuario actual con filtros opcionales"""
    query = db.query(Hours).filter(Hours.usuario_id == current_user.id)
    
    if fecha_inicio:
        query = query.filter(Hours.fecha >= fecha_inicio)
    if fecha_fin:
        query = query.filter(Hours.fecha <= fecha_fin)
    
    hours = query.offset(skip).limit(limit).all()
    return hours


# READ - Totales por período
@router.get("/user/{user_id}/total", response_model=Dict[str, Any])
def get_user_hours_total(
    user_id: int,
    periodo: str = "month",  # "week", "month", "quarter", "year"
    fecha_referencia: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Obtener totales de horas por período"""
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if (user_id != current_user.id and 
        not (user_role and user_role.nombre_rol in ["RRHH", "Administración"])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver totales de otro usuario"
        )
    
    if not fecha_referencia:
        fecha_referencia = date.today()
    
    # Calcular rango según período
    if periodo == "week":
        inicio = fecha_referencia - timedelta(days=fecha_referencia.weekday())
        fin = inicio + timedelta(days=6)
    elif periodo == "month":
        inicio = fecha_referencia.replace(day=1)
        if fecha_referencia.month == 12:
            fin = fecha_referencia.replace(year=fecha_referencia.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            fin = fecha_referencia.replace(month=fecha_referencia.month + 1, day=1) - timedelta(days=1)
    elif periodo == "quarter":
        quarter_start_month = ((fecha_referencia.month - 1) // 3) * 3 + 1
        inicio = fecha_referencia.replace(month=quarter_start_month, day=1)
        fin = (inicio + timedelta(days=92)).replace(day=1) - timedelta(days=1)
    elif periodo == "year":
        inicio = fecha_referencia.replace(month=1, day=1)
        fin = fecha_referencia.replace(month=12, day=31)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Período inválido. Use: week, month, quarter, year"
        )
    
    # Consultar horas en el período
    hours = db.query(Hours).filter(
        Hours.usuario_id == user_id,
        Hours.fecha >= inicio,
        Hours.fecha <= fin
    ).all()
    
    total_horas = sum(h.horas_totales for h in hours)
    dias_trabajados = len(set(h.fecha for h in hours))
    promedio_diario = total_horas / dias_trabajados if dias_trabajados > 0 else 0
    
    return {
        "usuario_id": user_id,
        "periodo": periodo,
        "fecha_inicio": inicio,
        "fecha_fin": fin,
        "total_horas": total_horas,
        "dias_trabajados": dias_trabajados,
        "promedio_diario": round(promedio_diario, 2),
        "registros": len(hours)
    }


# EXPORT - Exportar horas a Excel
@router.get("/export/excel")
async def export_hours_excel(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    usuario_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Exportar horas a Excel con filtros"""
    import pandas as pd
    from io import BytesIO
    from fastapi.responses import StreamingResponse
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    query = db.query(Hours, User).join(User, Hours.usuario_id == User.id)
    
    # Filtros de acceso por rol
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        # RRHH y Admin pueden exportar todas las horas
        if usuario_id:
            query = query.filter(Hours.usuario_id == usuario_id)
    else:
        # Usuario normal solo sus horas
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
            'Fecha Actualización': hours.fecha_actualizacion.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Crear DataFrame y Excel
    df = pd.DataFrame(data)
    
    # Crear archivo Excel en memoria
    excel_buffer = BytesIO()
    with pd.ExcelWriter(excel_buffer, engine='openpyxl') as writer:
        df.to_excel(writer, sheet_name='Horas Trabajadas', index=False)
        
        # Formatear hoja
        workbook = writer.book
        worksheet = writer.sheets['Horas Trabajadas']
        
        # Ajustar ancho de columnas
        for column in worksheet.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = min(max_length + 2, 50)
            worksheet.column_dimensions[column_letter].width = adjusted_width
    
    excel_buffer.seek(0)
    
    filename = f"horas_trabajadas_{date.today().strftime('%Y%m%d')}.xlsx"
    
    return StreamingResponse(
        BytesIO(excel_buffer.read()),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )