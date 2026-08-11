"""
Leaderboard Repository — MongoDB CRUD for leaderboard collection.
"""
from motor.motor_asyncio import AsyncIOMotorDatabase


from utils.logger import get_logger

logger = get_logger(__name__)


class LeaderboardRepository:
    """Repository for leaderboard queries."""

    COLLECTION = "player_stats"

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self._col = db[self.COLLECTION]

    async def get_global_leaderboard(
        self,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:
        """
        Global leaderboard sorted by ELO.
        """

        pipeline = [
            {
                "$addFields": {
                    "elo": {"$ifNull": ["$elo", 1200]},
                    "arena_points": {
                        "$ifNull": ["$arena_points", "$elo"]
                    },
                    "xp": {"$ifNull": ["$xp", 0]},
                    "wins": {"$ifNull": ["$wins", 0]},
                    "losses": {"$ifNull": ["$losses", 0]},
                    "total_battles": {
                        "$ifNull": [
                            "$total_battles",
                            {
                                "$add": [
                                    {"$ifNull": ["$wins", 0]},
                                    {"$ifNull": ["$losses", 0]}
                                ]
                            }
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "win_rate": {
                        "$cond": [
                            {"$gt": ["$total_battles", 0]},
                            {
                                "$round": [
                                    {
                                        "$multiply": [
                                            {
                                                "$divide": [
                                                    "$wins",
                                                    "$total_battles"
                                                ]
                                            },
                                            100
                                        ]
                                    },
                                    2
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                "$addFields": {
                    "level": {
                        "$ifNull": [
                            "$level",
                            {
                                "$add": [
                                    1,
                                    {
                                        "$floor": {
                                            "$sqrt": {
                                                "$divide": [
                                                    "$xp",
                                                    100
                                                ]
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            {
                "$sort": {
                    "elo": -1,
                    "xp": -1,
                    "wins": -1
                }
            },
            {"$skip": skip},
            {"$limit": limit},
            {
                "$project": {
                    "_id": 0,
                    "player_id": 1,
                    "player_name": 1,
                    "username": {
                        "$ifNull": [
                            "$username",
                            "$player_name"
                        ]
                    },
                    "avatar": 1,
                    "elo": 1,
                    "arena_points": 1,
                    "xp": 1,
                    "wins": 1,
                    "losses": 1,
                    "total_battles": 1,
                    "win_rate": 1,
                    "level": 1,
                    "rank": 1,
                    "mode_stats": 1,
                    "updated_at": 1
                }
            }
        ]

        return await self._col.aggregate(pipeline).to_list(length=limit)

    async def get_mode_leaderboard(
        self,
        mode: str,
        limit: int = 50,
        skip: int = 0,
    ) -> list[dict]:

        sort_key = f"mode_stats.{mode}.xp"

        pipeline = [
            {
                "$match": {
                    sort_key: {
                        "$exists": True
                    }
                }
            },
            {
                "$sort": {
                    sort_key: -1
                }
            },
            {
                "$skip": skip
            },
            {
                "$limit": limit
            },
            {
                "$project": {
                    "_id": 0,
                    "player_id": 1,
                    "player_name": 1,
                    "username": {
                        "$ifNull": [
                            "$username",
                            "$player_name"
                        ]
                    },
                    "avatar": 1,
                    "elo": 1,
                    "arena_points": 1,
                    "xp": f"$mode_stats.{mode}.xp",
                    "wins": f"$mode_stats.{mode}.wins",
                    "losses": f"$mode_stats.{mode}.losses",
                    "level": 1,
                    "rank": 1,
                    "mode_stats": 1
                }
            }
        ]

        return await self._col.aggregate(pipeline).to_list(length=limit)

    async def get_player_rank(
        self,
        player_id: str,
    ) -> int:
        """
        Global rank by ELO.
        """

        player = await self._col.find_one(
            {"player_id": player_id},
            {"elo": 1}
        )

        if not player:
            return -1

        elo = player.get("elo", 1200)

        higher = await self._col.count_documents(
            {
                "elo": {
                    "$gt": elo
                }
            }
        )

        return higher + 1

    async def get_total_players(self) -> int:
        return await self._col.count_documents({})