from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class ForumPost(Base):
    """Forum posts for discussions"""
    __tablename__ = "forum_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    tags = Column(String(500), nullable=True)  # Comma-separated tags
    is_pinned = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    views = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="forum_posts")
    comments = relationship("ForumComment", back_populates="post", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<ForumPost(id={self.id}, title={self.title})>"


class ForumComment(Base):
    """Comments on forum posts"""
    __tablename__ = "forum_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("forum_posts.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    is_solution = Column(Boolean, default=False)
    likes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    post = relationship("ForumPost", back_populates="comments")
    user = relationship("User", back_populates="forum_comments")
    
    def __repr__(self):
        return f"<ForumComment(id={self.id}, post_id={self.post_id})>"
