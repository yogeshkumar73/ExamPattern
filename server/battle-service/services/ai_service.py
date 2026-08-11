"""
AI Service — Optional AI question generation with graceful fallback.

If OPENAI_API_KEY is missing or the API call fails, this service
returns an empty list and logs a WARNING. The caller then falls back
to Python generators. The frontend NEVER knows AI was attempted.

Prediction mode is NEVER routed through this service — it always
uses PredictionGenerator.
"""

import json
from typing import Optional

import httpx

from config import settings
from models.question import QuestionModel, GameMode, Difficulty, QuestionType
from utils.logger import get_logger
from utils.helpers import generate_id, calculate_xp, calculate_coins, calculate_time_limit

logger = get_logger(__name__)

# Prediction mode must never use AI
_AI_BLOCKED_MODES = {GameMode.PREDICTION.value}

# Determine base URL (OpenRouter vs OpenAI)
def _get_api_url() -> str:
    key = settings.OPENAI_API_KEY or ""
    if key.startswith("sk-or-v1-"):
        return "https://openrouter.ai/api/v1/chat/completions"
    return "https://api.openai.com/v1/chat/completions"

def _get_model() -> str:
    key = settings.OPENAI_API_KEY or ""
    if key.startswith("sk-or-v1-"):
        return "meta-llama/llama-3.3-70b-instruct"
    return settings.AI_MODEL


class AIService:
    """
    Optional AI question generation service.

    Characteristics:
    - Never raises exceptions to callers
    - Returns [] on any failure (caller uses generator fallback)
    - Prediction mode is unconditionally blocked
    - Saves generated questions to MongoDB via QuestionService
    """

    @property
    def is_available(self) -> bool:
        """True only when AI is enabled AND an API key is configured."""
        return settings.ai_available

    def is_blocked_mode(self, mode: str) -> bool:
        """Prediction mode must never use AI."""
        return mode in _AI_BLOCKED_MODES

    async def generate_questions(
        self,
        mode: str,
        difficulty: str,
        count: int = 10,
        topic: Optional[str] = None,
        user_level: Optional[int] = None,
        previously_used_ids: Optional[list[str]] = None,
        previous_generated_questions: Optional[list[str]] = None,
    ) -> list[QuestionModel]:
        """
        Generate questions via AI. Returns [] on any failure or if unavailable.

        Never raises. Never called for prediction mode.
        """
        if not self.is_available:
            logger.warning("AI unavailable (no API key or AI_ENABLED=false). Using static questions.")
            return []

        if self.is_blocked_mode(mode):
            logger.info("Prediction mode blocked from AI — using PredictionGenerator.")
            return []

        prompt = self._build_prompt(
            mode, difficulty, count, topic, user_level, previously_used_ids, previous_generated_questions
        )

        try:
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.post(
                    _get_api_url(),
                    headers={
                        "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": _get_model(),
                        "messages": [
                            {"role": "system", "content": self._system_prompt(mode, difficulty)},
                            {"role": "user", "content": prompt},
                        ],
                        "temperature": settings.AI_TEMPERATURE,
                        "max_tokens": settings.AI_MAX_TOKENS,
                    },
                )

            if resp.status_code != 200:
                logger.warning("AI API returned %d. Falling back to static questions.", resp.status_code)
                return []

            content = resp.json()["choices"][0]["message"]["content"]
            return self._parse_response(content, mode, difficulty)

        except Exception as exc:
            logger.warning("AI generation failed (%s). Using static questions.", exc)
            return []

    # ── Internal helpers ──────────────────────────────────────

    def _system_prompt(self, mode: str, difficulty: str) -> str:
        return (
            f"You are an expert educational content creator for a competitive study platform. "
            f"Generate exactly the requested number of {difficulty} level {mode} questions. "
            f"Return ONLY a valid JSON array. No explanation, no markdown, no preamble. "
            f"Each object must have: id, question, options (array of 4 strings), "
            f"correct_answer, explanation, hint, topic, tags (array)."
        )

    def _build_prompt(
        self,
        mode: str,
        difficulty: str,
        count: int,
        topic: Optional[str],
        user_level: Optional[int] = None,
        previously_used_ids: Optional[list[str]] = None,
        previous_generated_questions: Optional[list[str]] = None,
    ) -> str:
        topic_str = f" about {topic}" if topic else ""
        level_str = f" for a user at Level {user_level}" if user_level else ""
        
        avoid_str = ""
        if previously_used_ids or previous_generated_questions:
            avoid_items = []
            if previously_used_ids:
                avoid_items.append(f"previously used question IDs: {', '.join(previously_used_ids)}")
            if previous_generated_questions:
                avoid_items.append(f"previously generated question content: {'; '.join(previous_generated_questions)}")
            avoid_str = " CRITICAL: Avoid repeating or generating questions similar to: " + " and ".join(avoid_items) + "."

        return (
            f"Generate {count} {difficulty} level {mode} questions{topic_str}{level_str}. "
            f"Return as JSON array only.{avoid_str}"
        )

    def _parse_response(
        self, content: str, mode: str, difficulty: str
    ) -> list[QuestionModel]:
        """Parse AI JSON response into QuestionModel list. Returns [] on parse error."""
        try:
            # Extract JSON array from response
            start = content.find("[")
            end = content.rfind("]") + 1
            if start == -1 or end == 0:
                raise ValueError("No JSON array found in AI response")

            raw_list: list[dict] = json.loads(content[start:end])

            questions: list[QuestionModel] = []
            for item in raw_list:
                if not isinstance(item, dict):
                    continue
                question_text = item.get("question") or item.get("title", "")
                if not question_text:
                    continue

                try:
                    diff = Difficulty(difficulty)
                except ValueError:
                    diff = Difficulty.BEGINNER

                q = QuestionModel(
                    id=generate_id("ai"),
                    mode=GameMode(mode) if mode in [m.value for m in GameMode] else GameMode.MIXED,
                    difficulty=diff,
                    topic=item.get("topic", mode),
                    question=question_text,
                    question_type=QuestionType.MCQ,
                    options=item.get("options", [])[:4],
                    correct_answer=str(item.get("correct_answer", "")),
                    explanation=item.get("explanation", ""),
                    hint=item.get("hint", ""),
                    time_limit=calculate_time_limit(difficulty),
                    xp=calculate_xp(difficulty),
                    coins=calculate_coins(difficulty),
                    tags=item.get("tags", [mode]),
                )
                questions.append(q)

            logger.info("AI generated %d valid questions for mode=%s difficulty=%s", len(questions), mode, difficulty)
            return questions

        except Exception as exc:
            logger.warning("Failed to parse AI response: %s", exc)
            return []
