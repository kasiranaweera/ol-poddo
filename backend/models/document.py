from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from ..core.database import Base


class DocumentType(str, PyEnum):
    """Enum for document types"""
    PDF = "pdf"
    DOC = "doc"
    DOCX = "docx"
    TXT = "txt"
    IMAGE = "image"
    EQUATION = "equation"


class Document(Base):
    """Document database model"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    filename = Column(String(255), nullable=False, unique=True)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Float, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    document_type = Column(Enum(DocumentType), default=DocumentType.DOC)
    uploaded_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="documents")
    
    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, user_id={self.user_id})>"


class Page(Base):
    """Page/Chapter in a document"""
    __tablename__ = "document_pages"
    
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    page_number = Column(Integer, nullable=False)
    content = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Page(id={self.id}, document_id={self.document_id}, page={self.page_number})>"
