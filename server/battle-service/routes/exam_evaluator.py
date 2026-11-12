"""
Custom Exam & Study Arena — Fast API Routes for Document Exam Generation
and NumPy/Pandas ML Answer Evaluation.
"""

import re
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.exam_evaluator import evaluator

router = APIRouter(prefix="/api/custom-exam", tags=["Custom Exam Arena"])


class EvaluateRequest(BaseModel):
    studentAnswer: str
    modelAnswer: str
    keywords: Optional[List[str]] = None
    maxPoints: Optional[int] = 10


class GenerateQuestionsRequest(BaseModel):
    documentText: str
    questionCount: Optional[int] = 5
    examFormat: Optional[str] = "mcqs"  # 'mcqs' | 'written' | 'mixed'
    subject: Optional[str] = "General"


@router.post("/evaluate")
async def evaluate_answer(req: EvaluateRequest):
    """
    Evaluates student subjective written answer using NumPy cosine similarity
    and Pandas token matrices.
    """
    try:
        result = evaluator.evaluate_answer(
            student_answer=req.studentAnswer,
            model_answer=req.modelAnswer,
            keywords=req.keywords or [],
            max_points=req.maxPoints or 10,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML Evaluation failed: {str(e)}")


@router.post("/generate")
async def generate_exam_from_document(req: GenerateQuestionsRequest):
    """
    Extracts key academic concepts from user uploaded document/text and generates
    custom exam questions (MCQs and Written questions).
    """
    text = (req.documentText or "").strip()
    if len(text) < 20:
        text = "Fundamental concepts of academic problem solving, scientific principles, algorithm optimization, and historical exam patterns."

    count = max(2, min(20, req.questionCount or 5))
    fmt = req.examFormat or "mcqs"

    # Split text into meaningful sentences/paragraphs
    raw_sentences = [s.strip() for s in re.split(r"[.\n]+", text) if len(s.strip()) > 25]
    if len(raw_sentences) < count:
        raw_sentences.extend([
            "A computational algorithm optimizes resource utilization using dynamic programming and memoization.",
            "Statistical significance and probability distributions determine predictive model accuracy in machine learning.",
            "Database normalization eliminates redundancy and guarantees referential integrity through foreign key constraints.",
            "Newton's laws of motion describe the mathematical relationship between forces acting on a body and its momentum.",
            "Object-oriented programming utilizes encapsulation, inheritance, and polymorphism for modular design."
        ])

    questions = []
    for i in range(count):
        sentence = raw_sentences[i % len(raw_sentences)]
        words = [w for w in re.findall(r"\b[A-Za-z]{4,}\b", sentence)]
        key_term = words[0] if words else "Principle"
        q_id = f"cq-{i+1}-{uuid.uuid4().hex[:6]}"

        # Determine question type
        is_written = fmt == "written" or (fmt == "mixed" and i % 2 == 1)

        if is_written:
            questions.append({
                "id": q_id,
                "question": f"Explain the principle and importance of: '{sentence[:90]}...'",
                "type": "written",
                "modelAnswer": sentence,
                "keywords": words[:5] if words else ["principle", "analysis", "system"],
                "explanation": f"Reference model answer extracted from provided document: '{sentence}'",
                "points": 10,
            })
        else:
            # Generate MCQ with realistic randomized distractors
            correct_text = sentence
            distractor_1 = f"Contradicts the primary concept of {key_term} and leads to system instability."
            distractor_2 = f"Applies only in static non-deterministic environments under zero load conditions."
            distractor_3 = f"An obsolete historical framework superseded by modern analytical standards."
            
            # Use another sentence from document as distractor if available
            if len(raw_sentences) > 1:
                other_sentence = raw_sentences[(i + 1) % len(raw_sentences)]
                distractor_1 = f"Requires replacing {key_term} with: {other_sentence[:75]}."

            raw_options = [correct_text, distractor_1, distractor_2, distractor_3]
            # Shuffle options deterministically based on question index
            shuffled_indices = [(i + offset) % 4 for offset in range(4)]
            # Deterministic permutation
            perm = [
                [0, 1, 2, 3],
                [1, 0, 3, 2],
                [2, 3, 0, 1],
                [3, 2, 1, 0],
            ][i % 4]
            
            shuffled_options = [raw_options[idx] for idx in perm]
            correct_index = perm.index(0)

            questions.append({
                "id": q_id,
                "question": f"According to the study material, which statement accurately describes {key_term}?",
                "type": "mcq",
                "options": shuffled_options,
                "correctIndex": correct_index,
                "correctOption": correct_index,
                "explanation": f"Directly stated in study material: '{sentence}'",
                "points": 10,
            })

    return {
        "success": True,
        "questionCount": len(questions),
        "examFormat": fmt,
        "questions": questions,
    }
