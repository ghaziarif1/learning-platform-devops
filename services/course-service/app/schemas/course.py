from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class LessonBase(BaseModel):
    title: str
    content: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 0
    order_index: int = 0

class LessonCreate(LessonBase):
    pass

class LessonOut(LessonBase):
    id: int
    course_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: Decimal = Decimal("0.00")
    is_free: bool = True
    category: Optional[str] = None
    level: str = "beginner"
    thumbnail_url: Optional[str] = None

class CourseCreate(CourseBase):
    instructor_id: str

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    is_free: Optional[bool] = None
    category: Optional[str] = None
    level: Optional[str] = None
    thumbnail_url: Optional[str] = None

class CourseOut(CourseBase):
    id: int
    instructor_id: str
    created_at: datetime
    lessons: List[LessonOut] = []
    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    user_id: str
    course_id: int

class EnrollmentOut(BaseModel):
    id: int
    user_id: str
    course_id: int
    enrolled_at: datetime
    progress: Decimal
    class Config:
        from_attributes = True