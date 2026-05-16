from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.routes import courses, lessons, enrollments, media
from app.config import settings

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Course Service",
    description="Gestion des cours, leçons et inscriptions",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(courses.router)
app.include_router(lessons.router)
app.include_router(enrollments.router)
app.include_router(media.router)

@app.on_event("startup")
def ensure_minio_bucket():
    from app.services.minio_client import ensure_bucket
    ensure_bucket(settings.minio_bucket)

@app.get("/health")
def health():
    return {"status": "OK", "service": "course-service"}