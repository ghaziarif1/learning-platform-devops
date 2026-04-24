from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.analytics import Event, CourseView
from app.schemas.analytics import EventCreate, EventOut, CourseViewCreate, CourseViewOut

router = APIRouter(prefix="/events", tags=["Events"])

@router.post("/", response_model=EventOut, status_code=201)
def track_event(event: EventCreate, db: Session = Depends(get_db)):
    db_event = Event(**event.model_dump())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/", response_model=List[EventOut])
def get_events(
    event_type: Optional[str] = None,
    course_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    if event_type: query = query.filter(Event.event_type == event_type)
    if course_id:  query = query.filter(Event.course_id == course_id)
    return query.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/views", response_model=CourseViewOut, status_code=201)
def track_view(view: CourseViewCreate, db: Session = Depends(get_db)):
    db_view = CourseView(**view.model_dump())
    db.add(db_view)
    db.commit()
    db.refresh(db_view)
    return db_view

@router.get("/views/course/{course_id}")
def get_course_views(course_id: int, db: Session = Depends(get_db)):
    count = db.query(CourseView).filter(CourseView.course_id == course_id).count()
    return {"course_id": course_id, "total_views": count}