from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from datetime import datetime, timedelta
from ..core.database import Base
from ..core.config import settings


class VerificationToken(Base):
    """Email verification token model"""
    __tablename__ = "verification_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.is_used and datetime.utcnow() < self.expires_at
    
    def __repr__(self):
        return f"<VerificationToken(id={self.id}, user_id={self.user_id})>"


class PasswordResetToken(Base):
    """Password reset token model"""
    __tablename__ = "password_reset_tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=1))
    
    def is_valid(self):
        """Check if token is still valid"""
        return not self.is_used and datetime.utcnow() < self.expires_at
    
    def __repr__(self):
        return f"<PasswordResetToken(id={self.id}, user_id={self.user_id})>"
