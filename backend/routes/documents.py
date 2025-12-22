"""
Document Routes - Papers, Textbooks, and Study Notes
Handles CRUD operations and Google Drive integration
"""
import os
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.google_drive import GoogleDriveManager
from ..core.config import settings
from ..models.user import User
from ..models.grade import Grade, Subject
from ..models.document import Paper, Textbook, StudyNote, PaperType, Medium
from ..schemas.document import (
    GradeCreate, GradeResponse, SubjectCreate, SubjectResponse,
    PaperCreate, PaperResponse, PaperListResponse,
    TextbookCreate, TextbookResponse, TextbookListResponse,
    StudyNoteCreate, StudyNoteResponse, StudyNoteListResponse,
    GoogleDriveUploadResponse,
)

router = APIRouter(prefix="/api", tags=["documents"])

# Allowed file extensions and MIME types
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt'}
ALLOWED_MIME_TYPES = {
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def validate_file(file: UploadFile) -> str:
    """Validate file before upload"""
    # Check file extension
    file_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type '.{file_ext}' not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check MIME type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"MIME type '{file.content_type}' not allowed"
        )
    
    return file_ext


# ==================== Grade Routes ====================

@router.get("/grades", response_model=List[GradeResponse])
async def get_all_grades(db: Session = Depends(get_db)):
    """Get all grades"""
    try:
        grades = db.query(Grade).order_by(Grade.level).all()
        return grades
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch grades: {str(e)}"
        )


@router.get("/grades/{grade_id}", response_model=GradeResponse)
async def get_grade(grade_id: int, db: Session = Depends(get_db)):
    """Get specific grade"""
    try:
        grade = db.query(Grade).filter(Grade.id == grade_id).first()
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grade not found"
            )
        return grade
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch grade: {str(e)}"
        )


@router.get("/grades/{grade_id}/subjects", response_model=List[SubjectResponse])
async def get_grade_subjects(grade_id: int, db: Session = Depends(get_db)):
    """Get subjects for a specific grade"""
    try:
        grade = db.query(Grade).filter(Grade.id == grade_id).first()
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Grade not found"
            )
        
        subjects = db.query(Subject).filter(Subject.grade_id == grade_id).all()
        return subjects
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subjects: {str(e)}"
        )


@router.post("/grades", response_model=GradeResponse, status_code=201)
async def create_grade(
    grade_data: GradeCreate,
    db: Session = Depends(get_db)
):
    """Create a new grade"""
    try:
        # Check if grade already exists
        existing_grade = db.query(Grade).filter(Grade.name == grade_data.name).first()
        if existing_grade:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Grade '{grade_data.name}' already exists"
            )
        
        # Create new grade
        new_grade = Grade(
            name=grade_data.name,
            level=grade_data.level,
            description=grade_data.description
        )
        db.add(new_grade)
        db.commit()
        db.refresh(new_grade)
        
        return new_grade
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create grade: {str(e)}"
        )


@router.post("/subjects", response_model=SubjectResponse, status_code=201)
async def create_subject(
    subject_data: SubjectCreate,
    db: Session = Depends(get_db)
):
    """Create a new subject for a grade"""
    try:
        # Verify grade exists
        grade = db.query(Grade).filter(Grade.id == subject_data.grade_id).first()
        if not grade:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Grade with id {subject_data.grade_id} not found"
            )
        
        # Check if subject already exists for this grade
        existing_subject = db.query(Subject).filter(
            Subject.grade_id == subject_data.grade_id,
            Subject.name == subject_data.name
        ).first()
        if existing_subject:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Subject '{subject_data.name}' already exists for {grade.name}"
            )
        
        # Create new subject
        new_subject = Subject(
            grade_id=subject_data.grade_id,
            name=subject_data.name,
            code=subject_data.code,
            description=subject_data.description
        )
        db.add(new_subject)
        db.commit()
        db.refresh(new_subject)
        
        return new_subject
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subject: {str(e)}"
        )


# ==================== Paper Routes ====================

@router.post("/papers/upload", response_model=GoogleDriveUploadResponse, status_code=201)
async def upload_paper(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    paper_type: str = Form(default="other"),
    medium: str = Form(...),
    exam_year: Optional[int] = Form(None),
    is_public: bool = Form(default=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a new paper"""
    
    # Validate file
    file_ext = validate_file(file)
    
    # Verify grade and subject exist
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade not found")
    
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.grade_id == grade_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found for this grade")
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size of {MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Upload to Google Drive (or use mock in development mode)
        drive_manager = GoogleDriveManager()
        filename = f"Paper_{grade.id}_{subject.id}_{datetime.utcnow().timestamp()}_{file.filename}"
        
        # Only use folder_id if it's configured and not empty
        folder_id = settings.google_drive_papers_folder_id
        folder_id = folder_id if folder_id and folder_id.strip() else None
        
        print(f"[upload_paper] Starting upload for: {filename}")
        print(f"[upload_paper] Folder ID: {folder_id}")
        
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=filename,
            mime_type=file.content_type,
            folder_id=folder_id,
            description=description
        )
        
        print(f"[upload_paper] Upload completed. File ID: {file_id}")
        
        # Save to database
        # Convert paper_type string to PaperType enum
        paper_type_enum = PaperType(paper_type) if isinstance(paper_type, str) else paper_type
        # Convert medium string to Medium enum
        medium_enum = Medium(medium) if isinstance(medium, str) else medium
        
        db_paper = Paper(
            owner_id=current_user.id,
            grade_id=grade_id,
            subject_id=subject_id,
            title=title,
            description=description,
            paper_type=paper_type_enum,
            medium=medium_enum,
            exam_year=exam_year,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=is_public
        )
        
        db.add(db_paper)
        db.commit()
        db.refresh(db_paper)
        
        return GoogleDriveUploadResponse(
            file_id=file_id,
            filename=file.filename,
            google_drive_url=shareable_link,
            message="Paper uploaded successfully!"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to upload paper: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload paper: {str(e)}"
        )


@router.get("/papers/my", response_model=List[PaperListResponse])
async def get_user_papers(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's papers"""
    try:
        papers = db.query(Paper).filter(
            Paper.owner_id == current_user.id
        ).order_by(Paper.created_at.desc()).offset(skip).limit(limit).all()
        return papers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch papers: {str(e)}"
        )


@router.get("/papers", response_model=List[PaperListResponse])
async def get_papers(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    paper_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get papers with optional filtering"""
    try:
        query = db.query(Paper).filter(Paper.is_public == True)
        
        if grade_id:
            query = query.filter(Paper.grade_id == grade_id)
        if subject_id:
            query = query.filter(Paper.subject_id == subject_id)
        if paper_type:
            query = query.filter(Paper.paper_type == paper_type)
        
        papers = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit).all()
        return papers
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch papers: {str(e)}"
        )


@router.get("/papers/{paper_id}", response_model=PaperResponse)
async def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get specific paper"""
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
        if not paper.is_public:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Paper is private")
        return paper
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch paper: {str(e)}"
        )


@router.delete("/papers/{paper_id}", status_code=204)
async def delete_paper(
    paper_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a paper (owner only)"""
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paper not found")
        
        if paper.owner_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
        # Delete from Google Drive
        try:
            drive_manager = GoogleDriveManager()
            drive_manager.delete_file(paper.google_drive_id)
        except Exception as e:
            print(f"Warning: Failed to delete from Google Drive: {str(e)}")
        
        db.delete(paper)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete paper: {str(e)}"
        )


# ==================== Textbook Routes ====================

@router.post("/textbooks/upload", response_model=GoogleDriveUploadResponse, status_code=201)
async def upload_textbook(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    medium: str = Form(...),
    part: Optional[str] = Form(None),
    is_public: bool = Form(default=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload a new textbook"""
    
    # Validate file
    file_ext = validate_file(file)
    
    # Verify grade and subject exist
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade not found")
    
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.grade_id == grade_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found for this grade")
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size of {MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Upload to Google Drive (or use mock in development mode)
        drive_manager = GoogleDriveManager()
        filename = f"Textbook_{grade.id}_{subject.id}_{datetime.utcnow().timestamp()}_{file.filename}"
        
        # Only use folder_id if it's configured and not empty
        folder_id = settings.google_drive_textbooks_folder_id
        folder_id = folder_id if folder_id and folder_id.strip() else None
        
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=filename,
            mime_type=file.content_type,
            folder_id=folder_id,
            description=description
        )
        
        # Save to database
        # Convert medium string to Medium enum
        medium_enum = Medium(medium) if isinstance(medium, str) else medium
        
        db_textbook = Textbook(
            grade_id=grade_id,
            subject_id=subject_id,
            title=title,
            description=description,
            medium=medium_enum,
            part=part,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=is_public
        )
        
        db.add(db_textbook)
        db.commit()
        db.refresh(db_textbook)
        
        return GoogleDriveUploadResponse(
            file_id=file_id,
            filename=file.filename,
            google_drive_url=shareable_link,
            message="Textbook uploaded successfully!"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to upload textbook: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload textbook: {str(e)}"
        )


@router.get("/textbooks", response_model=List[TextbookListResponse])
async def get_textbooks(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get textbooks with optional filtering"""
    try:
        query = db.query(Textbook).filter(Textbook.is_public == True)
        
        if grade_id:
            query = query.filter(Textbook.grade_id == grade_id)
        if subject_id:
            query = query.filter(Textbook.subject_id == subject_id)
        
        textbooks = query.order_by(Textbook.created_at.desc()).offset(skip).limit(limit).all()
        return textbooks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch textbooks: {str(e)}"
        )


@router.get("/textbooks/my", response_model=List[TextbookListResponse])
async def get_user_textbooks(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's textbooks"""
    try:
        # Note: Textbooks don't have owner_id, returning empty list
        textbooks = []
        return textbooks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch textbooks: {str(e)}"
        )


@router.get("/textbooks/{textbook_id}", response_model=TextbookResponse)
async def get_textbook(textbook_id: int, db: Session = Depends(get_db)):
    """Get specific textbook"""
    try:
        textbook = db.query(Textbook).filter(Textbook.id == textbook_id).first()
        if not textbook:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Textbook not found")
        if not textbook.is_public:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Textbook is private")
        return textbook
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch textbook: {str(e)}"
        )


@router.delete("/textbooks/{textbook_id}", status_code=204)
async def delete_textbook(
    textbook_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a textbook (admin only)"""
    try:
        if not current_user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
        
        textbook = db.query(Textbook).filter(Textbook.id == textbook_id).first()
        if not textbook:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Textbook not found")
        
        # Delete from Google Drive
        try:
            drive_manager = GoogleDriveManager()
            drive_manager.delete_file(textbook.google_drive_id)
        except Exception as e:
            print(f"Warning: Failed to delete from Google Drive: {str(e)}")
        
        db.delete(textbook)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete textbook: {str(e)}"
        )


# ==================== Study Notes Routes ====================

@router.post("/study-notes/upload", response_model=GoogleDriveUploadResponse, status_code=201)
async def upload_study_notes(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    medium: str = Form(...),
    lesson: Optional[str] = Form(None),
    is_public: bool = Form(default=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload new study notes"""
    
    # Validate file
    file_ext = validate_file(file)
    
    # Verify grade and subject exist
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Grade not found")
    
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.grade_id == grade_id).first()
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found for this grade")
    
    try:
        # Read file content
        content = await file.read()
        file_size = len(content)
        
        # Check file size
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum size of {MAX_FILE_SIZE / (1024*1024):.0f}MB"
            )
        
        # Upload to Google Drive (or use mock in development mode)
        drive_manager = GoogleDriveManager()
        filename = f"StudyNote_{grade.id}_{subject.id}_{datetime.utcnow().timestamp()}_{file.filename}"
        
        # Only use folder_id if it's configured and not empty
        folder_id = settings.google_drive_notes_folder_id
        folder_id = folder_id if folder_id and folder_id.strip() else None
        
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=filename,
            mime_type=file.content_type,
            folder_id=folder_id,
            description=description
        )
        
        # Save to database
        # Convert medium string to Medium enum
        medium_enum = Medium(medium) if isinstance(medium, str) else medium
        
        db_note = StudyNote(
            owner_id=current_user.id,
            grade_id=grade_id,
            subject_id=subject_id,
            title=title,
            description=description,
            medium=medium_enum,
            lesson=lesson,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=is_public
        )
        
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        
        return GoogleDriveUploadResponse(
            file_id=file_id,
            filename=file.filename,
            google_drive_url=shareable_link,
            message="Study notes uploaded successfully!"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"[ERROR] Failed to upload study notes: {str(e)}")
        print(traceback.format_exc())
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload study notes: {str(e)}"
        )


@router.get("/study-notes", response_model=List[StudyNoteListResponse])
async def get_study_notes(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Get study notes with optional filtering"""
    try:
        query = db.query(StudyNote).filter(StudyNote.is_public == True)
        
        if grade_id:
            query = query.filter(StudyNote.grade_id == grade_id)
        if subject_id:
            query = query.filter(StudyNote.subject_id == subject_id)
        
        notes = query.order_by(StudyNote.created_at.desc()).offset(skip).limit(limit).all()
        return notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch study notes: {str(e)}"
        )


@router.get("/study-notes/my", response_model=List[StudyNoteListResponse])
async def get_user_study_notes(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's study notes"""
    try:
        notes = db.query(StudyNote).filter(
            StudyNote.owner_id == current_user.id
        ).order_by(StudyNote.created_at.desc()).offset(skip).limit(limit).all()
        return notes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch study notes: {str(e)}"
        )


@router.get("/study-notes/{note_id}", response_model=StudyNoteResponse)
async def get_study_note(note_id: int, db: Session = Depends(get_db)):
    """Get specific study note"""
    try:
        note = db.query(StudyNote).filter(StudyNote.id == note_id).first()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study note not found")
        if not note.is_public:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Study note is private")
        return note
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch study note: {str(e)}"
        )


@router.delete("/study-notes/{note_id}", status_code=204)
async def delete_study_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete study notes (owner only)"""
    try:
        note = db.query(StudyNote).filter(StudyNote.id == note_id).first()
        if not note:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study note not found")
        
        if note.owner_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
        # Delete from Google Drive
        try:
            drive_manager = GoogleDriveManager()
            drive_manager.delete_file(note.google_drive_id)
        except Exception as e:
            print(f"Warning: Failed to delete from Google Drive: {str(e)}")
        
        db.delete(note)
        db.commit()
        return None
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete study note: {str(e)}"
        )
