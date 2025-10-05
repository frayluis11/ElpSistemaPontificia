from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from ..core.database import get_db
from ..core.security import verify_token
from ..models.user import User
from ..models.role import Role

# Configurar HTTP Bearer para tokens JWT
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Obtener usuario actual desde el token JWT"""
    token = credentials.credentials
    user_id = verify_token(token)
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    """Verificar que el usuario esté activo"""
    return current_user

def require_role(allowed_roles: list):
    """Dependency factory para requerir roles específicos"""
    def role_checker(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
        user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
        if not user_role or user_role.nombre_rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de estos roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

# Dependencias específicas por rol
require_docente = require_role(["Docente"])
require_rrhh = require_role(["RRHH"])
require_contabilidad = require_role(["Contabilidad"])
require_administracion = require_role(["Administración"])
require_ti = require_role(["Área TI"])

# Dependencias para múltiples roles
require_admin_or_ti = require_role(["Administración", "Área TI"])
require_rrhh_or_admin = require_role(["RRHH", "Administración"])
require_contabilidad_or_admin = require_role(["Contabilidad", "Administración"])