from sqlalchemy import Column, Integer, Date, Float, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Hours(Base):
    __tablename__ = "hours"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    fecha = Column(Date, nullable=False, index=True)
    horas_totales = Column(Float, nullable=False)  # Puede incluir decimales para minutos
    observaciones = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    usuario = relationship("User", back_populates="horas_trabajadas")
    
    def __repr__(self):
        return f"<Hours(id={self.id}, usuario_id={self.usuario_id}, fecha='{self.fecha}', horas={self.horas_totales})>"