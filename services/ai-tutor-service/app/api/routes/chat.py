from fastapi import APIRouter, HTTPException
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ollama_client import ask_tutor

router = APIRouter(prefix="/chat", tags=["Chat Q&A"])

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = await ask_tutor(
            course_title=request.course_title,
            course_description=request.course_description or "",
            user_question=request.user_question,
            conversation_history=request.conversation_history or []
        )
        return ChatResponse(
            answer=result.get("answer", ""),
            suggestions=result.get("suggestions", [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))