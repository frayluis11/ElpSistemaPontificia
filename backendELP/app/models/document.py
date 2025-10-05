from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    tipo_documento = Column(String(50), nullable=False)  # Ejemplo: "certificado", "solicitud", "informe", etc.
    fecha_emision = Column(DateTime, default=datetime.utcnow)
    ruta_archivo = Column(String(500), nullable=True)  # Ruta donde se almacena el archivo
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    estado = Column(String(20), default="pendiente")  # "pendiente", "aprobado", "rechazado"
    observaciones = Column(Text, nullable=True)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    usuario = relationship("User", back_populates="documentos")
    
    def __repr__(self):
        return f"<Document(id={self.id}, titulo='{self.titulo}', tipo='{self.tipo_documento}', estado='{self.estado}')>"