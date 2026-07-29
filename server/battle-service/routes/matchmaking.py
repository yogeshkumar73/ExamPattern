"""
Matchmaking API Routes.

POST /api/matchmaking/join          — Join matchmaking queue
POST /api/matchmaking/leave         — Leave queue
POST /api/matchmaking/create-room   — Create a custom/private room
POST /api/matchmaking/start         — Start match in a room
GET  /api/matchmaking/room/{id}     — Get room info
GET  /api/matchmaking/rooms         — List public rooms
GET  /api/matchmaking/reconnect     — Reconnect to player's room
"""

from typing import Optional
from fastapi import APIRouter, Request, HTTPException, status, Query

from middleware.rate_limiter import rate_limiter
from middleware.validation import (
    JoinQueueRequest,
    LeaveQueueRequest,
    CreateRoomRequest,
    StartMatchRequest,
)
from models.match import RoomSettings, GameType
from models.player import PlayerInQueue
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/matchmaking", tags=["Matchmaking"])


@router.post("/join")
async def join_queue(request: Request, body: JoinQueueRequest):
    """
    Join the matchmaking queue.

    Returns status 'searching' or 'matched' (with room_id) if immediately paired.
    """
    await rate_limiter.check(request)

    player = PlayerInQueue(
        user_id=body.user_id,
        name=body.name,
        avatar=body.avatar,
        mode=body.mode,
        difficulty=body.difficulty,
        game_type=body.game_type,
        elo=body.elo,
    )

    mm = request.app.state.matchmaking_service
    result = await mm.join_queue(player)

    return {"success": True, "data": result}


@router.post("/leave")
async def leave_queue(request: Request, body: LeaveQueueRequest):
    """Remove player from matchmaking queue."""
    await rate_limiter.check(request)

    mm = request.app.state.matchmaking_service
    found = await mm.leave_queue(body.user_id)

    return {"success": True, "data": {"removed": found}}


@router.post("/create-room")
async def create_room(request: Request, body: CreateRoomRequest):
    """
    Create a custom/private game room.

    Host can then invite other players by sharing the room_id.
    """
    await rate_limiter.check(request)

    room_settings = RoomSettings(
        mode=body.mode,
        difficulty=body.difficulty,
        game_type=GameType(body.game_type),
        max_players=body.max_players,
        question_count=body.question_count,
        is_private=body.is_private,
        password=body.password,
    )

    mm = request.app.state.matchmaking_service
    room = await mm.create_room(
        host_id=body.host_id,
        host_name=body.host_name,
        settings_data=room_settings,
    )

    return {
        "success": True,
        "data": {
            "room_id": room.room_id,
            "host_id": room.host_id,
            "host_name": room.host_name,
            "settings": room.settings.model_dump(),
            "status": room.status.value,
            "player_ids": room.player_ids,
        },
    }


@router.post("/start")
async def start_match(request: Request, body: StartMatchRequest):
    """
    Start the match in a room. Only the host can call this.
    """
    await rate_limiter.check(request)

    mm = request.app.state.matchmaking_service
    room = await mm.start_match(body.room_id, body.host_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Room not found, or you are not the host.",
        )

    return {
        "success": True,
        "data": {
            "room_id": room.room_id,
            "status": room.status.value,
            "player_ids": room.player_ids,
        },
    }


@router.get("/room/{room_id}")
async def get_room(request: Request, room_id: str):
    """Get room details by ID."""
    mm = request.app.state.matchmaking_service
    room = await mm.get_room(room_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Room {room_id} not found.",
        )

    return {
        "success": True,
        "data": {
            "room_id": room.room_id,
            "host_id": room.host_id,
            "host_name": room.host_name,
            "settings": room.settings.model_dump(),
            "status": room.status.value,
            "player_ids": room.player_ids,
            "player_count": len(room.player_ids),
        },
    }


@router.get("/rooms")
async def list_public_rooms(
    request: Request,
    mode: Optional[str] = Query(default=None),
):
    """List open public rooms."""
    mm = request.app.state.matchmaking_service
    rooms = await mm.list_public_rooms(mode=mode)

    return {
        "success": True,
        "data": {
            "rooms": [
                {
                    "room_id": r.room_id,
                    "host_name": r.host_name,
                    "mode": r.settings.mode,
                    "difficulty": r.settings.difficulty,
                    "player_count": len(r.player_ids),
                    "max_players": r.settings.max_players,
                }
                for r in rooms
            ],
            "total": len(rooms),
        },
    }


@router.get("/reconnect")
async def reconnect(request: Request, user_id: str = Query(...)):
    """
    Reconnect support — find the room a player was in.

    Returns room info if the player has an active session.
    """
    mm = request.app.state.matchmaking_service
    room = await mm.get_player_room(user_id)

    if not room:
        return {"success": True, "data": {"room": None, "reconnected": False}}

    return {
        "success": True,
        "data": {
            "reconnected": True,
            "room_id": room.room_id,
            "mode": room.settings.mode,
            "difficulty": room.settings.difficulty,
            "status": room.status.value,
            "player_ids": room.player_ids,
        },
    }


@router.post("/heartbeat")
async def heartbeat(request: Request, user_id: str = Query(...)):
    """Record player heartbeat to maintain session."""
    mm = request.app.state.matchmaking_service
    await mm.heartbeat(user_id)
    return {"success": True}
