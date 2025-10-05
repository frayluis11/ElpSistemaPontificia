from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_rrhh_or_admin
from ..models.hours import Hours
from ..models.user import User
from ..models.role import Role
from ..schemas.hours import HoursCreate, HoursUpdate, HoursResponse

router = APIRouter(prefix="/hours", tags=["hours"])

# CREATE - Crear nuevo registro de horas
@router.post("/", response_model=HoursResponse, status_code=status.HTTP_201_CREATED)
def create_hours(hours: HoursCreate, db: Session = Depends(get_db)):
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

# READ - Obtener todos los registros de horas
@router.get("/", response_model=List[HoursResponse])
def get_hours(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    hours = db.query(Hours).offset(skip).limit(limit).all()
    return hours

# READ - Obtener registro por ID
@router.get("/{hours_id}", response_model=HoursResponse)
def get_hours_by_id(hours_id: int, db: Session = Depends(get_db)):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    return hours

# READ - Obtener horas por usuario
@router.get("/user/{user_id}", response_model=List[HoursResponse])
def get_hours_by_user(user_id: int, db: Session = Depends(get_db)):
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

# UPDATE - Actualizar registro de horas
@router.put("/{hours_id}", response_model=HoursResponse)
def update_hours(hours_id: int, hours_update: HoursUpdate, db: Session = Depends(get_db)):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = hours_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(hours, field, value)
    
    db.commit()
    db.refresh(hours)
    return hours

# DELETE - Eliminar registro de horas
@router.delete("/{hours_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hours(hours_id: int, db: Session = Depends(get_db)):
    hours = db.query(Hours).filter(Hours.id == hours_id).first()
    if hours is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registro de horas no encontrado"
        )
    
    db.delete(hours)
    db.commit()
    return None