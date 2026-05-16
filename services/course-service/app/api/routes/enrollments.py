from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from typing import List
from app.db.database import get_db
from app.models.course import Enrollment, Course
from app.schemas.course import EnrollmentCreate, EnrollmentOut
from app.services.auth import get_current_user
from pydantic import BaseModel

class EnrollmentProgressUpdate(BaseModel):
    progress: Decimal

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=EnrollmentOut, status_code=201)
def enroll(
    enrollment: EnrollmentCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin" and current_user.get("id") != enrollment.user_id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à inscrire un autre utilisateur")
    course = db.query(Course).filter(Course.id == enrollment.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    existing = db.query(Enrollment).filter(
        Enrollment.user_id == enrollment.user_id,
        Enrollment.course_id == enrollment.course_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Déjà inscrit à ce cours")
    db_enrollment = Enrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@router.get("/user/{user_id}", response_model=List[EnrollmentOut])
def get_user_enrollments(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin" and current_user.get("id") != user_id:
        raise HTTPException(status_code=403, detail="Accès interdit")
    return db.query(Enrollment).filter(Enrollment.user_id == user_id).all()

@router.patch("/{enrollment_id}/progress", response_model=EnrollmentOut)
def update_enrollment_progress(
    enrollment_id: int,
    payload: EnrollmentProgressUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=404, detail="Inscription introuvable")
    if current_user.get("role") != "admin" and current_user.get("id") != enrollment.user_id:
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à mettre à jour cette progression")
    enrollment.progress = payload.progress
    if payload.progress >= 100:
        enrollment.completed_at = func.now()
    db.commit()
    db.refresh(enrollment)
    return enrollment