import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists locally)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

class Settings:
    """Application settings"""
    
    # App settings
    app_name: str = "OL-Poddo API"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = environment == "development"
    
    # Database settings
    db_path: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ol_poddo.db")
    database_url: str = f"sqlite:///{db_path}"
    
    # Security settings
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # CORS settings
    cors_origins: list = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://ol-poddo.vercel.app",
        "https://www.ol-poddo.vercel.app",
    ]
    
    # Email settings (for future use)
    smtp_server: str = os.getenv("SMTP_SERVER", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", 587))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    
    # Google Drive settings
    # Resolve the path relative to the backend directory
    _backend_dir = os.path.dirname(os.path.dirname(__file__))
    
    # OAuth2 credentials (preferred - uses your personal Google account)
    _google_oauth_relative = os.getenv("GOOGLE_OAUTH_CREDENTIALS_JSON", None)
    google_oauth_credentials_json: str = (
        os.path.join(_backend_dir, _google_oauth_relative) 
        if _google_oauth_relative 
        else None
    )
    
    # Service Account credentials (deprecated - use OAuth2 instead)
    _google_key_relative = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON", None)
    google_service_account_json: str = (
        os.path.join(_backend_dir, _google_key_relative) 
        if _google_key_relative 
        else None
    )
    
    google_drive_papers_folder_id: str = os.getenv("GOOGLE_DRIVE_PAPERS_FOLDER_ID", "")
    google_drive_textbooks_folder_id: str = os.getenv("GOOGLE_DRIVE_TEXTBOOKS_FOLDER_ID", "")
    google_drive_notes_folder_id: str = os.getenv("GOOGLE_DRIVE_NOTES_FOLDER_ID", "")
    
    # Google OAuth for user authentication
    google_oauth_client_id: str = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "")
    google_oauth_client_secret: str = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET", "")
    google_oauth_redirect_uri: str = os.getenv("GOOGLE_OAUTH_REDIRECT_URI", "https://ol-poddo.vercel.app/auth/google/callback" if environment == "production" else "http://localhost:5173/auth/google/callback")


# Create settings instance
settings = Settings()

