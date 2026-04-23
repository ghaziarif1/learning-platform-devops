from sqlalchemy import Column, Integer, String, Text, Boolean, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Course(Base):
    __tablename__ = "courses"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String(255), nullable=False)
    description  = Column(Text)
    instructor_id= Column(String(100), nullable=False)
    price        = Column(Numeric(10, 2), default=0.00)
    is_free      = Column(Boolean, default=True)
    category     = Column(String(100))
    level        = Column(String(50), default="beginner")
    thumbnail_url= Column(Text)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())

    lessons     = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id               = Column(Integer, primary_key=True, index=True)
    course_id        = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    title            = Column(String(255), nullable=False)
    content          = Column(Text)
    video_url        = Column(Text)
    duration_minutes = Column(Integer, default=0)
    order_index      = Column(Integer, default=0)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    course = relationship("Course", back_populates="lessons")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(String(100), nullable=False)
    course_id    = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    enrolled_at  = Column(DateTime(timezone=True), server_default=func.now())
    progress     = Column(Numeric(5, 2), default=0.00)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    course = relationship("Course", back_populates="enrollments")