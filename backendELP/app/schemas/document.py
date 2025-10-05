from pydantic import BaseModel, Field
from datetime import datetime, date
from typing import Optional, List

# Schemas para Document
class DocumentBase(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=200)
    tipo_documento: str = Field(..., min_length=2, max_length=50)
    estado: Optional[str] = Field("pendiente", pattern="^(pendiente|aprobado|rechazado)$")
    observaciones: Optional[str] = None
    es_publico: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True
    acceso_roles: Optional[str] = None  # JSON string con roles

class DocumentCreate(BaseModel):
    titulo: str = Field(..., min_length=2, max_length=200)
    tipo_documento: str = Field(..., min_length=2, max_length=50)
    observaciones: Optional[str] = None
    es_publico: Optional[bool] = False
    requiere_aprobacion: Optional[bool] = True
    acceso_roles: Optional[List[str]] = None  # Lista de roles que pueden acceder

class DocumentUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=2, max_length=200)
    tipo_documento: Optional[str] = Field(None, min_length=2, max_length=50)
    estado: Optional[str] = Field(None, pattern="^(pendiente|aprobado|rechazado)$")
    observaciones: Optional[str] = None
    es_publico: Optional[bool] = None
    requiere_aprobacion: Optional[bool] = None
    acceso_roles: Optional[List[str]] = None

class DocumentResponse(BaseModel):
    id: int
    titulo: str
    tipo_documento: str
    nombre_archivo: str
    tamaño_archivo: int
    tipo_mime: str
    fecha_emision: datetime
    usuario_id: int
    estado: str
    observaciones: Optional[str]
    es_publico: bool
    requiere_aprobacion: bool
    acceso_roles: Optional[str]
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    contador_descargas: int
    
    class Config:
        from_attributes = True

class DocumentWithUser(DocumentResponse):
    usuario_nombre: str
    usuario_apellido: str

# Schemas para DocumentAccess
class DocumentAccessCreate(BaseModel):
    documento_id: int
    accion: str = Field(..., pattern="^(descarga|visualizacion|actualizacion)$")
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class DocumentAccessResponse(BaseModel):
    id: int
    documento_id: int
    usuario_id: int
    accion: str
    fecha_acceso: datetime
    ip_address: Optional[str]
    
    class Config:
        from_attributes = True

# Schema para upload de archivo
class FileUploadResponse(BaseModel):
    message: str
    document_id: int
    filename: str
    size: int
    tipo_mime: str