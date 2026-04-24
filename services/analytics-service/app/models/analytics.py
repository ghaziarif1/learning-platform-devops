from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.database import Base

class CourseView(Base):
    __tablename__ = "course_views"

    id               = Column(Integer, primary_key=True, index=True)
    course_id        = Column(Integer, nullable=False, index=True)
    user_id          = Column(String(100), index=True)
    viewed_at        = Column(DateTime(timezone=True), server_default=func.now())
    duration_seconds = Column(Integer, default=0)


class Event(Base):
    __tablename__ = "events"

    id         = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False, index=True)
    user_id    = Column(String(100), index=True)
    course_id  = Column(Integer, index=True)
    event_data = Column(JSON, nullable=True)   # ← renommé
    created_at = Column(DateTime(timezone=True), server_default=func.now())