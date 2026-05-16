import io
from uuid import uuid4
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.config import settings
from app.services.minio_client import upload_media, build_media_url

router = APIRouter(prefix="/media", tags=["Media"])

@router.post("/upload")
async def upload_media_file(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    filename = f"{uuid4().hex}-{file.filename}"
    content = await file.read()
    try:
        upload_media(settings.minio_bucket, filename, io.BytesIO(content), file.content_type or "application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")

    url = build_media_url(settings.minio_bucket, filename)
    return {"url": url}
