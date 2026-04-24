from fastapi import APIRouter, HTTPException
from app.schemas.ai import QuizRequest, QuizResponse, QuizQuestion
from app.services.ollama_client import generate_quiz

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.post("/generate", response_model=QuizResponse)
async def create_quiz(request: QuizRequest):
    try:
        questions_raw = await generate_quiz(
            course_title=request.course_title,
            lesson_content=request.lesson_content,
            num_questions=request.num_questions,
            difficulty=request.difficulty
        )
        questions = [QuizQuestion(**q) for q in questions_raw]
        return QuizResponse(course_id=request.course_id, questions=questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))