import anthropic
import json
from app.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

async def ask_tutor(
    course_title: str,
    course_description: str,
    user_question: str,
    conversation_history: list
) -> dict:
    """Répond à la question d'un apprenant dans le contexte d'un cours."""

    system_prompt = f"""Tu es un tuteur pédagogique expert et bienveillant pour la plateforme d'apprentissage.
Tu aides les apprenants à comprendre le contenu du cours suivant :

Cours : {course_title}
Description : {course_description}

Règles :
- Réponds en français, de manière claire et pédagogique
- Donne des exemples concrets quand c'est utile
- Si la question est hors-sujet, redirige poliment vers le contenu du cours
- Propose 2-3 questions de suivi pertinentes à la fin de ta réponse
- Format de réponse JSON : {{"answer": "...", "suggestions": ["...", "...", "..."]}}
"""

    messages = []
    for msg in conversation_history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": user_question})

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=messages
    )

    raw = response.content[0].text
    try:
        # Nettoyer le JSON si entouré de backticks
        clean = raw.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception:
        return {"answer": raw, "suggestions": []}


async def generate_quiz(
    course_title: str,
    lesson_content: str,
    num_questions: int,
    difficulty: str
) -> list:
    """Génère un quiz basé sur le contenu d'une leçon."""

    system_prompt = """Tu es un expert en création de quiz pédagogiques.
Tu génères des questions QCM de qualité basées sur le contenu fourni.
Réponds UNIQUEMENT avec un JSON valide, sans texte avant ou après."""

    user_prompt = f"""Génère {num_questions} questions QCM de niveau {difficulty} pour le cours "{course_title}".

Contenu de la leçon :
{lesson_content}

Format JSON attendu (tableau de questions) :
[
  {{
    "question": "La question ici ?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Explication de la bonne réponse"
  }}
]

correct_answer est l'index (0-3) de la bonne réponse dans le tableau options.
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )

    raw = response.content[0].text
    clean = raw.strip().strip("```json").strip("```").strip()
    return json.loads(clean)


async def get_recommendations(
    completed_courses: list,
    interests: list,
    current_level: str,
    available_courses: list
) -> dict:
    """Génère des recommandations personnalisées pour un apprenant."""

    system_prompt = """Tu es un conseiller pédagogique IA.
Tu analyses le profil d'un apprenant et recommandes des cours adaptés.
Réponds UNIQUEMENT avec un JSON valide."""

    user_prompt = f"""Profil de l'apprenant :
- Cours complétés : {completed_courses}
- Centres d'intérêt : {interests}
- Niveau actuel : {current_level}

Cours disponibles sur la plateforme :
{json.dumps(available_courses, ensure_ascii=False, indent=2)}

Recommande les 3 cours les plus pertinents.
Format JSON :
{{
  "recommendations": [
    {{"course_id": 1, "title": "...", "reason": "Pourquoi ce cours est recommandé"}},
    ...
  ],
  "reasoning": "Explication globale de la stratégie d'apprentissage recommandée"
}}
"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )

    raw = response.content[0].text
    clean = raw.strip().strip("```json").strip("```").strip()
    return json.loads(clean)