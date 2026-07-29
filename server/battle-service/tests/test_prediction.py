"""
Unit tests for the PredictionGenerator.

Verifies that:
- All 16 pattern types generate valid questions
- Each question has a correct_answer in options
- No duplicate IDs in a batch
- Explanations are non-empty
- Sequences are present where expected
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from generators.prediction_generator import PredictionGenerator
from models.question import Difficulty, QuestionType


@pytest.fixture
def gen():
    return PredictionGenerator()


def _validate_question(q, difficulty):
    """Common question validation."""
    assert q.id, "Question must have an ID"
    assert q.question, "Question must have text"
    assert q.correct_answer, "Question must have a correct answer"
    assert q.explanation, "Question must have an explanation"
    assert q.time_limit > 0, "Time limit must be positive"
    assert q.xp > 0, "XP must be positive"
    assert q.coins > 0, "Coins must be positive"
    assert q.difficulty == difficulty
    assert q.mode.value == "prediction"
    # Correct answer must be in options (for MCQ types)
    if q.options:
        assert q.correct_answer in q.options, \
            f"Correct answer '{q.correct_answer}' not in options {q.options}"


class TestPredictionGeneratorPatterns:
    """Test each individual pattern type."""

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_arithmetic_series(self, gen, difficulty):
        q = gen._gen_arithmetic(difficulty)
        _validate_question(q, difficulty)
        assert "sequence" in q.question.lower() or "next" in q.question.lower()

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_geometric_series(self, gen, difficulty):
        q = gen._gen_geometric(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_fibonacci_variant(self, gen, difficulty):
        q = gen._gen_fibonacci(difficulty)
        _validate_question(q, difficulty)
        assert q.sequence is not None and len(q.sequence) >= 5

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_missing_number(self, gen, difficulty):
        q = gen._gen_missing_number(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_prime_number(self, gen, difficulty):
        q = gen._gen_prime(difficulty)
        _validate_question(q, difficulty)
        # Answer should be an integer (prime)
        assert int(q.correct_answer) > 1

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_odd_even(self, gen, difficulty):
        q = gen._gen_odd_even(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_binary(self, gen, difficulty):
        q = gen._gen_binary(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_hexadecimal(self, gen, difficulty):
        q = gen._gen_hexadecimal(difficulty)
        _validate_question(q, difficulty)
        # Hex answer should be uppercase
        assert q.correct_answer == q.correct_answer.upper()

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_roman_numeral(self, gen, difficulty):
        q = gen._gen_roman(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_alphabet(self, gen, difficulty):
        q = gen._gen_alphabet(difficulty)
        _validate_question(q, difficulty)
        # Answer should be a single uppercase letter
        assert len(q.correct_answer) == 1
        assert q.correct_answer.isupper()

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_clock(self, gen, difficulty):
        q = gen._gen_clock(difficulty)
        _validate_question(q, difficulty)
        assert ":00" in q.correct_answer

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_dice(self, gen, difficulty):
        q = gen._gen_dice(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_probability(self, gen, difficulty):
        q = gen._gen_probability(difficulty)
        _validate_question(q, difficulty)

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_coding_pattern(self, gen, difficulty):
        q = gen._gen_coding_pattern(difficulty)
        _validate_question(q, difficulty)
        assert "```python" in q.question or "Python" in q.question or "print" in q.question

    @pytest.mark.parametrize("difficulty", list(Difficulty))
    def test_square_cube(self, gen, difficulty):
        q = gen._gen_square_cube(difficulty)
        _validate_question(q, difficulty)


class TestPredictionGeneratorBatch:
    """Test batch generation properties."""

    def test_no_duplicate_ids(self, gen):
        """A batch of 20 questions should have unique IDs."""
        questions = gen.generate(Difficulty.BEGINNER, count=20)
        ids = [q.id for q in questions]
        assert len(ids) == len(set(ids)), "Duplicate IDs found in batch"

    def test_exclude_ids_respected(self, gen):
        """Questions with excluded IDs should not appear."""
        first_batch = gen.generate(Difficulty.BEGINNER, count=5)
        excluded = {q.id for q in first_batch}
        second_batch = gen.generate(Difficulty.BEGINNER, count=5, exclude_ids=excluded)
        second_ids = {q.id for q in second_batch}
        assert not excluded.intersection(second_ids), "Excluded IDs appeared in second batch"

    def test_all_difficulties_produce_questions(self, gen):
        """Generator should work for all difficulty levels."""
        for diff in Difficulty:
            questions = gen.generate(diff, count=5)
            assert len(questions) == 5, f"Expected 5 questions for {diff}, got {len(questions)}"

    def test_correct_answer_always_in_options(self, gen):
        """Correct answer must always appear in options list."""
        questions = gen.generate(Difficulty.INTERMEDIATE, count=30)
        for q in questions:
            if q.options:
                assert q.correct_answer in q.options, \
                    f"Answer '{q.correct_answer}' missing from options in: {q.question[:60]}"

    def test_unlimited_generation(self, gen):
        """Generator should handle large counts without crashing."""
        questions = gen.generate(Difficulty.BEGINNER, count=100)
        assert len(questions) == 100

    def test_mode_is_prediction(self, gen):
        """All generated questions must have mode=prediction."""
        questions = gen.generate(Difficulty.ADVANCED, count=10)
        for q in questions:
            assert q.mode.value == "prediction"
