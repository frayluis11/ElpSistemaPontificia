from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

# Schemas para User
class UserBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=50)
    apellido: str = Field(..., min_length=2, max_length=50)
    dni: str = Field(..., min_length=8, max_length=8, pattern="^[0-9]{8}$")
    correo_institucional: EmailStr
    rol_id: int

class UserCreate(UserBase):
    contraseña: str = Field(..., min_length=8, max_length=100)

class UserUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=50)
    apellido: Optional[str] = Field(None, min_length=2, max_length=50)
    correo_institucional: Optional[EmailStr] = None
    rol_id: Optional[int] = None

class UserResponse(UserBase):
    id: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    
    class Config:
        from_attributes = True

class UserWithRelations(UserResponse):
    documentos: Optional[List['DocumentResponse']] = []
    horas_trabajadas: Optional[List['HoursResponse']] = []