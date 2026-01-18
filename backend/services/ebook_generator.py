"""
🧠 GERADOR DE E-BOOKS PROFISSIONAIS ELEVARE

Sistema com:
- Prompt Mestre Editorial
- Editor Fantasma (QA com reescrita automática)
- Validação de qualidade obrigatória
- Trava de sistema anti-conteúdo raso
"""

import json
import os
import uuid
from typing import Optional, Tuple
from emergentintegrations.llm.chat import LlmChat, UserMessage
from schemas.ebook_schema import is_valid_structured_ebook
from services.editorial_system import (
    get_prompt_mestre,
    get_prompt_editor_fantasma,
    get_banco_editorial_formatado,
    validar_estrutura_ebook,
    gerar_relatorio_qa,
    REGRAS_MINIMAS
)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Máximo de tentativas de reescrita
MAX_REWRITE_ATTEMPTS = 2


def get_structured_ebook_system_prompt() -> str:
    """Retorna o prompt de sistema completo com todas as regras editoriais"""
    
    prompt_mestre = get_prompt_mestre()
    banco_editorial = get_banco_editorial_formatado()
    editor_fantasma = get_prompt_editor_fantasma()
    
    return f"""{prompt_mestre}

═══════════════════════════════════════════════════════════════════════════════
📚 BANCO EDITORIAL DE REFERÊNCIA
═══════════════════════════════════════════════════════════════════════════════
{banco_editorial}

═══════════════════════════════════════════════════════════════════════════════
📋 FORMATO DE SAÍDA OBRIGATÓRIO (JSON)
═══════════════════════════════════════════════════════════════════════════════

Gere EXCLUSIVAMENTE um JSON válido seguindo este schema:

{{
  "meta": {{
    "title": "string",
    "subtitle": "string",
    "author": "string",
    "tone": "educational | persuasive | storytelling",
    "audience": "string",
    "goal": "string"
  }},
  "sections": [
    {{
      "type": "hero",
      "title": "string",
      "subtitle": "string"
    }},
    {{
      "type": "section",
      "title": "CAPÍTULO X — TÍTULO",
      "blocks": [
        {{ "type": "paragraph", "text": "Parágrafo denso com 4-6 linhas. Deve conter explicação conceitual, não apenas afirmações." }},
        {{ "type": "paragraph", "text": "Segundo parágrafo desenvolvendo o argumento com referência a autor específico." }},
        {{ "type": "callout", "style": "highlight", "text": "Citação direta de autor ou estatística importante com fonte." }},
        {{ "type": "paragraph", "text": "Terceiro parágrafo explicando o mecanismo psicológico por trás do conceito." }},
        {{ "type": "paragraph", "text": "Quarto parágrafo com aplicação prática." }},
        {{ "type": "bullet_list", "items": ["Ponto 1 com explicação", "Ponto 2 com explicação", "Ponto 3 com explicação"] }},
        {{ "type": "paragraph", "text": "Parágrafo de transição para o próximo conceito ou capítulo." }}
      ]
    }}
  ]
}}

⚠️ REGRAS DE BLOCOS:
• Cada capítulo DEVE ter 6-10 blocos de conteúdo
• Cada parágrafo deve ter 4-6 linhas de texto denso
• Bullet lists devem explicar cada ponto, não apenas listar
• Callouts devem conter citações reais de autores ou dados com fonte

═══════════════════════════════════════════════════════════════════════════════
{editor_fantasma}
═══════════════════════════════════════════════════════════════════════════════

Responda APENAS com o JSON válido, sem markdown code blocks, sem explicações."""


def get_structured_ebook_user_prompt(topic: str, audience: str, goal: str, tone: str, author: str) -> str:
    """Retorna o prompt do usuário com instruções detalhadas"""
    
    return f"""═══════════════════════════════════════════════════════════════════════════════
📌 BRIEFING DO EBOOK PROFISSIONAL
═══════════════════════════════════════════════════════════════════════════════

TEMA: {topic}
PÚBLICO-ALVO: {audience}
OBJETIVO: {goal}
TOM: {tone}
AUTOR: {author}

═══════════════════════════════════════════════════════════════════════════════
📘 ESTRUTURA OBRIGATÓRIA — 7 CAPÍTULOS DENSOS
═══════════════════════════════════════════════════════════════════════════════

CAPÍTULO 1 — O PROBLEMA ESTRUTURAL
Objetivo: Definir o problema central que o público enfrenta
• Contextualize historicamente ou cientificamente
• Explique por que soluções superficiais falham
• Cite Kahneman (vieses), Ariely (irracionalidade), ou Thaler (nudges)
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 2 — COMO AS DECISÕES REALMENTE ACONTECEM
Objetivo: Explicar os mecanismos cognitivos e emocionais
• Descreva o Sistema 1 e 2 de Kahneman
• Explique marcadores somáticos de Damasio
• Conecte neurociência com comportamento prático
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 3 — O ERRO MAIS COMUM
Objetivo: Analisar erros recorrentes e crenças equivocadas
• Identifique os vieses mais frequentes no contexto
• Cite estudos do Journal of Consumer Research
• Explique o mecanismo do erro (causa → efeito)
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 4 — UMA NOVA PERSPECTIVA
Objetivo: Apresentar mudança de paradigma
• Use o Behavior Model de BJ Fogg (B=MAP)
• Aplique princípios de Cialdini quando relevante
• Construa argumento lógico com base em evidências
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 5 — APLICAÇÃO PRÁTICA
Objetivo: Traduzir teoria em ação
• Passo a passo aplicável imediatamente
• Exemplos universais e replicáveis
• Baseie em frameworks comprovados
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 6 — CONSISTÊNCIA E VISÃO DE FUTURO
Objetivo: Estabelecer mentalidade de longo prazo
• Explique por que resultados vêm da constância
• Cite tendências de McKinsey, HBR ou MIT Sloan
• Encerre com visão estratégica inspiradora (sem promessas vazias)
• Mínimo 7 blocos, 600-900 palavras

CAPÍTULO 7 — REFERÊNCIAS E LEITURAS COMPLEMENTARES
Objetivo: Demonstrar base intelectual sólida
• Liste TODOS os livros e autores citados
• Inclua journals e instituições mencionadas
• Organize por categoria (Livros, Artigos, Estudos)
• Mínimo 8-12 referências reais

═══════════════════════════════════════════════════════════════════════════════
⚠️ VALIDAÇÃO PRÉ-ENTREGA (EDITOR FANTASMA)
═══════════════════════════════════════════════════════════════════════════════

Antes de entregar, confirme:

1. ✅ Este conteúdo ENSINA algo novo? (não repete o óbvio)
2. ✅ Um profissional teria ORGULHO de assinar?
3. ✅ Cada conceito tem EXPLICAÇÃO de mecanismo?
4. ✅ Há REFERÊNCIAS em todos os capítulos?
5. ✅ Cada capítulo tem 600+ palavras (7+ blocos)?
6. ✅ Zero linguagem de "coach" ou promessas vazias?

Se qualquer item for NÃO → REESCREVA antes de entregar.

═══════════════════════════════════════════════════════════════════════════════

Responda APENAS com o JSON válido."""


def get_rewrite_prompt(problemas: list, ebook_atual: dict) -> str:
    """Gera prompt para reescrita baseado nos problemas encontrados"""
    
    problemas_formatados = "\n".join([f"• {p}" for p in problemas])
    
    return f"""═══════════════════════════════════════════════════════════════════════════════
🔄 REESCRITA OBRIGATÓRIA — EDITOR FANTASMA REPROVOU
═══════════════════════════════════════════════════════════════════════════════

O conteúdo gerado foi REPROVADO pelo controle de qualidade.

PROBLEMAS IDENTIFICADOS:
{problemas_formatados}

═══════════════════════════════════════════════════════════════════════════════
AÇÕES OBRIGATÓRIAS
═══════════════════════════════════════════════════════════════════════════════

1. Expanda capítulos com menos de 600 palavras
2. Adicione referências a autores (Kahneman, Cialdini, Damasio, etc.)
3. Inclua explicações de mecanismos psicológicos
4. Elimine frases genéricas ou vazias
5. Desenvolva cada ponto com profundidade
6. Garanta progressão lógica entre seções

EBOOK ATUAL PARA REVISÃO:
{json.dumps(ebook_atual, ensure_ascii=False, indent=2)[:3000]}...

═══════════════════════════════════════════════════════════════════════════════
REESCREVA O EBOOK COMPLETO corrigindo TODOS os problemas.
Responda APENAS com o JSON válido corrigido.
═══════════════════════════════════════════════════════════════════════════════"""


async def generate_structured_ebook(
    topic: str,
    audience: str,
    goal: str,
    tone: str,
    author: str = "Plataforma Elevare"
) -> dict:
    """
    Gera e-book estruturado com validação automática e reescrita se necessário.
    
    Fluxo:
    1. Gera conteúdo inicial
    2. Valida com Editor Fantasma
    3. Se reprovado, reescreve até MAX_REWRITE_ATTEMPTS
    4. Retorna resultado aprovado ou melhor tentativa
    """
    
    session_id = f"ebook_{uuid.uuid4()}"
    
    system_prompt = get_structured_ebook_system_prompt()
    user_prompt = get_structured_ebook_user_prompt(topic, audience, goal, tone, author)
    
    # Configurar chat
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_prompt
    ).with_model("openai", "gpt-4o")
    
    # Primeira geração
    user_message = UserMessage(text=user_prompt)
    response = await chat.send_message(user_message)
    
    if not response:
        raise ValueError("LLM retornou resposta vazia")
    
    # Processar resposta
    parsed_ebook = _parse_llm_response(response)
    
    # Validar com Editor Fantasma
    relatorio_qa = gerar_relatorio_qa(parsed_ebook)
    
    # Se aprovado, retorna
    if relatorio_qa["aprovado"]:
        return {
            "structured_ebook": parsed_ebook,
            "qa_report": relatorio_qa,
            "attempts": 1,
            "raw_content": response
        }
    
    # Se reprovado, tenta reescrever
    melhor_ebook = parsed_ebook
    melhor_relatorio = relatorio_qa
    
    for attempt in range(MAX_REWRITE_ATTEMPTS):
        rewrite_prompt = get_rewrite_prompt(relatorio_qa["problemas"], parsed_ebook)
        rewrite_message = UserMessage(text=rewrite_prompt)
        
        response = await chat.send_message(rewrite_message)
        
        if not response:
            continue
        
        try:
            parsed_ebook = _parse_llm_response(response)
            relatorio_qa = gerar_relatorio_qa(parsed_ebook)
            
            # Atualiza melhor versão
            if relatorio_qa["aprovado"] or len(relatorio_qa["problemas"]) < len(melhor_relatorio["problemas"]):
                melhor_ebook = parsed_ebook
                melhor_relatorio = relatorio_qa
            
            if relatorio_qa["aprovado"]:
                return {
                    "structured_ebook": parsed_ebook,
                    "qa_report": relatorio_qa,
                    "attempts": attempt + 2,
                    "raw_content": response
                }
        except Exception:
            continue
    
    # Retorna melhor tentativa mesmo se não aprovado completamente
    return {
        "structured_ebook": melhor_ebook,
        "qa_report": melhor_relatorio,
        "attempts": MAX_REWRITE_ATTEMPTS + 1,
        "raw_content": response,
        "warning": "E-book gerado com avisos de qualidade. Revise manualmente."
    }


def _parse_llm_response(response: str) -> dict:
    """Processa resposta do LLM e extrai JSON"""
    raw_content = response.strip()
    
    # Remover markdown code blocks
    if raw_content.startswith("```json"):
        raw_content = raw_content.replace("```json", "").replace("```", "").strip()
    elif raw_content.startswith("```"):
        raw_content = raw_content.replace("```", "").strip()
    
    # Parse JSON
    try:
        parsed_data = json.loads(raw_content)
    except json.JSONDecodeError as e:
        raise ValueError(f"Falha ao processar resposta como JSON: {str(e)}")
    
    # Validar schema básico
    if not is_valid_structured_ebook(parsed_data):
        raise ValueError("Schema do e-book estruturado inválido")
    
    return parsed_data


def structured_ebook_to_readable_text(ebook: dict) -> str:
    """Converte StructuredEbook para texto legível (Markdown)"""
    lines = []
    
    # Meta
    meta = ebook.get("meta", {})
    lines.append(f"# {meta.get('title', '')}")
    if meta.get("subtitle"):
        lines.append(f"## {meta['subtitle']}")
    lines.append("")
    lines.append(f"**Autor:** {meta.get('author', '')}")
    lines.append(f"**Público-alvo:** {meta.get('audience', '')}")
    lines.append(f"**Objetivo:** {meta.get('goal', '')}")
    lines.append("")
    lines.append("---")
    lines.append("")
    
    # Sections
    for section in ebook.get("sections", []):
        if section.get("type") == "hero":
            lines.append(f"# {section.get('title', '')}")
            if section.get("subtitle"):
                lines.append(f"### {section['subtitle']}")
            lines.append("")
        elif section.get("type") == "section":
            lines.append(f"## {section.get('title', '')}")
            lines.append("")
            
            for block in section.get("blocks", []):
                if block.get("type") == "paragraph":
                    lines.append(block.get("text", ""))
                    lines.append("")
                elif block.get("type") == "bullet_list":
                    for item in block.get("items", []):
                        lines.append(f"• {item}")
                    lines.append("")
                elif block.get("type") == "callout":
                    style_emoji = {
                        "highlight": "💡",
                        "tip": "✅",
                        "warning": "⚠️"
                    }.get(block.get("style", "highlight"), "💡")
                    lines.append(f"> {style_emoji} **{block.get('text', '')}**")
                    lines.append("")
            
            lines.append("---")
            lines.append("")
        elif section.get("type") == "image":
            lines.append(f"*[Imagem: {section.get('prompt', '')}]*")
            lines.append("")
    
    return "\n".join(lines)
