"""
Schema para Documento Estruturado de E-book

Este é o modelo intermediário (AST) que representa a estrutura
lógica do e-book antes da renderização visual.

Fluxo: Prompt → JSON Estruturado → Layout → PDF
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union
from enum import Enum

# ============================================================================
# META
# ============================================================================

class EbookTone(str, Enum):
    EDUCATIONAL = "educational"
    PERSUASIVE = "persuasive"
    STORYTELLING = "storytelling"

class EbookMeta(BaseModel):
    title: str
    subtitle: Optional[str] = None
    author: str
    tone: EbookTone
    audience: str
    goal: str

# ============================================================================
# BLOCKS (Elementos de conteúdo)
# ============================================================================

class ParagraphBlock(BaseModel):
    type: Literal["paragraph"] = "paragraph"
    text: str

class BulletListBlock(BaseModel):
    type: Literal["bullet_list"] = "bullet_list"
    items: List[str]

class CalloutStyle(str, Enum):
    HIGHLIGHT = "highlight"
    TIP = "tip"
    WARNING = "warning"

class CalloutBlock(BaseModel):
    type: Literal["callout"] = "callout"
    style: CalloutStyle
    text: str

ContentBlock = Union[ParagraphBlock, BulletListBlock, CalloutBlock]

# ============================================================================
# SECTIONS (Seções do documento)
# ============================================================================

class HeroSection(BaseModel):
    type: Literal["hero"] = "hero"
    title: str
    subtitle: Optional[str] = None

class ContentSection(BaseModel):
    type: Literal["section"] = "section"
    title: str
    blocks: List[dict]  # ContentBlock como dict para flexibilidade

class ImageStyle(str, Enum):
    FULL = "full"
    INLINE = "inline"

class ImageSection(BaseModel):
    type: Literal["image"] = "image"
    prompt: str
    style: ImageStyle
    url: Optional[str] = None

Section = Union[HeroSection, ContentSection, ImageSection]

# ============================================================================
# DOCUMENTO COMPLETO
# ============================================================================

class StructuredEbook(BaseModel):
    meta: EbookMeta
    sections: List[dict]  # Section como dict para flexibilidade

# ============================================================================
# VALIDAÇÃO
# ============================================================================

def is_valid_structured_ebook(data: dict) -> bool:
    """Valida se um objeto é um documento estruturado válido"""
    if not data or not isinstance(data, dict):
        return False
    
    # Validar meta
    if not data.get("meta") or not isinstance(data["meta"], dict):
        return False
    meta = data["meta"]
    if not meta.get("title") or not isinstance(meta["title"], str):
        return False
    if not meta.get("author") or not isinstance(meta["author"], str):
        return False
    if meta.get("tone") not in ["educational", "persuasive", "storytelling"]:
        return False
    if not meta.get("audience") or not isinstance(meta["audience"], str):
        return False
    if not meta.get("goal") or not isinstance(meta["goal"], str):
        return False
    
    # Validar sections
    if not isinstance(data.get("sections"), list):
        return False
    if len(data["sections"]) == 0:
        return False
    
    for section in data["sections"]:
        if not section or not isinstance(section, dict):
            return False
        if section.get("type") not in ["hero", "section", "image"]:
            return False
        
        # Validar cada tipo de seção
        if section["type"] == "hero":
            if not section.get("title") or not isinstance(section["title"], str):
                return False
        elif section["type"] == "section":
            if not section.get("title") or not isinstance(section["title"], str):
                return False
            if not isinstance(section.get("blocks"), list):
                return False
            
            for block in section["blocks"]:
                if not block or not isinstance(block, dict):
                    return False
                if block.get("type") not in ["paragraph", "bullet_list", "callout"]:
                    return False
                
                if block["type"] == "paragraph":
                    if not block.get("text") or not isinstance(block["text"], str):
                        return False
                elif block["type"] == "bullet_list":
                    if not isinstance(block.get("items"), list):
                        return False
                elif block["type"] == "callout":
                    if block.get("style") not in ["highlight", "tip", "warning"]:
                        return False
                    if not block.get("text") or not isinstance(block["text"], str):
                        return False
        elif section["type"] == "image":
            if not section.get("prompt") or not isinstance(section["prompt"], str):
                return False
            if section.get("style") not in ["full", "inline"]:
                return False
    
    return True

# ============================================================================
# EXEMPLO DE USO
# ============================================================================

EXAMPLE_STRUCTURED_EBOOK = {
    "meta": {
        "title": "Guia Completo de Neurovendas",
        "subtitle": "Técnicas comprovadas para aumentar suas conversões",
        "author": "Plataforma Elevare",
        "tone": "educational",
        "audience": "Empreendedores e profissionais de vendas",
        "goal": "Ensinar técnicas de neurovendas aplicáveis imediatamente"
    },
    "sections": [
        {
            "type": "hero",
            "title": "Guia Completo de Neurovendas",
            "subtitle": "Técnicas comprovadas para aumentar suas conversões"
        },
        {
            "type": "section",
            "title": "O que são Neurovendas?",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Neurovendas é a aplicação de princípios da neurociência e psicologia ao processo de vendas. Ao entender como o cérebro humano toma decisões, você pode criar estratégias mais eficazes."
                },
                {
                    "type": "callout",
                    "style": "highlight",
                    "text": "90% das decisões de compra são tomadas pelo cérebro emocional, não pela lógica."
                }
            ]
        },
        {
            "type": "section",
            "title": "Principais Gatilhos Mentais",
            "blocks": [
                {
                    "type": "paragraph",
                    "text": "Os gatilhos mentais são atalhos cognitivos que influenciam decisões. Aqui estão os mais poderosos:"
                },
                {
                    "type": "bullet_list",
                    "items": [
                        "Escassez: Produtos limitados geram urgência",
                        "Prova Social: Depoimentos aumentam credibilidade",
                        "Autoridade: Especialistas influenciam decisões",
                        "Reciprocidade: Dar antes de pedir gera retorno"
                    ]
                }
            ]
        },
        {
            "type": "image",
            "prompt": "Professional infographic showing brain decision-making process in sales, modern minimalist style",
            "style": "full"
        }
    ]
}
