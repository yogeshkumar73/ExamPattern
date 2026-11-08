"""
Unit tests for HighThroughputQuestionEngine and Telemetry metrics.
"""

import pytest
import asyncio
from services.high_throughput_engine import HighThroughputQuestionEngine
from services.metrics_service import TelemetryCollector


@pytest.mark.asyncio
async def test_engine_fast_questions():
    engine = HighThroughputQuestionEngine(num_worker_threads=4)
    await engine.start()
    try:
        qs = await engine.get_fast_questions(
            mode="math",
            difficulty="beginner",
            count=5,
            user_id="user_123",
        )
        assert len(qs) == 5
        assert all(q.mode.value == "math" for q in qs)
    finally:
        await engine.stop()


@pytest.mark.asyncio
async def test_engine_topic_generation():
    engine = HighThroughputQuestionEngine(num_worker_threads=4)
    await engine.start()
    try:
        qs = await engine.get_fast_questions(
            mode="custom",
            difficulty="intermediate",
            count=3,
            topic="Calculus & Derivatives",
            user_id="user_456",
        )
        assert len(qs) == 3
        assert any("Calculus" in q.topic or "derivative" in q.question.lower() for q in qs)
    finally:
        await engine.stop()


def test_telemetry_snapshot():
    t = TelemetryCollector()
    t.record_request(0.002, "/api/questions/math")
    t.record_request(0.005, "/api/questions/math")
    t.register_user("player_1")
    t.register_user("player_2")
    t.record_answer(True)
    t.record_answer(False)

    snap = t.get_snapshot()
    assert snap["target_capacity_qps"] == 1000
    assert snap["active_users"] == 2
    assert snap["accuracy_rate_pct"] == 50.0
    assert snap["total_requests"] == 2
