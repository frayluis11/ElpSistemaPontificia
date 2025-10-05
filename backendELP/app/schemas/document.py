from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional

# Schemas para Document
class DocumentBase(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=200)
    tipo_documento: str = Field(..., min_length=2, max_length=50)
    ruta_archivo: Optional[str] = Field(None, max_length=500)
    usuario_id: int
    estado: Optional[str] = Field("pendiente", pattern="^(pendiente|aprobado|rechazado)$")
    observaciones: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=2, max_length=200)
    tipo_documento: Optional[str] = Field(None, min_length=2, max_length=50)
    ruta_archivo: Optional[str] = Field(None, max_length=500)
    estado: Optional[str] = Field(None, pattern="^(pendiente|aprobado|rechazado)$")
    observaciones: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: int
    fecha_emision: datetime
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True