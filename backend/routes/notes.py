from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.note import Note, StudyMaterial

router = APIRouter(tags=["notes"])


@router.post("/")
def create_note(
    title: str = Query(...),
    subject: str = Query(...),
    content: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new note"""
    note = Note(
        user_id=current_user.id,
        title=title,
        subject=subject,
        content=content
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return {"id": note.id, "title": note.title, "message": "Note created"}


@router.get("/")
def list_notes(
    subject: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """List notes"""
    query = db.query(Note).filter(Note.is_public == True)
    
    if subject:
        query = query.filter(Note.subject == subject)
    
    notes = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "subject": n.subject,
            "author": n.user.username,
            "views": n.views,
            "created_at": n.created_at
        }
        for n in notes
    ]


@router.get("/user/{username}")
def user_notes(username: str, db: Session = Depends(get_db)):
    """Get user's notes"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    notes = db.query(Note).filter(
        (Note.user_id == user.id) &
        (Note.is_public == True)
    ).all()
    
    return [
        {
            "id": n.id,
            "title": n.title,
            "subject": n.subject,
            "views": n.views,
            "created_at": n.created_at
        }
        for n in notes
    ]


@router.get("/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    """Get note details"""
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if not note.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    
    note.views += 1
    db.commit()
    
    return {
        "id": note.id,
        "title": note.title,
        "subject": note.subject,
        "content": note.content,
        "author": note.user.username,
        "views": note.views,
        "created_at": note.created_at
    }


@router.put("/{note_id}")
def update_note(
    note_id: int,
    title: str = Query(None),
    content: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update note"""
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if title:
        note.title = title
    if content:
        note.content = content
    
    note.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Note updated"}


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete note"""
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    if note.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(note)
    db.commit()
    
    return {"message": "Note deleted"}
