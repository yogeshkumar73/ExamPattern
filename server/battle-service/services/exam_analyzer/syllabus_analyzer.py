"""
Syllabus Analyzer Module.
Detects units, headings, hierarchical subtopics, and normalized keywords from syllabus text.
"""

import re
from typing import List, Dict, Any
from .models import SyllabusTopicRecord


def analyze_syllabus(syllabus_text: str, syllabus_id: str = "syl_default", owner_id: str = "guest") -> List[SyllabusTopicRecord]:
    """
    Parses unstructured syllabus text into structured units and topic records.
    """
    if not syllabus_text or not syllabus_text.strip():
        return []

    lines = [line.strip() for line in syllabus_text.splitlines() if line.strip()]
    
    # Regex patterns for unit headers
    unit_pattern = re.compile(
        r"^(?:unit|module|chapter|section|part)\s*([0-9IVXLCDMivxlcdm]+)[\s:\-\.]*(.*)$",
        re.IGNORECASE
    )

    current_unit_number = 1
    current_unit_title = "General Core Syllabus"
    topics: List[SyllabusTopicRecord] = []
    seen_normalized = set()

    for line in lines:
        # Check if line indicates a unit header
        unit_match = unit_pattern.match(line)
        if unit_match:
            raw_num = unit_match.group(1)
            raw_title = unit_match.group(2).strip()
            
            # Convert roman or string num to integer
            current_unit_number = _parse_number(raw_num, fallback=current_unit_number + 1)
            current_unit_title = f"Unit {current_unit_number}: {raw_title}" if raw_title else f"Unit {current_unit_number}"
            continue

        # Split line by commas, semicolons, bullets, or dashes if multiple topics are listed
        sub_items = re.split(r"[,;•\t]|\s{3,}|\s*-\s*", line)
        for item in sub_items:
            clean_item = re.sub(r"^[0-9]+[\.\)\-]\s*", "", item).strip()
            # Must be a reasonable length for a topic
            if len(clean_item) < 3 or len(clean_item) > 120:
                continue

            # Skip common non-topic header noise
            if clean_item.lower() in {"syllabus", "hours", "credits", "reference books", "text books", "course objectives", "course outcomes"}:
                continue

            norm_name = clean_item.lower().strip()
            if norm_name in seen_normalized:
                continue
            seen_normalized.add(norm_name)

            # Generate keywords
            keywords = [w for w in re.findall(r"\b[a-zA-Z]{3,}\b", norm_name) if w not in {"the", "and", "for", "with", "into", "from", "overview", "introduction"}]

            topic = SyllabusTopicRecord(
                syllabusId=syllabus_id,
                ownerId=owner_id,
                unitNumber=current_unit_number,
                unitTitle=current_unit_title,
                topicName=clean_item,
                normalizedName=norm_name,
                keywords=keywords[:8],
                importance=7.0
            )
            topics.append(topic)

    # Fallback if no specific units were detected
    if not topics and len(lines) > 0:
        for idx, line in enumerate(lines[:15]):
            if len(line) >= 4:
                topics.append(SyllabusTopicRecord(
                    syllabusId=syllabus_id,
                    ownerId=owner_id,
                    unitNumber=1,
                    unitTitle="Core Topics",
                    topicName=line[:80],
                    normalizedName=line[:80].lower(),
                    keywords=re.findall(r"\b[a-zA-Z]{3,}\b", line.lower())[:6],
                    importance=6.0
                ))

    return topics


def _parse_number(val: str, fallback: int) -> int:
    roman_map = {'i': 1, 'v': 5, 'x': 10, 'l': 50, 'c': 100}
    val_clean = val.lower().strip()
    if val_clean.isdigit():
        return int(val_clean)
    try:
        total = 0
        prev = 0
        for ch in reversed(val_clean):
            curr = roman_map.get(ch, 0)
            if curr >= prev:
                total += curr
            else:
                total -= curr
            prev = curr
        return total if total > 0 else fallback
    except Exception:
        return fallback
