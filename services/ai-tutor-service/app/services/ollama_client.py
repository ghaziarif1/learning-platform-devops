import httpx
import json
from app.config import settings


async def _generate(prompt: str, system: str = "") -> str:
    """Appel direct à l'API Ollama."""
    payload = {
        "model": settings.ollama_model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": 512
        }
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{settings.ollama_url}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "")


async def ask_tutor(course_title: str, course_description: str,
                    user_question: str, conversation_history: list) -> dict:
    """Répond à la question d'un apprenant."""

    system = (
        f"You are a helpful tutor for the course: {course_title}. "
        f"Course description: {course_description}. "
        "Answer clearly and concisely in the same language as the question. "
        "After your answer, suggest 2 follow-up questions on new lines starting with 'Suggestion:'."
    )

    # Construire l'historique dans le prompt
    history_text = ""
    for msg in (conversation_history or []):
        role = "Student" if msg.role == "user" else "Tutor"
        history_text += f"{role}: {msg.content}\n"

    prompt = f"{history_text}Student: {user_question}\nTutor:"

    raw = await _generate(prompt, system)

    # Séparer la réponse des suggestions
    lines = raw.strip().split("\n")
    answer_lines = []
    suggestions = []
    for line in lines:
        if line.strip().startswith("Suggestion:"):
            suggestions.append(line.replace("Suggestion:", "").strip())
        else:
            answer_lines.append(line)

    return {
        "answer": "\n".join(answer_lines).strip(),
        "suggestions": suggestions[:3]
    }


async def generate_quiz(course_title: str, lesson_content: str,
                        num_questions: int, difficulty: str) -> list:
    """Génère un quiz en JSON."""

    system = (
        "You are a quiz generator. Always respond with ONLY valid JSON, no explanation. "
        "No markdown, no backticks."
    )

    prompt = f"""Generate {num_questions} multiple choice questions ({difficulty} level) about "{course_title}".
Content: {lesson_content[:500]}

Respond ONLY with this JSON array:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": 0,
    "explanation": "..."
  }}
]"""

    raw = await _generate(prompt, system)

    # Nettoyer et parser le JSON
    clean = raw.strip()
    # Trouver le tableau JSON dans la réponse
    start = clean.find("[")
    end = clean.rfind("]") + 1
    if start != -1 and end > start:
        clean = clean[start:end]

    try:
        return json.loads(clean)
    except Exception:
        # Fallback : retourner des questions par défaut
        return [
            {
                "question": f"What is the main topic of {course_title}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,
                "explanation": "Based on the course content."
            }
        ]


async def get_recommendations(completed_courses: list, interests: list,
                               current_level: str, available_courses: list) -> dict:
    """Recommande des cours."""

    system = (
        "You are a learning advisor. Respond ONLY with valid JSON, no extra text."
    )

    courses_text = ", ".join([f"{c['title']} (id:{c['course_id']})" for c in available_courses[:10]])

    prompt = f"""Student profile:
- Completed: {completed_courses}
- Interests: {interests}
- Level: {current_level}

Available courses: {courses_text}

Recommend 3 courses. Respond ONLY with this JSON:
{{
  "recommendations": [
    {{"course_id": 1, "title": "...", "reason": "..."}}
  ],
  "reasoning": "Overall learning strategy"
}}"""

    raw = await _generate(prompt, system)

    clean = raw.strip()
    start = clean.find("{")
    end = clean.rfind("}") + 1
    if start != -1 and end > start:
        clean = clean[start:end]

    try:
        return json.loads(clean)
    except Exception:
        # Fallback
        recs = [
            {"course_id": c["course_id"], "title": c["title"],
             "reason": f"Matches your interest in {interests[0] if interests else 'learning'}"}
            for c in available_courses[:3]
        ]
        return {"recommendations": recs, "reasoning": "Based on your profile."}