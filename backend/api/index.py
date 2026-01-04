import sys
from pathlib import Path
import os

# Add paths for both local development and Vercel deployment
current_dir = Path(__file__).parent
backend_parent = current_dir.parent  # Points to /backend in local, or /var/task in Vercel

# For local development: add the project root
sys.path.insert(0, str(backend_parent.parent))
# For Vercel deployment: add current directory (where backend code will be copied)
sys.path.insert(0, str(backend_parent))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

# Try importing with full path first (local dev), then relative (Vercel)
try:
    try:
        from backend.core.config import settings
    except ModuleNotFoundError:
        # Fallback for Vercel deployment where backend is in current dir
        from core.config import settings
except Exception as e:
    print(f"Error loading settings: {e}")
    import traceback
    traceback.print_exc()
    raise

# Initialize database engine and base
engine = None
Base = None

try:
    try:
        from backend.core.database import engine, Base
    except ModuleNotFoundError:
        # Fallback for Vercel deployment
        from core.database import engine, Base
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
        
        # Initialize seed data (grades and subjects)
        try:
            try:
                from backend.core.database import SessionLocal
            except ModuleNotFoundError:
                from core.database import SessionLocal
            
            db = SessionLocal()
            try:
                try:
                    from backend.models.grade import Grade, Subject
                except ModuleNotFoundError:
                    from models.grade import Grade, Subject
                
                # Check if grades already exist
                existing_grades = db.query(Grade).count()
                if existing_grades == 0:
                    print("Initializing seed data...")
                    
                    # Create grades
                    grades_data = [
                        Grade(name="Grade 6", level=6, description="Grade 6"),
                        Grade(name="Grade 7", level=7, description="Grade 7"),
                        Grade(name="Grade 8", level=8, description="Grade 8"),
                        Grade(name="Grade 9", level=9, description="Grade 9"),
                        Grade(name="Grade 10", level=10, description="Grade 10"),
                        Grade(name="Grade 11", level=11, description="Grade 11 (O-Level)"),
                    ]
                    
                    for grade in grades_data:
                        db.add(grade)
                    db.commit()
                    
                    # Create subjects for each grade
                    subjects_data = [
                        {"grade_name": "Grade 11 (O-Level)", "subjects": ["Mathematics", "English", "Science", "History", "Geography"]},
                        {"grade_name": "Grade 10", "subjects": ["Mathematics", "English", "Science", "History", "Geography"]},
                        {"grade_name": "Grade 9", "subjects": ["Mathematics", "English", "Science"]},
                    ]
                    
                    for grade_info in subjects_data:
                        grade = db.query(Grade).filter(Grade.name == grade_info["grade_name"]).first()
                        if grade:
                            for subject_name in grade_info["subjects"]:
                                subject = Subject(name=subject_name, grade_id=grade.id)
                                db.add(subject)
                    
                    db.commit()
                    print("Seed data initialized successfully")
                else:
                    print(f"Database already has {existing_grades} grades, skipping seed data")
            except Exception as e:
                print(f"Warning: Could not initialize seed data: {e}")
                import traceback
                traceback.print_exc()
            finally:
                db.close()
        except Exception as e:
            print(f"Warning: Could not load seed data module: {e}")
            import traceback
            traceback.print_exc()
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
    try:
        from backend.routes import auth, users, resources, notes, forum, questions, documents, files
    except ModuleNotFoundError:
        # Fallback for Vercel deployment
        from routes import auth, users, resources, notes, forum, questions, documents, files
    
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
