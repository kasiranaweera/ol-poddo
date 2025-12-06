from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Grade(Base):
    """Grade database model (e.g., Grade 1, Grade 2, ... O-Level)"""
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)  # e.g., "Grade 10", "O-Level"
    level = Column(Integer, nullable=False, index=True)  # e.g., 10, 11 for ordering
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subjects = relationship("Subject", back_populates="grade", cascade="all, delete-orphan")
    papers = relationship("Paper", back_populates="grade", cascade="all, delete-orphan")
    textbooks = relationship("Textbook", back_populates="grade", cascade="all, delete-orphan")
    study_notes = relationship("StudyNote", back_populates="grade", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Grade(id={self.id}, name={self.name}, level={self.level})>"


class Subject(Base):
    """Subject database model (e.g., Mathematics, Science, etc.)"""
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    grade_id = Column(Integer, ForeignKey("grades.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False, index=True)  # e.g., "Mathematics", "Science"
    code = Column(String(20), nullable=True)  # e.g., "MATH", "SCI"
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    grade = relationship("Grade", back_populates="subjects")
    papers = relationship("Paper", back_populates="subject", cascade="all, delete-orphan")
    textbooks = relationship("Textbook", back_populates="subject", cascade="all, delete-orphan")
    study_notes = relationship("StudyNote", back_populates="subject", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Subject(id={self.id}, name={self.name}, grade_id={self.grade_id})>"
