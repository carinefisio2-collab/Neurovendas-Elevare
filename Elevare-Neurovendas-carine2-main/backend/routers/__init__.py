"""
Routers initialization
Importa e configura todos os routers modulares
"""

from fastapi import APIRouter
from routers import auth, ai, gamification, onboarding, diagnosis, dashboard, payments, ebooks

# Router principal que agrega todos
api_router = APIRouter()

# Incluir todos os routers
api_router.include_router(auth.router)
api_router.include_router(ai.router)
api_router.include_router(gamification.router)
api_router.include_router(onboarding.router)
api_router.include_router(diagnosis.router)
api_router.include_router(dashboard.router)
api_router.include_router(payments.router)
api_router.include_router(ebooks.router)

__all__ = ["api_router"]
