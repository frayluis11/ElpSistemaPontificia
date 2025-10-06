from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..core.database import get_db
from ..core.auth_deps import get_current_active_user, require_rrhh_or_admin
from ..models.document import Document
from ..models.user import User
from ..models.role import Role
from ..schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter(prefix="/documents", tags=["documents"])

# CREATE - Crear nuevo documento (usuario crea para sí mismo)
@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(document: DocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Nota: Este endpoint es para metadatos solamente. Para subir archivos usar /documents/upload
    db_document = Document(
        titulo=document.titulo,
        tipo_documento=document.tipo_documento,
        nombre_archivo="metadata_only.txt",  # Placeholder para documentos sin archivo
        ruta_archivo="",  # Sin archivo físico
        tamaño_archivo=0,
        tipo_mime="text/plain",
        usuario_id=current_user.id,  # Usar el ID del usuario actual
        estado="pendiente",
        observaciones=document.observaciones,
        es_publico=document.es_publico or False,
        requiere_aprobacion=document.requiere_aprobacion or True
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

# READ - Obtener documentos (usuario ve solo los suyos, RRHH/Admin ven todos)
@router.get("/", response_model=List[DocumentResponse])
def get_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Obtener rol del usuario
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    
    # Si es RRHH o Admin, puede ver todos los documentos
    if user_role and user_role.nombre_rol in ["RRHH", "Administración"]:
        documents = db.query(Document).offset(skip).limit(limit).all()
    else:
        # Usuario normal solo ve sus documentos
        documents = db.query(Document).filter(Document.usuario_id == current_user.id).offset(skip).limit(limit).all()
    
    return documents

# READ - Obtener documento por ID (solo propietario o RRHH/Admin)
@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos: solo el propietario o RRHH/Admin pueden ver el documento
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if current_user.id != document.usuario_id and user_role.nombre_rol not in ["RRHH", "Administración", "Área TI"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver este documento"
        )
    
    return document

# READ - Obtener documentos por usuario (solo RRHH/Admin o el propio usuario)
@router.get("/user/{user_id}", response_model=List[DocumentResponse])
def get_documents_by_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    # Verificar permisos: solo RRHH/Admin o el propio usuario
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if current_user.id != user_id and user_role.nombre_rol not in ["RRHH", "Administración", "Área TI"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para ver documentos de otros usuarios"
        )
    
    documents = db.query(Document).filter(Document.usuario_id == user_id).all()
    return documents

# READ - Obtener documentos por tipo (solo RRHH/Admin)
@router.get("/type/{document_type}", response_model=List[DocumentResponse])
def get_documents_by_type(document_type: str, db: Session = Depends(get_db), current_user: User = Depends(require_rrhh_or_admin)):
    documents = db.query(Document).filter(Document.tipo_documento == document_type).all()
    return documents

# READ - Obtener documentos por estado (solo RRHH/Admin)
@router.get("/status/{status_filter}", response_model=List[DocumentResponse])
def get_documents_by_status(status_filter: str, db: Session = Depends(get_db), current_user: User = Depends(require_rrhh_or_admin)):
    documents = db.query(Document).filter(Document.estado == status_filter).all()
    return documents

# UPDATE - Actualizar documento (solo propietario o RRHH/Admin)
@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: int, document_update: DocumentUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos: solo el propietario o RRHH/Admin pueden actualizar
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if current_user.id != document.usuario_id and user_role.nombre_rol not in ["RRHH", "Administración", "Área TI"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para actualizar este documento"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    return document

# DELETE - Eliminar documento (solo propietario o Admin/TI)
@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Verificar permisos: solo el propietario o Admin/TI pueden eliminar
    user_role = db.query(Role).filter(Role.id == current_user.rol_id).first()
    if current_user.id != document.usuario_id and user_role.nombre_rol not in ["Administración", "Área TI"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar este documento"
        )
    
    db.delete(document)
    db.commit()
    return None