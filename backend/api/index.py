import sys
from pathlib import Path
import os

# Add the parent directory to sys.path so backend is recognized as a package
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

try:
    from backend.core.config import settings
except Exception as e:
    print(f"Error loading settings: {e}")
    import traceback
    traceback.print_exc()
    raise

# Initialize database engine and base
engine = None
Base = None

try:
    from backend.core.database import engine, Base
except Exception as e:
    print(f"Warning: Could not load database module: {e}")
    import traceback
    traceback.print_exc()

# Create database tables (only if they don't exist) - but don't fail if we can't
db_initialized = False
if engine is not None and Base is not None:
    try:
        Base.metadata.create_all(bind=engine)
        db_initialized = True
        print("Database tables created successfully")
    except Exception as e:
        print(f"Warning: Could not create database tables: {e}")
        print(f"Continuing without database. This is expected on Vercel.")
        import traceback
        traceback.print_exc()

# Initialize FastAPI app
try:
    app = FastAPI(
        title="OL-Poddo API",
        description="Backend API for OL-Poddo - A learning platform for O-Level students",
        version="1.0.0",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
    )
except Exception as e:
    print(f"Error initializing FastAPI app: {e}")
    import traceback
    traceback.print_exc()
    raise

# Middleware setup
# CORS middleware
try:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
except Exception as e:
    print(f"Error setting up CORS middleware: {e}")
    import traceback
    traceback.print_exc()

# Trusted host middleware
try:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=[
            "localhost",
            "127.0.0.1",
            "*.localhost",
            "ol-poddo-backend.vercel.app",
            "*.vercel.app",
        ],
    )
except Exception as e:
    print(f"Error setting up TrustedHost middleware: {e}")
    import traceback
    traceback.print_exc()

# Health check endpoint
@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "message": "OL-Poddo API is running"}

# Include routers - lazy load them
try:
    from backend.routes import auth, users, resources, notes, forum, questions, documents, files
    
    app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
    app.include_router(users.router, prefix="/api/users", tags=["users"])
    app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
    app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
    app.include_router(forum.router, prefix="/api/forum", tags=["forum"])
    app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
    app.include_router(documents.router, prefix="/api", tags=["documents"])
    app.include_router(files.router, prefix="/api", tags=["files"])
except Exception as e:
    print(f"Error loading routes: {e}")
    import traceback
    traceback.print_exc()
    # Don't raise here - allow app to run with limited endpoints

@app.get("/")
def root():
    return {
        "message": "OL-Poddo API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }

# Export app for Vercel
__all__ = ["app"]
