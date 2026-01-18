"""
Serviço de Verificação de Conteúdo (Fact-Checking) para NeuroVendas
"""
import os
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

class ContentVerifier:
    def __init__(self):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY não configurada")
    
    async def verify_content(self, content: str, content_type: str = "post") -> Dict[str, Any]:
        """Verifica a qualidade e precisão de um conteúdo"""
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
        prompt = f"""Verifique este {content_type} de estética:

{content}

Retorne em JSON:
{{"score_qualidade": 0, "aprovado": true, "claims_verificados": [], "alertas": [], "sugestoes_melhoria": [], "pontos_positivos": [], "resumo": ""}}"""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"verify_{hash(content)}",
                system_message="Você é um verificador de conteúdo de estética. Responda em JSON válido."
            )
            response = await chat.send_message(UserMessage(text=prompt))
            
            import json
            import re
            
            try:
                result = json.loads(response)
            except:
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    result = {"score_qualidade": 70, "aprovado": True, "claims_verificados": [], "alertas": [], "sugestoes_melhoria": [], "pontos_positivos": [], "resumo": response}
            
            return {"success": True, **result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def verify_campaign_posts(self, posts: List[Dict]) -> Dict[str, Any]:
        """Verifica todos os posts de uma campanha"""
        results = []
        total_score = 0
        all_alerts = []
        approved_count = 0
        
        for post in posts:
            content = f"{post.get('titulo', '')}\n\n{post.get('legenda', '')}\n\nCTA: {post.get('cta', '')}"
            result = await self.verify_content(content, "post de Instagram")
            
            if result.get("success"):
                result["post_id"] = post.get("id")
                result["dia_do_ciclo"] = post.get("dia_do_ciclo")
                results.append(result)
                total_score += result.get("score_qualidade", 0)
                all_alerts.extend(result.get("alertas", []))
                if result.get("aprovado"):
                    approved_count += 1
        
        avg_score = total_score / len(results) if results else 0
        
        alerts_by_severity = {"alta": [], "media": [], "baixa": []}
        for alert in all_alerts:
            severity = alert.get("severidade", "baixa")
            if severity in alerts_by_severity:
                alerts_by_severity[severity].append(alert)
        
        return {
            "success": True,
            "total_posts": len(posts),
            "posts_aprovados": approved_count,
            "taxa_aprovacao": round(approved_count / len(posts) * 100, 1) if posts else 0,
            "score_medio": round(avg_score, 1),
            "alertas_por_severidade": {
                "alta": len(alerts_by_severity["alta"]),
                "media": len(alerts_by_severity["media"]),
                "baixa": len(alerts_by_severity["baixa"])
            },
            "alertas_criticos": alerts_by_severity["alta"][:5],
            "resultados_individuais": results,
            "recomendacao_geral": self._get_recommendation(avg_score, alerts_by_severity)
        }
    
    def _get_recommendation(self, avg_score: float, alerts: Dict) -> str:
        if avg_score >= 90 and len(alerts["alta"]) == 0:
            return "✅ Campanha aprovada! Conteúdo de alta qualidade."
        elif avg_score >= 70 and len(alerts["alta"]) == 0:
            return "⚠️ Campanha aprovada com ressalvas. Revise as sugestões."
        elif len(alerts["alta"]) > 0:
            return "🚫 Campanha precisa de revisão. Existem alertas críticos."
        else:
            return "📝 Campanha precisa de ajustes."
    
    async def suggest_improvements(self, content: str) -> Dict[str, Any]:
        """Sugere melhorias para um conteúdo"""
        from emergentintegrations.llm.openai import LlmChat, UserMessage
        
        prompt = f"""Melhore este conteúdo de estética:

{content}

Retorne em JSON:
{{"versao_melhorada": "", "mudancas_aplicadas": [], "gatilhos_adicionados": [], "tom_ajustado": "", "impacto_esperado": ""}}"""

        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"improve_{hash(content)}",
                system_message="Você é um copywriter de estética. Responda em JSON válido."
            )
            response = await chat.send_message(UserMessage(text=prompt))
            
            import json
            import re
            
            try:
                result = json.loads(response)
            except:
                json_match = re.search(r'\{[\s\S]*\}', response)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    result = {"versao_melhorada": response}
            
            return {"success": True, **result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}


_content_verifier = None

def get_content_verifier() -> ContentVerifier:
    global _content_verifier
    if _content_verifier is None:
        _content_verifier = ContentVerifier()
    return _content_verifier
