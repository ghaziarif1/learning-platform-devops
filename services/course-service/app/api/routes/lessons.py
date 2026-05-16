from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.course import Lesson, Course
from app.schemas.course import LessonCreate, LessonUpdate, LessonOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/courses/{course_id}/lessons", tags=["Lessons"])

@router.get("/", response_model=List[LessonOut])
def get_lessons(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    return db.query(Lesson).filter(Lesson.course_id == course_id).order_by(Lesson.order_index).all()

@router.post("/", response_model=LessonOut, status_code=201)
def create_lesson(
    course_id: int,
    lesson: LessonCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    if current_user.get("role") != "admin" and course.instructor_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à ajouter une leçon à ce cours")
    db_lesson = Lesson(**lesson.model_dump(), course_id=course_id)
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.put("/{lesson_id}", response_model=LessonOut)
def update_lesson(
    course_id: int,
    lesson_id: int,
    lesson: LessonUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    if current_user.get("role") != "admin" and course.instructor_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier cette leçon")

    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable")

    for key, value in lesson.model_dump(exclude_unset=True).items():
        setattr(db_lesson, key, value)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson

@router.delete("/{lesson_id}", status_code=204)
def delete_lesson(
    course_id: int,
    lesson_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    if current_user.get("role") != "admin" and course.instructor_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer cette leçon")

    db_lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == course_id).first()
    if not db_lesson:
        raise HTTPException(status_code=404, detail="Leçon introuvable")

    db.delete(db_lesson)
    db.commit()
