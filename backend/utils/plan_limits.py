"""
Sistema de Limites de Planos
Verifica e aplica limites de uso baseado no plano do usuário

LIMITES CONFORME ESPECIFICAÇÃO:
- Free: 10 criações/mês (total)
- Pro/Profissional: 50 criações/mês (total)
- Premium: Ilimitado
"""

from datetime import datetime, timezone
from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger("elevare.limits")

# Definição de limites por plano
# NOTA: "posts_mes" representa o total de criações (posts + carrosséis + stories)
PLAN_LIMITS = {
    "free": {
        "posts_mes": 10,       # 10 criações totais
        "ebooks_mes": 1,
        "stories_mes": 10,     # Compartilha o limite de 10
        "blogs_mes": 0,
        "diagnosticos_mes": 2,
        "whatsapp_scripts_mes": 5,
        "total_criacoes": 10   # Limite total de criações
    },
    "beta": {
        # Beta tem tudo ilimitado (período de testes)
        "posts_mes": -1,
        "ebooks_mes": -1,
        "stories_mes": -1,
        "blogs_mes": -1,
        "diagnosticos_mes": -1,
        "whatsapp_scripts_mes": -1,
        "total_criacoes": -1
    },
    "essencial": {
        "posts_mes": 30,
        "ebooks_mes": 4,
        "stories_mes": 20,
        "blogs_mes": 0,
        "diagnosticos_mes": -1,
        "whatsapp_scripts_mes": 20,
        "total_criacoes": 50
    },
    "profissional": {
        "posts_mes": 50,       # 50 criações conforme especificação
        "ebooks_mes": 6,
        "stories_mes": 50,
        "blogs_mes": 4,
        "diagnosticos_mes": -1,
        "whatsapp_scripts_mes": -1,
        "total_criacoes": 50   # Pro = 50 criações
    },
    "premium": {
        "posts_mes": -1,       # Ilimitado
        "ebooks_mes": -1,      # Ilimitado
        "stories_mes": -1,     # Ilimitado
        "blogs_mes": -1,       # Ilimitado
        "diagnosticos_mes": -1,
        "whatsapp_scripts_mes": -1,
        "total_criacoes": -1   # Premium = Ilimitado
    }
}

# Mapeamento de tipo de conteúdo para campo de limite
CONTENT_TYPE_TO_LIMIT = {
    "post": "posts_mes",
    "carousel": "posts_mes",
    "reels": "posts_mes",
    "story": "stories_mes",
    "stories": "stories_mes",
    "ebook": "ebooks_mes",
    "blog": "blogs_mes",
    "diagnostico": "diagnosticos_mes",
    "whatsapp": "whatsapp_scripts_mes"
}

class LimitExceededError(Exception):
    """Erro quando limite do plano é excedido"""
    def __init__(self, message: str, limit_type: str, current: int, max_allowed: int):
        self.message = message
        self.limit_type = limit_type
        self.current = current
        self.max_allowed = max_allowed
        super().__init__(self.message)

async def get_user_usage_this_month(db, user_id: str, content_type: str) -> int:
    """
    Retorna quantas vezes o usuário usou determinado tipo de conteúdo este mês
    """
    # Início do mês atual
    now = datetime.now(timezone.utc)
    start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    # Mapear tipo para collection
    if content_type in ["post", "carousel", "reels", "story", "stories"]:
        collection = "content_history"
        query = {
            "user_id": user_id,
            "created_at": {"$gte": start_of_month}
        }
        if content_type in ["story", "stories"]:
            query["type"] = {"$in": ["story", "stories"]}
        else:
            query["type"] = {"$in": ["post", "carousel", "reels"]}
            
    elif content_type == "ebook":
        collection = "ebooks"
        query = {
            "user_id": user_id,
            "created_at": {"$gte": start_of_month}
        }
        
    elif content_type == "blog":
        collection = "blog_posts"
        query = {
            "user_id": user_id,
            "created_at": {"$gte": start_of_month}
        }
        
    elif content_type == "diagnostico":
        collection = "diagnoses"
        query = {
            "user_id": user_id,
            "created_at": {"$gte": start_of_month}
        }
        
    elif content_type == "whatsapp":
        collection = "whatsapp_scripts"
        query = {
            "user_id": user_id,
            "created_at": {"$gte": start_of_month}
        }
    else:
        return 0
    
    count = await db[collection].count_documents(query)
    return count

async def check_user_limit(db, user: dict, content_type: str) -> Tuple[bool, Dict]:
    """
    Verifica se o usuário pode criar mais conteúdo do tipo especificado
    
    Returns:
        Tuple[bool, Dict]: (pode_criar, info)
            - pode_criar: True se pode, False se atingiu limite
            - info: Dicionário com informações sobre o limite
    """
    user_plan = user.get("subscription_plan", "free")
    
    # Obter limites do plano
    plan_limits = PLAN_LIMITS.get(user_plan, PLAN_LIMITS["free"])
    
    # Mapear tipo de conteúdo para campo de limite
    limit_field = CONTENT_TYPE_TO_LIMIT.get(content_type)
    if not limit_field:
        # Tipo desconhecido, permitir
        return True, {"limit": -1, "used": 0, "remaining": -1}
    
    max_allowed = plan_limits.get(limit_field, 0)
    
    # -1 significa ilimitado
    if max_allowed == -1:
        return True, {
            "limit": -1,
            "used": 0,
            "remaining": -1,
            "is_unlimited": True,
            "plan": user_plan
        }
    
    # Verificar uso atual
    current_usage = await get_user_usage_this_month(db, user["id"], content_type)
    remaining = max(0, max_allowed - current_usage)
    
    info = {
        "limit": max_allowed,
        "used": current_usage,
        "remaining": remaining,
        "is_unlimited": False,
        "plan": user_plan,
        "content_type": content_type
    }
    
    if current_usage >= max_allowed:
        logger.warning(f"Limite atingido: user={user['id']}, type={content_type}, used={current_usage}/{max_allowed}")
        return False, info
    
    return True, info

async def check_and_raise_limit(db, user: dict, content_type: str):
    """
    Verifica limite e levanta exceção se atingido
    """
    can_create, info = await check_user_limit(db, user, content_type)
    
    if not can_create:
        raise LimitExceededError(
            message=f"Você atingiu o limite de {info['limit']} {content_type}(s) por mês no plano {info['plan'].title()}. Faça upgrade para continuar.",
            limit_type=content_type,
            current=info["used"],
            max_allowed=info["limit"]
        )
    
    return info

def get_plan_limits_display(plan_id: str) -> Dict:
    """
    Retorna os limites do plano formatados para exibição
    """
    limits = PLAN_LIMITS.get(plan_id, PLAN_LIMITS["free"])
    
    formatted = {}
    for key, value in limits.items():
        if value == -1:
            formatted[key] = "Ilimitado"
        else:
            formatted[key] = str(value)
    
    return formatted

async def get_user_usage_summary(db, user_id: str, plan_id: str) -> Dict:
    """
    Retorna resumo completo de uso do usuário
    """
    limits = PLAN_LIMITS.get(plan_id, PLAN_LIMITS["free"])
    summary = {}
    
    for content_type, limit_field in CONTENT_TYPE_TO_LIMIT.items():
        max_allowed = limits.get(limit_field, 0)
        current = await get_user_usage_this_month(db, user_id, content_type)
        
        summary[content_type] = {
            "used": current,
            "limit": max_allowed,
            "remaining": -1 if max_allowed == -1 else max(0, max_allowed - current),
            "percentage": 0 if max_allowed <= 0 else min(100, int((current / max_allowed) * 100))
        }
    
    return summary
