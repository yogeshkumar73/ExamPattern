"""
General-purpose utility functions for Battle Service.
"""

import random
import string
import uuid
from datetime import datetime, timezone
from typing import Any


import hashlib
from config import settings


def generate_id(prefix: str = "q", question_text: str = "") -> str:
    """Generate a unique ID with prefix. If question_text is provided, uses its MD5 hash."""
    if question_text:
        hash_str = hashlib.md5(question_text.strip().encode("utf-8")).hexdigest()[:12]
        return f"{prefix}-{hash_str}"
    short = uuid.uuid4().hex[:12]
    return f"{prefix}-{short}"


def get_difficulty_for_level(level: int) -> str:
    """Determine difficulty tier based on user level using config mapping."""
    mapping = settings.LEVEL_DIFFICULTY_MAPPING
    for diff, range_vals in mapping.items():
        if len(range_vals) == 2 and range_vals[0] <= level <= range_vals[1]:
            return diff
    return "beginner"


def generate_room_id() -> str:
    """Generate a unique room ID. Example: 'room-1690000000-x7k2m9'."""
    ts = int(datetime.now(timezone.utc).timestamp())
    suffix = "".join(random.choices(string.ascii_lowercase + string.digits, k=6))
    return f"room-{ts}-{suffix}"


def utc_now() -> datetime:
    """Return current UTC datetime."""
    return datetime.now(timezone.utc)


def shuffle_options_with_answer(
    options: list[str], correct_answer: str
) -> tuple[list[str], str]:
    """
    Shuffle MCQ options while tracking the correct answer.

    Returns:
        Tuple of (shuffled_options, correct_answer) — correct_answer value
        is unchanged, but its position in the list moves.
    """
    shuffled = list(options)
    random.shuffle(shuffled)
    return shuffled, correct_answer


def clamp(value: int | float, min_val: int | float, max_val: int | float) -> int | float:
    """Clamp a value between min and max bounds."""
    return max(min_val, min(value, max_val))


def calculate_xp(difficulty: str) -> int:
    """Return XP reward for a given difficulty tier."""
    xp_map: dict[str, int] = {
        "beginner": 50,
        "intermediate": 100,
        "advanced": 200,
    }
    return xp_map.get(difficulty, 50)


def calculate_coins(difficulty: str) -> int:
    """Return coin reward for a given difficulty tier."""
    coin_map: dict[str, int] = {
        "beginner": 10,
        "intermediate": 25,
        "advanced": 50,
    }
    return coin_map.get(difficulty, 10)


def calculate_time_limit(difficulty: str) -> int:
    """Return time limit in seconds for a given difficulty tier."""
    time_map: dict[str, int] = {
        "beginner": 30,
        "intermediate": 45,
        "advanced": 60,
    }
    return time_map.get(difficulty, 60)


def paginate(items: list[Any], page: int, limit: int) -> list[Any]:
    """Simple in-memory pagination."""
    start = (page - 1) * limit
    return items[start : start + limit]


def deduplicate_by_id(items: list[dict], id_field: str = "id") -> list[dict]:
    """Remove items with duplicate IDs, preserving order."""
    seen: set[str] = set()
    result: list[dict] = []
    for item in items:
        item_id = item.get(id_field, "")
        if item_id not in seen:
            seen.add(item_id)
            result.append(item)
    return result
