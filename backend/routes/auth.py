from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..core.database import get_db
from ..core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
)
from ..core.email import generate_token, send_verification_email, send_password_reset_email
from ..models.user import User
from ..models.token import VerificationToken, PasswordResetToken
from ..schemas.user import (
    UserCreate,
    UserLogin,
    TokenResponse,
    UserResponse,
    MessageResponse,
    ForgotPasswordRequest,
    PasswordReset,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account
    
    - **username**: Unique username (3-50 characters)
    - **email**: Valid email address
    - **password**: Strong password (min 8 chars, uppercase, digit, special char)
    - **full_name**: Optional full name
    
    Returns a message asking user to verify their email
    """
    # Check if user already exists
    db_user = db.query(User).filter(
        (User.username == user_data.username) | (User.email == user_data.email)
    ).first()
    
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_verified=False  # Email verification required
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Generate and store verification token
    verification_token_str = generate_token()
    verification_token = VerificationToken(
        user_id=db_user.id,
        token=verification_token_str
    )
    db.add(verification_token)
    db.commit()
    
    # Send verification email (in development, prints to console)
    send_verification_email(
        email=db_user.email,
        username=db_user.username,
        token=verification_token_str
    )
    
    return MessageResponse(
        message=f"Registration successful! Please check your email ({db_user.email}) to verify your account.",
        success=True
    )


@router.post("/verify-email")
async def verify_email(token: str = Query(...), db: Session = Depends(get_db)):
    """
    Verify user email with verification token
    
    - **token**: Verification token sent to user's email
    """
    # Find verification token
    verification_token = db.query(VerificationToken).filter(
        VerificationToken.token == token
    ).first()
    
    if not verification_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
    
    if not verification_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired. Please register again."
        )
    
    # Mark token as used and verify user
    verification_token.is_used = True
    user = db.query(User).filter(User.id == verification_token.user_id).first()
    user.is_verified = True
    user.updated_at = datetime.utcnow()
    
    db.commit()
    
    # Generate tokens for automatic login
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/login", response_model=TokenResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Login user with username or email and password
    
    - **username_or_email**: Registered username or email address
    - **password**: User password
    """
    # Find user by username or email
    db_user = db.query(User).filter(
        (User.username == user_data.username_or_email) | 
        (User.email == user_data.username_or_email)
    ).first()
    
    if not db_user or not verify_password(user_data.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username, email, or password"
        )
    
    if not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    if not db_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification link."
        )
    
    # Update last login
    db_user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate tokens
    access_token = create_access_token(data={"sub": db_user.username})
    refresh_token = create_refresh_token(data={"sub": db_user.username})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=db_user
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_tokens(refresh_token: str, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token
    
    - **refresh_token**: Valid refresh token
    """
    # Verify refresh token
    token_data = verify_token(refresh_token, token_type="refresh")
    
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Get user
    db_user = db.query(User).filter(User.username == token_data.sub).first()
    
    if not db_user or not db_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Generate new tokens
    access_token = create_access_token(data={"sub": db_user.username})
    new_refresh_token = create_refresh_token(data={"sub": db_user.username})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer"
    )


@router.post("/logout", response_model=MessageResponse)
def logout():
    """
    Logout user (client should discard tokens)
    """
    return MessageResponse(message="Logged out successfully", success=True)


@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Request password reset
    
    - **email**: User email address
    """
    user = db.query(User).filter(User.email == request.email).first()
    
    if user:
        # Generate and store password reset token
        reset_token = generate_token()
        password_reset = PasswordResetToken(
            user_id=user.id,
            token=reset_token
        )
        db.add(password_reset)
        db.commit()
        
        # Send password reset email
        send_password_reset_email(
            email=user.email,
            username=user.username,
            token=reset_token
        )
    
    # Return success even if user doesn't exist (security best practice)
    return MessageResponse(
        message="If an account exists with this email, you will receive password reset instructions",
        success=True
    )


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(token: str = Query(...), new_password: str = Query(...), db: Session = Depends(get_db)):
    """
    Reset password using reset token and new password
    
    - **token**: Password reset token from email
    - **new_password**: New password (strong password required)
    """
    # Find password reset token
    password_reset = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()
    
    if not password_reset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password reset token"
        )
    
    if not password_reset.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password reset token has expired. Please request a new one."
        )
    
    # Get user and update password
    user = db.query(User).filter(User.id == password_reset.user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or account is disabled"
        )
    
    # Mark token as used and update password
    password_reset.is_used = True
    user.hashed_password = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    
    db.commit()
    
    return MessageResponse(
        message="Password reset successfully. You can now login with your new password.",
        success=True
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user's profile information"""
    return current_user

