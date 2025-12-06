from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


# Grade Schemas
class GradeBase(BaseModel):
    """Base grade schema"""
    name: str = Field(..., min_length=1, max_length=50)
    level: int = Field(..., ge=1, le=100)
    description: Optional[str] = Field(None, max_length=255)


class GradeCreate(GradeBase):
    """Schema for creating a grade"""
    pass


class GradeResponse(GradeBase):
    """Schema for grade response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Subject Schemas
class SubjectBase(BaseModel):
    """Base subject schema"""
    grade_id: int
    name: str = Field(..., min_length=1, max_length=100)
    code: Optional[str] = Field(None, max_length=20)
    description: Optional[str] = Field(None, max_length=255)


class SubjectCreate(SubjectBase):
    """Schema for creating a subject"""
    pass


class SubjectResponse(SubjectBase):
    """Schema for subject response"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Paper Schemas
class PaperBase(BaseModel):
    """Base paper schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    paper_type: str = Field(..., description="Type of paper: past_paper, provisional_paper, school_paper, model_paper, other")
    grade_id: int
    subject_id: int
    exam_year: Optional[int] = Field(None, ge=1900, le=2100)
    is_public: bool = False


class PaperCreate(PaperBase):
    """Schema for creating a paper"""
    pass


class PaperResponse(PaperBase):
    """Schema for paper response"""
    id: int
    owner_id: int
    google_drive_id: str
    google_drive_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class PaperListResponse(BaseModel):
    """Schema for paper list response"""
    id: int
    title: str
    description: Optional[str]
    paper_type: str
    exam_year: Optional[int]
    grade_id: int
    subject_id: int
    owner_id: int
    is_public: bool
    created_at: datetime
    google_drive_url: Optional[str]
    
    class Config:
        from_attributes = True


# Textbook Schemas
class TextbookBase(BaseModel):
    """Base textbook schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    grade_id: int
    subject_id: int
    part: Optional[str] = Field(None, max_length=50)
    is_public: bool = True


class TextbookCreate(TextbookBase):
    """Schema for creating a textbook"""
    pass


class TextbookResponse(TextbookBase):
    """Schema for textbook response"""
    id: int
    google_drive_id: str
    google_drive_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TextbookListResponse(BaseModel):
    """Schema for textbook list response"""
    id: int
    title: str
    description: Optional[str]
    part: Optional[str]
    grade_id: int
    subject_id: int
    is_public: bool
    created_at: datetime
    google_drive_url: Optional[str]
    
    class Config:
        from_attributes = True


# StudyNote Schemas
class StudyNoteBase(BaseModel):
    """Base study note schema"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    grade_id: int
    subject_id: int
    lesson: Optional[str] = Field(None, max_length=255)
    is_public: bool = False


class StudyNoteCreate(StudyNoteBase):
    """Schema for creating a study note"""
    pass


class StudyNoteResponse(StudyNoteBase):
    """Schema for study note response"""
    id: int
    owner_id: int
    google_drive_id: str
    google_drive_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class StudyNoteListResponse(BaseModel):
    """Schema for study note list response"""
    id: int
    title: str
    description: Optional[str]
    lesson: Optional[str]
    grade_id: int
    subject_id: int
    owner_id: int
    is_public: bool
    created_at: datetime
    google_drive_url: Optional[str]
    
    class Config:
        from_attributes = True


# File Upload Response
class GoogleDriveUploadResponse(BaseModel):
    """Schema for Google Drive upload response"""
    file_id: str
    filename: str
    google_drive_url: str
    message: str = "File uploaded successfully to Google Drive"
