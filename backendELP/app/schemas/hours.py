from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional

# Schemas para Hours
class HoursBase(BaseModel):
    usuario_id: int
    fecha: date
    horas_totales: float = Field(..., ge=0.0, le=24.0)  # Entre 0 y 24 horas
    observaciones: Optional[str] = None

class HoursCreate(HoursBase):
    pass

class HoursUpdate(BaseModel):
    fecha: Optional[date] = None
    horas_totales: Optional[float] = Field(None, ge=0.0, le=24.0)
    observaciones: Optional[str] = None

class HoursResponse(HoursBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True