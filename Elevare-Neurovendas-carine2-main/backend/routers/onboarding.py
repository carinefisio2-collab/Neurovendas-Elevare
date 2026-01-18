"""
Rotas de onboarding
Gerencia: dados iniciais, diagnóstico, setup de usuário
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime, timezone

router = APIRouter(prefix="/api/onboarding", tags=["onboarding"])

# Dependency
async def get_db():
    from server import db
    return db

async def get_current_user():
    from routers.auth import get_current_user as _get_current_user
    return await _get_current_user()

# Pydantic Models
class OnboardingData(BaseModel):
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    target_audience: Optional[str] = None
    main_goal: Optional[str] = None
    social_media_presence: Optional[List[str]] = None

# Routes
@router.post("/complete")
async def complete_onboarding(
    data: OnboardingData,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Completar onboarding inicial"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "onboarding_completed": True,
                "onboarding_data": data.dict(),
                "updated_at": datetime.now(timezone.utc)
            },
            "$inc": {"xp": 50}  # Bônus por completar onboarding
        }
    )
    
    return {"message": "Onboarding completed", "xp_earned": 50}

@router.get("/status")
async def get_onboarding_status(
    current_user: dict = Depends(get_current_user)
):
    """Verificar status do onboarding"""
    return {
        "completed": current_user.get("onboarding_completed", False),
        "data": current_user.get("onboarding_data", {})
    }
