import sys
from pathlib import Path

# Add the parent directory to sys.path so backend is recognized as a package
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.database import engine, Base
from backend.routes import auth, users, resources, notes, forum, questions, documents, files
from backend.models.user import User
from backend.models.resource import Resource, ResourceCategory
from backend.models.note import Note, StudyMaterial
from backend.models.forum import ForumPost, ForumComment
from backend.models.question import Question, Answer
from backend.models.token import VerificationToken, PasswordResetToken
from backend.models.grade import Grade, Subject
from backend.models.document import Paper, Textbook, StudyNote

# Create database tables (only if they don't exist)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create database tables: {e}")

# Initialize FastAPI app
app = FastAPI(
    title="OL-Poddo API",
    description="Backend API for OL-Poddo - A learning platform for O-Level students",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Middleware setup
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost", "ol-poddo-backend.vercel.app", "*.vercel.app"],
)


# Health check endpoint
@app.get("/api/health", tags=["health"])
def health_check():
    """Check API health status"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": "1.0.0",
        "service": "OL-Poddo API"
    }


# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resources.router)
app.include_router(notes.router)
app.include_router(forum.router)
app.include_router(questions.router)
app.include_router(documents.router)
app.include_router(files.router)


# Root endpoint
@app.get("/", tags=["root"])
def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to OL-Poddo API",
        "description": "A comprehensive learning platform for O-Level students",
        "docs": "/api/docs",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "auth": "/api/auth",
            "users": "/api/users",
            "resources": "/api/resources",
            "notes": "/api/notes",
            "forum": "/api/forum",
            "questions": "/api/questions",
            "documents": "/api/documents",
            "files": "/api/files"
        }
    }


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
