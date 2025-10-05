from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    tipo_documento = Column(String(50), nullable=False)  # "certificado", "solicitud", "informe", etc.
    nombre_archivo = Column(String(255), nullable=False)  # Nombre original del archivo
    ruta_archivo = Column(String(500), nullable=False)  # Ruta donde se almacena el archivo
    tamaño_archivo = Column(BigInteger, nullable=False)  # Tamaño en bytes
    tipo_mime = Column(String(100), nullable=False)  # Tipo MIME del archivo
    hash_archivo = Column(String(64), nullable=True)  # Hash SHA256 del archivo para integridad
    
    fecha_emision = Column(DateTime, default=datetime.utcnow)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    estado = Column(String(20), default="pendiente")  # "pendiente", "aprobado", "rechazado"
    observaciones = Column(Text, nullable=True)
    
    # Campos de permisos y acceso
    acceso_roles = Column(Text, nullable=True)  # JSON con roles que pueden acceder
    es_publico = Column(Boolean, default=False)  # Si el documento es público
    requiere_aprobacion = Column(Boolean, default=True)  # Si requiere aprobación
    
    # Metadatos
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
    fecha_actualizacion = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    contador_descargas = Column(Integer, default=0)  # Contador de descargas
    
    # Relaciones
    usuario = relationship("User", back_populates="documentos")
    accesos = relationship("DocumentAccess", back_populates="documento")
    
    def __repr__(self):
        return f"<Document(id={self.id}, titulo='{self.titulo}', tipo='{self.tipo_documento}', estado='{self.estado}')>"

class DocumentAccess(Base):
    """Registro de accesos a documentos"""
    __tablename__ = "document_accesses"
    
    id = Column(Integer, primary_key=True, index=True)
    documento_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    accion = Column(String(20), nullable=False)  # "descarga", "visualizacion", "actualizacion"
    fecha_acceso = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45), nullable=True)  # IPv4 o IPv6
    user_agent = Column(Text, nullable=True)
    
    # Relaciones
    documento = relationship("Document", back_populates="accesos")
    usuario = relationship("User")
    
    def __repr__(self):
        return f"<DocumentAccess(documento_id={self.documento_id}, usuario_id={self.usuario_id}, accion='{self.accion}')>"