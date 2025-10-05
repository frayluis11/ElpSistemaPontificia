from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_admin_or_ti, require_rrhh_or_admin
from ..models.user import User
from ..schemas.user import UserCreate, UserUpdate, UserResponse
from passlib.context import CryptContext

router = APIRouter(prefix="/users", tags=["users"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# CREATE - Crear nuevo usuario (solo Admin o TI)
@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_ti)):
    # Verificar si el DNI ya existe
    db_user = db.query(User).filter(User.dni == user.dni).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DNI ya está registrado"
        )
    
    # Verificar si el correo ya existe
    db_user = db.query(User).filter(User.correo_institucional == user.correo_institucional).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo institucional ya está registrado"
        )
    
    # Crear hash de la contraseña
    hashed_password = pwd_context.hash(user.contraseña)
    
    # Crear el usuario
    db_user = User(
        nombre=user.nombre,
        apellido=user.apellido,
        dni=user.dni,
        correo_institucional=user.correo_institucional,
        contraseña_hash=hashed_password,
        rol_id=user.rol_id
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# READ - Obtener todos los usuarios (solo RRHH o Admin)
@router.get("/", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(require_rrhh_or_admin)):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

# READ - Obtener usuario por ID
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

# READ - Obtener perfil del usuario actual
@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

# READ - Obtener usuario por DNI
@router.get("/dni/{dni}", response_model=UserResponse)
def get_user_by_dni(dni: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.dni == dni).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    return user

# UPDATE - Actualizar usuario
@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

# DELETE - Eliminar usuario (solo Admin o TI)
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_admin_or_ti)):
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    db.delete(user)
    db.commit()
    return None