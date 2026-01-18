"""
Rotas de gamificação
Gerencia: XP, níveis, badges, conquistas
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime, timezone

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

# Dependency
async def get_db():
    from server import db
    return db

async def get_current_user():
    from routers.auth import get_current_user as _get_current_user
    return await _get_current_user()

# Sistema de Níveis
LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
}

def calculate_level(xp: int) -> int:
    """Calcular nível baseado em XP"""
    for level in sorted(LEVEL_THRESHOLDS.keys(), reverse=True):
        if xp >= LEVEL_THRESHOLDS[level]:
            return level
    return 1

# Routes
@router.post("/add-xp")
async def add_xp(
    xp_amount: int,
    reason: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Adicionar XP ao usuário"""
    current_xp = current_user.get("xp", 0)
    current_level = current_user.get("level", 1)
    new_xp = current_xp + xp_amount
    new_level = calculate_level(new_xp)
    
    level_up = new_level > current_level
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {"xp": new_xp, "level": new_level},
            "$push": {
                "xp_history": {
                    "amount": xp_amount,
                    "reason": reason,
                    "timestamp": datetime.now(timezone.utc)
                }
            }
        }
    )
    
    return {
        "xp": new_xp,
        "level": new_level,
        "level_up": level_up,
        "xp_added": xp_amount
    }

@router.get("/stats")
async def get_gamification_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter estatísticas de gamificação"""
    xp = current_user.get("xp", 0)
    level = current_user.get("level", 1)
    next_level_xp = LEVEL_THRESHOLDS.get(level + 1, 10000)
    xp_to_next_level = next_level_xp - xp
    
    return {
        "xp": xp,
        "level": level,
        "next_level_xp": next_level_xp,
        "xp_to_next_level": xp_to_next_level,
        "progress_percentage": (xp / next_level_xp) * 100 if next_level_xp > 0 else 100
    }

@router.get("/leaderboard")
async def get_leaderboard(db = Depends(get_db)):
    """Obter ranking de usuários por XP"""
    cursor = db.users.find(
        {},
        {"name": 1, "xp": 1, "level": 1}
    ).sort("xp", -1).limit(10)
    
    leaderboard = []
    rank = 1
    async for user in cursor:
        leaderboard.append({
            "rank": rank,
            "name": user.get("name", "Anônimo"),
            "xp": user.get("xp", 0),
            "level": user.get("level", 1)
        })
        rank += 1
    
    return {"leaderboard": leaderboard}
