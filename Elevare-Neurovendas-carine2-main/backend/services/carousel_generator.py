"""
Gerador de Carrosséis NeuroVendas Elevare
Gera carrosséis de alta conversão seguindo a lógica de NeuroVendas Elevare.
"""

import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

CAROUSEL_SYSTEM_PROMPT = """
Você é o Gerador de Carrosséis NeuroVendas Elevare.

Sua função é gerar carrosséis prontos de alta conversão para Instagram e Meta Ads, 
voltados a profissionais da estética, seguindo a lógica de NeuroVendas Elevare.

🧠 ESTRUTURA LÓGICA OBRIGATÓRIA (NeuroVendas Elevare):

SLIDE 1 - HOOK VISCERAL:
- Quebra de padrão ou promessa clara e realista
- Faça a pessoa PARAR de rolar

SLIDES 2-3 - DOR REAL:
- Dor real do profissional ou cliente
- Linguagem simples, cotidiana, sem jargão técnico
- Faça ela se identificar e pensar "isso sou eu"

SLIDES 4-5 - CONSCIÊNCIA DO CUSTO INVISÍVEL:
- Tempo perdido, dinheiro deixado na mesa
- Agenda vazia, desgaste emocional
- O preço de não resolver isso

SLIDES 6-7 - NOVA PERSPECTIVA:
- Solução possível, sem promessas irreais
- Sem linguagem médica proibida
- Mostre que existe caminho

SLIDE FINAL - CTA:
- CTA direto e acionável
- Comentar, chamar no direct, salvar ou clicar no link

✍️ REGRAS DE ESCRITA (TRAVAS DO SISTEMA):

SEMPRE:
- Frases curtas e escaneáveis
- Linguagem humana, direta e brasileira
- Tom de quem vive a realidade da clínica
- Parecer escrito por alguém que lida com agenda vazia e Instagram que não entrega

NUNCA:
- Clichês de marketing genérico
- Emojis excessivos
- Promessas milagrosas
- Termos médicos, diagnósticos ou garantias de resultado
- Linguagem de robô ou chatbot

🎯 VOCÊ ENTREGA:
- Carrossel PRONTO
- Copy de conversão REAL
- Executável em MINUTOS
"""


class CarouselGenerator:
    """Gerador de Carrosséis NeuroVendas Elevare"""
    
    def __init__(self, brand_identity: dict = None):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.brand_identity = brand_identity or {}
        
        # Personalizar com identidade da marca
        system_message = CAROUSEL_SYSTEM_PROMPT
        if brand_identity:
            system_message += f"\n\n📊 IDENTIDADE DA MARCA:\n"
            if brand_identity.get("brand_name"):
                system_message += f"Marca: {brand_identity['brand_name']}\n"
            if brand_identity.get("segment"):
                system_message += f"Segmento: {brand_identity['segment']}\n"
            if brand_identity.get("main_specialty"):
                system_message += f"Especialidade: {brand_identity['main_specialty']}\n"
            if brand_identity.get("positioning"):
                system_message += f"Posicionamento: {brand_identity['positioning']}\n"
            if brand_identity.get("visual_style"):
                system_message += f"Estilo Visual: {brand_identity['visual_style']}\n"
            if brand_identity.get("key_phrases"):
                system_message += f"Frases-chave: {', '.join(brand_identity['key_phrases'])}\n"
        
        # Generate a session ID for this carousel generator instance
        import uuid
        session_id = f"carousel_{uuid.uuid4().hex[:8]}"
        
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
    
    async def generate_carousel(
        self,
        niche: str,
        carousel_objective: str,
        target_audience: str,
        tone_of_voice: str,
        offer_or_theme: str,
        audience_awareness: str,
        number_of_slides: int = 8
    ) -> dict:
        """
        Gera carrossel completo seguindo a lógica NeuroVendas Elevare.
        
        Args:
            niche: Nicho de atuação (ex: estética, criomodelagem, harmonização)
            carousel_objective: Objetivo (atracao, autoridade, prova_social, venda_direta)
            target_audience: Nível do público (iniciante, intermediario, avancado, cliente_final)
            tone_of_voice: Tom de voz (profissional, direto, acolhedor, premium, provocativo)
            offer_or_theme: Oferta ou tema central
            audience_awareness: Consciência do público (frio, morno, quente)
            number_of_slides: Quantidade de slides (7-9)
        """
        
        objective_map = {
            "atracao": "Atrair novos seguidores e gerar awareness",
            "autoridade": "Posicionar como autoridade no nicho",
            "prova_social": "Usar casos e depoimentos para gerar confiança",
            "venda_direta": "Converter em agendamento ou venda"
        }
        
        audience_map = {
            "iniciante": "Profissional que está começando, ainda inseguro",
            "intermediario": "Profissional com alguma experiência, buscando escalar",
            "avancado": "Profissional experiente, quer otimizar e inovar",
            "cliente_final": "Cliente que vai fazer o procedimento"
        }
        
        awareness_map = {
            "frio": "Não conhece você nem o problema - precisa de educação",
            "morno": "Conhece o problema, busca soluções - precisa de diferenciação",
            "quente": "Já confia em você - precisa de oferta clara"
        }
        
        tone_map = {
            "profissional": "Técnico mas acessível, transmite competência",
            "direto": "Objetivo, sem rodeios, vai ao ponto",
            "acolhedor": "Empático, compreensivo, conecta emocionalmente",
            "premium": "Sofisticado, exclusivo, para público exigente",
            "provocativo": "Desafiador, questiona crenças, gera reflexão"
        }
        
        # Contexto da identidade da marca
        brand_context = ""
        if self.brand_identity:
            brand_context = f"""
CONTEXTO DA MARCA:
- Marca: {self.brand_identity.get('brand_name', 'Não definido')}
- Segmento: {self.brand_identity.get('segment', 'estética')}
- Especialidade: {self.brand_identity.get('main_specialty', 'Não definido')}
- Posicionamento: {self.brand_identity.get('positioning', 'profissional')}
- Estilo Visual: {self.brand_identity.get('visual_style', 'clean')}
- Frases-chave: {', '.join(self.brand_identity.get('key_phrases', [])) or 'Não definidas'}
"""
        
        prompt = f"""Gere um carrossel de {number_of_slides} slides para Instagram/Meta Ads.

{brand_context}

BRIEFING:
- Nicho: {niche}
- Objetivo: {objective_map.get(carousel_objective, carousel_objective)}
- Público-alvo: {audience_map.get(target_audience, target_audience)}
- Tom de voz: {tone_map.get(tone_of_voice, tone_of_voice)}
- Tema/Oferta: {offer_or_theme}
- Nível de consciência: {awareness_map.get(audience_awareness, audience_awareness)}

ESTRUTURA OBRIGATÓRIA:

SLIDE 1: Hook visceral - quebra de padrão ou promessa clara
SLIDES 2-3: Dor real - linguagem simples, cotidiana
SLIDES 4-5: Custo invisível - tempo, dinheiro, desgaste
SLIDES 6-7: Nova perspectiva - solução possível
SLIDE {number_of_slides}: CTA direto e acionável

REGRAS:
- Frases CURTAS e escaneáveis
- Linguagem HUMANA e brasileira
- ZERO clichês de marketing
- ZERO promessas milagrosas
- ZERO termos médicos/diagnósticos
- Parecer escrito por quem VIVE clínica

Responda em JSON:
{{
    "carousel_title": "Título interno do carrossel",
    "carousel_objective": "{carousel_objective}",
    "target_audience": "{target_audience}",
    "slides": [
        {{
            "slide": 1,
            "phase": "hook",
            "headline": "Headline curta e impactante (máx 8 palavras)",
            "text": "Texto principal do slide (máx 30 palavras)",
            "visual_suggestion": "Sugestão visual específica"
        }}
    ],
    "final_cta": "CTA claro e acionável",
    "caption": "Legenda completa para o post (máx 200 palavras)",
    "hashtags": ["5 hashtags relevantes"]
}}

Responda APENAS com o JSON válido."""

        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        import json
        import re
        
        try:
            return json.loads(response)
        except:
            # Tentar extrair JSON do texto
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return {"raw_response": response}
    
    async def generate_carousel_sequence(
        self,
        niche: str,
        campaign_theme: str,
        number_of_carousels: int = 3
    ) -> dict:
        """
        Gera sequência de carrosséis para campanha completa.
        """
        prompt = f"""Crie uma sequência estratégica de {number_of_carousels} carrosséis para uma campanha.

CONTEXTO:
- Nicho: {niche}
- Tema da Campanha: {campaign_theme}
- Marca: {self.brand_identity.get('brand_name', 'Não definido')}

A sequência deve seguir a jornada:
1. ATRAÇÃO (público frio) - Educar e gerar curiosidade
2. AUTORIDADE (público morno) - Posicionar como especialista
3. CONVERSÃO (público quente) - Ofertar e converter

Para cada carrossel, forneça:
- Objetivo específico
- Resumo da estratégia
- 3 headlines sugeridas

Responda em JSON:
{{
    "campaign_theme": "{campaign_theme}",
    "carousels": [
        {{
            "order": 1,
            "objective": "atracao",
            "strategy": "Descrição da estratégia",
            "suggested_headlines": ["headline 1", "headline 2", "headline 3"],
            "best_day_to_post": "Sugestão de dia",
            "target_awareness": "frio"
        }}
    ],
    "campaign_notes": "Notas estratégicas da campanha"
}}

Responda APENAS com o JSON válido."""

        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        import json
        import re
        
        try:
            return json.loads(response)
        except:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except:
                    pass
            return {"raw_response": response}


# Singleton para reutilização
_carousel_generator = None

def get_carousel_generator(brand_identity: dict = None) -> CarouselGenerator:
    """Retorna instância do gerador de carrosséis"""
    return CarouselGenerator(brand_identity=brand_identity)
