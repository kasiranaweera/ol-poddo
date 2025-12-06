"""
Seed script to populate initial grades and subjects
Run this script once to initialize the database with default grades and subjects
"""
import sys
from pathlib import Path

# Add the parent directory to the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.core.database import SessionLocal, Base, engine
from backend.models.grade import Grade, Subject
# Import all models to ensure they are registered with SQLAlchemy
from backend.models.user import User
from backend.models.document import Paper, Textbook, StudyNote
from backend.models.resource import Resource
from backend.models.note import Note
from backend.models.forum import ForumPost, ForumComment
from backend.models.question import Question, Answer
from backend.models.token import VerificationToken, PasswordResetToken

# Create all tables
Base.metadata.create_all(bind=engine)

def seed_data():
    """Seed initial grades and subjects"""
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_grades = db.query(Grade).count()
        if existing_grades > 0:
            print("Database already contains grades. Skipping seed...")
            return
        
        # Define grades
        grades_data = [
            {"name": "Grade 10", "level": 10, "description": "Grade 10 (O-Level Stream)"},
            {"name": "Grade 11", "level": 11, "description": "Grade 11 (A-Level Stream)"},
        ]
        
        # Define subjects for each grade
        subjects_data = {
            "Grade 10": [
                {"name": "Mathematics", "code": "MATH", "description": "Mathematics"},
                {"name": "Science", "code": "SCI", "description": "Integrated Science"},
                {"name": "English Language", "code": "ENG", "description": "English Language"},
                {"name": "Sinhala Language", "code": "SIN", "description": "Sinhala Language"},
                {"name": "History", "code": "HIS", "description": "History"},
                {"name": "Geography", "code": "GEO", "description": "Geography"},
                {"name": "Civics", "code": "CIV", "description": "Civics and Citizenship Education"},
                {"name": "Commerce", "code": "COM", "description": "Commerce"},
                {"name": "Information and Communication Technology", "code": "ICT", "description": "ICT"},
            ],
            "Grade 11": [
                {"name": "Mathematics", "code": "MATH", "description": "Mathematics"},
                {"name": "Physics", "code": "PHY", "description": "Physics"},
                {"name": "Chemistry", "code": "CHEM", "description": "Chemistry"},
                {"name": "Biology", "code": "BIO", "description": "Biology"},
                {"name": "English Language", "code": "ENG", "description": "English Language"},
                {"name": "Sinhala Language", "code": "SIN", "description": "Sinhala Language"},
                {"name": "History", "code": "HIS", "description": "History"},
                {"name": "Geography", "code": "GEO", "description": "Geography"},
                {"name": "Accounting", "code": "ACC", "description": "Accounting"},
                {"name": "Economics", "code": "ECO", "description": "Economics"},
                {"name": "Information and Communication Technology", "code": "ICT", "description": "ICT"},
            ]
        }
        
        # Create grades and subjects
        for grade_data in grades_data:
            grade = Grade(
                name=grade_data["name"],
                level=grade_data["level"],
                description=grade_data["description"]
            )
            db.add(grade)
            db.flush()  # Flush to get the grade ID
            
            # Add subjects for this grade
            for subject_data in subjects_data.get(grade_data["name"], []):
                subject = Subject(
                    grade_id=grade.id,
                    name=subject_data["name"],
                    code=subject_data["code"],
                    description=subject_data["description"]
                )
                db.add(subject)
            
            print(f"✓ Created {grade_data['name']} with {len(subjects_data.get(grade_data['name'], []))} subjects")
        
        db.commit()
        print("\n✓ Database seeding completed successfully!")
        print("✓ Created 2 grades (Grade 10, Grade 11)")
        print("✓ Created 20 subjects across both grades")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
