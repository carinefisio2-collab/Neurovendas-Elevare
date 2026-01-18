"""
Rotas de E-books (Gamma Integration)
Gerencia: criação, listagem, visualização e edição de e-books via Gamma API
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from uuid import uuid4
import logging
import os

router = APIRouter(prefix="/api", tags=["ebooks"])
logger = logging.getLogger("elevare.ebooks")

# Dependencies
async def get_db():
    from server import db
    return db

from routers.auth import get_current_user
from services.gamma_service import GammaService, GammaConfig
from utils.plan_limits import check_and_raise_limit, LimitExceededError

# Pydantic Models
class CreateEbookRequest(BaseModel):
    topic: str = Field(..., min_length=10, max_length=500)
    audience: str = Field(..., min_length=5, max_length=200)
    goal: str = Field(..., min_length=10, max_length=300)
    tone: str = "educational"
    author: str = "Plataforma Elevare"
    num_pages: int = Field(default=10, ge=5, le=30)

class UpdateEbookRequest(BaseModel):
    ebook_id: str
    updates: Dict[str, Any]

# Routes

@router.post("/gamma/create-ebook")
async def create_ebook_with_gamma(
    request: CreateEbookRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Gera e-book via API Gamma e salva referência no banco
    
    Fluxo:
    1. Verifica limite do plano
    2. Cria e-book via Gamma API
    3. Salva no MongoDB com URL do Gamma
    4. Retorna dados para visualização no app
    """
    
    logger.info(f"[E-book] Criando e-book: topic={request.topic[:50]}...")
    
    # 1. Verificar limite do plano
    try:
        limit_info = await check_and_raise_limit(db, current_user, "ebooks")
        logger.info(f"[E-book] Limite OK: {limit_info['used']}/{limit_info['limit']} usado(s)")
    except LimitExceededError as e:
        logger.warning(f"[E-book] Limite excedido: {e.message}")
        raise HTTPException(
            status_code=403,
            detail={
                "error": "limit_exceeded",
                "message": e.message,
                "upgrade_required": True
            }
        )
    
    # 2. Gerar via Gamma API
    gamma_api_key = os.environ.get("GAMMA_API_KEY")
    if not gamma_api_key:
        logger.error("[E-book] GAMMA_API_KEY não configurada")
        raise HTTPException(
            status_code=503,
            detail={
                "error": "gamma_not_configured",
                "message": "Serviço de e-books temporariamente indisponível. Contate o suporte."
            }
        )
    
    try:
        gamma_service = GammaService(api_key=gamma_api_key)
        
        # Construir input text estratégico
        input_text = f"""
# {request.topic}

**Público-alvo:** {request.audience}

**Objetivo:** {request.goal}

**Tom:** {request.tone}

**Autor:** {request.author}

Crie um e-book educacional e estratégico sobre este tema, dividido em {request.num_pages} seções.
Cada seção deve ter conteúdo prático e acionável para o público-alvo.
Use exemplos reais do mercado de estética e bem-estar.
"""
        
        # Configuração Gamma
        config = GammaConfig(
            input_text=input_text,
            text_mode="generate",
            format="document",
            num_cards=request.num_pages,
            card_split="auto",
            text_amount="detailed",
            tone=request.tone,
            audience=request.audience,
            language="pt-br",
            image_source="aiGenerated",
            image_style="professional photography, modern, clean"
        )
        
        # Gerar e aguardar
        logger.info("[E-book] Iniciando geração no Gamma...")
        result = await gamma_service.generate_and_wait(
            config=config,
            max_wait_seconds=120,
            poll_interval=5
        )
        
        logger.info(f"[E-book] Gamma retornou: {result}")
        
        # 3. Salvar no MongoDB
        ebook_id = str(uuid4())
        gamma_url = result.get("gammaUrl") or result.get("gamma_url") or result.get("url")
        generation_id = result.get("generationId")
        
        ebook_doc = {
            "id": ebook_id,
            "user_id": current_user["id"],
            "topic": request.topic,
            "audience": request.audience,
            "goal": request.goal,
            "tone": request.tone,
            "author": request.author,
            "gamma_url": gamma_url,
            "gamma_generation_id": generation_id,
            "gamma_response": result,
            "status": "completed",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.ebooks.insert_one(ebook_doc)
        logger.info(f"[E-book] Salvo no MongoDB: {ebook_id}")
        
        # Incrementar contador de uso
        await db.usage_tracking.insert_one({
            "user_id": current_user["id"],
            "action": "ebook_created",
            "ebook_id": ebook_id,
            "timestamp": datetime.now(timezone.utc)
        })
        
        # XP
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"xp": 100}}
        )
        
        # 4. Retornar resposta
        return {
            "success": True,
            "ebook_id": ebook_id,
            "gamma_url": gamma_url,
            "generation_id": generation_id,
            "message": "E-book criado com sucesso! Você pode editá-lo no Gamma ou baixar em PDF.",
            "credits_used": result.get("credits", {}).get("deducted", 0)
        }
        
    except TimeoutError as e:
        logger.error(f"[E-book] Timeout: {str(e)}")
        raise HTTPException(
            status_code=504,
            detail={
                "error": "generation_timeout",
                "message": "Geração do e-book está demorando mais que o esperado. Tente novamente em alguns minutos."
            }
        )
    except Exception as e:
        logger.error(f"[E-book] Erro ao gerar: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "generation_failed",
                "message": f"Erro ao gerar e-book: {str(e)}"
            }
        )


@router.get("/ebooks/list")
async def list_ebooks(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Lista todos os e-books do usuário"""
    cursor = db.ebooks.find({"user_id": current_user["id"]}).sort("created_at", -1)
    
    ebooks = []
    async for ebook in cursor:
        ebook["_id"] = str(ebook["_id"])
        ebooks.append({
            "id": ebook.get("id"),
            "topic": ebook.get("topic"),
            "audience": ebook.get("audience"),
            "gamma_url": ebook.get("gamma_url"),
            "status": ebook.get("status", "completed"),
            "created_at": ebook.get("created_at").isoformat() if ebook.get("created_at") else None
        })
    
    return {
        "success": True,
        "ebooks": ebooks,
        "total": len(ebooks)
    }


@router.get("/ebooks/{ebook_id}")
async def get_ebook(
    ebook_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter detalhes de um e-book específico"""
    ebook = await db.ebooks.find_one({
        "id": ebook_id,
        "user_id": current_user["id"]
    })
    
    if not ebook:
        raise HTTPException(
            status_code=404,
            detail={"error": "not_found", "message": "E-book não encontrado"}
        )
    
    ebook["_id"] = str(ebook["_id"])
    
    return {
        "success": True,
        "ebook": ebook
    }


@router.delete("/ebooks/{ebook_id}")
async def delete_ebook(
    ebook_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Deletar um e-book"""
    result = await db.ebooks.delete_one({
        "id": ebook_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail={"error": "not_found", "message": "E-book não encontrado"}
        )
    
    return {
        "success": True,
        "message": "E-book deletado com sucesso"
    }
