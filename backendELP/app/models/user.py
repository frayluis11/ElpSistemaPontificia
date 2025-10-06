from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    apellido = Column(String(50), nullable=False)
    dni = Column(String(8), unique=True, nullable=False, index=True)
    correo_institucional = Column(String(100), unique=True, nullable=False, index=True)
    contraseña_hash = Column(String(255), nullable=False)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    rol = relationship("Role", back_populates="usuarios")
    documentos = relationship("Document", back_populates="usuario")
    horas_trabajadas = relationship("Hours", back_populates="usuario")
    
    def verificar_contraseña(self, contraseña: str) -> bool:
        """Verifica si la contraseña proporcionada coincide con el hash almacenado"""
        from ..core.security import verify_password
        return verify_password(contraseña, self.contraseña_hash)
    
    @staticmethod
    def generar_hash_contraseña(contraseña: str) -> str:
        """Genera un hash seguro de la contraseña"""
        from ..core.security import get_password_hash
        return get_password_hash(contraseña)
    
    def __repr__(self):
        return f"<User(id={self.id}, nombre='{self.nombre}', apellido='{self.apellido}', dni='{self.dni}')>"