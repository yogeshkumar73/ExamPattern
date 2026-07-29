"""
Matchmaking Service — Queue management, room lifecycle, reconnect support.

Supports all game types:
- 1v_ai, 1v1, 1v_many, tournament, practice, ranked, custom_room,
  public_match, private_match

Features:
- Heartbeat tracking
- Room expiry with TTL
- Reconnect support (player rejoins by user_id)
- Latency-aware matching (ELO-based pairing within 200 ELO range)
"""

import asyncio
import time
import random
from typing import Optional

from config import settings
from models.match import GameType, MatchStatus, RoomModel, RoomSettings
from models.player import PlayerInQueue, QueueStatus
from utils.helpers import generate_room_id, utc_now
from utils.logger import get_logger

logger = get_logger(__name__)


class _QueueEntry:
    __slots__ = ("player", "joined_at", "last_heartbeat")

    def __init__(self, player: PlayerInQueue) -> None:
        self.player = player
        self.joined_at = time.monotonic()
        self.last_heartbeat = time.monotonic()


class MatchmakingService:
    """
    In-memory matchmaking engine with room lifecycle management.

    Rooms and queues are stored in memory for speed.
    Match results are persisted via MatchRepository separately.
    """

    def __init__(self) -> None:
        # queueKey → list of players waiting
        self._queues: dict[str, list[_QueueEntry]] = {}
        # roomId → RoomModel
        self._rooms: dict[str, RoomModel] = {}
        # userId → roomId (for reconnect support)
        self._player_room_map: dict[str, str] = {}
        # userId → last heartbeat timestamp
        self._heartbeats: dict[str, float] = {}

        self._lock = asyncio.Lock()

    # ── Queue management ──────────────────────────────────────

    async def join_queue(
        self,
        player: PlayerInQueue,
    ) -> dict:
        """
        Add player to matchmaking queue for their mode/difficulty.

        Returns dict with status and optional room_id if immediately matched.
        """
        queue_key = f"{player.mode}_{player.difficulty}_{player.game_type}"

        async with self._lock:
            if queue_key not in self._queues:
                self._queues[queue_key] = []

            # Remove duplicate (same user_id)
            self._queues[queue_key] = [
                e for e in self._queues[queue_key]
                if e.player.user_id != player.user_id
            ]

            entry = _QueueEntry(player)
            self._queues[queue_key].append(entry)
            self._heartbeats[player.user_id] = time.monotonic()

            # Try to match immediately for 1v1
            if player.game_type == GameType.PVP.value:
                match_result = self._try_match_pvp(queue_key)
                if match_result:
                    return match_result

        logger.info("Player %s joined queue: %s", player.name, queue_key)
        queue_size = len(self._queues.get(queue_key, []))
        return {
            "status": QueueStatus.SEARCHING,
            "queue_key": queue_key,
            "queue_size": queue_size,
        }

    def _try_match_pvp(self, queue_key: str) -> Optional[dict]:
        """Try to create a 1v1 match from queue. Call inside lock."""
        queue = self._queues.get(queue_key, [])
        if len(queue) < 2:
            return None

        # Find ELO-compatible pair (within 200 ELO)
        for i in range(len(queue)):
            for j in range(i + 1, len(queue)):
                p1 = queue[i].player
                p2 = queue[j].player
                if abs(p1.elo - p2.elo) <= 200:
                    self._queues[queue_key].remove(queue[i])
                    self._queues[queue_key].remove(queue[j])
                    room = self._create_room_internal(p1, p2)
                    return {
                        "status": QueueStatus.MATCHED,
                        "room_id": room.room_id,
                        "players": [
                            {"user_id": p1.user_id, "name": p1.name},
                            {"user_id": p2.user_id, "name": p2.name},
                        ],
                    }

        # If no ELO-compatible pair, match first two (prevents infinite wait)
        if len(queue) >= 2:
            p1 = queue.pop(0).player
            p2 = queue.pop(0).player
            room = self._create_room_internal(p1, p2)
            return {
                "status": QueueStatus.MATCHED,
                "room_id": room.room_id,
                "players": [
                    {"user_id": p1.user_id, "name": p1.name},
                    {"user_id": p2.user_id, "name": p2.name},
                ],
            }
        return None

    async def leave_queue(self, user_id: str) -> bool:
        """Remove player from all queues. Returns True if found."""
        async with self._lock:
            found = False
            for key in list(self._queues.keys()):
                before = len(self._queues[key])
                self._queues[key] = [
                    e for e in self._queues[key] if e.player.user_id != user_id
                ]
                if len(self._queues[key]) < before:
                    found = True
            self._heartbeats.pop(user_id, None)
        return found

    # ── Room management ───────────────────────────────────────

    async def create_room(
        self,
        host_id: str,
        host_name: str,
        settings_data: RoomSettings,
    ) -> RoomModel:
        """Create a new game room (custom, private, or public)."""
        room = RoomModel(
            room_id=generate_room_id(),
            host_id=host_id,
            host_name=host_name,
            settings=settings_data,
            player_ids=[host_id],
            status=MatchStatus.WAITING,
            created_at=utc_now(),
        )
        async with self._lock:
            self._rooms[room.room_id] = room
            self._player_room_map[host_id] = room.room_id

        logger.info("Room %s created by %s", room.room_id, host_name)
        return room

    def _create_room_internal(
        self, p1: PlayerInQueue, p2: PlayerInQueue
    ) -> RoomModel:
        """Create room for matched pair (call inside lock)."""
        room = RoomModel(
            room_id=generate_room_id(),
            host_id=p1.user_id,
            host_name=p1.name,
            settings=RoomSettings(
                mode=p1.mode,
                difficulty=p1.difficulty,
                game_type=GameType(p1.game_type),
            ),
            player_ids=[p1.user_id, p2.user_id],
            status=MatchStatus.ACTIVE,
            created_at=utc_now(),
        )
        self._rooms[room.room_id] = room
        self._player_room_map[p1.user_id] = room.room_id
        self._player_room_map[p2.user_id] = room.room_id
        logger.info("Match created: %s vs %s in room %s", p1.name, p2.name, room.room_id)
        return room

    async def join_room(self, room_id: str, user_id: str) -> Optional[RoomModel]:
        """Add a player to an existing room."""
        async with self._lock:
            room = self._rooms.get(room_id)
            if not room:
                return None
            if room.status != MatchStatus.WAITING:
                return None
            if user_id not in room.player_ids:
                room.player_ids.append(user_id)
            self._player_room_map[user_id] = room_id
        return room

    async def start_match(self, room_id: str, host_id: str) -> Optional[RoomModel]:
        """Mark room as ACTIVE. Only host can start."""
        async with self._lock:
            room = self._rooms.get(room_id)
            if not room or room.host_id != host_id:
                return None
            if room.status == MatchStatus.WAITING:
                room.status = MatchStatus.ACTIVE
        return room

    async def get_room(self, room_id: str) -> Optional[RoomModel]:
        return self._rooms.get(room_id)

    async def get_player_room(self, user_id: str) -> Optional[RoomModel]:
        """Get the room a player is currently in (reconnect support)."""
        room_id = self._player_room_map.get(user_id)
        if room_id:
            return self._rooms.get(room_id)
        return None

    async def end_match(self, room_id: str) -> None:
        """Mark room as finished."""
        async with self._lock:
            room = self._rooms.get(room_id)
            if room:
                room.status = MatchStatus.FINISHED

    # ── Heartbeat ─────────────────────────────────────────────

    async def heartbeat(self, user_id: str) -> None:
        """Record player heartbeat to detect disconnects."""
        self._heartbeats[user_id] = time.monotonic()

    # ── Cleanup ───────────────────────────────────────────────

    async def cleanup_expired(self) -> int:
        """Remove stale rooms and queues. Returns rooms removed."""
        now = time.monotonic()
        timeout = settings.MATCHMAKING_TIMEOUT_SECONDS
        room_expiry = settings.ROOM_EXPIRY_SECONDS
        removed = 0

        async with self._lock:
            # Remove timed-out queue entries
            for key in list(self._queues.keys()):
                self._queues[key] = [
                    e for e in self._queues[key]
                    if now - e.joined_at < timeout
                ]

            # Remove expired rooms
            for rid in list(self._rooms.keys()):
                room = self._rooms[rid]
                age = (utc_now() - room.created_at).total_seconds()
                if age > room_expiry and room.status in (MatchStatus.FINISHED, MatchStatus.CANCELLED):
                    del self._rooms[rid]
                    removed += 1

        return removed

    async def list_public_rooms(self, mode: Optional[str] = None) -> list[RoomModel]:
        """List public waiting rooms, optionally filtered by mode."""
        return [
            r for r in self._rooms.values()
            if r.status == MatchStatus.WAITING
            and not r.settings.is_private
            and (mode is None or r.settings.mode == mode)
        ]
