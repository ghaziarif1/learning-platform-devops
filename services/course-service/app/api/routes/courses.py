from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseOut, CourseUpdate
from app.services.auth import get_current_user

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/", response_model=List[CourseOut])
def get_courses(
    skip: int = 0,
    limit: int = 20,
    category: Optional[str] = None,
    level: Optional[str] = None,
    is_free: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if category: query = query.filter(Course.category == category)
    if level:    query = query.filter(Course.level == level)
    if is_free is not None: query = query.filter(Course.is_free == is_free)
    if search:   query = query.filter(Course.title.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/{course_id}", response_model=CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    return course

@router.get("/instructor/{instructor_id}", response_model=List[CourseOut])
def get_instructor_courses(
    instructor_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") != "admin" and current_user.get("id") != instructor_id:
        raise HTTPException(status_code=403, detail="Accès interdit")
    return db.query(Course).filter(Course.instructor_id == instructor_id).all()

@router.post("/", response_model=CourseOut, status_code=201)
def create_course(
    course: CourseCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.get("role") not in ["instructor", "admin"]:
        raise HTTPException(status_code=403, detail="Accès réservé aux instructeurs")

    payload = course.model_dump()
    payload["instructor_id"] = current_user.get("id")
    db_course = Course(**payload)
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    course: CourseUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    if current_user.get("role") != "admin" and db_course.instructor_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à modifier ce cours")
    for key, value in course.model_dump(exclude_unset=True).items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if not db_course:
        raise HTTPException(status_code=404, detail="Cours introuvable")
    if current_user.get("role") != "admin" and db_course.instructor_id != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Vous n'êtes pas autorisé à supprimer ce cours")
    db.delete(db_course)
    db.commit()