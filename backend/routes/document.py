import os
import shutil
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path

from ..core.database import get_db
from ..core.security import verify_token, get_current_user
from ..models.user import User
from ..models.document import Document, DocumentType
from ..schemas.document import (
    DocumentCreate,
    DocumentUpdate,
    DocumentResponse,
    DocumentListResponse,
    FileUploadResponse,
    DocumentDetailResponse,
)

router = APIRouter(tags=["documents"])

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'pdf', 'doc', 'docx', 'txt', 
    'png', 'jpg', 'jpeg', 'gif',
    'xlsx', 'xls', 'csv'
}

# Allowed MIME types
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/png',
    'image/jpeg',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
}


def get_file_type(filename: str) -> str:
    """Extract file extension from filename"""
    return filename.split('.')[-1].lower() if '.' in filename else 'unknown'


def get_document_type(file_type: str) -> DocumentType:
    """Determine document type from file extension"""
    file_type_lower = file_type.lower()
    
    if file_type_lower == 'pdf':
        return DocumentType.PDF
    elif file_type_lower in ['doc', 'docx']:
        return DocumentType.DOC
    elif file_type_lower == 'txt':
        return DocumentType.TXT
    elif file_type_lower in ['png', 'jpg', 'jpeg', 'gif']:
        return DocumentType.IMAGE
    else:
        return DocumentType.DOC


def generate_unique_filename(original_filename: str, user_id: int) -> str:
    """Generate a unique filename for storage"""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    file_ext = get_file_type(original_filename)
    return f"user_{user_id}_{timestamp}.{file_ext}"


@router.post("/upload", response_model=FileUploadResponse, status_code=201)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a document/file
    
    - **file**: File to upload (PDF, DOC, DOCX, TXT, Images, etc.)
    - **title**: Document title
    - **description**: Optional description
    - **is_public**: Whether document is publicly accessible
    """
    
    # Verify user is verified
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before uploading documents"
        )
    
    # Validate file extension
    file_type = get_file_type(file.filename)
    if file_type not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '{file_type}' is not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type '{file.content_type}' is not allowed"
        )
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if file_size > max_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds maximum allowed size of {max_size / (1024*1024):.0f}MB"
            )
        
        # Generate unique filename
        unique_filename = generate_unique_filename(file.filename, current_user.id)
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Create document record in database
        db_document = Document(
            user_id=current_user.id,
            title=title,
            description=description,
            filename=file.filename,  # Original filename
            file_path=str(file_path),  # Full path on disk
            file_type=file_type,
            file_size=file_size,
            mime_type=file.content_type,
            document_type=get_document_type(file_type),
            is_public=is_public
        )
        
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        
        return FileUploadResponse(
            filename=file.filename,
            file_size=file_size,
            mime_type=file.content_type,
            message="File uploaded successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.get("", response_model=List[DocumentListResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    """
    List all documents uploaded by current user
    
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    
    documents = db.query(Document).filter(
        Document.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return documents


@router.get("/{document_id}", response_model=DocumentDetailResponse)
def get_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific document details"""
    
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check ownership (unless document is public)
    if document.user_id != current_user.id and not document.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this document"
        )
    
    return document


@router.put("/{document_id}", response_model=DocumentDetailResponse)
def update_document(
    document_id: int,
    document_update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document metadata (title, description, visibility)"""
    
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check ownership
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this document"
        )
    
    # Update fields
    update_data = document_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    document.updated_at = datetime.utcnow()
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document"""
    
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check ownership
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this document"
        )
    
    try:
        # Delete file from disk
        if os.path.exists(document.file_path):
            os.remove(document.file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting document: {str(e)}"
        )


@router.get("/{document_id}/download")
async def download_document(
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a document file"""
    from fastapi.responses import FileResponse
    
    document = db.query(Document).filter(
        Document.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check ownership (unless document is public)
    if document.user_id != current_user.id and not document.is_public:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to download this document"
        )
    
    # Check if file exists
    if not os.path.exists(document.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )
    
    return FileResponse(
        path=document.file_path,
        filename=document.filename,
        media_type=document.mime_type
    )
