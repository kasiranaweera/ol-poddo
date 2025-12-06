from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.question import Question, Answer

router = APIRouter(prefix="/api/questions", tags=["questions"])


@router.post("/")
def ask_question(
    title: str = Query(...),
    content: str = Query(...),
    subject: str = Query(...),
    difficulty: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask a question"""
    question = Question(
        user_id=current_user.id,
        title=title,
        content=content,
        subject=subject,
        difficulty=difficulty
    )
    
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return {"id": question.id, "title": question.title, "message": "Question posted"}


@router.get("/")
def list_questions(
    subject: str = Query(None),
    answered: bool = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """List questions"""
    query = db.query(Question)
    
    if subject:
        query = query.filter(Question.subject == subject)
    
    if answered is not None:
        query = query.filter(Question.is_answered == answered)
    
    query = query.order_by(Question.created_at.desc())
    questions = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": q.id,
            "title": q.title,
            "subject": q.subject,
            "author": q.user.username,
            "answers": len(q.answers),
            "views": q.views,
            "is_answered": q.is_answered,
            "created_at": q.created_at
        }
        for q in questions
    ]


@router.get("/subject/{subject}")
def questions_by_subject(
    subject: str,
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """Get questions by subject"""
    questions = db.query(Question).filter(
        Question.subject == subject
    ).order_by(Question.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": q.id,
            "title": q.title,
            "author": q.user.username,
            "answers": len(q.answers),
            "views": q.views,
            "created_at": q.created_at
        }
        for q in questions
    ]


@router.get("/{question_id}")
def get_question(question_id: int, db: Session = Depends(get_db)):
    """Get question details"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question.views += 1
    db.commit()
    
    return {
        "id": question.id,
        "title": question.title,
        "content": question.content,
        "subject": question.subject,
        "difficulty": question.difficulty,
        "author": question.user.username,
        "views": question.views,
        "is_answered": question.is_answered,
        "answers": [
            {
                "id": a.id,
                "content": a.content,
                "author": a.user.username,
                "upvotes": a.upvotes,
                "downvotes": a.downvotes,
                "is_accepted": a.is_accepted,
                "created_at": a.created_at
            }
            for a in question.answers
        ],
        "created_at": question.created_at
    }


@router.post("/{question_id}/answers")
def answer_question(
    question_id: int,
    content: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Answer a question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    answer = Answer(
        question_id=question_id,
        user_id=current_user.id,
        content=content
    )
    
    db.add(answer)
    
    if not question.is_answered:
        question.is_answered = True
    
    db.commit()
    db.refresh(answer)
    
    return {"id": answer.id, "message": "Answer posted"}


@router.post("/{question_id}/answers/{answer_id}/accept")
def accept_answer(
    question_id: int,
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept an answer"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    if question.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only question author can accept")
    
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    # Unaccept other answers
    db.query(Answer).filter(Answer.question_id == question_id).update({"is_accepted": False})
    
    answer.is_accepted = True
    db.commit()
    
    return {"message": "Answer accepted"}


@router.post("/{question_id}/answers/{answer_id}/upvote")
def upvote_answer(
    question_id: int,
    answer_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upvote an answer"""
    answer = db.query(Answer).filter(Answer.id == answer_id).first()
    
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")
    
    answer.upvotes += 1
    db.commit()
    
    return {"message": "Answer upvoted", "upvotes": answer.upvotes}
