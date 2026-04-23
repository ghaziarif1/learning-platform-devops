from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.course import Enrollment, Course
from app.schemas.course import EnrollmentCreate, EnrollmentOut

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])

@router.post("/", response_model=EnrollmentOut, status_code=201)
def enroll(enrollment: EnrollmentCreate, db: Session = Depends(get_db)):
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
def get_user_enrollments(user_id: str, db: Session = Depends(get_db)):
    return db.query(Enrollment).filter(Enrollment.user_id == user_id).all()