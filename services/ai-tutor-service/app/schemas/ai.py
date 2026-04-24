from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    course_id: int
    course_title: str
    course_description: Optional[str] = ""
    user_question: str
    conversation_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    answer: str
    suggestions: Optional[List[str]] = []

class QuizRequest(BaseModel):
    course_id: int
    course_title: str
    lesson_content: str
    num_questions: int = 3
    difficulty: str = "medium"

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class QuizResponse(BaseModel):
    course_id: int
    questions: List[QuizQuestion]

class RecommendationRequest(BaseModel):
    user_id: str
    completed_courses: Optional[List[str]] = []
    interests: Optional[List[str]] = []
    current_level: str = "beginner"

class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: List[Dict[str, Any]]
    reasoning: str