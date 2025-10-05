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
    db_document = Document(
        titulo=document.titulo,
        tipo_documento=document.tipo_documento,
        ruta_archivo=document.ruta_archivo,
        usuario_id=current_user.id,  # Usar el ID del usuario actual
        estado=document.estado,
        observaciones=document.observaciones
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

# READ - Obtener documento por ID
@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    return document

# READ - Obtener documentos por usuario
@router.get("/user/{user_id}", response_model=List[DocumentResponse])
def get_documents_by_user(user_id: int, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.usuario_id == user_id).all()
    return documents

# READ - Obtener documentos por tipo
@router.get("/type/{document_type}", response_model=List[DocumentResponse])
def get_documents_by_type(document_type: str, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.tipo_documento == document_type).all()
    return documents

# READ - Obtener documentos por estado
@router.get("/status/{status_filter}", response_model=List[DocumentResponse])
def get_documents_by_status(status_filter: str, db: Session = Depends(get_db)):
    documents = db.query(Document).filter(Document.estado == status_filter).all()
    return documents

# UPDATE - Actualizar documento
@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: int, document_update: DocumentUpdate, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    # Actualizar solo los campos proporcionados
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    return document

# DELETE - Eliminar documento
@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, db: Session = Depends(get_db)):
    document = db.query(Document).filter(Document.id == document_id).first()
    if document is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado"
        )
    
    db.delete(document)
    db.commit()
    return None