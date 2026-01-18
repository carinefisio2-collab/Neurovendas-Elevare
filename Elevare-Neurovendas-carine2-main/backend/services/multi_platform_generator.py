"""
Multi-Platform Content Generator
Gera legendas otimizadas para cada plataforma e scripts de WhatsApp para estética.
"""

import os
import uuid
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

# Diretrizes por plataforma
PLATFORM_GUIDELINES = {
    "instagram": {
        "max_length": 2200,
        "style": "visual, inspirador e humanizado",
        "features": "Emojis estratégicos, quebras de linha, hashtags (5-10 relevantes), CTA no final",
        "focus": "Conexão emocional, transformação, resultados visuais"
    },
    "facebook": {
        "max_length": 500,
        "style": "conversacional e engajador",
        "features": "Perguntas para engajamento, storytelling curto, emojis moderados",
        "focus": "Comunidade, compartilhamento, discussão"
    },
    "linkedin": {
        "max_length": 700,
        "style": "profissional e informativo",
        "features": "Tom autoridade, insights técnicos, evitar emojis excessivos",
        "focus": "Autoridade, networking, cases profissionais"
    },
    "tiktok": {
        "max_length": 300,
        "style": "casual, divertido e direto",
        "features": "Ganchos rápidos, trends, linguagem jovem, hashtags virais",
        "focus": "Entretenimento, educação rápida, bastidores"
    },
    "whatsapp": {
        "max_length": 1000,
        "style": "pessoal, próximo e direto",
        "features": "Linguagem de conversa, emojis naturais, mensagens curtas",
        "focus": "Relacionamento, vendas, atendimento"
    }
}

# Cenários de WhatsApp para estética
WHATSAPP_SCENARIOS = {
    "primeiro_contato": {
        "description": "Primeira mensagem para lead que demonstrou interesse",
        "goal": "Criar conexão e entender a necessidade",
        "tone": "Acolhedor, curioso, sem pressão"
    },
    "followup": {
        "description": "Retorno para lead que não respondeu",
        "goal": "Reengajar sem parecer insistente",
        "tone": "Leve, value-first, respeitoso"
    },
    "agendamento": {
        "description": "Confirmar ou agendar consulta/procedimento",
        "goal": "Facilitar o agendamento",
        "tone": "Prático, organizado, prestativo"
    },
    "pos_atendimento": {
        "description": "Mensagem após o procedimento",
        "goal": "Fidelizar e pedir feedback/indicação",
        "tone": "Carinhoso, atencioso, profissional"
    },
    "reativacao": {
        "description": "Contato com cliente que sumiu",
        "goal": "Trazer de volta sem parecer desesperado",
        "tone": "Nostálgico, value-first, oferta especial"
    },
    "objecao": {
        "description": "Resposta para objeções comuns (preço, tempo, medo)",
        "goal": "Quebrar objeção com empatia",
        "tone": "Compreensivo, educativo, sem pressão"
    }
}


class MultiPlatformGenerator:
    """Gerador de conteúdo multi-plataforma para estética"""
    
    def __init__(self, brand_identity: dict = None):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.brand_identity = brand_identity or {}
        
        system_message = """Você é uma especialista em marketing digital para profissionais de estética.
Seu foco é criar conteúdo que CONVERTE, não apenas engaja.

Regras de ouro:
- Linguagem humana, nunca robótica
- Foco em TRANSFORMAÇÃO, não em procedimento
- Micro-dor antes da solução
- CTA sempre claro e natural
- Zero clichês de marketing genérico
- Adaptar tom para cada plataforma"""
        
        if brand_identity:
            system_message += f"\n\nIDENTIDADE DA MARCA:\n"
            system_message += f"- Marca: {brand_identity.get('brand_name', '')}\n"
            system_message += f"- Posicionamento: {brand_identity.get('positioning', '')}\n"
            system_message += f"- Estilo: {brand_identity.get('visual_style', '')}\n"
        
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id=f"multi_platform_{uuid.uuid4().hex[:8]}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
    
    async def generate_caption(self, content: str, platform: str, tone: str = "profissional") -> dict:
        """Gera legenda otimizada para plataforma específica"""
        guidelines = PLATFORM_GUIDELINES.get(platform, PLATFORM_GUIDELINES["instagram"])
        
        prompt = f"""Crie uma legenda otimizada para {platform.upper()} baseada neste conteúdo:

CONTEÚDO BASE:
{content}

DIRETRIZES DA PLATAFORMA:
- Limite: {guidelines['max_length']} caracteres
- Estilo: {guidelines['style']}
- Features: {guidelines['features']}
- Foco: {guidelines['focus']}
- Tom: {tone}

REGRAS:
1. Adapte a linguagem para {platform}
2. Inclua elementos apropriados (emojis, hashtags, quebras)
3. Comece com um gancho forte
4. Termine com CTA natural
5. NÃO exceda o limite de caracteres

Responda em JSON:
{{
    "caption": "legenda completa",
    "character_count": número,
    "hashtags": ["lista de hashtags se aplicável"],
    "cta": "call-to-action usado",
    "best_time": "melhor horário para postar"
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
            return {"caption": response, "platform": platform}
    
    async def generate_all_captions(self, content: str, tone: str = "profissional") -> dict:
        """Gera legendas para todas as plataformas principais"""
        platforms = ["instagram", "facebook", "linkedin", "tiktok"]
        captions = {}
        
        for platform in platforms:
            try:
                captions[platform] = await self.generate_caption(content, platform, tone)
            except Exception as e:
                captions[platform] = {"error": str(e)}
        
        return captions
    
    async def generate_whatsapp_script(
        self, 
        scenario: str, 
        service: str, 
        client_name: str = None,
        context: str = None
    ) -> dict:
        """Gera script de WhatsApp para cenário específico"""
        scenario_info = WHATSAPP_SCENARIOS.get(scenario, WHATSAPP_SCENARIOS["primeiro_contato"])
        
        brand_context = ""
        if self.brand_identity:
            brand_context = f"""
MARCA: {self.brand_identity.get('brand_name', 'Clínica')}
POSICIONAMENTO: {self.brand_identity.get('positioning', 'profissional')}
"""
        
        prompt = f"""Crie um script de WhatsApp para profissional de estética.

{brand_context}

CENÁRIO: {scenario_info['description']}
OBJETIVO: {scenario_info['goal']}
TOM: {scenario_info['tone']}
SERVIÇO: {service}
{f"NOME DO CLIENTE: {client_name}" if client_name else ""}
{f"CONTEXTO ADICIONAL: {context}" if context else ""}

REGRAS:
1. Mensagens CURTAS (máx 3 linhas cada)
2. Linguagem HUMANA, como conversa real
3. Emojis naturais, não excessivos
4. Sem pressão de vendas óbvia
5. Criar conexão genuína
6. Incluir variações para diferentes respostas

Responda em JSON:
{{
    "script_name": "Nome do script",
    "scenario": "{scenario}",
    "messages": [
        {{
            "order": 1,
            "type": "abertura",
            "message": "mensagem de abertura",
            "wait_for": "resposta esperada ou ação"
        }},
        {{
            "order": 2,
            "type": "desenvolvimento",
            "message": "segunda mensagem",
            "variations": ["variação se cliente disser X", "variação se cliente disser Y"]
        }}
    ],
    "objection_handlers": {{
        "preco": "resposta para objeção de preço",
        "tempo": "resposta para falta de tempo",
        "pensar": "resposta para 'vou pensar'"
    }},
    "closing_options": [
        "opção de fechamento suave",
        "opção de fechamento direto"
    ],
    "tips": ["dica prática 1", "dica prática 2"]
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
    
    async def generate_story_sequence(
        self,
        theme: str,
        story_type: str,
        number_of_stories: int = 5
    ) -> dict:
        """Gera sequência de stories com narrativa"""
        
        story_types = {
            "dia_a_dia": "Mostre um dia típico na clínica, humanizando a profissional",
            "antes_depois": "Construa expectativa mostrando transformação gradual",
            "bastidores": "Mostre o que acontece por trás das câmeras",
            "educativo": "Ensine algo valioso em formato de storytelling",
            "venda": "Conduza para uma oferta de forma natural"
        }
        
        story_focus = story_types.get(story_type, story_types["dia_a_dia"])
        
        prompt = f"""Crie uma sequência de {number_of_stories} stories para Instagram.

TEMA: {theme}
TIPO: {story_type} - {story_focus}

ESTRUTURA NARRATIVA:
Story 1: GANCHO - Capture atenção imediata
Stories 2-{number_of_stories-2}: DESENVOLVIMENTO - Construa a história
Story {number_of_stories-1}: CLÍMAX - Momento de virada/revelação
Story {number_of_stories}: CTA - Ação clara e natural

REGRAS:
1. Cada story = 1 ideia (não sobrecarregue)
2. Texto CURTO (máx 50 palavras por story)
3. Use recursos nativos (enquete, pergunta, slider)
4. Mantenha continuidade visual
5. Termine com CTA que faça sentido

Responda em JSON:
{{
    "sequence_title": "Título interno da sequência",
    "theme": "{theme}",
    "stories": [
        {{
            "order": 1,
            "phase": "GANCHO",
            "text": "texto curto para o story",
            "visual": "descrição do visual/cena",
            "sticker": "tipo de sticker interativo (enquete/pergunta/slider/nenhum)",
            "sticker_content": "conteúdo do sticker se aplicável",
            "music_suggestion": "sugestão de música"
        }}
    ],
    "final_cta": "call-to-action do último story",
    "tips": ["dica de gravação 1", "dica de gravação 2"]
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


def get_multi_platform_generator(brand_identity: dict = None) -> MultiPlatformGenerator:
    """Retorna instância do gerador multi-plataforma"""
    return MultiPlatformGenerator(brand_identity=brand_identity)
