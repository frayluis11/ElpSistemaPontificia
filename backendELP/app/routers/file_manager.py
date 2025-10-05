import os
import hashlib
import json
import aiofiles
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_rrhh_or_admin
from ..models.user import User
from ..models.role import Role
from ..models.document import Document, DocumentAccess
from ..schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, 
    DocumentWithUser, FileUploadResponse, DocumentAccessResponse
)

router = APIRouter(prefix="/documents", tags=["documents-management"])

# Configuración de directorio de archivos
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Tipos de archivo permitidos
ALLOWED_EXTENSIONS = {
    ".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png", 
    ".xls", ".xlsx", ".csv", ".zip", ".rar"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def get_file_hash(content: bytes) -> str:
    """Generar hash SHA256 del contenido del archivo"""
    return hashlib.sha256(content).hexdigest()

def is_allowed_file(filename: str) -> bool:
    """Verificar si el archivo tiene una extensión permitida"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

async def save_uploaded_file(upload_file: UploadFile, user_id: int) -> tuple:
    """Guardar archivo subido y retornar información del archivo"""
    
    # Verificar extensión
    if not is_allowed_file(upload_file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Extensiones permitidas: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Leer contenido del archivo
    content = await upload_file.read()
    
    # Verificar tamaño
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El archivo es demasiado grande. Tamaño máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generar nombre único para el archivo
    file_hash = get_file_hash(content)
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file_hash[:10]}{file_extension}"
    
    # Crear directorio del usuario si no existe
    user_dir = UPLOAD_DIR / str(user_id)
    user_dir.mkdir(exist_ok=True)
    
    # Ruta completa del archivo
    file_path = user_dir / unique_filename
    
    # Guardar archivo
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    return str(file_path), len(content), file_hash, unique_filename

@router.post("/upload", response_model=FileUploadResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    titulo: str = None,
    tipo_documento: str = "general",
    observaciones: str = None,
    es_publico: bool = False,
    requiere_aprobacion: bool = True,
    acceso_roles: str = None,  # JSON string de roles
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Subir un documento con metadatos"""
    
    try:
        # Guardar archivo
        file_path, file_size, file_hash, unique_filename = await save_uploaded_file(file, current_user.id)
        
        # Usar nombre del archivo como título si no se proporciona
        if not titulo:
            titulo = Path(file.filename).stem
        
        # Crear registro en base de datos
        db_document = Document(
            titulo=titulo,
            tipo_documento=tipo_documento,
            nombre_archivo=file.filename,
            ruta_archivo=file_path,
            tamaño_archivo=file_size,
            tipo_mime=file.content_type or "application/octet-stream",
            hash_archivo=file_hash,
            usuario_id=current_user.id,
            estado="pendiente" if requiere_aprobacion else "aprobado",
            observaciones=observaciones,
            es_publico=es_publico,
            requiere_aprobacion=requiere_aprobacion,
            acceso_roles=acceso_roles
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        # Registrar acceso
        access_record = DocumentAccess(
            documento_id=db_document.id,
            usuario_id=current_user.id,
            accion="subida",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        db.add(access_record)
        db.commit()
        
        return FileUploadResponse(
            message="Documento subido exitosamente",
            document_id=db_document.id,
            filename=unique_filename,
            size=file_size,
            tipo_mime=db_document.tipo_mime
        )
        
    except Exception as e:
        # Limpiar archivo en caso de error
        if 'file_path' in locals() and Path(file_path).exists():
            Path(file_path).unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir el archivo: {str(e)}"
        )

@router.get("/download/{document_id}")
async def download_document(
    document_id: int,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Descargar un documento si el usuario tiene permisos"""
    
    # Buscar documento
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    can_access = False
    
    # El propietario siempre puede acceder
    if document.usuario_id == current_user.id:
        can_access = True
    
    # Documento público
    elif document.es_publico:
        can_access = True
    
    # RRHH y Admin pueden acceder a todos
    elif user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        can_access = True
    
    # Verificar roles específicos
    elif document.acceso_roles and user_role:
        try:
            allowed_roles = json.loads(document.acceso_roles)
            if user_role.nombre_rol in allowed_roles:
                can_access = True
        except json.JSONDecodeError:
            pass
    
    if not can_access:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para descargar este documento"
        )
    
    # Verificar que el archivo existe
    file_path = Path(document.ruta_archivo)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El archivo no se encuentra en el servidor"
        )
    
    # Registrar acceso
    access_record = DocumentAccess(
        documento_id=document_id,
        usuario_id=current_user.id,
        accion="descarga",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    db.add(access_record)
    
    # Incrementar contador de descargas
    document.contador_descargas += 1
    
    db.commit()
    
    # Retornar archivo
    return FileResponse(
        path=file_path,
        filename=document.nombre_archivo,
        media_type=document.tipo_mime
    )

@router.get("/", response_model=List[DocumentWithUser])
async def list_documents(
    skip: int = 0,
    limit: int = 100,
    tipo_documento: Optional[str] = None,
    estado: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Listar documentos según permisos del usuario"""
    
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    # Construir query base
    query = db.query(Document, User).join(User, Document.usuario_id == User.id)
    
    # Filtros según rol
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        # RRHH y Admin ven todos los documentos
        pass
    else:
        # Usuarios normales ven solo sus documentos y los públicos
        query = query.filter(
            (Document.usuario_id == current_user.id) | 
            (Document.es_publico == True)
        )
    
    # Aplicar filtros opcionales
    if tipo_documento:
        query = query.filter(Document.tipo_documento == tipo_documento)
    
    if estado:
        query = query.filter(Document.estado == estado)
    
    # Obtener resultados
    results = query.offset(skip).limit(limit).all()
    
    # Formatear respuesta
    documents = []
    for doc, user in results:
        doc_dict = {
            **doc.__dict__,
            "usuario_nombre": user.nombre,
            "usuario_apellido": user.apellido
        }
        documents.append(DocumentWithUser(**doc_dict))
    
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Obtener información de un documento específico"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos de visualización (similar a download pero sin descargar)
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    can_view = False
    
    if (document.usuario_id == current_user.id or 
        document.es_publico or 
        (user_role and user_role.nombre_rol in ["RRHH", "Administración"])):
        can_view = True
    elif document.acceso_roles and user_role:
        try:
            allowed_roles = json.loads(document.acceso_roles)
            if user_role.nombre_rol in allowed_roles:
                can_view = True
        except json.JSONDecodeError:
            pass
    
    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este documento"
        )
    
    return document

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Actualizar metadatos de un documento (solo propietario o RRHH/Admin)"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    can_update = (
        document.usuario_id == current_user.id or
        (user_role and user_role.nombre_rol in ["RRHH", "Administración"])
    )
    
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este documento"
        )
    
    # Actualizar campos
    update_data = document_update.dict(exclude_unset=True)
    
    # Convertir lista de roles a JSON string
    if "acceso_roles" in update_data and update_data["acceso_roles"]:
        update_data["acceso_roles"] = json.dumps(update_data["acceso_roles"])
    
    for field, value in update_data.items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Eliminar un documento y su archivo (solo propietario o Admin/TI)"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    can_delete = (
        document.usuario_id == current_user.id or
        (user_role and user_role.nombre_rol in ["Administración", "Área TI"])
    )
    
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar este documento"
        )
    
    # Eliminar archivo físico
    file_path = Path(document.ruta_archivo)
    if file_path.exists():
        file_path.unlink()
    
    # Eliminar registros de acceso
    db.query(DocumentAccess).filter(DocumentAccess.documento_id == document_id).delete()
    
    # Eliminar documento
    db.delete(document)
    db.commit()
    
    return {"message": "Documento eliminado exitosamente"}

@router.get("/{document_id}/access-log", response_model=List[DocumentAccessResponse])
async def get_document_access_log(
    document_id: int,
    current_user: User = Depends(require_rrhh_or_admin),
    db: Session = Depends(get_db)
):
    """Obtener log de accesos de un documento (solo RRHH/Admin)"""
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    accesses = db.query(DocumentAccess).filter(
        DocumentAccess.documento_id == document_id
    ).order_by(DocumentAccess.fecha_acceso.desc()).all()
    
    return accesses