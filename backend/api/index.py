from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import sys
from pathlib import Path

# Add parent directory to path so we can import backend modules
sys.path.insert(0, str(Path(__file__).parent.parent))

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

# Create database tables
Base.metadata.create_all(bind=engine)

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
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost"],
)

# Health check endpoint
@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok", "message": "OL-Poddo API is running"}

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(resources.router, prefix="/api/resources", tags=["resources"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(forum.router, prefix="/api/forum", tags=["forum"])
app.include_router(questions.router, prefix="/api/questions", tags=["questions"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(files.router, prefix="/api/files", tags=["files"])

@app.get("/")
def root():
    return {
        "message": "OL-Poddo API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }
