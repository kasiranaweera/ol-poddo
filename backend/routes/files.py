"""
Document Routes - Papers, Textbooks, and Study Notes with Google Drive OAuth2 Integration
Handles file uploads directly to Google Drive, saves metadata to DB
"""
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session

from ..core.database import get_db
from ..core.security import get_current_user
from ..core.google_drive import GoogleDriveManager
from ..core.config import settings
from ..models.user import User
from ..models.document import Paper, Textbook, StudyNote, PaperType
from ..schemas.document import (
    PaperResponse, PaperListResponse,
    TextbookResponse, TextbookListResponse,
    StudyNoteResponse, StudyNoteListResponse,
)

router = APIRouter(tags=["files"])

# File validation
ALLOWED_PDF_MIME = {'application/pdf'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def validate_pdf_file(file: UploadFile) -> None:
    """Validate PDF file before upload"""
    if file.content_type != 'application/pdf':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only PDF files allowed. Got: {file.content_type}"
        )


# ==================== PAPERS - Upload, List, Download, Preview ====================

@router.post("/papers/upload", response_model=dict)
async def upload_paper(
    title: str = Form(...),
    description: str = Form(default=""),
    paper_type: str = Form(...),
    exam_year: int = Form(...),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a paper PDF to Google Drive and save metadata to DB
    
    Args:
        title: Paper title
        description: Paper description
        paper_type: Type of paper (past_paper, provisional_paper, school_paper, model_paper, other)
        exam_year: Exam year (e.g., 2023, 2024)
        grade_id: Grade ID
        subject_id: Subject ID
        file: PDF file
    
    Returns:
        Paper metadata with Google Drive links
    """
    try:
        # Validate file
        validate_pdf_file(file)
        
        # Validate paper type
        try:
            paper_type_enum = PaperType(paper_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid paper type. Allowed: {[pt.value for pt in PaperType]}"
            )
        
        # Get Google Drive manager
        drive_manager = GoogleDriveManager()
        
        # Upload to Google Drive
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=file.filename,
            mime_type=file.content_type,
            folder_id=settings.google_drive_papers_folder_id,
            description=description
        )
        
        # Save to database
        paper = Paper(
            title=title,
            description=description,
            paper_type=paper_type_enum,
            exam_year=exam_year,
            grade_id=grade_id,
            subject_id=subject_id,
            owner_id=current_user.id,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=True
        )
        db.add(paper)
        db.commit()
        db.refresh(paper)
        
        return {
            "id": paper.id,
            "title": paper.title,
            "file_id": file_id,
            "download_url": f"/api/files/download/{file_id}",
            "preview_url": f"/api/files/preview/{file_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={file_id}&sz=w400",
            "message": "Paper uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload paper: {str(e)}"
        )


@router.get("/papers", response_model=List[dict])
async def list_papers(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    paper_type: Optional[str] = None,
    exam_year: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    List all public papers with optional filters
    
    Returns papers with download/preview links and thumbnails
    """
    try:
        query = db.query(Paper).filter(Paper.is_public == True)
        
        if grade_id:
            query = query.filter(Paper.grade_id == grade_id)
        if subject_id:
            query = query.filter(Paper.subject_id == subject_id)
        if paper_type:
            try:
                paper_type_enum = PaperType(paper_type)
                query = query.filter(Paper.paper_type == paper_type_enum)
            except ValueError:
                pass
        if exam_year:
            query = query.filter(Paper.exam_year == exam_year)
        
        papers = query.order_by(Paper.created_at.desc()).offset(skip).limit(limit).all()
        
        return [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "paper_type": p.paper_type.value,
                "exam_year": p.exam_year,
                "grade_id": p.grade_id,
                "subject_id": p.subject_id,
                "created_at": p.created_at.isoformat(),
                "download_url": f"/api/files/download/{p.google_drive_id}",
                "preview_url": f"/api/files/preview/{p.google_drive_id}",
                "thumbnail_url": f"https://drive.google.com/thumbnail?id={p.google_drive_id}&sz=w400"
            }
            for p in papers
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list papers: {str(e)}"
        )


@router.get("/papers/{paper_id}", response_model=dict)
async def get_paper(paper_id: int, db: Session = Depends(get_db)):
    """Get specific paper with all details"""
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paper not found"
            )
        
        return {
            "id": paper.id,
            "title": paper.title,
            "description": paper.description,
            "paper_type": paper.paper_type.value,
            "exam_year": paper.exam_year,
            "grade_id": paper.grade_id,
            "subject_id": paper.subject_id,
            "owner_id": paper.owner_id,
            "created_at": paper.created_at.isoformat(),
            "updated_at": paper.updated_at.isoformat(),
            "download_url": f"/api/files/download/{paper.google_drive_id}",
            "preview_url": f"/api/files/preview/{paper.google_drive_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={paper.google_drive_id}&sz=w600"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get paper: {str(e)}"
        )


# ==================== TEXTBOOKS - Upload, List, Download, Preview ====================

@router.post("/textbooks/upload", response_model=dict)
async def upload_textbook(
    title: str = Form(...),
    description: str = Form(default=""),
    part: str = Form(default=""),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a textbook PDF to Google Drive and save metadata to DB
    
    Args:
        title: Textbook title
        description: Description
        part: Part/edition (e.g., "Part 1", "Part 2")
        grade_id: Grade ID
        subject_id: Subject ID
        file: PDF file
    
    Returns:
        Textbook metadata with Google Drive links
    """
    try:
        validate_pdf_file(file)
        
        drive_manager = GoogleDriveManager()
        
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=file.filename,
            mime_type=file.content_type,
            folder_id=settings.google_drive_textbooks_folder_id,
            description=description
        )
        
        textbook = Textbook(
            title=title,
            description=description,
            part=part,
            grade_id=grade_id,
            subject_id=subject_id,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=True
        )
        db.add(textbook)
        db.commit()
        db.refresh(textbook)
        
        return {
            "id": textbook.id,
            "title": textbook.title,
            "part": textbook.part,
            "file_id": file_id,
            "download_url": f"/api/files/download/{file_id}",
            "preview_url": f"/api/files/preview/{file_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={file_id}&sz=w400",
            "message": "Textbook uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload textbook: {str(e)}"
        )


@router.get("/textbooks", response_model=List[dict])
async def list_textbooks(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List all public textbooks with optional filters"""
    try:
        query = db.query(Textbook).filter(Textbook.is_public == True)
        
        if grade_id:
            query = query.filter(Textbook.grade_id == grade_id)
        if subject_id:
            query = query.filter(Textbook.subject_id == subject_id)
        
        textbooks = query.order_by(Textbook.created_at.desc()).offset(skip).limit(limit).all()
        
        return [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "part": t.part,
                "grade_id": t.grade_id,
                "subject_id": t.subject_id,
                "created_at": t.created_at.isoformat(),
                "download_url": f"/api/files/download/{t.google_drive_id}",
                "preview_url": f"/api/files/preview/{t.google_drive_id}",
                "thumbnail_url": f"https://drive.google.com/thumbnail?id={t.google_drive_id}&sz=w400"
            }
            for t in textbooks
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list textbooks: {str(e)}"
        )


@router.get("/textbooks/{textbook_id}", response_model=dict)
async def get_textbook(textbook_id: int, db: Session = Depends(get_db)):
    """Get specific textbook"""
    try:
        textbook = db.query(Textbook).filter(Textbook.id == textbook_id).first()
        if not textbook:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Textbook not found"
            )
        
        return {
            "id": textbook.id,
            "title": textbook.title,
            "description": textbook.description,
            "part": textbook.part,
            "grade_id": textbook.grade_id,
            "subject_id": textbook.subject_id,
            "created_at": textbook.created_at.isoformat(),
            "download_url": f"/api/files/download/{textbook.google_drive_id}",
            "preview_url": f"/api/files/preview/{textbook.google_drive_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={textbook.google_drive_id}&sz=w600"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get textbook: {str(e)}"
        )


# ==================== STUDY NOTES - Upload, List, Download, Preview ====================

@router.post("/notes/upload", response_model=dict)
async def upload_study_note(
    title: str = Form(...),
    description: str = Form(default=""),
    lesson: str = Form(default=""),
    grade_id: int = Form(...),
    subject_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a study note PDF to Google Drive and save metadata to DB
    
    Args:
        title: Note title
        description: Description
        lesson: Lesson/chapter reference (e.g., "Chapter 5", "Lesson 3")
        grade_id: Grade ID
        subject_id: Subject ID
        file: PDF file
    
    Returns:
        Study note metadata with Google Drive links
    """
    try:
        validate_pdf_file(file)
        
        drive_manager = GoogleDriveManager()
        
        file_id, shareable_link = await drive_manager.upload_file_from_upload(
            file=file,
            filename=file.filename,
            mime_type=file.content_type,
            folder_id=settings.google_drive_notes_folder_id,
            description=description
        )
        
        note = StudyNote(
            title=title,
            description=description,
            lesson=lesson,
            grade_id=grade_id,
            subject_id=subject_id,
            owner_id=current_user.id,
            google_drive_id=file_id,
            google_drive_url=shareable_link,
            is_public=False
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        
        return {
            "id": note.id,
            "title": note.title,
            "lesson": note.lesson,
            "file_id": file_id,
            "download_url": f"/api/files/download/{file_id}",
            "preview_url": f"/api/files/preview/{file_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={file_id}&sz=w400",
            "message": "Study note uploaded successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload study note: {str(e)}"
        )


@router.get("/notes", response_model=List[dict])
async def list_study_notes(
    grade_id: Optional[int] = None,
    subject_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List study notes created by current user"""
    try:
        query = db.query(StudyNote).filter(StudyNote.owner_id == current_user.id)
        
        if grade_id:
            query = query.filter(StudyNote.grade_id == grade_id)
        if subject_id:
            query = query.filter(StudyNote.subject_id == subject_id)
        
        notes = query.order_by(StudyNote.created_at.desc()).offset(skip).limit(limit).all()
        
        return [
            {
                "id": n.id,
                "title": n.title,
                "description": n.description,
                "lesson": n.lesson,
                "grade_id": n.grade_id,
                "subject_id": n.subject_id,
                "created_at": n.created_at.isoformat(),
                "is_public": n.is_public,
                "download_url": f"/api/files/download/{n.google_drive_id}",
                "preview_url": f"/api/files/preview/{n.google_drive_id}",
                "thumbnail_url": f"https://drive.google.com/thumbnail?id={n.google_drive_id}&sz=w400"
            }
            for n in notes
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list study notes: {str(e)}"
        )


@router.get("/notes/{note_id}", response_model=dict)
async def get_study_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get specific study note (only owner can view)"""
    try:
        note = db.query(StudyNote).filter(StudyNote.id == note_id).first()
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Study note not found"
            )
        
        # Only owner can view
        if note.owner_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this study note"
            )
        
        return {
            "id": note.id,
            "title": note.title,
            "description": note.description,
            "lesson": note.lesson,
            "grade_id": note.grade_id,
            "subject_id": note.subject_id,
            "created_at": note.created_at.isoformat(),
            "is_public": note.is_public,
            "download_url": f"/api/files/download/{note.google_drive_id}",
            "preview_url": f"/api/files/preview/{note.google_drive_id}",
            "thumbnail_url": f"https://drive.google.com/thumbnail?id={note.google_drive_id}&sz=w600"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get study note: {str(e)}"
        )


# ==================== SHARED ENDPOINTS ====================

@router.get("/download/{file_id}")
async def download_file(file_id: str):
    """
    Redirect to direct download link (bypasses Google virus warning)
    
    Usage:
        GET /api/files/download/{google_drive_file_id}
    """
    drive_manager = GoogleDriveManager()
    download_url = drive_manager.get_direct_download_url(file_id)
    return RedirectResponse(url=download_url)


@router.get("/preview/{file_id}")
async def preview_file(file_id: str):
    """
    Redirect to Google Drive preview (embeddable in iframe)
    
    Usage:
        GET /api/files/preview/{google_drive_file_id}
        or embed in iframe: <iframe src="/api/files/preview/{file_id}"></iframe>
    """
    drive_manager = GoogleDriveManager()
    preview_url = drive_manager.get_preview_url(file_id)
    return RedirectResponse(url=preview_url)


@router.get("/thumbnail/{file_id}")
async def get_thumbnail(file_id: str, size: str = "w400"):
    """
    Get thumbnail URL for a file
    
    Args:
        file_id: Google Drive file ID
        size: Thumbnail size (w200, w400, w600, w800)
    
    Returns:
        JSON with thumbnail URL
    """
    drive_manager = GoogleDriveManager()
    thumbnail_url = drive_manager.get_thumbnail_url(file_id, size)
    return {"thumbnail_url": thumbnail_url, "file_id": file_id}


@router.get("/info/{file_id}")
async def get_file_info(file_id: str):
    """
    Get file metadata from Google Drive
    
    Returns:
        File information (name, size, MIME type, etc.)
    """
    try:
        drive_manager = GoogleDriveManager()
        file_info = drive_manager.get_file_info(file_id)
        
        if not file_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found in Google Drive"
            )
        
        return file_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get file info: {str(e)}"
        )
