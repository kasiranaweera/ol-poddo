import sys
from pathlib import Path
import os

# Add paths for both local development and Vercel deployment
current_dir = Path(__file__).parent  # /api
backend_dir = current_dir.parent     # /backend
project_root = backend_dir.parent    # /project_root

# Make sure backend is importable as a package
# This is crucial for relative imports to work
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

print(f"Python path: {sys.path[:5]}")
print(f"Trying to import backend module...")

# Verify backend can be imported as a package
try:
    import backend
    print(f"✓ Successfully imported backend package from {backend.__file__}")
except Exception as e:
    print(f"✗ Could not import backend: {e}")

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse

# Try importing with full path first (local dev), then relative (Vercel)
print("Attempting to load settings...")
try:
    try:
        from backend.core.config import settings
        print("✓ Settings loaded using 'backend.core.config'")
    except ModuleNotFoundError as e1:
        print(f"✗ Failed to load 'backend.core.config': {e1}")
        # Fallback for Vercel deployment where backend is in current dir
        try:
            from core.config import settings
            print("✓ Settings loaded using 'core.config' (Vercel fallback)")
        except Exception as e2:
            print(f"✗ Failed to load 'core.config': {e2}")
            raise
except Exception as e:
    print(f"❌ CRITICAL: Error loading settings: {e}")
    import traceback
    traceback.print_exc()
    raise

# Initialize database engine and base
print("Attempting to load database modules...")
engine = None
Base = None

try:
    try:
        from backend.core.database import engine, Base
        print("✓ Database loaded using 'backend.core.database'")
    except ModuleNotFoundError as e1:
        print(f"✗ Failed to load 'backend.core.database': {e1}")
        # Fallback for Vercel deployment
        try:
            from core.database import engine, Base
            print("✓ Database loaded using 'core.database' (Vercel fallback)")
        except Exception as e2:
            print(f"✗ Failed to load 'core.database': {e2}")
            raise
except Exception as e:
    print(f"❌ Error loading database module: {e}")
    import traceback
    traceback.print_exc()
    engine = None
    Base = None

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

# Test endpoint to debug
@app.get("/api/test", tags=["test"])
def test():
    return {
        "message": "API is working",
        "database": "in-memory" if "memory" in (settings.database_url if engine else "none") else "file-based"
    }

# Helper function to safely import and include routers
def load_router(module_name: str, prefix: str = None):
    """Safely load and include a router module"""
    print(f"  Loading '{module_name}' router...")
    router = None
    
    try:
        # Always try backend.routes.{module_name} first since we've set up sys.path
        try:
            print(f"    Trying: backend.routes.{module_name}")
            if module_name == "auth":
                from backend.routes.auth import router
            elif module_name == "users":
                from backend.routes.users import router
            elif module_name == "resources":
                from backend.routes.resources import router
            elif module_name == "notes":
                from backend.routes.notes import router
            elif module_name == "forum":
                from backend.routes.forum import router
            elif module_name == "questions":
                from backend.routes.questions import router
            elif module_name == "documents":
                from backend.routes.documents import router
            elif module_name == "files":
                from backend.routes.files import router
            else:
                print(f"    ✗ Unknown module: {module_name}")
                return False
            
            if router:
                if prefix:
                    app.include_router(router, prefix=prefix, tags=[module_name])
                else:
                    app.include_router(router, tags=[module_name])
                print(f"    ✓ Successfully loaded '{module_name}'")
                return True
        except ImportError as e:
            print(f"    ✗ ImportError: {str(e)[:100]}")
            return False
        except Exception as e:
            print(f"    ✗ Error: {str(e)[:100]}")
            import traceback
            print(traceback.format_exc()[:500])
            return False
    except Exception as e:
        print(f"  ✗ Critical error: {e}")
        return False

# Load all routers
print("Loading routers...")
print("=" * 50)
routers_status = {}
routers_status["auth"] = load_router("auth", "/api/auth")
routers_status["users"] = load_router("users", "/api/users")
routers_status["resources"] = load_router("resources", "/api/resources")
routers_status["notes"] = load_router("notes", "/api/notes")
routers_status["forum"] = load_router("forum", "/api/forum")
routers_status["questions"] = load_router("questions", "/api/questions")
routers_status["documents"] = load_router("documents", "/api")
routers_status["files"] = load_router("files", "/api")
print("=" * 50)
print(f"Router Status: {routers_status}")
print(f"Routes loaded: {sum(routers_status.values())}/{len(routers_status)}")

# Test endpoint to show router status
@app.get("/api/status", tags=["test"])
def status():
    return {
        "message": "API status",
        "routers": routers_status,
        "routes_loaded": sum(routers_status.values())
    }

@app.get("/")
def root():
    return {
        "message": "OL-Poddo API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }

# Export app for Vercel
__all__ = ["app"]
