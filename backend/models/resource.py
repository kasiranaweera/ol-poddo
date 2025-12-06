from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum as PyEnum
from ..core.database import Base


class ResourceCategory(str, PyEnum):
    """Categories for learning resources"""
    MATHEMATICS = "mathematics"
    SCIENCE = "science"
    ENGLISH = "english"
    SINHALA = "sinhala"
    HISTORY = "history"
    GEOGRAPHY = "geography"
    CIVICS = "civics"
    COMMERCE = "commerce"
    ACCOUNTING = "accounting"
    ECONOMICS = "economics"
    ISLAM = "islam"
    BUDDHISM = "buddhism"
    CHRISTIANITY = "christianity"
    HINDUISM = "hinduism"
    OTHER = "other"


class Resource(Base):
    """Learning resource (notes, videos, links, etc.)"""
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    category = Column(Enum(ResourceCategory), nullable=False, index=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    is_published = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="resources")
    likes = relationship("ResourceLike", back_populates="resource", cascade="all, delete-orphan")
    comments = relationship("ResourceComment", back_populates="resource", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Resource(id={self.id}, title={self.title}, category={self.category})>"


class ResourceLike(Base):
    """User likes for resources"""
    __tablename__ = "resource_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="likes")
    user = relationship("User")


class ResourceComment(Base):
    """Comments on resources"""
    __tablename__ = "resource_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    resource = relationship("Resource", back_populates="comments")
    user = relationship("User")
