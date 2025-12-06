import os
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from .config import settings


def generate_token(length: int = 32) -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(length)


def send_verification_email(email: str, username: str, token: str, frontend_url: str = "http://localhost:5173") -> bool:
    """
    Send email verification link
    
    Args:
        email: User email address
        username: User username
        token: Verification token
        frontend_url: Frontend URL for the verification link
    
    Returns:
        True if email sent successfully, False otherwise
    """
    
    # If SMTP settings are not configured, just return True (for development)
    if not settings.smtp_server or not settings.smtp_user:
        print(f"[DEV] Verification token for {email}: {token}")
        print(f"[DEV] Verification link: {frontend_url}/verify?token={token}")
        return True
    
    try:
        verification_link = f"{frontend_url}/verify?token={token}"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Verify Your Email Address"
        msg['From'] = settings.smtp_user
        msg['To'] = email
        
        # HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Welcome to {settings.app_name}!</h2>
                <p>Hi {username},</p>
                <p>Please verify your email address by clicking the button below:</p>
                <p>
                    <a href="{verification_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Verify Email
                    </a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p>{verification_link}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create this account, please ignore this email.</p>
                <br>
                <p>Best regards,<br>{settings.app_name} Team</p>
            </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Welcome to {settings.app_name}!
        
        Hi {username},
        
        Please verify your email address by visiting this link:
        {verification_link}
        
        This link will expire in 24 hours.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        {settings.app_name} Team
        """
        
        # Attach both plain text and HTML
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending verification email to {email}: {str(e)}")
        return False


def send_password_reset_email(email: str, username: str, token: str, frontend_url: str = "http://localhost:5173") -> bool:
    """
    Send password reset email
    
    Args:
        email: User email address
        username: User username
        token: Password reset token
        frontend_url: Frontend URL for the reset link
    
    Returns:
        True if email sent successfully, False otherwise
    """
    
    # If SMTP settings are not configured, just return True (for development)
    if not settings.smtp_server or not settings.smtp_user:
        print(f"[DEV] Password reset token for {email}: {token}")
        print(f"[DEV] Reset link: {frontend_url}/reset-password?token={token}")
        return True
    
    try:
        reset_link = f"{frontend_url}/reset-password?token={token}"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Password Reset Request"
        msg['From'] = settings.smtp_user
        msg['To'] = email
        
        # HTML content
        html_content = f"""
        <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Password Reset Request</h2>
                <p>Hi {username},</p>
                <p>We received a password reset request for your account. Click the button below to reset your password:</p>
                <p>
                    <a href="{reset_link}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p>{reset_link}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email.</p>
                <br>
                <p>Best regards,<br>{settings.app_name} Team</p>
            </body>
        </html>
        """
        
        # Plain text content
        text_content = f"""
        Password Reset Request
        
        Hi {username},
        
        We received a password reset request for your account. Visit this link to reset your password:
        {reset_link}
        
        This link will expire in 1 hour.
        
        If you didn't request a password reset, please ignore this email.
        
        Best regards,
        {settings.app_name} Team
        """
        
        # Attach both plain text and HTML
        msg.attach(MIMEText(text_content, 'plain'))
        msg.attach(MIMEText(html_content, 'html'))
        
        # Send email
        with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        
        return True
    
    except Exception as e:
        print(f"Error sending password reset email to {email}: {str(e)}")
        return False
