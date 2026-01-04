from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.forum import ForumPost, ForumComment

router = APIRouter(tags=["forum"])


@router.post("/posts")
def create_post(
    title: str = Query(...),
    content: str = Query(...),
    category: str = Query(...),
    tags: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create forum post"""
    post = ForumPost(
        user_id=current_user.id,
        title=title,
        content=content,
        category=category,
        tags=tags
    )
    
    db.add(post)
    db.commit()
    db.refresh(post)
    
    return {"id": post.id, "title": post.title, "message": "Post created"}


@router.get("/posts")
def list_posts(
    category: str = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """List forum posts"""
    query = db.query(ForumPost).filter(ForumPost.is_locked == False)
    
    if category:
        query = query.filter(ForumPost.category == category)
    
    query = query.order_by(ForumPost.is_pinned.desc(), ForumPost.created_at.desc())
    posts = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "author": p.user.username,
            "replies": len(p.comments),
            "views": p.views,
            "pinned": p.is_pinned,
            "created_at": p.created_at
        }
        for p in posts
    ]


@router.get("/posts/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    """Get post details"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    post.views += 1
    db.commit()
    
    return {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "category": post.category,
        "author": post.user.username,
        "views": post.views,
        "comments": [
            {
                "id": c.id,
                "content": c.content,
                "author": c.user.username,
                "likes": c.likes,
                "is_solution": c.is_solution,
                "created_at": c.created_at
            }
            for c in post.comments
        ],
        "created_at": post.created_at
    }


@router.post("/posts/{post_id}/comments")
def comment_post(
    post_id: int,
    content: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Comment on post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.is_locked:
        raise HTTPException(status_code=403, detail="Post is locked")
    
    comment = ForumComment(
        post_id=post_id,
        user_id=current_user.id,
        content=content
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {"id": comment.id, "message": "Comment added"}


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete post"""
    post = db.query(ForumPost).filter(ForumPost.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted"}
