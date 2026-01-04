from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

from ..core.config import settings
from ..core.database import engine, Base
from ..routes import auth, users, resources, notes, forum, questions, documents, files
from ..models.user import User
from ..models.resource import Resource, ResourceCategory
from ..models.note import Note, StudyMaterial
from ..models.forum import ForumPost, ForumComment
from ..models.question import Question, Answer
from ..models.token import VerificationToken, PasswordResetToken
from ..models.grade import Grade, Subject
from ..models.document import Paper, Textbook, StudyNote

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
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.localhost",
        "ol-poddo-backend.vercel.app",
        "*.vercel.app",
    ],
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
app.include_router(documents.router, prefix="/api", tags=["documents"])
app.include_router(files.router, prefix="/api", tags=["files"])

@app.get("/")
def root():
    return {
        "message": "OL-Poddo API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }
