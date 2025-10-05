from pydantic import BaseModel, Field
from typing import Optional, List

# Schemas para Role
class RoleBase(BaseModel):
    nombre_rol: str = Field(..., min_length=2, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)

class RoleCreate(RoleBase):
    pass

class RoleUpdate(BaseModel):
    nombre_rol: Optional[str] = Field(None, min_length=2, max_length=50)
    descripcion: Optional[str] = Field(None, max_length=255)

class RoleResponse(RoleBase):
    id: int
    
    class Config:
        from_attributes = True

class RoleWithUsers(RoleResponse):
    usuarios: Optional[List['UserResponse']] = []