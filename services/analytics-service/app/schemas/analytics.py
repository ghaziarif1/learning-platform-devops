from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime

class EventCreate(BaseModel):
    event_type: str
    user_id: Optional[str] = None
    course_id: Optional[int] = None
    event_data: Optional[Dict[str, Any]] = None   # ← renommé

class EventOut(EventCreate):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CourseViewCreate(BaseModel):
    course_id: int
    user_id: Optional[str] = None
    duration_seconds: int = 0

class CourseViewOut(CourseViewCreate):
    id: int
    viewed_at: datetime
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_events: int
    total_views: int
    top_courses: List[Dict[str, Any]]
    enrollments_by_day: List[Dict[str, Any]]
    completions_by_day: List[Dict[str, Any]]