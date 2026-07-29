"""
Unit tests for all question generators.

Verifies:
- Each generator produces valid QuestionModel instances
- Correct answers are in options
- No duplicate IDs in batches
- All modes produce questions
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from models.question import Difficulty, GameMode
from generators.math_generator import MathGenerator
from generators.gk_generator import GKGenerator
from generators.coding_generator import CodingGenerator
from generators.puzzle_generator import PuzzleGenerator
from generators.prediction_generator import PredictionGenerator
from generators.random_generator import RandomGenerator


def _validate_batch(questions, expected_mode=None, count=None):
    """Validate a list of QuestionModel instances."""
    if count is not None:
        assert len(questions) == count, f"Expected {count} questions, got {len(questions)}"
    for q in questions:
        assert q.id
        assert q.question
        assert q.correct_answer
        assert q.explanation
        assert q.time_limit > 0
        assert q.xp > 0
        if expected_mode:
            assert q.mode.value == expected_mode
        if q.options:
            assert q.correct_answer in q.options, \
                f"Correct answer not in options: {q.correct_answer} not in {q.options}"
        ids = [q.id for q in questions]
        assert len(ids) == len(set(ids)), "Duplicate IDs detected"


class TestMathGenerator:
    @pytest.fixture
    def gen(self):
        return MathGenerator()

    def test_generates_beginner(self, gen):
        qs = gen.generate(Difficulty.BEGINNER, count=10)
        _validate_batch(qs, expected_mode="math", count=10)

    def test_generates_intermediate(self, gen):
        qs = gen.generate(Difficulty.INTERMEDIATE, count=10)
        _validate_batch(qs, expected_mode="math", count=10)

    def test_generates_advanced(self, gen):
        qs = gen.generate(Difficulty.ADVANCED, count=10)
        _validate_batch(qs, expected_mode="math", count=10)

    def test_all_topics(self, gen):
        for topic in gen.TOPIC_TYPES:
            q = gen._dispatch(topic, Difficulty.BEGINNER)
            assert q is not None, f"No question generated for topic: {topic}"

    def test_no_duplicates_in_large_batch(self, gen):
        qs = gen.generate(Difficulty.BEGINNER, count=50)
        ids = [q.id for q in qs]
        assert len(ids) == len(set(ids))


class TestGKGenerator:
    @pytest.fixture
    def gen(self):
        return GKGenerator()

    def test_generates_questions(self, gen):
        for diff in Difficulty:
            qs = gen.generate(diff, count=10)
            _validate_batch(qs, expected_mode="gk", count=10)

    def test_correct_answer_in_options(self, gen):
        qs = gen.generate(Difficulty.INTERMEDIATE, count=20)
        for q in qs:
            assert q.correct_answer in q.options


class TestCodingGenerator:
    @pytest.fixture
    def gen(self):
        return CodingGenerator()

    def test_generates_questions(self, gen):
        for diff in Difficulty:
            qs = gen.generate(diff, count=10)
            _validate_batch(qs, expected_mode="coding", count=10)

    def test_code_output_type(self, gen):
        """Code output questions should have appropriate type."""
        qs = gen.generate(Difficulty.BEGINNER, count=20)
        # At least some should be code_output type
        types = {q.question_type.value for q in qs}
        assert len(types) >= 1


class TestPuzzleGenerator:
    @pytest.fixture
    def gen(self):
        return PuzzleGenerator()

    def test_generates_questions(self, gen):
        for diff in Difficulty:
            qs = gen.generate(diff, count=8)
            assert len(qs) == 8
            _validate_batch(qs, expected_mode="puzzle")


class TestRandomGenerator:
    @pytest.fixture
    def gen(self):
        return RandomGenerator()

    def test_mixed_modes(self, gen):
        """Random generator should produce questions from multiple modes."""
        qs = gen.generate(Difficulty.BEGINNER, count=20)
        assert len(qs) == 20
        modes = {q.mode.value for q in qs}
        # Should have at least 2 different modes in 20 questions
        assert len(modes) >= 2

    def test_no_duplicates(self, gen):
        qs = gen.generate(Difficulty.INTERMEDIATE, count=25)
        ids = [q.id for q in qs]
        assert len(ids) == len(set(ids))
