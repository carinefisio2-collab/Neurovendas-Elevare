"""
Rotas de IA (LucresIA)
Gerencia: geração de conteúdo, carrosséis, e-books, blog
Com Timeout e Retry para resiliência
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import logging

router = APIRouter(prefix="/api/ai", tags=["ai"])
logger = logging.getLogger("elevare.ai")

# Dependency
async def get_db():
    from server import db
    return db

# Import correto do get_current_user
from routers.auth import get_current_user

# Import do sistema de retry
from utils.ai_retry import ai_call_with_retry, AICallError, get_user_friendly_error

# Pydantic Models
class ContentGenerationRequest(BaseModel):
    tema: str
    tipo: str = "post"
    tom: str = "profissional"

class CarouselGenerationRequest(BaseModel):
    offer_or_theme: str
    tone: str = "profissional"
    cta_type: str = "direct"
    target_audience: Optional[str] = None
    pain_points: Optional[List[str]] = None
    desired_results: Optional[List[str]] = None

# Configurações de timeout
AI_TIMEOUT = 60  # segundos
AI_MAX_RETRIES = 3

# Import do sistema de limites
from utils.plan_limits import check_and_raise_limit, LimitExceededError

# Routes
@router.post("/generate-content")
async def generate_content(
    request: ContentGenerationRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Gerar conteúdo (post/reels/stories) com retry automático e verificação de limites"""
    from services.lucresia import LucresIA
    
    logger.info(f"Gerando conteúdo: tipo={request.tipo}, tema={request.tema[:50]}...")
    
    # Verificar limite do plano
    try:
        limit_info = await check_and_raise_limit(db, current_user, request.tipo)
        logger.info(f"Limite OK: {limit_info['used']}/{limit_info['limit']} usado(s)")
    except LimitExceededError as e:
        logger.warning(f"Limite excedido: {e.message}")
        raise HTTPException(
            status_code=403,
            detail={
                "error": "limit_exceeded",
                "message": e.message,
                "limit_type": e.limit_type,
                "current": e.current,
                "max_allowed": e.max_allowed,
                "upgrade_required": True
            }
        )
    
    # Buscar identidade de marca
    brand_identity = await db.brand_identities.find_one({"user_id": current_user["id"]})
    
    try:
        # Gerar conteúdo com retry
        lucresia = LucresIA()
        
        async def _generate():
            return await lucresia.generate_content(
                tema=request.tema,
                tipo=request.tipo,
                tom=request.tom,
                brand_identity=brand_identity
            )
        
        content = await ai_call_with_retry(
            _generate,
            timeout=AI_TIMEOUT,
            max_retries=AI_MAX_RETRIES
        )
        
        # Salvar no histórico
        await db.content_history.insert_one({
            "user_id": current_user["id"],
            "type": request.tipo,
            "content": content,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Adicionar XP
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"xp": 10}}
        )
        
        logger.info(f"Conteúdo gerado com sucesso para user={current_user['id']}")
        return {"content": content, "brand_identity_applied": brand_identity is not None}
        
    except AICallError as e:
        logger.error(f"Falha na geração de conteúdo: {e.message}")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ai_generation_failed",
                "message": get_user_friendly_error(e),
                "retry_count": e.retry_count
            }
        )
    except Exception as e:
        logger.error(f"Erro inesperado na geração: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "internal_error",
                "message": "Erro interno ao gerar conteúdo. Tente novamente."
            }
        )

@router.post("/generate-carousel")
async def generate_carousel(
    request: CarouselGenerationRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Gerar carrossel NeuroVendas com retry automático e verificação de limites"""
    from services.carousel_generator import get_carousel_generator
    
    logger.info(f"Gerando carrossel: tema={request.offer_or_theme[:50]}...")
    
    # Verificar limite do plano
    try:
        limit_info = await check_and_raise_limit(db, current_user, "carousel")
        logger.info(f"Limite OK: {limit_info['used']}/{limit_info['limit']} usado(s)")
    except LimitExceededError as e:
        logger.warning(f"Limite excedido: {e.message}")
        raise HTTPException(
            status_code=403,
            detail={
                "error": "limit_exceeded",
                "message": e.message,
                "limit_type": e.limit_type,
                "current": e.current,
                "max_allowed": e.max_allowed,
                "upgrade_required": True
            }
        )
    
    brand_identity = await db.brand_identities.find_one({"user_id": current_user["id"]})
    
    try:
        carousel_gen = get_carousel_generator()
        
        async def _generate():
            return await carousel_gen.generate_carousel(
                offer_or_theme=request.offer_or_theme,
                tone=request.tone,
                cta_type=request.cta_type,
                target_audience=request.target_audience,
                pain_points=request.pain_points,
                desired_results=request.desired_results,
                brand_identity=brand_identity
            )
        
        carousel = await ai_call_with_retry(
            _generate,
            timeout=AI_TIMEOUT,
            max_retries=AI_MAX_RETRIES
        )
        
        # Salvar
        await db.content_history.insert_one({
            "user_id": current_user["id"],
            "type": "carousel",
            "content": carousel,
            "created_at": datetime.now(timezone.utc)
        })
        
        # XP
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"xp": 20}}
        )
        
        logger.info(f"Carrossel gerado com sucesso para user={current_user['id']}")
        return {"carousel": carousel, "brand_identity_applied": brand_identity is not None}
        
    except AICallError as e:
        logger.error(f"Falha na geração de carrossel: {e.message}")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "ai_generation_failed",
                "message": get_user_friendly_error(e),
                "retry_count": e.retry_count
            }
        )
    except Exception as e:
        logger.error(f"Erro inesperado na geração: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "internal_error",
                "message": "Erro interno ao gerar carrossel. Tente novamente."
            }
        )

@router.get("/history")
async def get_content_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter histórico de conteúdo gerado"""
    cursor = db.content_history.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).limit(50)
    
    history = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    
    return {"history": history}


@router.get("/usage")
async def get_usage_summary(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter resumo de uso do mês atual"""
    from utils.plan_limits import get_user_usage_summary, get_plan_limits_display
    
    plan_id = current_user.get("subscription_plan", "free")
    usage = await get_user_usage_summary(db, current_user["id"], plan_id)
    limits_display = get_plan_limits_display(plan_id)
    
    return {
        "plan": plan_id,
        "plan_name": plan_id.title(),
        "is_beta": plan_id == "beta",
        "usage": usage,
        "limits_display": limits_display
    }

