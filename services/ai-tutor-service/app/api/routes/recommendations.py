from fastapi import APIRouter, HTTPException
import httpx
from app.schemas.ai import RecommendationRequest, RecommendationResponse
from app.services.ollama_client import get_recommendations
from app.config import settings

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/", response_model=RecommendationResponse)
async def recommend(request: RecommendationRequest):
    try:
        # Récupère les cours disponibles
        async with httpx.AsyncClient(timeout=5.0) as http:
            resp = await http.get(f"{settings.course_service_url}/courses/")
            available = resp.json() if resp.status_code == 200 else []

        simplified = [
            {"course_id": c["id"], "title": c["title"],
             "category": c.get("category"), "level": c.get("level")}
            for c in available
        ]

        result = await get_recommendations(
            completed_courses=request.completed_courses or [],
            interests=request.interests or [],
            current_level=request.current_level,
            available_courses=simplified
        )

        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=result.get("recommendations", []),
            reasoning=result.get("reasoning", "")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))