"""
Rotas de diagnóstico premium
Gerencia: questionário, análise, resultados
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime, timezone

router = APIRouter(prefix="/api/diagnosis", tags=["diagnosis"])

# Dependency
async def get_db():
    from server import db
    return db

async def get_current_user():
    from routers.auth import get_current_user as _get_current_user
    return await _get_current_user()

# Pydantic Models
class DiagnosisComplete(BaseModel):
    score_total: int
    indice_elevare: float
    classificacao: str
    nivel_geral: str
    scores_por_bloco: Dict[str, int]
    respostas: List[Dict[str, Any]]

# Routes
@router.post("/complete")
async def complete_diagnosis(
    diagnosis: DiagnosisComplete,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Salvar diagnóstico completado"""
    diagnosis_doc = {
        "user_id": current_user["id"],
        "score_total": diagnosis.score_total,
        "indice_elevare": diagnosis.indice_elevare,
        "classificacao": diagnosis.classificacao,
        "nivel_geral": diagnosis.nivel_geral,
        "scores_por_bloco": diagnosis.scores_por_bloco,
        "respostas": diagnosis.respostas,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.diagnoses.insert_one(diagnosis_doc)
    
    # Marcar como completo + XP
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {"diagnosis_completed": True},
            "$inc": {"xp": 100}  # Bônus por completar diagnóstico
        }
    )
    
    return {"message": "Diagnosis saved", "xp_earned": 100}

@router.post("/skip")
async def skip_diagnosis(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Pular diagnóstico (por enquanto)"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"diagnosis_skipped": True}}
    )
    return {"message": "Diagnosis skipped"}

@router.get("/history")
async def get_diagnosis_history(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """Obter histórico de diagnósticos"""
    cursor = db.diagnoses.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1)
    
    history = []
    async for item in cursor:
        item["_id"] = str(item["_id"])
        history.append(item)
    
    return {"diagnoses": history}
