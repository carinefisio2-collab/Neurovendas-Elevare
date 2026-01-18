"""
Rotas de Pagamentos - Integração Stripe
Gerencia: checkout, status, webhooks, assinaturas
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import os
import logging

router = APIRouter(prefix="/api/payments", tags=["payments"])

# Configurar logging
logger = logging.getLogger(__name__)

# Planos de assinatura com Price IDs do Stripe
# CONFORME ESPECIFICAÇÃO: Free=10, Pro=50, Premium=ilimitado
SUBSCRIPTION_PLANS = {
    "free": {
        "name": "Gratuito",
        "price": 0,
        "credits": 10,
        "currency": "brl",
        "stripe_price_id": "",
        "limits": {
            "total_criacoes": 10,
            "posts_mes": 10,
            "ebooks_mes": 1,
            "stories_mes": 10,
            "blogs_mes": 0
        },
        "features": [
            "10 criações/mês",
            "1 e-book/mês",
            "Diagnóstico Premium",
            "Scripts de WhatsApp básico"
        ]
    },
    "essencial": {
        "name": "Essencial",
        "price": 5700,  # R$ 57,00
        "credits": 30,
        "currency": "brl",
        "stripe_price_id": os.environ.get("STRIPE_ESSENCIAL_PRICE_ID", ""),
        "limits": {
            "total_criacoes": 30,
            "posts_mes": 30,
            "ebooks_mes": 4,
            "stories_mes": 20,
            "blogs_mes": 0
        },
        "features": [
            "30 criações/mês",
            "4 e-books/mês",
            "20 stories/mês",
            "Diagnóstico Premium ilimitado",
            "Scripts de WhatsApp",
            "Suporte por email"
        ]
    },
    "profissional": {
        "name": "Profissional", 
        "price": 10700,  # R$ 107,00
        "credits": 50,
        "currency": "brl",
        "stripe_price_id": os.environ.get("STRIPE_PROFISSIONAL_PRICE_ID", ""),
        "limits": {
            "total_criacoes": 50,
            "posts_mes": 50,
            "ebooks_mes": 6,
            "stories_mes": 50,
            "blogs_mes": 4
        },
        "features": [
            "50 criações/mês",
            "6 e-books/mês",
            "50 stories/mês",
            "4 artigos de blog SEO/mês",
            "Calendário de conteúdo",
            "Suporte prioritário WhatsApp"
        ]
    },
    "premium": {
        "name": "Premium",
        "price": 19700,  # R$ 197,00
        "credits": 999,
        "currency": "brl",
        "stripe_price_id": os.environ.get("STRIPE_PREMIUM_PRICE_ID", ""),
        "limits": {
            "total_criacoes": -1,  # Ilimitado
            "posts_mes": -1,
            "ebooks_mes": -1,
            "stories_mes": -1,
            "blogs_mes": -1
        },
        "features": [
            "Criações ILIMITADAS",
            "E-books ilimitados",
            "Stories ilimitados",
            "Blog posts ilimitados",
            "ELEVARE 365 PRO",
            "Mentorias em grupo mensais",
            "Suporte VIP"
        ]
    }
}

# Pydantic Models
class SubscriptionCheckoutRequest(BaseModel):
    plan_id: str
    origin_url: str

class SubscriptionStatusResponse(BaseModel):
    success: bool
    status: str
    payment_status: str
    plan: Optional[str] = None
    credits_added: int = 0

# Dependency injection
async def get_db():
    from server import db
    return db

async def get_current_user_from_auth():
    from routers.auth import get_current_user
    return get_current_user

# Helper para obter usuário atual
from routers.auth import get_current_user

@router.get("/plans")
async def get_subscription_plans():
    """Retorna os planos de assinatura disponíveis"""
    plans_list = []
    for plan_id, plan in SUBSCRIPTION_PLANS.items():
        plans_list.append({
            "id": plan_id,
            "name": plan["name"],
            "price": plan["price"] / 100,  # Retorna em reais
            "price_display": f"R$ {plan['price'] / 100:.2f}".replace(".", ","),
            "credits": plan["credits"],
            "limits": {
                "ebooks": plan["limits"].get("ebooks_mes", 0),
                "sites": 0,  # Não disponível no momento
                "slides": 0,  # Não disponível no momento
                "blogs": plan["limits"].get("blogs_mes", 0)
            },
            "features": plan["features"],
            "badge": "MAIS POPULAR" if plan_id == "profissional" else None,
            "tagline": _get_plan_tagline(plan_id),
            "description": _get_plan_description(plan_id),
            "use_case": _get_plan_use_case(plan_id),
            "result": _get_plan_result(plan_id),
            "guarantee": "7 dias de garantia incondicional"
        })
    
    return {
        "success": True,
        "plans": plans_list,
        "philosophy": "Invista no crescimento do seu negócio com ferramentas que realmente funcionam"
    }

def _get_plan_tagline(plan_id: str) -> str:
    taglines = {
        "essencial": "Para quem está começando",
        "profissional": "Para crescer com consistência",
        "premium": "Para escalar seu negócio"
    }
    return taglines.get(plan_id, "")

def _get_plan_description(plan_id: str) -> str:
    descriptions = {
        "essencial": "Ideal para profissionais que querem organizar seu conteúdo",
        "profissional": "Para quem quer crescer de forma consistente e estratégica",
        "premium": "Recursos ilimitados para escalar seu negócio"
    }
    return descriptions.get(plan_id, "")

def _get_plan_use_case(plan_id: str) -> str:
    use_cases = {
        "essencial": "Esteticistas autônomas que atendem até 30 clientes/mês",
        "profissional": "Clínicas e profissionais com equipe pequena",
        "premium": "Franquias, redes e profissionais que querem escalar"
    }
    return use_cases.get(plan_id, "")

def _get_plan_result(plan_id: str) -> str:
    results = {
        "essencial": "Organize sua comunicação e atraia clientes certos",
        "profissional": "Duplique seu faturamento com estratégia e consistência",
        "premium": "Escale sem limites e domine seu mercado"
    }
    return results.get(plan_id, "")

@router.post("/create-checkout")
async def create_checkout_session(
    data: SubscriptionCheckoutRequest, 
    request: Request, 
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Cria sessão de checkout do Stripe para assinatura"""
    from emergentintegrations.payments.stripe.checkout import (
        StripeCheckout, 
        CheckoutSessionRequest
    )
    from uuid import uuid4
    
    # Validar plano
    if data.plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    plan = SUBSCRIPTION_PLANS[data.plan_id]
    
    # Verificar configuração Stripe
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        logger.error("STRIPE_API_KEY não configurada")
        raise HTTPException(status_code=500, detail="Sistema de pagamentos não configurado")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/payments/webhook"
    
    try:
        stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
        
        # URLs de retorno
        origin = data.origin_url.rstrip("/")
        success_url = f"{origin}/dashboard/planos?session_id={{CHECKOUT_SESSION_ID}}&status=success"
        cancel_url = f"{origin}/dashboard/planos?status=cancelled"
        
        # Metadata para rastreamento
        metadata = {
            "user_id": current_user["id"],
            "user_email": current_user["email"],
            "plan_id": data.plan_id,
            "plan_name": plan["name"],
            "credits": str(plan["credits"])
        }
        
        # Criar checkout session
        checkout_request = CheckoutSessionRequest(
            amount=plan["price"],
            currency=plan["currency"],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata=metadata
        )
        
        session = await stripe_checkout.create_checkout_session(checkout_request)
        
        # Registrar transação pendente
        transaction_id = str(uuid4())
        await db.payment_transactions.insert_one({
            "id": transaction_id,
            "session_id": session.session_id,
            "user_id": current_user["id"],
            "user_email": current_user["email"],
            "plan_id": data.plan_id,
            "plan_name": plan["name"],
            "amount": plan["price"],
            "currency": plan["currency"],
            "credits": plan["credits"],
            "status": "pending",
            "payment_status": "initiated",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info(f"Checkout criado: user={current_user['email']}, plan={data.plan_id}, session={session.session_id}")
        
        return {
            "success": True,
            "checkout_url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        logger.error(f"Erro ao criar checkout: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar checkout: {str(e)}")

@router.get("/status/{session_id}")
async def get_payment_status(
    session_id: str, 
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Verifica status do pagamento e atualiza se necessário"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    # Buscar transação
    transaction = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transação não encontrada")
    
    # Se já processada, retorna
    if transaction.get("payment_status") == "paid":
        return {
            "success": True,
            "status": "completed",
            "payment_status": "paid",
            "plan": transaction.get("plan_name"),
            "credits_added": transaction.get("credits_added", 0),
            "already_processed": True
        }
    
    # Verificar status no Stripe
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        update_data = {
            "status": status_response.status,
            "payment_status": status_response.payment_status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Se pagamento confirmado, atualizar usuário
        if status_response.payment_status == "paid":
            plan = SUBSCRIPTION_PLANS.get(transaction["plan_id"])
            if plan:
                # Atualizar plano e créditos do usuário
                await db.users.update_one(
                    {"id": current_user["id"]},
                    {
                        "$set": {
                            "subscription_plan": transaction["plan_id"],
                            "plan_name": plan["name"],
                            "subscription_active": True,
                            "subscription_limits": plan["limits"],
                            "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                        },
                        "$inc": {"credits_remaining": plan["credits"]}
                    }
                )
                
                update_data["credits_added"] = plan["credits"]
                update_data["processed_at"] = datetime.now(timezone.utc).isoformat()
                
                logger.info(f"Pagamento confirmado: user={current_user['email']}, plan={transaction['plan_id']}")
        
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "status": status_response.status,
            "payment_status": status_response.payment_status,
            "plan": transaction.get("plan_name"),
            "credits_added": update_data.get("credits_added", 0)
        }
        
    except Exception as e:
        logger.error(f"Erro ao verificar status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status: {str(e)}")

@router.post("/webhook")
async def stripe_webhook(request: Request, db = Depends(get_db)):
    """Webhook para eventos do Stripe"""
    from emergentintegrations.payments.stripe.checkout import StripeCheckout
    
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    stripe_webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    
    if not stripe_webhook_secret:
        logger.warning("STRIPE_WEBHOOK_SECRET não configurado")
        return {"received": True}
    
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature", "")
        
        stripe_checkout = StripeCheckout(
            api_key=stripe_api_key, 
            webhook_url="",
            webhook_secret=stripe_webhook_secret
        )
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Processar evento de pagamento confirmado
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            transaction = await db.payment_transactions.find_one(
                {"session_id": session_id},
                {"_id": 0}
            )
            
            if transaction and transaction.get("payment_status") != "paid":
                plan = SUBSCRIPTION_PLANS.get(transaction["plan_id"])
                
                if plan:
                    # Atualizar usuário
                    await db.users.update_one(
                        {"id": transaction["user_id"]},
                        {
                            "$set": {
                                "subscription_plan": transaction["plan_id"],
                                "plan_name": plan["name"],
                                "subscription_active": True,
                                "subscription_limits": plan["limits"],
                                "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                            },
                            "$inc": {"credits_remaining": plan["credits"]}
                        }
                    )
                    
                    # Atualizar transação
                    await db.payment_transactions.update_one(
                        {"session_id": session_id},
                        {
                            "$set": {
                                "status": "completed",
                                "payment_status": "paid",
                                "credits_added": plan["credits"],
                                "processed_at": datetime.now(timezone.utc).isoformat()
                            }
                        }
                    )
                    
                    # Enviar email de confirmação
                    try:
                        from services.email_service import get_email_service
                        user = await db.users.find_one({"id": transaction["user_id"]})
                        if user:
                            email_service = get_email_service()
                            await email_service.send_payment_confirmation(
                                user_email=user["email"],
                                user_name=user["name"],
                                plan_name=plan["name"],
                                amount=plan["price"] / 100
                            )
                    except Exception as email_error:
                        logger.warning(f"Falha ao enviar email de confirmação: {str(email_error)}")
                    
                    logger.info(f"Webhook: Pagamento processado - user={transaction['user_email']}, plan={transaction['plan_id']}")
        
        return {"received": True, "status": "processed"}
        
    except Exception as e:
        logger.error(f"Erro no webhook Stripe: {str(e)}")
        return {"received": True, "error": str(e)}

@router.get("/subscription")
async def get_user_subscription(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Retorna informações da assinatura do usuário"""
    
    # Buscar última transação de pagamento
    last_payment = await db.payment_transactions.find_one(
        {"user_id": current_user["id"], "payment_status": "paid"},
        {"_id": 0},
        sort=[("processed_at", -1)]
    )
    
    plan_id = current_user.get("subscription_plan", "beta")
    is_beta = plan_id == "beta"
    
    # Se beta, retornar informações especiais
    if is_beta:
        return {
            "success": True,
            "subscription": {
                "plan_id": "beta",
                "plan_name": "Beta Tester",
                "status": "active",
                "is_beta": True,
                "credits_remaining": current_user.get("credits_remaining", 999),
                "limits": {
                    "posts_mes": -1,
                    "ebooks_mes": -1,
                    "stories_mes": -1,
                    "blogs_mes": -1
                },
                "features": [
                    "Todos os recursos desbloqueados",
                    "Créditos ilimitados durante beta",
                    "Acesso antecipado a features",
                    "Suporte direto com a equipe"
                ],
                "message": "Você está no programa Beta! Todos os recursos estão desbloqueados."
            }
        }
    
    # Se tem plano pago
    plan = SUBSCRIPTION_PLANS.get(plan_id)
    if plan:
        return {
            "success": True,
            "subscription": {
                "plan_id": plan_id,
                "plan_name": plan["name"],
                "status": "active" if current_user.get("subscription_active") else "inactive",
                "is_beta": False,
                "credits_remaining": current_user.get("credits_remaining", 0),
                "limits": plan["limits"],
                "features": plan["features"],
                "last_payment": last_payment.get("processed_at") if last_payment else None,
                "next_billing": None  # TODO: Implementar com Stripe subscriptions
            }
        }
    
    # Plano gratuito
    return {
        "success": True,
        "subscription": {
            "plan_id": "free",
            "plan_name": "Gratuito",
            "status": "active",
            "is_beta": False,
            "credits_remaining": current_user.get("credits_remaining", 10),
            "limits": {
                "posts_mes": 10,
                "ebooks_mes": 1,
                "stories_mes": 5,
                "blogs_mes": 0
            },
            "features": [
                "10 posts/mês",
                "5 stories/mês",
                "1 e-book/mês",
                "Diagnóstico Premium",
                "Scripts de WhatsApp"
            ]
        }
    }

@router.get("/history")
async def get_payment_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Retorna histórico de pagamentos do usuário"""
    
    cursor = db.payment_transactions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20)
    
    payments = []
    async for payment in cursor:
        payments.append({
            "id": payment.get("id"),
            "plan_name": payment.get("plan_name"),
            "amount": payment.get("amount", 0) / 100,  # Converter para reais
            "status": payment.get("payment_status"),
            "created_at": payment.get("created_at"),
            "processed_at": payment.get("processed_at")
        })
    
    return {
        "success": True,
        "payments": payments
    }
