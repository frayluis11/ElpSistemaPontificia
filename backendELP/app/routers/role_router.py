from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_admin_or_ti
from ..models.role import Role
from ..models.user import User
from ..schemas.role import RoleCreate, RoleUpdate, RoleResponse

router = APIRouter(prefix="/roles", tags=["roles"])

# CREATE - Crear nuevo rol (solo Admin o TI)
@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(role: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_ti)):
    # Verificar si el nombre del rol ya existe
    db_role = db.query(Role).filter(Role.nombre_rol == role.nombre_rol).first()
    if db_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del rol ya existe"
        )
    
    # Crear el rol
    db_role = Role(
        nombre_rol=role.nombre_rol,
        descripcion=role.descripcion
    )
    
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

# READ - Obtener todos los roles (usuarios autenticados)
@router.get("/", response_model=List[RoleResponse])
def get_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    roles = db.query(Role).offset(skip).limit(limit).all()
    return roles

# READ - Obtener rol por ID (usuarios autenticados)
@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    return role

# READ - Obtener rol por nombre (usuarios autenticados)
@router.get("/name/{role_name}", response_model=RoleResponse)
def get_role_by_name(role_name: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    role = db.query(Role).filter(Role.nombre_rol == role_name).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    return role

# UPDATE - Actualizar rol (solo Admin o TI)
@router.put("/{role_id}", response_model=RoleResponse)
def update_role(role_id: int, role_update: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_ti)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = role_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(role, field, value)
    
    db.commit()
    db.refresh(role)
    return role

# DELETE - Eliminar rol (solo Admin o TI)
@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_ti)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rol no encontrado"
        )
    
    db.delete(role)
    db.commit()
    return None