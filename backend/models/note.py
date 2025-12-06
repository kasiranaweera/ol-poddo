from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Note(Base):
    """Study notes created by users"""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_public = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notes")
    
    def __repr__(self):
        return f"<Note(id={self.id}, title={self.title}, subject={self.subject})>"


class StudyMaterial(Base):
    """Study materials and attachments"""
    __tablename__ = "study_materials"
    
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)  # Size in bytes
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<StudyMaterial(id={self.id}, filename={self.filename})>"
