from fastapi import APIRouter

router = APIRouter(prefix="/api/materials", tags=["materials"])


@router.get("/")
def list_materials():
    """List study materials"""
    return {"message": "Study materials list"}


@router.post("/upload")
def upload_material():
    """Upload study material"""
    return {"message": "Material uploaded"}
