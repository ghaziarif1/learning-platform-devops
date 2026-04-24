from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import chat, quiz, recommendations

app = FastAPI(
    title="AI Tutor Service",
    description="Q&A, quiz et recommandations avec Ollama (local, gratuit)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(recommendations.router)

@app.get("/health")
def health():
    return {"status": "OK", "service": "ai-tutor-service"}