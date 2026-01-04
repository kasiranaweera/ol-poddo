import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

# Create database engine
# On Vercel, the filesystem is ephemeral and read-only, so SQLite won't work
# This is a fallback setup - in production, use a cloud database
try:
    engine = create_engine(
        settings.database_url,
        connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
        echo=False
    )
    # Test the connection
    with engine.connect() as conn:
        pass
    print(f"Database engine created successfully at {settings.database_url}")
except Exception as e:
    print(f"Warning: Could not create database engine: {e}")
    print(f"Database URL attempted: {settings.database_url}")
    engine = None

# Create session factory
if engine is not None:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    SessionLocal = None

# Base for models
Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    if SessionLocal is None:
        raise RuntimeError("Database is not available. This is expected on Vercel.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
