"""
Serviço de integração com a API do Gamma
Motor invisível para criação de e-books e artigos de blog

Documentação: https://developers.gamma.app
"""

import os
import asyncio
import httpx
from typing import Optional, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel

# Configuração da API
GAMMA_API_URL = "https://public-api.gamma.app/v1.0"

class GammaConfig(BaseModel):
    """Configuração para geração de conteúdo via Gamma"""
    input_text: str
    text_mode: Literal["generate", "condense", "preserve"] = "generate"
    format: Literal["presentation", "document", "social", "webpage"] = "document"
    theme_id: Optional[str] = None
    num_cards: int = 10
    card_split: Literal["auto", "inputTextBreaks"] = "auto"
    additional_instructions: Optional[str] = None
    export_as: Optional[Literal["pdf", "pptx"]] = None
    
    # Text options
    text_amount: Literal["brief", "medium", "detailed", "extensive"] = "detailed"
    tone: Optional[str] = None
    audience: Optional[str] = None
    language: str = "pt-br"  # Português do Brasil
    
    # Image options
    image_source: Literal[
        "aiGenerated", "pictographic", "unsplash", "giphy",
        "webAllImages", "webFreeToUse", "webFreeToUseCommercially",
        "placeholder", "noImages"
    ] = "aiGenerated"
    image_style: Optional[str] = None


class GammaService:
    """Serviço para integração com a API do Gamma"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get("GAMMA_API_KEY")
        self.base_url = GAMMA_API_URL
        
    def _get_headers(self) -> Dict[str, str]:
        """Retorna headers para autenticação"""
        if not self.api_key:
            raise ValueError("GAMMA_API_KEY não configurada")
        return {
            "Content-Type": "application/json",
            "X-API-KEY": self.api_key,
        }
    
    def _build_request_body(self, config: GammaConfig) -> Dict[str, Any]:
        """Constrói o corpo da requisição para a API"""
        body = {
            "inputText": config.input_text,
            "textMode": config.text_mode,
            "format": config.format,
            "numCards": config.num_cards,
            "cardSplit": config.card_split,
            "textOptions": {
                "amount": config.text_amount,
                "language": config.language,
            },
            "imageOptions": {
                "source": config.image_source,
            },
        }
        
        # Adicionar campos opcionais
        if config.theme_id:
            body["themeId"] = config.theme_id
            
        if config.additional_instructions:
            body["additionalInstructions"] = config.additional_instructions
            
        if config.export_as:
            body["exportAs"] = config.export_as
            
        if config.tone:
            body["textOptions"]["tone"] = config.tone
            
        if config.audience:
            body["textOptions"]["audience"] = config.audience
            
        if config.image_style and config.image_source == "aiGenerated":
            body["imageOptions"]["style"] = config.image_style
            body["imageOptions"]["model"] = "flux-1-pro"  # Modelo padrão para imagens AI
            
        return body
    
    async def generate(self, config: GammaConfig) -> Dict[str, Any]:
        """
        Inicia a geração de conteúdo via API do Gamma
        
        Retorna:
            {
                "generationId": "xxx",
                "status": "pending" | "completed",
                "gammaUrl": "https://gamma.app/docs/xxx" (quando completo)
            }
        """
        async with httpx.AsyncClient() as client:
            request_body = self._build_request_body(config)
            print(f"[Gamma] Enviando request: {request_body}")  # Debug
            
            response = await client.post(
                f"{self.base_url}/generations",
                headers=self._get_headers(),
                json=request_body,
                timeout=30.0,
            )
            
            print(f"[Gamma] Response status: {response.status_code}")  # Debug
            print(f"[Gamma] Response body: {response.text}")  # Debug
            
            if response.status_code == 403:
                raise ValueError("Sem créditos disponíveis na API Gamma")
            
            response.raise_for_status()
            return response.json()
    
    async def check_status(self, generation_id: str) -> Dict[str, Any]:
        """
        Verifica o status de uma geração
        
        Retorna:
            {
                "generationId": "xxx",
                "status": "pending" | "completed",
                "gammaUrl": "https://gamma.app/docs/xxx" (quando completo),
                "credits": {"deducted": 150, "remaining": 3000}
            }
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/generations/{generation_id}",
                headers=self._get_headers(),
                timeout=30.0,
            )
            
            response.raise_for_status()
            return response.json()
    
    async def generate_and_wait(
        self, 
        config: GammaConfig, 
        max_wait_seconds: int = 120,
        poll_interval: int = 3
    ) -> Dict[str, Any]:
        """
        Gera conteúdo e aguarda até completar
        
        Args:
            config: Configuração de geração
            max_wait_seconds: Tempo máximo de espera
            poll_interval: Intervalo entre verificações
            
        Retorna:
            {
                "generationId": "xxx",
                "status": "completed",
                "gammaUrl": "https://gamma.app/docs/xxx"
            }
        """
        # Iniciar geração
        result = await self.generate(config)
        generation_id = result.get("generationId")
        
        if not generation_id:
            raise ValueError("Falha ao iniciar geração: generationId não retornado")
        
        # Aguardar conclusão
        elapsed = 0
        while elapsed < max_wait_seconds:
            status = await self.check_status(generation_id)
            
            if status.get("status") == "completed":
                return status
            
            await asyncio.sleep(poll_interval)
            elapsed += poll_interval
        
        raise TimeoutError(f"Geração não completou em {max_wait_seconds} segundos")


# Funções helper para casos de uso específicos

def build_ebook_config(
    title: str,
    topic: str,
    audience: str,
    tone: str = "profissional",
    num_chapters: int = 8,
    additional_instructions: Optional[str] = None,
) -> GammaConfig:
    """
    Constrói configuração para e-book estratégico Elevare
    """
    # Prompt estruturado no padrão NeuroVendas
    input_text = f"""# {title}

## E-book Estratégico para Profissionais de Estética

### Público-alvo
{audience}

### Tema Central
{topic}

### Estrutura do E-book
Crie um e-book educativo e persuasivo com os seguintes elementos:
1. Capa impactante com título e subtítulo
2. Introdução que conecta com a dor do leitor
3. Capítulos com conteúdo de valor e gatilhos mentais
4. Exemplos práticos e cases de sucesso
5. Call to action estratégico
6. Página de encerramento com próximos passos

### Tom de Voz
{tone}
"""

    instructions = """
    - Crie um e-book premium com design profissional
    - Use gatilhos mentais: autoridade, prova social, escassez, reciprocidade
    - Inclua sumário clicável no início
    - Cada capítulo deve ter título atrativo e conteúdo de valor
    - Termine com CTA claro e persuasivo
    - Linguagem acessível mas profissional
    - Evite jargões técnicos excessivos
    """
    
    if additional_instructions:
        instructions += f"\n- {additional_instructions}"

    return GammaConfig(
        input_text=input_text,
        text_mode="generate",
        format="document",
        num_cards=num_chapters + 2,  # +2 para capa e encerramento
        text_amount="detailed",
        tone=tone,
        audience=audience,
        language="pt-br",
        image_source="aiGenerated",
        image_style="profissional, clean, moderno, estética premium",
        additional_instructions=instructions,
    )


def build_blog_config(
    title: str,
    topic: str,
    audience: str,
    article_type: str = "educativo",
    tone: str = "profissional",
    keywords: Optional[str] = None,
    call_to_action: Optional[str] = None,
) -> GammaConfig:
    """
    Constrói configuração para artigo de blog Elevare
    """
    # Mapear tipo de artigo para instruções específicas
    type_instructions = {
        "educativo": "Foque em ensinar conceitos e técnicas de forma clara e didática.",
        "autoridade": "Posicione o autor como especialista de referência no assunto.",
        "conversao": "Direcione o leitor para uma ação específica com gatilhos de conversão.",
        "tendencias": "Apresente novidades e tendências do mercado de forma atual.",
    }
    
    input_text = f"""# {title}

## Artigo Estratégico para Blog

### Tema
{topic}

### Público-alvo
{audience}

### Objetivo do Artigo
{type_instructions.get(article_type, type_instructions["educativo"])}

### Palavras-chave SEO
{keywords or "estética, beleza, procedimentos, autoestima"}

### Call to Action
{call_to_action or "Agende sua avaliação gratuita"}
"""

    instructions = f"""
    - Crie um artigo de blog otimizado para SEO
    - Estrutura: título atrativo, introdução, subtítulos, conclusão com CTA
    - Use as palavras-chave de forma natural no texto
    - Inclua perguntas que o leitor pode ter
    - Tom de voz: {tone}
    - Tipo de artigo: {article_type}
    - Termine com call to action persuasivo
    """

    return GammaConfig(
        input_text=input_text,
        text_mode="generate",
        format="webpage",  # Formato de página web para blog
        num_cards=6,  # Seções do artigo
        text_amount="detailed",
        tone=tone,
        audience=audience,
        language="pt-br",
        image_source="aiGenerated",
        image_style="clean, moderno, profissional, estética",
        additional_instructions=instructions,
    )


# Instância singleton do serviço
gamma_service = GammaService()
