from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class DocumentBase(BaseModel):
    """Base document schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: bool = False


class DocumentCreate(DocumentBase):
    """Schema for creating a document"""
    pass


class DocumentUpdate(BaseModel):
    """Schema for updating a document"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None


class DocumentResponse(DocumentBase):
    """Schema for document response"""
    id: int
    user_id: int
    filename: str
    file_path: str
    file_type: str
    file_size: float
    mime_type: str
    document_type: str
    uploaded_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    """Schema for document list response"""
    id: int
    title: str
    filename: str
    file_type: str
    file_size: float
    document_type: str
    uploaded_at: datetime
    is_public: bool
    
    class Config:
        from_attributes = True


class PageCreate(BaseModel):
    """Schema for creating a page"""
    page_number: int = Field(..., gt=0)
    content: Optional[str] = None


class PageResponse(BaseModel):
    """Schema for page response"""
    id: int
    document_id: int
    page_number: int
    content: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    filename: str
    file_size: float
    mime_type: str
    message: str = "File uploaded successfully"


class DocumentDetailResponse(DocumentResponse):
    """Detailed document response with all information"""
    pass
