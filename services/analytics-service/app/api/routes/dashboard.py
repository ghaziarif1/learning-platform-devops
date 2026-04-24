from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.db.database import get_db
from app.models.analytics import Event, CourseView
from app.schemas.analytics import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):

    total_events = db.query(Event).count()
    total_views  = db.query(CourseView).count()

    # Top 5 cours les plus vus
    top_courses_raw = (
        db.query(CourseView.course_id, func.count(CourseView.id).label("views"))
        .group_by(CourseView.course_id)
        .order_by(func.count(CourseView.id).desc())
        .limit(5)
        .all()
    )
    top_courses = [{"course_id": r[0], "views": r[1]} for r in top_courses_raw]

    # Inscriptions par jour (7 derniers jours)
    enrollments_raw = db.execute(text("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM events
        WHERE event_type = 'enrollment'
          AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY day
    """)).fetchall()
    enrollments_by_day = [{"day": str(r[0]), "count": r[1]} for r in enrollments_raw]

    # Complétions par jour (7 derniers jours)
    completions_raw = db.execute(text("""
        SELECT DATE(created_at) as day, COUNT(*) as count
        FROM events
        WHERE event_type = 'completion'
          AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY DATE(created_at)
        ORDER BY day
    """)).fetchall()
    completions_by_day = [{"day": str(r[0]), "count": r[1]} for r in completions_raw]

    return DashboardStats(
        total_events=total_events,
        total_views=total_views,
        top_courses=top_courses,
        enrollments_by_day=enrollments_by_day,
        completions_by_day=completions_by_day
    )

@router.get("/course/{course_id}")
def get_course_analytics(course_id: int, db: Session = Depends(get_db)):
    views       = db.query(CourseView).filter(CourseView.course_id == course_id).count()
    enrollments = db.query(Event).filter(
        Event.event_type == "enrollment", Event.course_id == course_id
    ).count()
    completions = db.query(Event).filter(
        Event.event_type == "completion", Event.course_id == course_id
    ).count()

    return {
        "course_id":   course_id,
        "views":       views,
        "enrollments": enrollments,
        "completions": completions,
        "completion_rate": round((completions / enrollments * 100), 2) if enrollments > 0 else 0
    }