from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from ..core.database import get_db
from ..core.security import get_current_user
from ..models.user import User
from ..models.resource import Resource, ResourceCategory, ResourceLike, ResourceComment

router = APIRouter(tags=["resources"])


@router.post("/")
def create_resource(
    title: str = Query(...),
    description: str = Query(None),
    content: str = Query(...),
    category: ResourceCategory = Query(...),
    tags: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new resource"""
    resource = Resource(
        user_id=current_user.id,
        title=title,
        description=description,
        content=content,
        category=category,
        tags=tags
    )
    
    db.add(resource)
    db.commit()
    db.refresh(resource)
    
    return {
        "id": resource.id,
        "title": resource.title,
        "message": "Resource created successfully"
    }


@router.get("/")
def list_resources(
    category: ResourceCategory = Query(None),
    skip: int = Query(0),
    limit: int = Query(20),
    db: Session = Depends(get_db)
):
    """List resources"""
    query = db.query(Resource).filter(Resource.is_published == True)
    
    if category:
        query = query.filter(Resource.category == category)
    
    resources = query.offset(skip).limit(limit).all()
    
    return [
        {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "category": r.category,
            "author": r.user.username,
            "views": r.views,
            "created_at": r.created_at
        }
        for r in resources
    ]


@router.get("/{resource_id}")
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    """Get resource details"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    resource.views += 1
    db.commit()
    
    return {
        "id": resource.id,
        "title": resource.title,
        "description": resource.description,
        "content": resource.content,
        "category": resource.category,
        "author": resource.user.username,
        "views": resource.views,
        "tags": resource.tags.split(",") if resource.tags else [],
        "created_at": resource.created_at
    }


@router.post("/{resource_id}/like")
def like_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Like a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    existing_like = db.query(ResourceLike).filter(
        (ResourceLike.resource_id == resource_id) &
        (ResourceLike.user_id == current_user.id)
    ).first()
    
    if existing_like:
        db.delete(existing_like)
    else:
        like = ResourceLike(resource_id=resource_id, user_id=current_user.id)
        db.add(like)
    
    db.commit()
    
    return {"message": "Like toggled"}


@router.post("/{resource_id}/comment")
def comment_resource(
    resource_id: int,
    content: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Comment on a resource"""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    comment = ResourceComment(
        resource_id=resource_id,
        user_id=current_user.id,
        content=content
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {
        "id": comment.id,
        "content": comment.content,
        "author": current_user.username,
        "message": "Comment added"
    }
