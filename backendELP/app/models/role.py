from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base

class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre_rol = Column(String(50), unique=True, nullable=False, index=True)
    descripcion = Column(String(255), nullable=True)
    
    # Relaciones
    usuarios = relationship("User", back_populates="rol")
    
    def __repr__(self):
        return f"<Role(id={self.id}, nombre_rol='{self.nombre_rol}')>"