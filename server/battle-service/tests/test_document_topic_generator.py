"""
Unit tests for DocumentTopicGenerator using NumPy & Pandas.
"""

import pytest
from generators.document_topic_generator import DocumentTopicGenerator
from models.question import Difficulty


@pytest.fixture
def doc_gen():
    return DocumentTopicGenerator()


def test_generator_mode(doc_gen):
    assert doc_gen.mode == "document"


def test_generate_from_numeric_document(doc_gen):
    csv_data = "12, 18, 25, 33, 42, 55, 68, 85, 102"
    questions = doc_gen.generate(
        difficulty=Difficulty.BEGINNER,
        count=3,
        document=csv_data,
    )
    assert len(questions) >= 2
    assert any("mean" in q.question.lower() or "average" in q.question.lower() for q in questions)
    assert any("numpy" in q.tags or "document" in q.tags for q in questions)


def test_generate_from_trend_series(doc_gen):
    # Clearly linear series: y = 2x + 10 -> 10, 12, 14, 16, 18, 20
    trend_data = "10, 12, 14, 16, 18, 20"
    questions = doc_gen.generate(
        difficulty=Difficulty.INTERMEDIATE,
        count=3,
        document=trend_data,
    )
    assert len(questions) > 0
    for q in questions:
        assert q.options and len(q.options) == 4
        assert q.correct_answer in q.options
        assert q.explanation != ""


def test_generate_from_custom_topic(doc_gen):
    questions = doc_gen.generate(
        difficulty=Difficulty.ADVANCED,
        count=4,
        topic="Linear Algebra & Matrices",
    )
    assert len(questions) == 4
    for q in questions:
        assert len(q.options) >= 2
        assert q.correct_answer != ""
        assert "math" in q.tags or "custom_topic" in q.tags or "linear_algebra" in q.tags


def test_generate_from_text_document(doc_gen):
    passage = """
    Artificial intelligence and deep learning models require optimization algorithms
    such as gradient descent. Gradient descent updates weights iteratively to minimize
    loss function errors across neural network training epochs.
    """
    questions = doc_gen.generate(
        difficulty=Difficulty.BEGINNER,
        count=2,
        document=passage,
    )
    assert len(questions) >= 1
    assert questions[0].correct_answer != ""
