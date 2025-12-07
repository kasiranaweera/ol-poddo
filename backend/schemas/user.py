from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=100)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """Validate password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserLogin(BaseModel):
    """Schema for user login - accepts username or email"""
    username_or_email: str = Field(..., min_length=3, description="Username or email address")
    password: str = Field(...)


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)


class PasswordChange(BaseModel):
    """Schema for password change"""
    current_password: str = Field(...)
    new_password: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """Validate new password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request"""
    email: EmailStr


class PasswordReset(BaseModel):
    """Schema for password reset"""
    email: EmailStr
    new_password: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        """Validate new password strength"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in v):
            raise ValueError('Password must contain at least one special character')
        return v


class UserResponse(UserBase):
    """Schema for user response"""
    id: int
    is_active: bool
    is_verified: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
    status_code: int


class GoogleOAuthCallback(BaseModel):
    """Schema for Google OAuth callback"""
    code: str = Field(..., description="Authorization code from Google")
