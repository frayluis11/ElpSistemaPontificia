from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..models.user import User
from ..models.role import Role
from ..schemas.auth import LoginSchema, LoginResponse, RegisterSchema

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """Login con DNI o correo institucional"""
    
    # Buscar usuario por DNI o correo
    user = None
    if "@" in login_data.username:
        # Es un correo
        user = db.query(User).filter(User.correo_institucional == login_data.username).first()
    else:
        # Es un DNI
        user = db.query(User).filter(User.dni == login_data.username).first()
    
    # Verificar usuario y contraseña
    if not user or not verify_password(login_data.password, user.contraseña_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Obtener rol del usuario
    user_role = db.query(Role).filter(Role.id == user.rol_id).first()
    
    # Crear token de acceso
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        nombre=user.nombre,
        apellido=user.apellido,
        rol=user_role.nombre_rol if user_role else "Sin rol",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60  # en segundos
    )

@router.post("/register", response_model=dict)
def register(register_data: RegisterSchema, db: Session = Depends(get_db)):
    """Registro de nuevo usuario"""
    
    # Verificar si el DNI ya existe
    existing_user = db.query(User).filter(User.dni == register_data.dni).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El DNI ya está registrado"
        )
    
    # Verificar si el correo ya existe
    existing_email = db.query(User).filter(User.correo_institucional == register_data.correo_institucional).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo institucional ya está registrado"
        )
    
    # Buscar el rol
    role = db.query(Role).filter(Role.nombre_rol == register_data.rol_nombre).first()
    if not role:
        # Crear el rol si no existe
        role = Role(
            nombre_rol=register_data.rol_nombre,
            descripcion=f"Rol {register_data.rol_nombre}"
        )
        db.add(role)
        db.commit()
        db.refresh(role)
    
    # Crear hash de la contraseña
    hashed_password = get_password_hash(register_data.contraseña)
    
    # Crear nuevo usuario
    new_user = User(
        nombre=register_data.nombre,
        apellido=register_data.apellido,
        dni=register_data.dni,
        correo_institucional=register_data.correo_institucional,
        contraseña_hash=hashed_password,
        rol_id=role.id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Usuario registrado exitosamente",
        "user_id": new_user.id,
        "nombre": new_user.nombre,
        "apellido": new_user.apellido,
        "rol": role.nombre_rol
    }

@router.post("/create-default-roles")
def create_default_roles(db: Session = Depends(get_db)):
    """Crear roles por defecto del sistema"""
    default_roles = [
        {"nombre_rol": "Docente", "descripcion": "Profesor/Docente de la institución"},
        {"nombre_rol": "RRHH", "descripcion": "Recursos Humanos - Gestión de personal"},
        {"nombre_rol": "Contabilidad", "descripcion": "Área de Contabilidad - Gestión financiera"},
        {"nombre_rol": "Administración", "descripcion": "Administración general"},
        {"nombre_rol": "Área TI", "descripcion": "Tecnologías de la Información - Gestión del sistema"}
    ]
    
    created_roles = []
    for role_data in default_roles:
        existing_role = db.query(Role).filter(Role.nombre_rol == role_data["nombre_rol"]).first()
        if not existing_role:
            new_role = Role(
                nombre_rol=role_data["nombre_rol"],
                descripcion=role_data["descripcion"]
            )
            db.add(new_role)
            created_roles.append(role_data["nombre_rol"])
    
    db.commit()
    
    return {
        "message": "Roles creados exitosamente",
        "created_roles": created_roles
    }