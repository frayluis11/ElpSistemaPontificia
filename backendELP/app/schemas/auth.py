from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginSchema(BaseModel):
    username: str = Field(..., description="DNI o correo institucional")
    password: str = Field(..., min_length=8, description="Contraseña")

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    nombre: str
    apellido: str
    rol: str
    expires_in: int

class RegisterSchema(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=50)
    apellido: str = Field(..., min_length=2, max_length=50)
    dni: str = Field(..., min_length=8, max_length=8, pattern="^[0-9]{8}$")
    correo_institucional: EmailStr
    contraseña: str = Field(..., min_length=8, max_length=100)
    rol_nombre: str = Field(..., description="Nombre del rol: Docente, RRHH, Contabilidad, Administración, Área TI")

class TokenData(BaseModel):
    user_id: Optional[int] = None