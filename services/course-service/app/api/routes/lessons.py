from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.course import Lesson, Course
from app.schemas.course import LessonCreate, LessonOut

router = APIRouter(prefix="/courses/{course_id}/lessons", tags=["Lessons"])

@router.get("/", response_model=List[LessonOut])
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    return db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()

@router.post("/", response_model=LessonOut, status_code=201)
def create_lesson(course_id: int, lesson: LessonCreate, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    db_lesson = Lesson(**lesson.model_dump(), course_id=course_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson