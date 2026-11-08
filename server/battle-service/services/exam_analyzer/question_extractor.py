"""
Historical Question Paper Extractor.
Segments questions, subparts, marks, academic year, and question types from historical papers.
"""

import re
import hashlib
from typing import List, Dict, Any, Optional
from .models import ExtractedQuestionRecord


def extract_questions_from_paper(
    paper_text: str,
    academic_year: int = 2025,
    paper_id: str = "paper_default",
    owner_id: str = "guest"
) -> List[ExtractedQuestionRecord]:
    """
    Extracts individual question records from a past exam paper text.
    """
    if not paper_text or not paper_text.strip():
        return []

    lines = paper_text.splitlines()
    questions: List[ExtractedQuestionRecord] = []

    # Regex for question start markers:
    # Q.1, Q1, Question 2, 1., (a), 2(b), etc.
    q_start_regex = re.compile(
        r"^(?:(?:question|q|que)[\.\s]*([0-9]+[a-zA-Z\(\)]*)|([0-9]{1,2})[\.\)\-]\s+)(.*)$",
        re.IGNORECASE
    )

    # Marks regex: [5 Marks], (10), [5M], 10 marks, etc.
    marks_regex = re.compile(
        r"\[?\s*([0-9]{1,2})\s*(?:marks?|m)?\s*\]?$",
        re.IGNORECASE
    )

    current_q_num = ""
    current_q_lines: List[str] = []
    current_marks = 5

    def _flush_question():
        nonlocal current_q_num, current_q_lines, current_marks
        if not current_q_lines:
            return
        raw_text = " ".join(current_q_lines).strip()
        if len(raw_text) < 8:
            return

        # Check if marks are embedded in text
        marks_match = re.search(r"\[([0-9]{1,2})\s*(?:marks?|m)?\]|\(([0-9]{1,2})\s*marks?\)", raw_text, re.IGNORECASE)
        if marks_match:
            found_m = marks_match.group(1) or marks_match.group(2)
            if found_m and found_m.isdigit():
                current_marks = int(found_m)
            # Remove marks token from clean question text
            raw_text = re.sub(r"\[([0-9]{1,2})\s*(?:marks?|m)?\]|\(([0-9]{1,2})\s*marks?\)", "", raw_text).strip()

        # Classify question type
        q_type = "written"
        lower_text = raw_text.lower()
        if re.search(r"\b(a\)|b\)|c\)|d\)|\(a\)|\(b\)|\(c\)|\(d\))\b", lower_text) or "choose the correct" in lower_text:
            q_type = "mcq"
        elif current_marks <= 3:
            q_type = "short"
        elif current_marks >= 8:
            q_type = "long"

        # Unique hash for deduplication
        text_hash = hashlib.md5(re.sub(r"\W+", "", lower_text).encode()).hexdigest()

        q_record = ExtractedQuestionRecord(
            paperId=paper_id,
            ownerId=owner_id,
            academicYear=academic_year,
            questionNumber=current_q_num or f"Q{len(questions) + 1}",
            questionText=raw_text,
            marks=current_marks,
            questionType=q_type,
            textHash=text_hash,
            mappingConfidence=0.0,
            needsHumanReview=True
        )
        questions.append(q_record)
        current_q_lines = []
        current_marks = 5

    for line in lines:
        line_clean = line.strip()
        if not line_clean:
            continue

        # Skip exam header noise (Roll No, Time: 3 Hours, Total Marks: 100, etc.)
        if re.search(r"^(roll no|time\s*:\s*[0-9]|maximum marks|total marks|note\s*:|instructions|page [0-9])", line_clean, re.IGNORECASE):
            continue

        match = q_start_regex.match(line_clean)
        if match:
            _flush_question()
            current_q_num = match.group(1) or match.group(2) or f"Q{len(questions) + 1}"
            if not current_q_num.upper().startswith("Q"):
                current_q_num = f"Q{current_q_num}"
            remainder = match.group(3).strip()
            if remainder:
                current_q_lines.append(remainder)
        else:
            if current_q_lines or current_q_num:
                current_q_lines.append(line_clean)

    _flush_question()

    # If document had no standard Q1, Q2 numbering, split by sentences / question marks
    if not questions:
        raw_items = [p.strip() for p in re.split(r"(?<=[?\.\n])\s*(?=[A-Z0-9])", paper_text) if len(p.strip()) > 15]
        for idx, item in enumerate(raw_items[:25]):
            if "?" in item or any(w in item.lower() for w in ["explain", "define", "what is", "calculate", "describe", "discuss", "differentiate"]):
                questions.append(ExtractedQuestionRecord(
                    paperId=paper_id,
                    ownerId=owner_id,
                    academicYear=academic_year,
                    questionNumber=f"Q{idx + 1}",
                    questionText=item,
                    marks=5,
                    questionType="written",
                    textHash=hashlib.md5(item.encode()).hexdigest(),
                    mappingConfidence=0.0,
                    needsHumanReview=True
                ))

    return questions
