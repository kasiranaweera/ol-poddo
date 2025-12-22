from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from ..core.database import Base


class PaperType(str, PyEnum):
    """Enum for paper types"""
    PAST_PAPER = "past_paper"
    PROVISIONAL_PAPER = "provisional_paper"
    SCHOOL_PAPER = "school_paper"
    MODEL_PAPER = "model_paper"
    OTHER = "other"


class Medium(str, PyEnum):
    """Enum for document medium (language)"""
    SINHALA = "sinhala"
    ENGLISH = "english"
    TAMIL = "tamil"


class Paper(Base):
    """Paper document model (Past papers, Provisional papers, School papers, Model papers, etc.)"""
    __tablename__ = "papers"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    paper_type = Column(Enum(PaperType), nullable=False, index=True)
    medium = Column(Enum(Medium), nullable=True, index=True)  # Language: Sinhala, English, Tamil
    exam_year = Column(Integer, nullable=True)  # e.g., 2023, 2024
    google_drive_id = Column(String(255), nullable=False)  # Google Drive file ID
    google_drive_url = Column(String(500), nullable=True)  # Shareable Google Drive URL
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=False)
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="papers")
    grade = relationship("Grade", back_populates="papers")
    subject = relationship("Subject", back_populates="papers")
    
    def __repr__(self):
        return f"<Paper(id={self.id}, title={self.title}, paper_type={self.paper_type})>"


class Textbook(Base):
    """Textbook document model"""
    __tablename__ = "textbooks"
    
    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    medium = Column(Enum(Medium), nullable=True, index=True)  # Language: Sinhala, English, Tamil
    part = Column(String(50), nullable=True)  # e.g., "Part 1", "Part 2"
    google_drive_id = Column(String(255), nullable=False)  # Google Drive file ID
    google_drive_url = Column(String(500), nullable=True)  # Shareable Google Drive URL
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=True)
    
    # Relationships
    grade = relationship("Grade", back_populates="textbooks")
    subject = relationship("Subject", back_populates="textbooks")
    
    def __repr__(self):
        return f"<Textbook(id={self.id}, title={self.title}, part={self.part})>"


class StudyNote(Base):
    """Study notes document model (uploaded documents for specific lessons/chapters)"""
    __tablename__ = "study_notes_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    medium = Column(Enum(Medium), nullable=True, index=True)  # Language: Sinhala, English, Tamil
    lesson = Column(String(255), nullable=True)  # e.g., "Chapter 5", "Lesson 3"
    google_drive_id = Column(String(255), nullable=False)  # Google Drive file ID
    google_drive_url = Column(String(500), nullable=True)  # Shareable Google Drive URL
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=False)
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="study_note_documents")
    grade = relationship("Grade", back_populates="study_notes")
    subject = relationship("Subject", back_populates="study_notes")
    
    def __repr__(self):
        return f"<StudyNote(id={self.id}, title={self.title}, owner_id={self.owner_id})>"
