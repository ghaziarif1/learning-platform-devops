from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx
import pymongo
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Feedback Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB
mongo_client = pymongo.MongoClient(os.getenv("MONGO_URI"))
db = mongo_client["users_db"]
feedbacks_col = db["feedbacks"]

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL", "http://n8n:5678/webhook/feedback")
OLLAMA_URL      = os.getenv("OLLAMA_URL", "http://ollama:11434")
OLLAMA_MODEL    = os.getenv("OLLAMA_MODEL", "tinyllama")


class FeedbackCreate(BaseModel):
    user_id: str
    course_id: int
    course_title: str
    rating: int           # 1-5
    comment: Optional[str] = ""


class FeedbackOut(BaseModel):
    id: str
    user_id: str
    course_id: int
    course_title: str
    rating: int
    comment: str
    ai_summary: Optional[str] = ""
    created_at: str


async def summarize_feedback(comment: str, rating: int, course_title: str) -> str:
    """Résume le feedback avec Ollama."""
    if not comment:
        return f"Rating: {rating}/5 - No comment provided."
    try:
        prompt = (
            f"Summarize this student feedback in one sentence for the course '{course_title}'. "
            f"Rating: {rating}/5. Comment: {comment}"
        )
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False,
                      "options": {"num_predict": 100}}
            )
            return resp.json().get("response", "").strip()
    except Exception:
        return f"Rating {rating}/5: {comment[:100]}"


@app.post("/feedback", status_code=201)
async def submit_feedback(feedback: FeedbackCreate):
    """Reçoit un feedback, le résume avec IA, le stocke et notifie n8n."""

    # 1. Résumé IA
    ai_summary = await summarize_feedback(
        feedback.comment, feedback.rating, feedback.course_title
    )

    # 2. Stockage MongoDB
    doc = {
        "user_id":     feedback.user_id,
        "course_id":   feedback.course_id,
        "course_title":feedback.course_title,
        "rating":      feedback.rating,
        "comment":     feedback.comment or "",
        "ai_summary":  ai_summary,
        "created_at":  datetime.utcnow().isoformat()
    }
    result = feedbacks_col.insert_one(doc)
    doc_id = str(result.inserted_id)

    # 3. Déclencher le webhook n8n (non bloquant)
    payload = {
        "feedback_id": doc_id,
        "user_id":     feedback.user_id,
        "course_id":   feedback.course_id,
        "course_title":feedback.course_title,
        "rating":      feedback.rating,
        "comment":     feedback.comment or "",
        "ai_summary":  ai_summary,
        "created_at":  doc["created_at"]
    }
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(N8N_WEBHOOK_URL, json=payload)
    except Exception:
        pass  # n8n optionnel, ne bloque pas

    return {
        "success": True,
        "feedback_id": doc_id,
        "ai_summary": ai_summary,
        "message": "Feedback enregistré avec succès"
    }


@app.get("/feedback/course/{course_id}")
def get_course_feedbacks(course_id: int):
    """Récupère tous les feedbacks d'un cours."""
    docs = list(feedbacks_col.find({"course_id": course_id}, {"_id": 0}))
    avg = sum(d["rating"] for d in docs) / len(docs) if docs else 0
    return {
        "course_id": course_id,
        "total_feedbacks": len(docs),
        "average_rating": round(avg, 2),
        "feedbacks": docs
    }


@app.get("/feedback/stats")
def get_stats():
    """Statistiques globales des feedbacks."""
    total = feedbacks_col.count_documents({})
    pipeline = [{"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}]
    agg = list(feedbacks_col.aggregate(pipeline))
    avg = round(agg[0]["avg_rating"], 2) if agg else 0
    return {"total_feedbacks": total, "average_rating": avg}


@app.get("/health")
def health():
    return {"status": "OK", "service": "feedback-service"}