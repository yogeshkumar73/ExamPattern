"""
Battle Arena — Python Battle Service
FastAPI application entry point.

Port: 8001 (separate from existing AI service on 8000)

Startup sequence:
1. Connect to MongoDB (motor async driver)
2. Ensure collection indexes
3. Seed DB from generators if empty
4. Init cache (memory, optional Redis)
5. Register all routes

All existing endpoints on port 8000 are UNAFFECTED.
"""

import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient  # pyrefly: ignore[missing-import]

from config import settings
from repositories.question_repo import QuestionRepository
from repositories.player_repo import PlayerRepository
from repositories.match_repo import MatchRepository
from repositories.leaderboard_repo import LeaderboardRepository
from services.cache_service import CacheService
from services.ai_service import AIService
from services.question_service import QuestionService
from services.matchmaking_service import MatchmakingService
from services.leaderboard_service import LeaderboardService
from services.high_throughput_engine import engine
from services.metrics_service import (
    telemetry,
    HTTP_REQUESTS_TOTAL,
    REQUEST_DURATION_SECONDS,
    generate_latest,
    CONTENT_TYPE_LATEST,
)
from routes.questions import router as questions_router
from routes.matchmaking import router as matchmaking_router
from routes.leaderboard import router as leaderboard_router
from routes.exam_analyzer import router as exam_analyzer_router
from utils.logger import get_logger

logger = get_logger("battle-service")


# ── Lifespan: startup / shutdown ──────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize all services on startup, clean up on shutdown."""

    logger.info("=" * 60)
    logger.info("Battle Arena Service starting on port %d", settings.PORT)
    logger.info("=" * 60)

    # ── MongoDB ───────────────────────────────────────────────
    mongo_client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        serverSelectionTimeoutMS=10_000,
        maxPoolSize=10,
    )
    db = mongo_client[settings.DATABASE_NAME]

    # ── Repositories ──────────────────────────────────────────
    question_repo = QuestionRepository(db)
    player_repo = PlayerRepository(db)
    match_repo = MatchRepository(db)
    lb_repo = LeaderboardRepository(db)

    # ── Ensure indexes ────────────────────────────────────────
    try:
        await question_repo.ensure_indexes()
        await player_repo.ensure_indexes()
        await match_repo.ensure_indexes()
        logger.info("MongoDB indexes verified.")
    except Exception as exc:
        logger.warning("Index creation failed (non-fatal): %s", exc)

    # ── Cache ─────────────────────────────────────────────────
    cache = CacheService(
        ttl=settings.CACHE_TTL_SECONDS,
        redis_url=settings.REDIS_URL,
    )
    await cache.init_redis()

    # ── Services ──────────────────────────────────────────────
    ai_service = AIService()
    question_service = QuestionService(question_repo, cache, ai_service)
    matchmaking_service = MatchmakingService()
    leaderboard_service = LeaderboardService(player_repo, lb_repo, cache)

    # ── High-Throughput Queue Engine ─────────────────────────
    await engine.start()

    # ── Inject into app state ─────────────────────────────────
    app.state.mongo_client = mongo_client
    app.state.db = db
    app.state.cache = cache
    app.state.question_service = question_service
    app.state.matchmaking_service = matchmaking_service
    app.state.leaderboard_service = leaderboard_service
    app.state.match_repo = match_repo
    app.state.player_repo = player_repo
    app.state.engine = engine

    # ── Auto-seed DB if empty ─────────────────────────────────
    try:
        q_count = await question_repo.count("math", "beginner")
        if q_count == 0:
            logger.info("Question DB is empty — seeding from generators...")
            seeded = await question_service.seed_from_generators(count_per_combo=15)
            logger.info("Auto-seeded %d questions.", seeded)
        else:
            logger.info("Question DB already has data (%d math/beginner). Skipping seed.", q_count)
    except Exception as exc:
        logger.warning("Auto-seed skipped (non-fatal): %s", exc)

    # ── Background cleanup task ───────────────────────────────
    async def cleanup_loop():
        while True:
            await asyncio.sleep(300)  # Every 5 minutes
            try:
                removed = await matchmaking_service.cleanup_expired()
                evicted = await cache.cleanup_expired()
                if removed or evicted:
                    logger.debug("Cleanup: rooms=%d cache=%d", removed, evicted)
            except Exception as exc:
                logger.warning("Cleanup error: %s", exc)

    cleanup_task = asyncio.create_task(cleanup_loop())

    logger.info("✅ Battle Service ready. AI enabled: %s", settings.ai_available)
    logger.info("   Cache TTL: %ds | Redis: %s", settings.CACHE_TTL_SECONDS,
                "enabled" if settings.REDIS_URL else "memory-only")

    yield  # ── App running ───────────────────────────────────

    # ── Shutdown ──────────────────────────────────────────────
    cleanup_task.cancel()
    await engine.stop()
    mongo_client.close()
    logger.info("Battle Service shut down cleanly.")


# ── Application ───────────────────────────────────────────────
app = FastAPI(
    title="Battle Arena — Question Engine & Matchmaking Service",
    description=(
        "Hybrid question engine: Static DB + Python generators + optional AI.\n"
        "Prediction mode is 100% Python — zero AI calls.\n"
        "Runs on port 8001 (does not affect AI service on port 8000)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Prometheus Request Timing Middleware ──────────────────────
@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start_time = time.time()
    try:
        response = await call_next(request)
        status_code = str(response.status_code)
    except Exception:
        status_code = "500"
        raise
    finally:
        latency = time.time() - start_time
        path = request.url.path
        HTTP_REQUESTS_TOTAL.labels(method=request.method, endpoint=path, status=status_code).inc()
        REQUEST_DURATION_SECONDS.labels(endpoint=path).observe(latency)
    return response



# ── Global exception handler ──────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s: %s", request.url.path, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error."},
    )


# ── Routers ───────────────────────────────────────────────────
app.include_router(questions_router)
app.include_router(matchmaking_router)
app.include_router(leaderboard_router)
app.include_router(exam_analyzer_router)


# ── Metrics (Prometheus / Grafana) ────────────────────────────
@app.get("/metrics", tags=["Monitoring"])
async def metrics():
    """Prometheus metrics endpoint for Grafana scraping."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# ── Health check ──────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health(request: Request):
    """Service health check."""
    db_ok = False
    try:
        await request.app.state.db.command("ping")
        db_ok = True
    except Exception:
        pass

    return {
        "status": "healthy" if db_ok else "degraded",
        "service": "battle-service",
        "version": "2.0.0",
        "port": settings.PORT,
        "ai_enabled": settings.ai_available,
        "cache_ttl": settings.CACHE_TTL_SECONDS,
        "redis": settings.REDIS_URL is not None,
        "mongodb": db_ok,
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "service": "Battle Arena — Hybrid Question Engine",
        "docs": "/docs",
        "health": "/health",
        "version": "2.0.0",
    }


# ── Entry point ───────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
