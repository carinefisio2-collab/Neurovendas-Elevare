"""
Rotas de dashboard
Gerencia: estatísticas, resumos, progresso
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timezone, timedelta

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Dependency
async def get_db():
    from server import db
    return db

# Import correto do get_current_user
from routers.auth import get_current_user

# Routes
@router.get("/stats")
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter estatísticas do dashboard"""
    # Contar conteúdos gerados
    conteudos_gerados = await db.content_history.count_documents(
        {"user_id": current_user["id"]}
    )
    
    # Contar leads
    leads_total = await db.leads.count_documents(
        {"user_id": current_user["id"]}
    )
    
    # Créditos (modo beta = infinito)
    credits_remaining = 999999 if current_user.get("subscription_plan") == "beta" else current_user.get("credits_remaining", 0)
    
    # Última criação
    last_content = await db.content_history.find_one(
        {"user_id": current_user["id"]},
        sort=[("created_at", -1)]
    )
    
    return {
        "stats": {
            "conteudos_gerados": conteudos_gerados,
            "leads_total": leads_total,
            "credits_remaining": credits_remaining,
            "last_content_created": last_content["created_at"] if last_content else None
        }
    }
