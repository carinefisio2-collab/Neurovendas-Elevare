from fastapi import FastAPI, HTTPException, Depends, status, Request, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import json
import base64
from uuid import uuid4
from dotenv import load_dotenv
import resend

load_dotenv()

# Import LucresIA
from services.lucresia import LucresIA, PROMPTS_BIBLIOTECA, TEMPLATES_CONTEUDO
from services.biblioteca_prompts import (
    PROMPTS_ESTRATEGICOS, 
    TEMPLATES_CALENDARIO, 
    TEMAS_MENSAIS_ELEVARE,
    TONS_COMUNICACAO,
    OBJETIVOS_ESTRATEGICOS,
    TIPOS_CONTEUDO
)
from services.image_generator import get_image_generator, ImageGenerator
from services.content_verifier import get_content_verifier, ContentVerifier
from services.carousel_generator import get_carousel_generator, CarouselGenerator
from services.multi_platform_generator import get_multi_platform_generator, MultiPlatformGenerator
from services.seo_blog_generator import get_seo_blog_generator, SEOBlogGenerator, ARTICLE_TYPES, AWARENESS_LEVELS

# E-book Structured Generator (New System)
from services.ebook_generator import generate_structured_ebook, structured_ebook_to_readable_text
from services.ebook_renderer import render_structured_ebook, get_available_templates
from schemas.ebook_schema import is_valid_structured_ebook

# E-book Generator V2 (Interno - SEM GAMMA)
from services.ebook_generator_v2 import get_ebook_generator, EbookGeneratorV2

# Gamma API Integration (DEPRECATED - mantido para compatibilidade)
from services.gamma_service import (
    gamma_service, 
    GammaConfig, 
    build_ebook_config, 
    build_blog_config
)

# Stripe Integration
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

# App initialization
app = FastAPI(title="NeuroVendas by Elevare", version="2.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "elevare_db")
JWT_SECRET = os.environ.get("JWT_SECRET", "elevare-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# Resend Email Config
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
RESEND_FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "noreply@elevare.neurovendas")
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

client: AsyncIOMotorClient = None
db = None

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# =============================================================================
# PYDANTIC MODELS
# =============================================================================

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=2)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    plan: str
    credits_remaining: int
    created_at: str
    onboarding_completed: bool = False
    onboarding_data: Optional[Dict] = None
    diagnosis_completed: bool = False

class TokenResponse(BaseModel):
    success: bool
    token: str
    user: UserResponse

class OnboardingData(BaseModel):
    tipo_negocio: Optional[str] = None
    especialidade: Optional[str] = None
    objetivo: Optional[str] = None
    publico_alvo: Optional[str] = None
    tom_voz: Optional[str] = None

class LeadCreate(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    procedimento: Optional[str] = None
    origem: Optional[str] = "manual"
    temperatura: Optional[str] = "frio"
    valor_estimado: Optional[int] = 0
    observacoes: Optional[str] = None

class LeadUpdate(BaseModel):
    nome: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    procedimento: Optional[str] = None
    temperatura: Optional[str] = None
    status: Optional[str] = None
    valor_estimado: Optional[int] = None
    observacoes: Optional[str] = None

class AgendamentoCreate(BaseModel):
    cliente_nome: str
    procedimento: str
    valor: int
    data: str
    horario: str
    observacoes: Optional[str] = None

class ContentCreate(BaseModel):
    tipo: str
    titulo: str
    conteudo: Optional[str] = None

# AI Request Models
class BioAnalyzeRequest(BaseModel):
    instagramHandle: str
    bioText: Optional[str] = None

# Diagnóstico de Presença Digital
class DiagnosticoPresencaRequest(BaseModel):
    # Instagram
    instagramHandle: str
    nicho: str
    bioText: str
    destaques: Optional[str] = None
    tipoConteudo: Optional[str] = None
    ctaBio: Optional[str] = None
    # Link da Bio
    linkUrl: str
    tipoLink: str
    tituloLink: str
    subtituloLink: Optional[str] = None
    ofertaLink: Optional[str] = None
    ctaLink: str
    objetivoLink: str

# Diagnóstico de Presença SIMPLIFICADO (apenas 2 campos)
class DiagnosticoPresencaSimplesRequest(BaseModel):
    instagramHandle: str
    linkBio: str

class ContentGenerateRequest(BaseModel):
    tema: str
    tipo: str = "post"
    tom: str = "profissional"

class PersonaGenerateRequest(BaseModel):
    servico: str
    nicho: str = "estética"

class EbookGenerateRequest(BaseModel):
    topic: str
    targetAudience: str
    chapters: int = 5

# New Structured Ebook Models
class StructuredEbookGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, description="Tema do e-book")
    audience: str = Field(..., min_length=3, description="Público-alvo")
    goal: str = Field(..., min_length=3, description="Objetivo do e-book")
    tone: str = Field(default="educational", description="Tom: educational, persuasive, storytelling")
    author: str = Field(default="Plataforma Elevare", description="Nome do autor")

class StructuredEbookPDFRequest(BaseModel):
    ebook_id: str
    template: str = Field(default="educational", description="Template: educational, marketing, storytelling")

class StructuredEbookUpdateRequest(BaseModel):
    ebook_id: str
    structured_content: dict

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ScriptDirectRequest(BaseModel):
    tipo: str = "premium"

class CalendarPostCreate(BaseModel):
    titulo: str
    tipo: str  # autoridade, desejo, fechamento, conexao
    data_agendada: str
    horario: str
    legenda: Optional[str] = None
    hashtags: Optional[str] = None
    tema_mensal: Optional[str] = None
    subtema: Optional[str] = None
    objetivo: Optional[str] = None
    tom: Optional[str] = None
    plataforma: Optional[str] = "instagram"

class CalendarPostUpdate(BaseModel):
    titulo: Optional[str] = None
    tipo: Optional[str] = None
    data_agendada: Optional[str] = None
    horario: Optional[str] = None
    legenda: Optional[str] = None
    hashtags: Optional[str] = None
    tema_mensal: Optional[str] = None
    subtema: Optional[str] = None
    objetivo: Optional[str] = None
    tom: Optional[str] = None
    status: Optional[str] = None
    plataforma: Optional[str] = None

class GenerateCalendarRequest(BaseModel):
    mes: str  # janeiro, fevereiro, etc
    posts_por_semana: int = 5
    tipos_conteudo: List[str] = ["feed", "reels", "stories"]
    tom_preferido: str = "acolhedor"

class GenerateFromPromptRequest(BaseModel):
    prompt_id: str
    variaveis: Dict[str, str] = {}
    tom: str = "profissional"

# =============================================================================
# CAMPANHAS ELEVARE 360° MODELS
# =============================================================================

class CampanhaCreate(BaseModel):
    nome: str
    objetivo_estrategico: str  # Engajar/Educar/Vender/Inspirar/Fidelizar
    tom_comunicacao: str  # Técnico/Acolhedor/Provocador/Inspirador/Comercial
    emocao_principal: str  # Segurança/Desejo/Pertencimento/Confiança/Esperança
    duracao_dias: int = 6  # Default 6 dias (ciclo completo)
    tema_base: str
    descricao: Optional[str] = None
    data_inicio: Optional[str] = None

class CampanhaUpdate(BaseModel):
    nome: Optional[str] = None
    objetivo_estrategico: Optional[str] = None
    tom_comunicacao: Optional[str] = None
    emocao_principal: Optional[str] = None
    duracao_dias: Optional[int] = None
    tema_base: Optional[str] = None
    descricao: Optional[str] = None
    data_inicio: Optional[str] = None
    status: Optional[str] = None

class PostCampanhaCreate(BaseModel):
    campanha_id: str
    dia_do_ciclo: int  # 1-6
    foco_neuro: str  # Impacto/Identificação/Autoridade/Educação/Prova+Oferta/Encantamento
    cerebro_alvo: str  # Reptiliano/Límbico/Neocórtex
    tipo_conteudo: str
    titulo: Optional[str] = None
    legenda: Optional[str] = None
    cta: Optional[str] = None
    gatilhos: Optional[List[str]] = None
    data_programada: Optional[str] = None

class PostCampanhaUpdate(BaseModel):
    titulo: Optional[str] = None
    legenda: Optional[str] = None
    cta: Optional[str] = None
    gatilhos: Optional[List[str]] = None
    data_programada: Optional[str] = None
    status: Optional[str] = None
    imagem_url: Optional[str] = None

class GenerarSequenciaRequest(BaseModel):
    campanha_id: str
    gerar_copy: bool = True  # Gerar copy com IA

class GenerateImageRequest(BaseModel):
    prompt: str
    style: str = "professional"  # professional, artistic, minimalist, warm, luxurious, natural, clinical

class GeneratePostImageRequest(BaseModel):
    post_id: str
    custom_prompt: Optional[str] = None

# Content Verification Models
class VerifyContentRequest(BaseModel):
    content: str
    content_type: str = "post"

class SuggestImprovementsRequest(BaseModel):
    content: str

# =============================================================================
# CAROUSEL NEUROVENDAS MODELS
# =============================================================================

class CarouselGenerateRequest(BaseModel):
    # CAMPOS OBRIGATÓRIOS (mínimo 2)
    offer_or_theme: str  # Único campo realmente necessário
    carousel_objective: str = "autoridade"  # atracao, autoridade, prova_social, venda_direta
    # CAMPOS OPCIONAIS com defaults inteligentes
    niche: Optional[str] = None  # Será preenchido pela brand_identity ou "estética"
    target_audience: str = "cliente_final"  # iniciante, intermediario, avancado, cliente_final
    tone_of_voice: str = "profissional"  # profissional, direto, acolhedor, premium, provocativo
    audience_awareness: str = "morno"  # frio, morno, quente
    number_of_slides: int = 8

class CarouselSequenceRequest(BaseModel):
    niche: str
    campaign_theme: str
    number_of_carousels: int = 3

# =============================================================================
# MULTI-PLATFORM CAPTION MODELS
# =============================================================================

class GenerateCaptionRequest(BaseModel):
    content: Optional[str] = None  # Conteúdo base para gerar legenda
    theme: Optional[str] = None  # Alternativa: tema para gerar legenda
    platform: str  # instagram, facebook, linkedin, tiktok, whatsapp
    tone: str = "profissional"  # profissional, acolhedor, direto, premium
    
    @property
    def effective_content(self) -> str:
        """Retorna content ou theme, garantindo que há conteúdo"""
        return self.content or self.theme or ""

class GenerateAllCaptionsRequest(BaseModel):
    content: str  # Conteúdo base
    tone: str = "profissional"

# =============================================================================
# WHATSAPP SCRIPTS MODELS
# =============================================================================

class WhatsAppScriptRequest(BaseModel):
    scenario: str  # primeiro_contato, followup, agendamento, pos_atendimento, reativacao, objecao
    service: str  # Serviço/procedimento
    client_name: Optional[str] = None
    context: Optional[str] = None  # Contexto adicional

# =============================================================================
# STORY SEQUENCE MODELS
# =============================================================================

class StorySequenceRequest(BaseModel):
    theme: str  # Tema da sequência
    story_type: str  # dia_a_dia, antes_depois, bastidores, educativo, venda
    number_of_stories: int = 5  # 5-10 stories

# =============================================================================
# CONTENT TEMPLATES MODELS
# =============================================================================

class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    template_type: str  # caption, carrossel, script, stories
    platform: Optional[str] = None
    content: str
    variables: Optional[List[str]] = None

class TemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    variables: Optional[List[str]] = None

# =============================================================================
# POST SCHEDULER MODELS
# =============================================================================

class SchedulePostRequest(BaseModel):
    content: str
    platform: str  # instagram, facebook, linkedin
    scheduled_for: str  # ISO datetime
    media_url: Optional[str] = None
    hashtags: Optional[List[str]] = None

# =============================================================================
# BRAND IDENTITY MODELS (Construtor de Personalidade da Marca - Estética)
# =============================================================================

class BrandColors(BaseModel):
    primary: str = "#7C3AED"
    secondary: str = "#8B5CF6"
    accent: str = "#F59E0B"
    background: str = "#FFFFFF"

class BrandIdentityCreate(BaseModel):
    # Identidade da Marca
    brand_name: Optional[str] = None
    segment: Optional[str] = None  # estética, criomodelagem, harmonização, clínica premium
    main_specialty: Optional[str] = None  # criolipólise, corporal, facial, emagrecimento
    positioning: Optional[str] = None  # acessível, premium, autoridade técnica, acolhedora
    
    # Identidade Visual
    colors: Optional[BrandColors] = None
    preferred_font: Optional[str] = "Montserrat"
    font_style: Optional[str] = "moderna"  # moderna, clássica, minimalista, elegante
    visual_style: Optional[str] = "clean"  # clean, sofisticado, feminino, clínico, natural
    
    # Elementos Visuais
    logo_base64: Optional[str] = None
    professional_photos: Optional[List[str]] = None  # Fotos da profissional
    clinic_photos: Optional[List[str]] = None  # Fotos da clínica/procedimentos
    
    # Configuração de Aparição
    appearance_mode: Optional[str] = "sometimes"  # always, sometimes, never
    
    # Informações Adicionais
    key_phrases: Optional[List[str]] = None
    instagram_handle: Optional[str] = None
    website: Optional[str] = None
    
    # Status de configuração
    setup_completed: Optional[bool] = False

class BrandIdentityUpdate(BaseModel):
    brand_name: Optional[str] = None
    segment: Optional[str] = None
    main_specialty: Optional[str] = None
    positioning: Optional[str] = None
    colors: Optional[BrandColors] = None
    preferred_font: Optional[str] = None
    font_style: Optional[str] = None
    visual_style: Optional[str] = None
    logo_base64: Optional[str] = None
    professional_photos: Optional[List[str]] = None
    clinic_photos: Optional[List[str]] = None
    appearance_mode: Optional[str] = None
    key_phrases: Optional[List[str]] = None
    instagram_handle: Optional[str] = None
    website: Optional[str] = None
    setup_completed: Optional[bool] = None

class GenerateCampaignImageRequest(BaseModel):
    campaign_type: str  # carrossel, anuncio, post, capa, stories
    campaign_theme: str  # tema da campanha
    include_professional: bool = True  # incluir foto da profissional
    custom_prompt: Optional[str] = None

class AnalyzeBrandRequest(BaseModel):
    instagram_handle: Optional[str] = None
    bio_text: Optional[str] = None
    sample_content: Optional[str] = None

# =============================================================================
# SEO BLOG GENERATOR MODELS (Fábrica de Conteúdo SEO)
# =============================================================================

class SEOArticleGenerateRequest(BaseModel):
    keyword: str  # Keyword principal para otimização
    topic: Optional[str] = None  # Tema do artigo (opcional agora)
    tema: Optional[str] = None  # Tema alternativo (novo campo)
    article_type: str = "procedimento"  # procedimento, comparativo, mitos_verdades, antes_depois, guia_local, lista
    awareness_level: str = "consciente_problema"  # inconsciente, consciente_problema, consciente_solucao, consciente_produto
    location: Optional[str] = None  # Para SEO local (ex: "São Paulo")
    tone: str = "profissional"  # profissional, acolhedor, técnico, premium
    include_faq: bool = True
    custom_instructions: Optional[str] = None
    # Novos campos para Fábrica SEO
    objetivo: Optional[str] = None  # Objetivo do conteúdo
    dores: Optional[str] = None  # Dores que o texto resolve
    publico: Optional[str] = None  # Público-alvo
    enquadramento: Optional[str] = None  # Enquadramento clínico

class SEOArticleIdeasRequest(BaseModel):
    specialty: str  # Especialidade da clínica
    location: Optional[str] = None
    count: int = 10

class SEOArticleImproveRequest(BaseModel):
    content: str  # Conteúdo atual
    keyword: str  # Keyword alvo
    feedback: Optional[str] = None  # Feedback específico

class SEOArticleSaveRequest(BaseModel):
    title: str
    slug: str
    keyword: str
    content: str
    meta_description: Optional[str] = None
    excerpt: Optional[str] = None
    seo_score: Optional[int] = None
    article_type: Optional[str] = None
    status: str = "rascunho"  # rascunho, publicado, agendado

class SEOArticleUpdateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    meta_description: Optional[str] = None
    status: Optional[str] = None
    published_url: Optional[str] = None

# =============================================================================
# GAMIFICATION MODELS
# =============================================================================

class ClaimRewardRequest(BaseModel):
    reward_type: str  # app_review, follow_instagram, etc.
    proof_url: Optional[str] = None  # URL de prova (screenshot, link, etc.)

class ReferralCodeRequest(BaseModel):
    code: str  # Código de indicação do amigo

class DiagnosticoBioRequest(BaseModel):
    nivel: str  # Bio Invisível, Bio Estética mas Fraca, Bio Magnética
    score: int
    respostas: List[int]

# =============================================================================
# STRIPE PAYMENT MODELS
# =============================================================================

class SubscriptionCheckoutRequest(BaseModel):
    plan_id: str  # essencial, profissional, premium
    origin_url: str  # URL de origem do frontend

# Definição fixa dos planos (NUNCA aceitar valores do frontend)
# ESTRATÉGIA: Gamma como infraestrutura invisível
# Créditos calculados para margem saudável com escala
# 
# CUSTOS GAMMA (base Pro R$70/mês = 4000 créditos):
# - E-book: ~118 créditos Gamma = R$1,30
# - Slides: ~40 créditos Gamma = R$0,45
# - Site: ~60 créditos Gamma = R$0,65
# - Imagem: ~8 créditos Gamma = R$0,09
#
# Com 10 assinantes = R$7/cliente
# Com 50 assinantes = R$1,40/cliente
# 
SUBSCRIPTION_PLANS = {
    "essencial": {
        "name": "Essencial",
        "price": 57.00,
        "credits": 50,
        "currency": "brl",
        "limits": {
            "ebooks_mes": 4,
            "sites_mes": 1,
            "slides_mes": 1,
            "blogs_mes": 0
        }
    },
    "profissional": {
        "name": "Profissional", 
        "price": 107.00,
        "credits": 150,
        "currency": "brl",
        "limits": {
            "ebooks_mes": 6,
            "sites_mes": 2,
            "slides_mes": 3,
            "blogs_mes": 4
        }
    },
    "premium": {
        "name": "Premium",
        "price": 197.00,
        "credits": 350,
        "currency": "brl",
        "limits": {
            "ebooks_mes": 10,
            "sites_mes": 2,
            "slides_mes": 5,
            "blogs_mes": 10
        }
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

async def check_credits(user_id: str, required_amount: int) -> tuple[bool, int]:
    """
    Verifica se o usuário tem créditos suficientes.
    BETA: Sempre retorna True (créditos infinitos)
    """
    # BETA MODE: Créditos infinitos
    return (True, 999999)

async def consume_credits(user_id: str, amount: int, description: str, check_balance: bool = True):
    """
    Consume credits from user account.
    BETA MODE: Não consome créditos, apenas loga a operação.
    
    IMPORTANTE: Quando sair do beta, esta função DEVE:
    1. Verificar saldo antes de consumir
    2. NÃO permitir saldo negativo
    3. Retornar erro se saldo insuficiente
    """
    # BETA MODE: Não verificar nem consumir créditos
    # Apenas logar a operação para analytics
    await db.credit_logs.insert_one({
        "id": str(uuid4()),
        "user_id": user_id,
        "amount": 0,  # Não consome durante beta
        "description": f"[BETA] {description}",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # ═══════════════════════════════════════════════════════════════════
    # CÓDIGO PARA PRODUÇÃO (descomentar quando sair do beta)
    # ═══════════════════════════════════════════════════════════════════
    # 
    # if check_balance:
    #     user = await db.users.find_one({"id": user_id}, {"credits": 1})
    #     current_credits = user.get("credits", 0) if user else 0
    #     
    #     # PROTEÇÃO: NÃO permitir saldo negativo
    #     if current_credits < amount:
    #         raise HTTPException(
    #             status_code=402,  # Payment Required
    #             detail=f"Créditos insuficientes. Necessário: {amount}, Disponível: {current_credits}"
    #         )
    # 
    # # Atualizar saldo (com proteção contra negativo)
    # result = await db.users.update_one(
    #     {"id": user_id, "credits": {"$gte": amount}},  # Só atualiza se tiver saldo
    #     {"$inc": {"credits": -amount}}
    # )
    # 
    # if result.modified_count == 0:
    #     raise HTTPException(status_code=402, detail="Créditos insuficientes")
    # 
    # # Log da operação
    # await db.credit_logs.insert_one({
    #     "id": str(uuid4()),
    #     "user_id": user_id,
    #     "amount": -amount,
    #     "description": description,
    #     "created_at": datetime.now(timezone.utc).isoformat()
    # })
    # ═══════════════════════════════════════════════════════════════════

async def add_credits(user_id: str, amount: int, description: str, reward_type: str = None):
    """Add credits to user account (rewards/gamification)"""
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"credits_remaining": amount}}
    )
    # Log credit gain
    await db.credit_logs.insert_one({
        "id": str(uuid4()),
        "user_id": user_id,
        "amount": amount,
        "description": description,
        "reward_type": reward_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

# Tabela de consumo de créditos por recurso
# ESTRATÉGIA: Créditos são para uso diário (chat, posts, legendas)
# Features premium (ebook, site, slides) têm COTAS MENSAIS separadas
# Isso protege margem e educa cliente sobre valor real
CREDIT_COSTS = {
    # DIÁRIO - Uso livre dentro dos créditos
    "chat": 1,                    # LucresIA - uso frequente
    "bio_analysis": 2,            # Análise OÁSIS
    "content_generation": 2,      # Post/legenda
    "caption": 1,                 # Legenda única
    "multi_caption": 3,           # Legendas multiplataforma
    "carousel": 3,                # Carrossel único
    "carousel_sequence": 5,       # Sequência de carrosséis
    "whatsapp_script": 2,         # Script WhatsApp
    "story_sequence": 3,          # Sequência de stories
    "brand_analysis": 2,          # Análise de marca
    
    # PREMIUM - Controlado por COTAS (não só créditos)
    # Estes consomem créditos MAS também contam na cota mensal
    "ebook": 8,                   # E-book (max por plano)
    "gamma_site": 15,             # Site/Landing (max por plano)
    "gamma_slides": 10,           # Apresentação (max por plano)
    "seo_article": 5,             # Blog SEO (max por plano)
    
    # AUXILIARES SEO
    "seo_ideas": 1,               # Ideias de artigos
    "seo_improve": 2,             # Melhoria de artigo
    
    # CAMPANHAS
    "campaign_sequence": 6,       # Sequência de campanha
}

# Tabela de recompensas de gamificação
GAMIFICATION_REWARDS = {
    "app_review": {
        "credits": 20,
        "description": "Avaliar o aplicativo",
        "one_time": True
    },
    "leave_testimonial": {
        "credits": 15,
        "description": "Deixar depoimento na página",
        "one_time": True
    },
    "follow_instagram": {
        "credits": 10,
        "description": "Seguir @elevare no Instagram",
        "one_time": True
    },
    "follow_youtube": {
        "credits": 10,
        "description": "Inscrever no canal YouTube Elevare",
        "one_time": True
    },
    "share_social": {
        "credits": 5,
        "description": "Compartilhar nas redes sociais",
        "one_time": False,
        "max_per_month": 4
    },
    "referral_signup": {
        "credits": 25,
        "description": "Amigo se cadastrou com seu link",
        "one_time": False
    },
    "referral_paid": {
        "credits": 100,
        "description": "Amigo assinou plano pago",
        "one_time": False
    },
    "first_article": {
        "credits": 10,
        "description": "Criar primeiro artigo SEO",
        "one_time": True
    },
    "first_carousel": {
        "credits": 5,
        "description": "Criar primeiro carrossel",
        "one_time": True
    },
    "complete_brand": {
        "credits": 15,
        "description": "Completar identidade da marca",
        "one_time": True
    },
    "daily_login": {
        "credits": 2,
        "description": "Login diário",
        "one_time": False,
        "max_per_day": 1
    }
}

# =============================================================================
# EVENTS
# =============================================================================

@app.on_event("startup")
async def startup_db_client():
    global client, db
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    print(f"✅ NeuroVendas conectado ao MongoDB: {DB_NAME}")

@app.on_event("shutdown")
async def shutdown_db_client():
    global client
    if client:
        client.close()

# =============================================================================
# HEALTH CHECK
# =============================================================================

@app.get("/api/health")
async def health_check():
    """Health check básico com status de integrações"""
    integrations = {
        "email": {
            "configured": bool(RESEND_API_KEY),
            "from_email": RESEND_FROM_EMAIL if RESEND_API_KEY else None
        },
        "database": {
            "configured": bool(MONGO_URL),
            "connected": client is not None
        },
        "llm": {
            "configured": bool(os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY'))
        }
    }
    return {
        "status": "healthy", 
        "service": "NeuroVendas by Elevare",
        "version": "2.0.0",
        "ai": "LucresIA",
        "integrations": integrations
    }

@app.get("/api/health/detailed")
async def health_check_detailed():
    """
    Health check DETALHADO com testes reais de conexão
    Testa: MongoDB, Resend API, LLM API
    """
    results = {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "checks": {}
    }
    
    # 1. Testar MongoDB
    try:
        await db.command("ping")
        results["checks"]["mongodb"] = {"status": "ok", "message": "Conectado"}
    except Exception as e:
        results["checks"]["mongodb"] = {"status": "error", "message": str(e)}
        results["status"] = "degraded"
    
    # 2. Testar Resend API (verificar API key sem enviar email)
    if RESEND_API_KEY:
        try:
            # Fazer request à API de domínios para validar a key
            import httpx
            async with httpx.AsyncClient() as client_http:
                response = await client_http.get(
                    "https://api.resend.com/domains",
                    headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
                    timeout=10.0
                )
                if response.status_code == 200:
                    results["checks"]["resend"] = {"status": "ok", "message": "API Key válida"}
                elif response.status_code == 401:
                    results["checks"]["resend"] = {"status": "error", "message": "API Key inválida"}
                    results["status"] = "degraded"
                else:
                    results["checks"]["resend"] = {"status": "warning", "message": f"Status: {response.status_code}"}
        except Exception as e:
            results["checks"]["resend"] = {"status": "error", "message": str(e)}
            results["status"] = "degraded"
    else:
        results["checks"]["resend"] = {"status": "not_configured", "message": "RESEND_API_KEY não definida"}
        results["status"] = "degraded"
    
    # 3. Testar LLM (verificar se key existe)
    llm_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
    if llm_key:
        results["checks"]["llm"] = {
            "status": "ok", 
            "message": "Configurado",
            "provider": "emergent" if os.environ.get('EMERGENT_LLM_KEY') else "openai"
        }
    else:
        results["checks"]["llm"] = {"status": "not_configured", "message": "Nenhuma API key de LLM"}
        results["status"] = "degraded"
    
    # 4. Verificar Stripe (opcional)
    stripe_key = os.environ.get('STRIPE_API_KEY')
    if stripe_key:
        results["checks"]["stripe"] = {"status": "ok", "message": "Configurado"}
    else:
        results["checks"]["stripe"] = {"status": "not_configured", "message": "STRIPE_API_KEY não definida"}
    
    return results

@app.post("/api/health/test-email")
async def test_email_integration(current_user: dict = Depends(get_current_user)):
    """Endpoint para testar envio de email (apenas admin ou próprio usuário)"""
    if not RESEND_API_KEY:
        return {
            "success": False,
            "error": "RESEND_API_KEY não configurada",
            "configured": False
        }
    
    try:
        result = resend.Emails.send({
            "from": f"Elevare NeuroVendas <{RESEND_FROM_EMAIL}>",
            "to": [current_user["email"]],
            "subject": "✅ Teste de Email - NeuroVendas",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #7C3AED;">Email funcionando! ✅</h1>
                <p>Olá <strong>{current_user.get('name', 'Usuário')}</strong>,</p>
                <p>Este é um email de teste do sistema NeuroVendas.</p>
                <p>Se você recebeu este email, a integração com Resend está funcionando corretamente!</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 11px;">© 2025 Elevare NeuroVendas</p>
            </div>
            """
        })
        return {
            "success": True,
            "message": f"Email de teste enviado para {current_user['email']}",
            "resend_id": result.get("id") if isinstance(result, dict) else str(result)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "configured": True
        }

# =============================================================================
# FUNIS PÚBLICOS (SEM AUTENTICAÇÃO) - CRÍTICO PARA CONVERSÃO
# =============================================================================

class DiagnosticoInput(BaseModel):
    respostas: Dict[str, str]

class AnalisePresencaInput(BaseModel):
    instagram_url: Optional[str] = None
    site_url: Optional[str] = None

class CadastroGratuitoInput(BaseModel):
    nome: str
    email: EmailStr
    whatsapp: str

@app.post("/api/public/diagnostico/gerar")
async def gerar_diagnostico_publico(data: DiagnosticoInput):
    """
    FUNIL A - Diagnóstico Gratuito (SEM LOGIN)
    Gera diagnóstico baseado nas respostas do quiz
    """
    try:
        respostas = data.respostas
        
        # Lógica de análise baseada nas respostas
        faturamento = respostas.get('faturamento', 'ate_5k')
        clientes = respostas.get('clientes_mes', 'ate_10')
        marketing = respostas.get('marketing', 'nenhum')
        conversao = respostas.get('conversao', 'leads')
        
        # Determinar perfil
        if faturamento in ['acima_30k'] and clientes in ['30_50', 'acima_50']:
            perfil = "Profissional Consolidada"
            nivel = "Avançado"
        elif faturamento in ['15k_30k', '5k_15k'] and marketing in ['ads', 'misto']:
            perfil = "Profissional em Crescimento"
            nivel = "Intermediário"
        else:
            perfil = "Profissional Iniciante"
            nivel = "Iniciante"
        
        # Pontos fortes baseados nas respostas
        pontos_fortes = []
        if marketing in ['ads', 'misto']:
            pontos_fortes.append("Você já investe em marketing digital, o que mostra visão de crescimento")
        if faturamento in ['15k_30k', 'acima_30k']:
            pontos_fortes.append("Seu faturamento indica que você entrega valor percebido aos clientes")
        if clientes in ['30_50', 'acima_50']:
            pontos_fortes.append("Volume de clientes mostra capacidade de atração")
        if not pontos_fortes:
            pontos_fortes = [
                "Você está buscando evolução profissional",
                "Tem consciência de que precisa melhorar sua presença digital",
                "Está aberta a aprender novas estratégias de vendas"
            ]
        
        # Oportunidades
        oportunidades = []
        if conversao == 'leads':
            oportunidades.append("Melhorar a geração de leads qualificados através de conteúdo estratégico")
        if conversao == 'fechar':
            oportunidades.append("Desenvolver scripts de vendas e apresentações que convertem")
        if conversao == 'fidelizar':
            oportunidades.append("Criar programa de relacionamento e retenção de clientes")
        if conversao == 'preco':
            oportunidades.append("Comunicar valor premium através de conteúdo educativo")
        if marketing == 'nenhum':
            oportunidades.append("Implementar estratégia de marketing digital estruturada")
        if marketing == 'organico':
            oportunidades.append("Considerar tráfego pago para escalar resultados")
        
        # Estratégias personalizadas
        estrategias = [
            "Criar conteúdo educativo que posicione você como autoridade",
            "Desenvolver apresentações de vendas com gatilhos de Neurovendas",
            "Implementar funil de captação com lead magnets",
            "Usar storytelling para conectar com clientes de alto ticket"
        ]
        
        if conversao == 'preco':
            estrategias.insert(0, "Criar e-books e apresentações que justifiquem investimento premium")
        
        resultado = {
            "perfil": perfil,
            "nivel_maturidade": nivel,
            "pontos_fortes": pontos_fortes[:3],
            "oportunidades": oportunidades[:3],
            "estrategias": estrategias[:4]
        }
        
        return {"success": True, "resultado": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/public/analise-presenca/gerar")
async def gerar_analise_presenca_publica(data: AnalisePresencaInput):
    """
    FUNIL B - Análise de Presença Digital Gratuita (SEM LOGIN)
    Analisa Instagram e/ou Site
    """
    try:
        instagram_url = data.instagram_url
        site_url = data.site_url
        
        if not instagram_url and not site_url:
            raise HTTPException(status_code=400, detail="Forneça pelo menos um link (Instagram ou Site)")
        
        resultado = {
            "score_geral": 0,
            "classificacao": ""
        }
        
        scores = []
        
        # Análise de Instagram (simulada - pode ser expandida com IA)
        if instagram_url:
            # Scores simulados (em produção, usar GPT-4o Vision)
            import random
            score_visual = round(random.uniform(5.5, 8.5), 1)
            score_conteudo = round(random.uniform(5.0, 8.0), 1)
            score_conversao = round(random.uniform(4.5, 7.5), 1)
            
            resultado["instagram"] = {
                "score_visual": score_visual,
                "score_conteudo": score_conteudo,
                "score_conversao": score_conversao,
                "pontos_fortes": [
                    "Perfil profissional configurado",
                    "Bio com informações relevantes",
                    "Feed com identidade visual"
                ],
                "melhorias": [
                    "Adicionar chamadas para ação mais claras",
                    "Criar destaques organizados por serviço",
                    "Implementar estratégia de Stories diária"
                ]
            }
            scores.extend([score_visual, score_conteudo, score_conversao])
        
        # Análise de Site (simulada - pode ser expandida com IA)
        if site_url:
            import random
            score_design = round(random.uniform(5.0, 8.5), 1)
            score_conversao_site = round(random.uniform(4.5, 7.5), 1)
            score_seo = round(random.uniform(4.0, 7.0), 1)
            
            resultado["site"] = {
                "score_design": score_design,
                "score_conversao": score_conversao_site,
                "score_seo": score_seo,
                "pontos_fortes": [
                    "Site responsivo e funcional",
                    "Informações de contato visíveis",
                    "Design profissional"
                ],
                "melhorias": [
                    "Melhorar velocidade de carregamento",
                    "Adicionar mais provas sociais (depoimentos)",
                    "Otimizar textos para SEO local"
                ]
            }
            scores.extend([score_design, score_conversao_site, score_seo])
        
        # Calcular score geral
        if scores:
            resultado["score_geral"] = round(sum(scores) / len(scores), 1)
            
            if resultado["score_geral"] >= 7.5:
                resultado["classificacao"] = "Excelente"
            elif resultado["score_geral"] >= 6.0:
                resultado["classificacao"] = "Bom"
            elif resultado["score_geral"] >= 4.5:
                resultado["classificacao"] = "Regular"
            else:
                resultado["classificacao"] = "Precisa Melhorar"
        
        return {"success": True, "resultado": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cadastro-gratuito")
async def cadastro_gratuito(data: CadastroGratuitoInput):
    """
    ÚNICO PONTO DE CADASTRO DO SISTEMA
    Cria conta + libera 100 créditos mensais
    """
    try:
        # Verificar se email já existe
        existing = await db.users.find_one({"email": data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Este email já está cadastrado. Faça login.")
        
        # Criar usuário com 100 créditos
        user_id = str(uuid4())
        now = datetime.now(timezone.utc)
        
        user_doc = {
            "id": user_id,
            "email": data.email,
            "name": data.nome,
            "whatsapp": data.whatsapp,
            "password": pwd_context.hash("temp_" + str(uuid4())[:8]),  # Senha temporária
            "role": "user",
            "credits": 100,
            "credits_remaining": 100,
            "monthly_credits": 100,
            "credits_renewed_at": now,
            "xp": 0,
            "level": 1,
            "achievements": [],
            "streak_days": 0,
            "plan": "free",
            "origem_cadastro": "funil_publico",
            "onboarding_completed": False,
            "diagnosis_completed": False,
            "created_at": now,
            "updated_at": now,
            "terms_accepted": True,
            "terms_accepted_at": now
        }
        
        await db.users.insert_one(user_doc)
        
        # Gerar token JWT
        token_data = {
            "sub": user_id,
            "email": data.email,
            "exp": datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        }
        token = jwt.encode(token_data, JWT_SECRET, algorithm=ALGORITHM)
        
        # Enviar email de boas-vindas (não-bloqueante)
        try:
            if RESEND_API_KEY:
                resend.Emails.send({
                    "from": f"Elevare NeuroVendas <{RESEND_FROM_EMAIL}>",
                    "to": [data.email],
                    "subject": "🎉 Bem-vinda ao Elevare NeuroVendas!",
                    "html": f"""
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #7c3aed;">Parabéns, {data.nome.split()[0]}! 🎉</h1>
                        <p>Sua conta foi criada com sucesso no <strong>Elevare NeuroVendas</strong>.</p>
                        <div style="background: linear-gradient(to right, #7c3aed, #db2777); padding: 20px; border-radius: 10px; color: white; text-align: center;">
                            <h2 style="margin: 0;">100 Créditos Grátis</h2>
                            <p style="margin: 10px 0 0 0;">Liberados para você usar!</p>
                        </div>
                        <p style="margin-top: 20px;">Agora você pode:</p>
                        <ul>
                            <li>✓ Criar posts e stories com IA</li>
                            <li>✓ Gerar apresentações de vendas premium</li>
                            <li>✓ Criar e-books profissionais</li>
                            <li>✓ Analisar sua presença digital</li>
                        </ul>
                        <p>Acesse a plataforma e comece a transformar seu negócio!</p>
                        <p style="color: #666; font-size: 12px;">© 2026 Elevare NeuroVendas</p>
                    </div>
                    """
                })
        except Exception as email_error:
            print(f"Erro ao enviar email: {email_error}")
            # Não bloqueia o cadastro
        
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": data.email,
                "name": data.nome,
                "credits": 100,
                "plan": "free"
            },
            "message": "Conta criada com sucesso! 100 créditos liberados."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# AUTH ROUTES
# =============================================================================

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    user = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": get_password_hash(user_data.password),
        "role": "user",
        "plan": "free",
        "credits_remaining": 100,
        "monthly_credits_limit": 100,
        "onboarding_completed": False,
        "onboarding_data": {},
        "diagnosis_completed": False,
        "xp": 0,
        "level": 1,
        "badges": [],
        "created_at": now,
        "updated_at": now,
    }
    
    await db.users.insert_one(user)
    
    token = create_access_token({"user_id": user_id, "email": user_data.email})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": user_data.email,
            "name": user_data.name,
            "role": "user",
            "plan": "free",
            "credits_remaining": 100,
            "created_at": now,
            "onboarding_completed": False,
            "onboarding_data": {},
            "diagnosis_completed": False
        }
    }

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou senha inválidos")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
    )
    
    token = create_access_token({"user_id": user["id"], "email": user["email"]})
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "user"),
            "plan": user.get("plan", "free"),
            "credits_remaining": user.get("credits_remaining", 100),
            "created_at": user.get("created_at", ""),
            "onboarding_completed": user.get("onboarding_completed", False),
            "onboarding_data": user.get("onboarding_data", {}),
            "diagnosis_completed": user.get("diagnosis_completed", False)
        }
    }

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user["id"],
            "email": current_user["email"],
            "name": current_user["name"],
            "role": current_user.get("role", "user"),
            "plan": current_user.get("plan", "free"),
            "credits_remaining": current_user.get("credits_remaining", 100),
            "created_at": current_user.get("created_at", ""),
            "onboarding_completed": current_user.get("onboarding_completed", False),
            "onboarding_data": current_user.get("onboarding_data", {}),
            "diagnosis_completed": current_user.get("diagnosis_completed", False),
            "xp": current_user.get("xp", 0),
            "level": current_user.get("level", 1),
            "badges": current_user.get("badges", [])
        }
    }

# =============================================================================
# PASSWORD RECOVERY ROUTES
# =============================================================================

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

@app.post("/api/auth/forgot-password")
async def forgot_password(data: PasswordResetRequest):
    """Solicita recuperação de senha"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0, "id": 1, "name": 1, "email": 1})
    
    # Sempre retorna sucesso (segurança - não revelar se email existe)
    if not user:
        return {"success": True, "message": "Se o email existir, você receberá um link de recuperação."}
    
    # Gerar token de reset
    reset_token = str(uuid4())
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "id": str(uuid4()),
        "user_id": user["id"],
        "token": reset_token,
        "expires_at": expires.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Enviar email com Resend
    try:
        if RESEND_API_KEY:
            reset_link = f"https://aivendas-1.preview.emergentagent.com/reset-password?token={reset_token}"
            resend.Emails.send({
                "from": f"Elevare NeuroVendas <{RESEND_FROM_EMAIL}>",
                "to": [user["email"]],
                "subject": "Recupere sua senha - NeuroVendas by Elevare",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #7C3AED;">NeuroVendas by Elevare</h1>
                    <p>Olá <strong>{user.get('name', 'Usuário')}</strong>,</p>
                    <p>Você solicitou a recuperação de senha. Clique no botão abaixo para criar uma nova senha:</p>
                    <a href="{reset_link}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #1E3A5F); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
                        Redefinir Senha
                    </a>
                    <p style="color: #666; font-size: 14px;">Este link expira em 1 hora.</p>
                    <p style="color: #666; font-size: 12px;">Se você não solicitou esta recuperação, ignore este email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">© 2025 NeuroVendas by Elevare</p>
                </div>
                """
            })
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
    
    return {
        "success": True,
        "message": "Se o email existir, você receberá um link de recuperação."
    }

@app.post("/api/auth/reset-password")
async def reset_password(data: PasswordResetConfirm):
    """Reseta a senha com token válido"""
    reset_request = await db.password_resets.find_one({
        "token": data.token,
        "used": False
    }, {"_id": 0})
    
    if not reset_request:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
    
    # Verificar expiração
    expires = datetime.fromisoformat(reset_request["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires:
        raise HTTPException(status_code=400, detail="Token expirado")
    
    # Atualizar senha
    new_hash = get_password_hash(data.new_password)
    await db.users.update_one(
        {"id": reset_request["user_id"]},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Marcar token como usado
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    return {"success": True, "message": "Senha alterada com sucesso"}

# =============================================================================
# WAITLIST (Early Access)
# =============================================================================

class WaitlistRequest(BaseModel):
    email: EmailStr
    name: str
    specialty: Optional[str] = None

@app.post("/api/waitlist")
async def join_waitlist(data: WaitlistRequest):
    """Adiciona usuário à lista de espera"""
    # Verificar se já está na lista
    existing = await db.waitlist.find_one({"email": data.email}, {"_id": 0})
    if existing:
        return {
            "success": True,
            "message": "Você já está na lista!",
            "position": existing.get("position", 100)
        }
    
    # Contar posição na fila
    count = await db.waitlist.count_documents({})
    position = count + 1
    
    # Salvar na lista
    await db.waitlist.insert_one({
        "id": str(uuid4()),
        "email": data.email,
        "name": data.name,
        "specialty": data.specialty,
        "position": position,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "invited": False
    })
    
    # Enviar email de confirmação
    try:
        if RESEND_API_KEY:
            resend.Emails.send({
                "from": f"Elevare NeuroVendas <{RESEND_FROM_EMAIL}>",
                "to": [data.email],
                "subject": "Você está na lista VIP! - NeuroVendas by Elevare",
                "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #7C3AED;">Você está na lista! 🎉</h1>
                    <p>Olá <strong>{data.name}</strong>,</p>
                    <p>Você é a pessoa <strong>#{position}</strong> na nossa lista VIP de acesso antecipado ao NeuroVendas!</p>
                    <div style="background: linear-gradient(135deg, #7C3AED, #1E3A5F); color: white; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        <h3 style="margin: 0 0 10px 0;">Seus benefícios exclusivos:</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li>50% de desconto no lançamento</li>
                            <li>+500 créditos de bônus</li>
                            <li>Acesso ao grupo VIP</li>
                        </ul>
                    </div>
                    <p>Fique de olho no seu email - avisaremos quando sua vez chegar!</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 11px;">© 2025 NeuroVendas by Elevare</p>
                </div>
                """
            })
    except Exception as e:
        print(f"Erro ao enviar email de waitlist: {e}")
    
    return {
        "success": True,
        "message": "Você está na lista!",
        "position": position
    }

@app.get("/api/waitlist/count")
async def get_waitlist_count():
    """Retorna o número de pessoas na lista de espera"""
    count = await db.waitlist.count_documents({})
    return {"success": True, "count": count}

# =============================================================================
# LGPD & TERMS ROUTES
# =============================================================================

@app.get("/api/legal/terms")
async def get_terms():
    """Retorna os termos de uso"""
    return {
        "success": True,
        "terms": {
            "title": "Termos de Uso - NeuroVendas by Elevare",
            "version": "1.0",
            "last_updated": "2025-01-01",
            "content": """
## 1. Aceitação dos Termos

Ao acessar e usar o NeuroVendas by Elevare, você concorda com estes termos de uso.

## 2. Descrição do Serviço

O NeuroVendas é uma plataforma de criação de conteúdo com inteligência artificial voltada para profissionais da estética.

## 3. Uso do Serviço

- Você é responsável por manter a confidencialidade de sua conta
- O uso é pessoal e intransferível
- É proibido usar o serviço para fins ilegais ou antiéticos

## 4. Propriedade Intelectual

- Os conteúdos gerados pela IA são de sua propriedade
- A plataforma e seus recursos são propriedade da Elevare

## 5. Garantia de 7 Dias

Oferecemos garantia incondicional de 7 dias em todos os planos pagos. Se não estiver satisfeito, devolvemos 100% do valor.

## 6. Cancelamento

Você pode cancelar sua assinatura a qualquer momento. O acesso continua até o fim do período pago.

## 7. Limitação de Responsabilidade

O NeuroVendas não se responsabiliza por resultados comerciais obtidos com os conteúdos gerados.

## 8. Alterações nos Termos

Podemos atualizar estes termos. Você será notificado sobre mudanças significativas.
"""
        }
    }

@app.get("/api/legal/privacy")
async def get_privacy_policy():
    """Retorna a política de privacidade (LGPD)"""
    return {
        "success": True,
        "privacy": {
            "title": "Política de Privacidade - NeuroVendas by Elevare",
            "version": "1.0",
            "last_updated": "2025-01-01",
            "content": """
## 1. Dados Coletados

Coletamos os seguintes dados:
- Nome e email (cadastro)
- Dados de uso da plataforma
- Conteúdos gerados (para histórico)

## 2. Uso dos Dados

Seus dados são usados para:
- Fornecer o serviço
- Melhorar a experiência
- Comunicações sobre o produto
- Suporte ao cliente

## 3. Compartilhamento

**NÃO vendemos seus dados.** Compartilhamos apenas com:
- Processadores de pagamento (Stripe)
- Serviços de IA (OpenAI) - apenas prompts, não dados pessoais

## 4. Segurança

- Dados criptografados em trânsito e repouso
- Senhas com hash bcrypt
- Tokens JWT seguros

## 5. Seus Direitos (LGPD)

Você tem direito a:
- Acessar seus dados
- Corrigir dados incorretos
- Excluir seus dados
- Portar seus dados
- Revogar consentimento

## 6. Retenção de Dados

Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão, removemos em até 30 dias.

## 7. Cookies

Usamos cookies essenciais para autenticação. Não usamos cookies de rastreamento de terceiros.

## 8. Contato DPO

Para questões de privacidade: privacidade@elevare.com.br
"""
        }
    }

@app.post("/api/legal/accept-terms")
async def accept_terms(current_user: dict = Depends(get_current_user)):
    """Registra aceitação dos termos pelo usuário"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "terms_accepted": True,
                "terms_accepted_at": datetime.now(timezone.utc).isoformat(),
                "terms_version": "1.0"
            }
        }
    )
    return {"success": True, "message": "Termos aceitos com sucesso"}

@app.delete("/api/legal/delete-account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Exclui conta e dados do usuário (LGPD)"""
    user_id = current_user["id"]
    
    # Anonimizar dados em vez de deletar completamente (para integridade referencial)
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "email": f"deleted_{user_id}@deleted.local",
                "name": "Usuário Excluído",
                "password_hash": "",
                "deleted": True,
                "deleted_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"success": True, "message": "Conta excluída com sucesso"}

@app.post("/api/onboarding/save")
async def save_onboarding(data: OnboardingData, current_user: dict = Depends(get_current_user)):
    """Save onboarding data and mark as completed"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "onboarding_completed": True,
                "onboarding_data": data.dict(),
                "xp": current_user.get("xp", 0) + 20,  # +20 XP for completing onboarding
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    return {"success": True, "message": "Onboarding completo! +20 XP", "xp_earned": 20}

@app.get("/api/onboarding/status")
async def get_onboarding_status(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "completed": current_user.get("onboarding_completed", False),
        "data": current_user.get("onboarding_data", {})
    }

# =============================================================================
# DIAGNOSIS PREMIUM ROUTES
# =============================================================================

class DiagnosisSaveRequest(BaseModel):
    score_bio: int
    score_consciencia: int
    score_financeiro: int
    nivel_bio: str
    nivel_consciencia: str
    nivel_financeiro: str
    nivel_geral: str
    score_total: int

@app.post("/api/diagnosis/complete")
async def complete_diagnosis(data: DiagnosisSaveRequest, current_user: dict = Depends(get_current_user)):
    """Marca o diagnóstico premium como completo e salva resultados"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "diagnosis_completed": True,
                "diagnosis_data": data.dict(),
                "xp": current_user.get("xp", 0) + 30,  # +30 XP for completing diagnosis
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Salvar no histórico de diagnósticos
    await db.diagnosticos_premium.insert_one({
        "id": str(uuid4()),
        "user_id": current_user["id"],
        "score_bio": data.score_bio,
        "score_consciencia": data.score_consciencia,
        "score_financeiro": data.score_financeiro,
        "nivel_bio": data.nivel_bio,
        "nivel_consciencia": data.nivel_consciencia,
        "nivel_financeiro": data.nivel_financeiro,
        "nivel_geral": data.nivel_geral,
        "score_total": data.score_total,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Diagnóstico Premium completo! +30 XP", "xp_earned": 30}

@app.post("/api/diagnosis/skip")
async def skip_diagnosis(current_user: dict = Depends(get_current_user)):
    """Permite que o usuário pule o diagnóstico no onboarding"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "diagnosis_completed": True,  # Marca como completo para não mostrar novamente
                "diagnosis_skipped": True,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    return {"success": True, "message": "Diagnóstico pulado. Você pode fazer depois no menu."}

@app.get("/api/diagnosis/status")
async def get_diagnosis_status(current_user: dict = Depends(get_current_user)):
    """Retorna status e dados do diagnóstico"""
    return {
        "success": True,
        "completed": current_user.get("diagnosis_completed", False),
        "skipped": current_user.get("diagnosis_skipped", False),
        "data": current_user.get("diagnosis_data", {})
    }


# =============================================================================
# LUCRESIA AI ROUTES
# =============================================================================

@app.post("/api/ai/chat")
async def chat_with_lucresia(data: ChatMessageRequest, current_user: dict = Depends(get_current_user)):
    """Chat with LucresIA - the AI assistant with brand identity context"""
    session_id = data.session_id or f"user_{current_user['id']}_{uuid4()}"
    
    # Get user context from onboarding
    user_context = current_user.get("onboarding_data", {})
    user_context["name"] = current_user["name"]
    
    # Get brand identity for personalized responses
    brand_identity = await db.brand_identity.find_one(
        {"user_id": current_user["id"], "setup_completed": True},
        {"_id": 0}
    )
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(data.message)
        
        # Save chat history
        await db.chat_history.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "session_id": session_id,
            "message": data.message,
            "response": response,
            "brand_context_used": brand_identity is not None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume 1 credit per message
        await consume_credits(current_user["id"], 1, "Chat com LucresIA")
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id,
            "brand_context_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar mensagem: {str(e)}")

@app.post("/api/ai/analyze-bio")
async def analyze_bio(data: BioAnalyzeRequest, current_user: dict = Depends(get_current_user)):
    """Analyze Instagram bio using OÁSIS method"""
    
    # VERIFICAR CRÉDITOS ANTES DE PROCESSAR
    credits_required = 3
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    session_id = f"bio_analysis_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        result = await lucresia.analyze_bio(data.instagramHandle, data.bioText)
        
        # Save analysis
        await db.bio_analyses.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "instagram_handle": data.instagramHandle,
            "result": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume credits (já verificado acima)
        await consume_credits(current_user["id"], credits_required, f"Análise de bio: @{data.instagramHandle}", check_balance=False)
        
        return {"success": True, "result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

@app.post("/api/ai/diagnostico-presenca")
async def diagnostico_presenca_digital(data: DiagnosticoPresencaRequest, current_user: dict = Depends(get_current_user)):
    """
    Diagnóstico de Presença Digital - Análise integrada Instagram + Link da Bio
    Análise genuína baseada APENAS nos dados fornecidos, sem invenções.
    """
    # VERIFICAR CRÉDITOS
    credits_required = 3
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    try:
        # Construir prompt rigoroso para análise genuína
        prompt = f"""Você é um analista de presença digital. Analise APENAS os dados fornecidos abaixo.

REGRA ABSOLUTA: Não invente, não suponha, não complete informações. Se algo não foi informado, marque como "Não identificado".

═══════════════════════════════════════
DADOS DO INSTAGRAM
═══════════════════════════════════════
@: {data.instagramHandle}
Nicho: {data.nicho}
Bio: {data.bioText}
Destaques: {data.destaques or "Não informado"}
Tipo de conteúdo: {data.tipoConteudo or "Não informado"}
CTA da bio: {data.ctaBio or "Não informado"}

═══════════════════════════════════════
DADOS DO LINK DA BIO
═══════════════════════════════════════
URL: {data.linkUrl}
Tipo: {data.tipoLink}
Título: {data.tituloLink}
Subtítulo: {data.subtituloLink or "Não informado"}
Oferta: {data.ofertaLink or "Não informada"}
CTA: {data.ctaLink}
Objetivo: {data.objetivoLink}

═══════════════════════════════════════
ANÁLISE REQUERIDA
═══════════════════════════════════════

Retorne um JSON com esta estrutura EXATA:

{{
  "coerencia": {{
    "status": "alinhado" ou "parcial" ou "quebrado",
    "analise": "Avaliação objetiva se a promessa da bio continua no link, se há quebra de expectativa, se o usuário entende que está no lugar certo. Máximo 2 frases."
  }},
  "clareza": {{
    "quem": "Quem é a profissional? (extraído da bio/link ou 'Não identificado')",
    "oque": "O que ela faz? (extraído da bio/link ou 'Não identificado')",
    "paraquem": "Para quem? (extraído da bio/link ou 'Não identificado')",
    "proximopasso": "Qual o próximo passo claro? (extraído dos CTAs ou 'Não identificado')",
    "pontoQuebra": "Se não está claro em 5 segundos, onde quebra? (null se está claro)"
  }},
  "autoridade": {{
    "percepcao": "especialista" ou "generico" ou "amador" ou "promocional",
    "justificativa": "Por que transmite essa percepção? Baseado APENAS nos dados. 1 frase."
  }},
  "conversao": {{
    "ctaBioAnalise": "Análise do CTA da bio em 1 frase",
    "ctaLinkAnalise": "Análise do CTA do link em 1 frase",
    "coerenciaCtas": "Os CTAs se complementam ou se contradizem? 1 frase",
    "friccoes": ["Lista de fricções óbvias identificadas, como CTA vago, excesso de opções, etc"]
  }},
  "riscos": [
    {{
      "risco": "Nome do risco (ex: Perda de leads)",
      "impacto": "Impacto prático em 1 frase"
    }}
  ],
  "ajustesPrioritarios": [
    "Ajuste 1 de alto impacto focado em clareza/alinhamento",
    "Ajuste 2 de alto impacto focado em clareza/alinhamento",
    "Ajuste 3 de alto impacto focado em clareza/alinhamento"
  ]
}}

IMPORTANTE:
- Máximo 3 riscos
- Máximo 3 ajustes
- Não reescreva textos, apenas aponte o que ajustar
- Não sugira estética visual
- Seja direto e objetivo"""

        # Chamar IA usando LucresIA (padrão do sistema)
        session_id = f"presenca_{current_user['id']}_{uuid4()}"
        lucresia = LucresIA(session_id=session_id)
        response = await lucresia.send_message(prompt)
        
        # Parsear resposta JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise Exception("Resposta da IA não contém JSON válido")
        
        # Salvar análise
        await db.presenca_analyses.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "instagram_handle": data.instagramHandle,
            "link_url": data.linkUrl,
            "input_data": data.dict(),
            "result": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir créditos
        await consume_credits(current_user["id"], credits_required, f"Diagnóstico presença: @{data.instagramHandle}", check_balance=False)
        
        return {"success": True, "result": result}
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar resposta da IA: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

@app.post("/api/ai/diagnostico-presenca-simples")
async def diagnostico_presenca_simples(data: DiagnosticoPresencaSimplesRequest, current_user: dict = Depends(get_current_user)):
    """
    Diagnóstico de Presença Digital SIMPLIFICADO
    Apenas 2 inputs: @ do Instagram + Link da Bio
    A IA faz a análise completa automaticamente
    """
    # VERIFICAR CRÉDITOS
    credits_required = 3
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    try:
        prompt = f"""Você é um analista de presença digital especializado em clínicas de estética.

DADOS FORNECIDOS:
- Instagram: @{data.instagramHandle}
- Link da Bio: {data.linkBio}

SUA TAREFA:
Analise a COERÊNCIA entre o perfil do Instagram e a página de destino do link.
Baseie sua análise APENAS no que pode ser inferido dos dados fornecidos.

IMPORTANTE:
- Se não conseguir acessar os dados reais, faça uma análise baseada em padrões comuns
- Seja específico e prático nas recomendações
- Foque em conversão e clareza

Retorne um JSON EXATO nesta estrutura:

{{
  "coerencia": {{
    "status": "alinhado" ou "parcial" ou "quebrado",
    "analise": "Avaliação em 1-2 frases da coerência entre Instagram e Link"
  }},
  "clareza": {{
    "quem": "Quem é o profissional? (baseado no @)",
    "oque": "O que oferece?",
    "paraquem": "Para quem é?",
    "proximopasso": "Qual ação o visitante deve tomar?",
    "pontoQuebra": "Onde a comunicação pode falhar? (ou null se OK)"
  }},
  "autoridade": {{
    "percepcao": "especialista" ou "generico" ou "amador" ou "promocional",
    "justificativa": "Por que essa percepção? 1 frase."
  }},
  "conversao": {{
    "ctaBioAnalise": "Análise do possível CTA do Instagram",
    "ctaLinkAnalise": "Análise do CTA esperado no link",
    "coerenciaCtas": "Os CTAs se complementam?",
    "friccoes": ["Lista de possíveis fricções no funil"]
  }},
  "riscos": [
    {{
      "risco": "Nome do risco",
      "impacto": "Impacto prático"
    }}
  ],
  "ajustesPrioritarios": [
    "Ajuste 1 de alto impacto",
    "Ajuste 2 de alto impacto",
    "Ajuste 3 de alto impacto"
  ]
}}

Responda APENAS com o JSON, sem explicações adicionais."""

        # Chamar IA usando LucresIA
        session_id = f"presenca_simples_{current_user['id']}_{uuid4()}"
        lucresia = LucresIA(session_id=session_id)
        response = await lucresia.send_message(prompt)
        
        # Parsear resposta JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise Exception("Resposta da IA não contém JSON válido")
        
        # Salvar análise
        await db.presenca_analyses.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "instagram_handle": data.instagramHandle,
            "link_bio": data.linkBio,
            "result": result,
            "simplified": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir créditos
        await consume_credits(current_user["id"], credits_required, f"Diagnóstico presença simples: @{data.instagramHandle}", check_balance=False)
        
        return {"success": True, "result": result}
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar resposta da IA: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

@app.post("/api/ai/diagnostico-presenca-visual")
async def diagnostico_presenca_visual(
    instagramHandle: str = Form(...),
    linkBio: str = Form(...),
    instagramImage: UploadFile = File(...),
    paginaImage: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Diagnóstico de Presença Digital com ANÁLISE VISUAL COMPLETA
    Recebe prints do Instagram e da página para análise estratégica com GPT-4o Vision
    """
    # VERIFICAR CRÉDITOS
    credits_required = 5
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    try:
        # Ler e converter imagens para base64
        instagram_bytes = await instagramImage.read()
        pagina_bytes = await paginaImage.read()
        
        instagram_base64 = base64.b64encode(instagram_bytes).decode('utf-8')
        pagina_base64 = base64.b64encode(pagina_bytes).decode('utf-8')
        
        # Detectar tipo de imagem
        instagram_type = instagramImage.content_type or "image/jpeg"
        pagina_type = paginaImage.content_type or "image/jpeg"
        
        # PROMPT MASTER - ANÁLISE VISUAL ESTRATÉGICA COMPLETA
        prompt_master = f"""Você é um especialista premium em análise de presença digital, marketing para estética avançada e conversão de alto valor.

═══════════════════════════════════════════════════════════════════════════════════
DADOS DE ENTRADA
═══════════════════════════════════════════════════════════════════════════════════

PERFIL INSTAGRAM:
- Handle: @{instagramHandle}
- IMAGEM 1: Print do perfil Instagram (ANALISE VISUALMENTE TODOS OS ELEMENTOS)

PÁGINA DE DESTINO:
- Link: {linkBio}
- IMAGEM 2: Print da página de destino (ANALISE VISUALMENTE TODOS OS ELEMENTOS)

═══════════════════════════════════════════════════════════════════════════════════
INSTRUÇÕES DE ANÁLISE VISUAL DETALHADA
═══════════════════════════════════════════════════════════════════════════════════

📱 ANÁLISE DO INSTAGRAM (baseado no print):
1. Bio: Leia o texto da bio, identifique nome, especialidade, proposta de valor
2. Foto de perfil: Avalie profissionalismo e coerência
3. Destaques: Identifique os destaques fixados e seus títulos/ícones
4. Feed: Analise estilo visual, cores dominantes, qualidade das fotos
5. Números: Identifique seguidores, posts (se visíveis)
6. Prova social: Busque menções a números, certificações, transformações
7. CTA: Avalie se há chamada clara para ação

🌐 ANÁLISE DA PÁGINA (baseado no print):
1. Título principal: Leia e transcreva o título exato
2. Subtítulo: Leia e transcreva se houver
3. CTA principal: Identifique o botão/link de ação principal
4. Layout: Avalie organização visual e hierarquia
5. Prova social: Busque depoimentos, avaliações, números de clientes
6. Cores: Identifique paleta de cores dominante
7. Serviços/Preços: Identifique se estão visíveis

🎨 ANÁLISE DE COERÊNCIA VISUAL:
- Compare cores entre Instagram e página
- Compare tom de comunicação
- Compare qualidade visual e profissionalismo
- Identifique quebras de expectativa entre canais

🏆 ANÁLISE DE AUTORIDADE:
- Especialização clara ou genérica?
- Prova social visível e quantificável?
- Elementos de credibilidade (certificações, anos de experiência)?
- Percepção de preço (popular, médio ou premium)?

═══════════════════════════════════════════════════════════════════════════════════
FORMATO DE RESPOSTA (JSON OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════════════════════

Retorne EXATAMENTE este JSON (sem texto antes ou depois):

{{
  "resumoExecutivo": {{
    "notaGeral": 70,
    "pontuacoes": {{
      "autoridadePercebida": 75,
      "coerenciaVisual": 70,
      "provaSocial": 65,
      "conversaoCTAs": 60,
      "presencaDigitalGlobal": 72
    }},
    "status": "BOM"
  }},
  "instagramAnalise": {{
    "bioIdentificada": "Texto exato da bio lido na imagem",
    "seguidores": "Número identificado ou 'Não visível'",
    "posts": "Número identificado ou 'Não visível'",
    "destaqueIdentificados": ["Destaque 1", "Destaque 2"],
    "paletaCores": ["#cor1", "#cor2"],
    "pontosFortes": [
      {{"item": "Ponto forte específico", "impacto": "ALTO"}},
      {{"item": "Outro ponto forte", "impacto": "MÉDIO"}}
    ],
    "pontosFracos": [
      {{"item": "Ponto fraco específico", "impacto": "ALTO", "solucao": "Solução prática"}},
      {{"item": "Outro ponto fraco", "impacto": "MÉDIO", "solucao": "Solução prática"}}
    ],
    "sugestoesCopy": {{
      "bioSugerida": "Sugestão de bio otimizada com CTA",
      "ctaSugerido": "Exemplo de CTA para link"
    }}
  }},
  "paginaAnalise": {{
    "tituloIdentificado": "Título exato lido na imagem",
    "subtituloIdentificado": "Subtítulo ou 'Não identificado'",
    "ctaIdentificado": "Texto do botão/CTA principal",
    "servicosVisiveis": ["Serviço 1", "Serviço 2"],
    "precosVisiveis": ["R$ X", "R$ Y"],
    "provasSociaisVisiveis": ["Depoimento", "Avaliação", "Número"],
    "pontosFortes": [
      {{"item": "Ponto forte específico", "impacto": "ALTO"}},
      {{"item": "Outro ponto forte", "impacto": "MÉDIO"}}
    ],
    "pontosFracos": [
      {{"item": "Ponto fraco específico", "impacto": "ALTO", "solucao": "Solução prática"}},
      {{"item": "Outro ponto fraco", "impacto": "MÉDIO", "solucao": "Solução prática"}}
    ],
    "sugestoesCopy": {{
      "tituloSugerido": "Sugestão de título mais impactante",
      "ctaSugerido": "Sugestão de CTA mais efetivo"
    }}
  }},
  "coerencia": {{
    "status": "alinhado",
    "analise": "Análise detalhada da coerência entre canais baseada nos elementos visuais identificados",
    "elementosAlinhados": ["Elemento 1", "Elemento 2"],
    "quebraExpectativa": ["Quebra 1 se houver"]
  }},
  "autoridade": {{
    "percepcao": "especialista",
    "nivel": "premium",
    "justificativa": "Justificativa baseada nos elementos visuais identificados",
    "elementosAutoridade": ["Elemento 1", "Elemento 2"],
    "elementosFaltando": ["Elemento que aumentaria autoridade"]
  }},
  "melhorias": [
    {{
      "acao": "Ação específica e prática",
      "impacto": "ALTO",
      "prazo": "7 dias",
      "resultadoEsperado": "Resultado quantificável esperado"
    }},
    {{
      "acao": "Segunda ação prioritária",
      "impacto": "ALTO",
      "prazo": "7 dias",
      "resultadoEsperado": "Resultado esperado"
    }},
    {{
      "acao": "Terceira ação",
      "impacto": "MÉDIO",
      "prazo": "30 dias",
      "resultadoEsperado": "Resultado esperado"
    }}
  ],
  "templateVisual": {{
    "paletaSugerida": {{
      "primaria": "#cor",
      "secundaria": "#cor",
      "contraste": "#cor"
    }},
    "tipografiaSugerida": {{
      "titulos": "Nome da fonte",
      "corpo": "Nome da fonte"
    }}
  }},
  "insightPrincipal": "Um parágrafo estratégico com o insight mais importante para aumentar conversão"
}}

═══════════════════════════════════════════════════════════════════════════════════
REGRAS CRÍTICAS
═══════════════════════════════════════════════════════════════════════════════════

1. ANALISE VISUALMENTE as imagens - NÃO invente informações
2. Leia os textos que aparecem nas imagens (bio, títulos, CTAs)
3. Identifique cores, elementos visuais, números visíveis
4. Se algo não estiver visível, indique "Não identificado" ou "Não visível"
5. Seja ESPECÍFICO - cite elementos que você viu nas imagens
6. Priorize melhorias que aumentem CONVERSÃO real
7. Responda APENAS com o JSON, sem texto adicional"""

        # Usar LlmChat com ImageContent para análise visual com GPT-4o
        from emergentintegrations.llm.chat import LlmChat, ImageContent, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key não configurada")
        
        # Criar instância do chat com GPT-4o (suporta visão)
        session_id = f"visual_diagnosis_{current_user['id']}_{uuid4()}"
        llm = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message="Você é um especialista premium em análise de presença digital e marketing para estética."
        ).with_model("openai", "gpt-4o")
        
        # Criar conteúdo com imagens (usando base64)
        instagram_image = ImageContent(image_base64=instagram_base64)
        pagina_image = ImageContent(image_base64=pagina_base64)
        
        # Enviar mensagem com texto e imagens
        user_message = UserMessage(
            text=prompt_master,
            file_contents=[instagram_image, pagina_image]
        )
        response = await llm.send_message(user_message)
        
        # Parsear resposta JSON
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if json_match:
            result = json.loads(json_match.group())
        else:
            raise Exception("Resposta da IA não contém JSON válido")
        
        # Salvar análise
        await db.presenca_analyses.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "instagram_handle": instagramHandle,
            "link_bio": linkBio,
            "result": result,
            "visual_analysis": True,
            "analysis_type": "premium_visual",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir créditos
        await consume_credits(current_user["id"], credits_required, f"Diagnóstico visual: @{instagramHandle}", check_balance=False)
        
        return {"success": True, "result": result}
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar resposta da IA: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro na análise visual: {e}")
        raise HTTPException(status_code=500, detail=f"Erro na análise visual: {str(e)}")

# Endpoint para histórico de análises de presença
@app.get("/api/presenca-analyses/history")
async def get_presenca_analyses_history(
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Retorna histórico de análises de presença visual do usuário"""
    try:
        cursor = db.presenca_analyses.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        
        analyses = await cursor.to_list(length=limit)
        
        return {
            "success": True,
            "analyses": analyses,
            "total": len(analyses)
        }
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        raise HTTPException(status_code=500, detail="Erro ao buscar histórico de análises")

# Helper para obter identidade da marca do usuário
async def get_user_brand_identity(user_id: str) -> dict:
    """Obtém a identidade de marca do usuário se existir"""
    identity = await db.brand_identity.find_one(
        {"user_id": user_id, "setup_completed": True},
        {"_id": 0}
    )
    return identity

@app.post("/api/ai/diagnostico-bio")
async def gerar_diagnostico_bio(data: DiagnosticoBioRequest, current_user: dict = Depends(get_current_user)):
    """Gera diagnóstico personalizado da bio usando IA"""
    session_id = f"diagnostico_{current_user['id']}_{uuid4()}"
    
    prompt = f"""Você é uma especialista em marketing estético, neurovendas e posicionamento premium.

Gere um diagnóstico claro, direto e respeitoso para uma dona de clínica estética com base neste resultado:

NÍVEL DA BIO: {data.nivel}
SCORE: {data.score} de 12 pontos
RESPOSTAS DO QUIZ: {data.respostas}

Contexto das respostas:
- Pergunta 1 (Bio): 1=só quem sou, 2=o que faço, 3=para quem e por quê
- Pergunta 2 (CTA): 1=precisa procurar, 2=sem incentivo, 3=conduz ao agendamento
- Pergunta 3 (Comunicação): 1=informativa, 2=genérica, 3=persuasiva
- Pergunta 4 (Destaques): 1=desatualizados, 2=mostram procedimentos, 3=conduzem à decisão

GERE um diagnóstico em JSON com:
{{
    "nivel": "{data.nivel}",
    "mensagem_curta": "Frase de impacto sobre o estado atual (máx 2 linhas)",
    "diagnostico_completo": "Análise detalhada e personalizada baseada nas respostas específicas (3-4 parágrafos)",
    "o_que_esta_travando": "O que está impedindo os agendamentos chegarem (específico, sem jargão)",
    "impacto_faturamento": "Como isso afeta o faturamento dela em termos práticos (cite números estimados)",
    "o_que_ajustar": "O que precisa ser ajustado urgentemente (sem entregar tudo, gerar curiosidade)",
    "convite_proximo_passo": "Convite sutil e elegante para aprofundar no diagnóstico estratégico completo"
}}

TOM OBRIGATÓRIO:
- Profissional e elegante
- Nada agressivo ou de vendedor
- Nada genérico (personalize para as respostas dela)
- Linguagem de estética e autoridade
- Evite termos técnicos de marketing

REGRA: O diagnóstico deve parecer que você CONHECE o perfil dela, não um template.

Responda APENAS com o JSON válido."""

    lucresia = LucresIA(session_id=session_id)
    
    try:
        from emergentintegrations.llm.chat import UserMessage
        user_message = UserMessage(text=prompt)
        response = await lucresia.chat.send_message(user_message)
        
        import json
        clean_response = response.strip()
        if clean_response.startswith("```json"):
            clean_response = clean_response[7:]
        if clean_response.startswith("```"):
            clean_response = clean_response[3:]
        if clean_response.endswith("```"):
            clean_response = clean_response[:-3]
        
        diagnostico = json.loads(clean_response.strip())
        
        # Salvar diagnóstico no histórico do usuário
        await db.diagnosticos_bio.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "nivel": data.nivel,
            "score": data.score,
            "respostas": data.respostas,
            "diagnostico": diagnostico,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "diagnostico": diagnostico}
        
    except Exception as e:
        # Fallback para diagnóstico básico
        fallback = {
            "nivel": data.nivel,
            "mensagem_curta": "Seu Instagram até existe, mas não vende." if data.score <= 6 else "Você atrai curiosas, mas não conduz à decisão." if data.score <= 9 else "Sua bio já trabalha por você.",
            "diagnostico_completo": "",
            "o_que_esta_travando": "",
            "impacto_faturamento": "",
            "o_que_ajustar": "",
            "convite_proximo_passo": ""
        }
        return {"success": True, "diagnostico": fallback}

@app.post("/api/ai/generate-content")
async def generate_content(data: ContentGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Generate content using NeuroVendas framework with brand identity"""
    
    # VERIFICAR CRÉDITOS ANTES DE PROCESSAR
    credits_required = 2
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    session_id = f"content_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    
    # Obter identidade da marca
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        result = await lucresia.generate_content_aisv(data.tema, data.tipo, data.tom)
        
        # Save generated content
        await db.generated_content.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "tipo": data.tipo,
            "tema": data.tema,
            "content": result,
            "brand_identity_used": brand_identity is not None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume credits (já verificado acima)
        await consume_credits(current_user["id"], credits_required, f"Geração de {data.tipo}: {data.tema}", check_balance=False)
        
        return {"success": True, "content": result, "brand_identity_applied": brand_identity is not None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar conteúdo: {str(e)}")

@app.post("/api/ai/generate-carousel")
async def generate_carousel_neurovendas(data: CarouselGenerateRequest, current_user: dict = Depends(get_current_user)):
    """
    Gera carrossel de alta conversão usando lógica NeuroVendas Elevare.
    Estrutura: Hook → Dor → Custo Invisível → Nova Perspectiva → CTA
    """
    # VERIFICAR CRÉDITOS ANTES DE PROCESSAR
    credits_required = 3
    has_credits, current_balance = await check_credits(current_user["id"], credits_required)
    if not has_credits:
        raise HTTPException(
            status_code=402,
            detail=f"Créditos insuficientes. Necessário: {credits_required}, Disponível: {current_balance}"
        )
    
    # Obter identidade da marca
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    # Usar nicho da identidade se não informado
    niche = data.niche
    if brand_identity and not niche:
        niche = brand_identity.get("segment", "estética")
    
    generator = get_carousel_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_carousel(
            niche=niche,
            carousel_objective=data.carousel_objective,
            target_audience=data.target_audience,
            tone_of_voice=data.tone_of_voice,
            offer_or_theme=data.offer_or_theme,
            audience_awareness=data.audience_awareness,
            number_of_slides=data.number_of_slides
        )
        
        # Salvar carrossel gerado
        carousel_id = str(uuid4())
        await db.generated_carousels.insert_one({
            "id": carousel_id,
            "user_id": current_user["id"],
            "niche": niche,
            "objective": data.carousel_objective,
            "theme": data.offer_or_theme,
            "carousel": result,
            "brand_identity_used": brand_identity is not None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir créditos (já verificado acima)
        await consume_credits(current_user["id"], credits_required, f"Carrossel NeuroVendas: {data.offer_or_theme}", check_balance=False)
        
        return {
            "success": True,
            "carousel_id": carousel_id,
            "carousel": result,
            "brand_identity_applied": brand_identity is not None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar carrossel: {str(e)}")

@app.post("/api/ai/generate-carousel-sequence")
async def generate_carousel_sequence(data: CarouselSequenceRequest, current_user: dict = Depends(get_current_user)):
    """Gera sequência estratégica de carrosséis para campanha completa"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    generator = get_carousel_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_carousel_sequence(
            niche=data.niche,
            campaign_theme=data.campaign_theme,
            number_of_carousels=data.number_of_carousels
        )
        
        # Consumir 5 créditos por sequência
        await consume_credits(current_user["id"], 5, f"Sequência de carrosséis: {data.campaign_theme}")
        
        return {
            "success": True,
            "sequence": result,
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar sequência: {str(e)}")

@app.get("/api/ai/carousel-options")
async def get_carousel_options(current_user: dict = Depends(get_current_user)):
    """Retorna opções disponíveis para geração de carrosséis"""
    return {
        "success": True,
        "options": {
            "objectives": [
                {"id": "atracao", "label": "Atração", "desc": "Atrair novos seguidores"},
                {"id": "autoridade", "label": "Autoridade", "desc": "Posicionar como expert"},
                {"id": "prova_social", "label": "Prova Social", "desc": "Casos e depoimentos"},
                {"id": "venda_direta", "label": "Venda Direta", "desc": "Converter em cliente"}
            ],
            "audiences": [
                {"id": "iniciante", "label": "Iniciante", "desc": "Profissional começando"},
                {"id": "intermediario", "label": "Intermediário", "desc": "Buscando escalar"},
                {"id": "avancado", "label": "Avançado", "desc": "Quer otimizar"},
                {"id": "cliente_final", "label": "Cliente Final", "desc": "Consumidor do serviço"}
            ],
            "tones": [
                {"id": "profissional", "label": "Profissional", "desc": "Técnico e acessível"},
                {"id": "direto", "label": "Direto", "desc": "Objetivo, sem rodeios"},
                {"id": "acolhedor", "label": "Acolhedor", "desc": "Empático e conectivo"},
                {"id": "premium", "label": "Premium", "desc": "Sofisticado e exclusivo"},
                {"id": "provocativo", "label": "Provocativo", "desc": "Desafia crenças"}
            ],
            "awareness_levels": [
                {"id": "frio", "label": "Frio", "desc": "Não conhece você"},
                {"id": "morno", "label": "Morno", "desc": "Conhece o problema"},
                {"id": "quente", "label": "Quente", "desc": "Já confia em você"}
            ]
        }
    }

# =============================================================================
# MULTI-PLATFORM CAPTION ROUTES
# =============================================================================

@app.post("/api/ai/generate-caption")
async def generate_platform_caption(data: GenerateCaptionRequest, current_user: dict = Depends(get_current_user)):
    """Gera legenda otimizada para plataforma específica"""
    # Usar content ou theme como fallback
    effective_content = data.content or data.theme
    if not effective_content:
        raise HTTPException(status_code=400, detail="Informe 'content' ou 'theme' para gerar a legenda")
    
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_multi_platform_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_caption(effective_content, data.platform, data.tone)
        
        await consume_credits(current_user["id"], 1, f"Legenda {data.platform}")
        
        return {
            "success": True,
            "platform": data.platform,
            "caption": result,
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar legenda: {str(e)}")

@app.post("/api/ai/generate-all-captions")
async def generate_all_platform_captions(data: GenerateAllCaptionsRequest, current_user: dict = Depends(get_current_user)):
    """Gera legendas para todas as plataformas principais"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_multi_platform_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_all_captions(data.content, data.tone)
        
        await consume_credits(current_user["id"], 4, "Legendas multi-plataforma")
        
        return {
            "success": True,
            "captions": result,
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar legendas: {str(e)}")

@app.get("/api/ai/caption-platforms")
async def get_caption_platforms(current_user: dict = Depends(get_current_user)):
    """Retorna plataformas disponíveis para geração de legendas"""
    return {
        "success": True,
        "platforms": [
            {"id": "instagram", "label": "Instagram", "max_length": 2200, "features": "Emojis, hashtags, CTA"},
            {"id": "facebook", "label": "Facebook", "max_length": 500, "features": "Perguntas, storytelling"},
            {"id": "linkedin", "label": "LinkedIn", "max_length": 700, "features": "Tom profissional, insights"},
            {"id": "tiktok", "label": "TikTok", "max_length": 300, "features": "Ganchos rápidos, trends"}
        ]
    }

# =============================================================================
# WHATSAPP SCRIPTS ROUTES
# =============================================================================

@app.post("/api/ai/generate-whatsapp-script")
async def generate_whatsapp_script(data: WhatsAppScriptRequest, current_user: dict = Depends(get_current_user)):
    """Gera script de WhatsApp para cenário específico"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_multi_platform_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_whatsapp_script(
            scenario=data.scenario,
            service=data.service,
            client_name=data.client_name,
            context=data.context
        )
        
        # Salvar script
        script_id = str(uuid4())
        await db.whatsapp_scripts.insert_one({
            "id": script_id,
            "user_id": current_user["id"],
            "scenario": data.scenario,
            "service": data.service,
            "script": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        await consume_credits(current_user["id"], 2, f"Script WhatsApp: {data.scenario}")
        
        return {
            "success": True,
            "script_id": script_id,
            "script": result,
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar script: {str(e)}")

@app.get("/api/ai/whatsapp-scenarios")
async def get_whatsapp_scenarios(current_user: dict = Depends(get_current_user)):
    """Retorna cenários disponíveis para scripts de WhatsApp"""
    return {
        "success": True,
        "scenarios": [
            {"id": "primeiro_contato", "label": "Primeiro Contato", "desc": "Lead demonstrou interesse"},
            {"id": "followup", "label": "Follow-up", "desc": "Lead não respondeu"},
            {"id": "agendamento", "label": "Agendamento", "desc": "Confirmar ou agendar"},
            {"id": "pos_atendimento", "label": "Pós-Atendimento", "desc": "Após o procedimento"},
            {"id": "reativacao", "label": "Reativação", "desc": "Cliente sumiu"},
            {"id": "objecao", "label": "Quebra de Objeção", "desc": "Responder objeções"}
        ]
    }

@app.get("/api/whatsapp-scripts")
async def list_whatsapp_scripts(current_user: dict = Depends(get_current_user)):
    """Lista scripts de WhatsApp salvos"""
    scripts = await db.whatsapp_scripts.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"success": True, "scripts": scripts}

# =============================================================================
# STORY SEQUENCE ROUTES
# =============================================================================

@app.post("/api/ai/generate-story-sequence")
async def generate_story_sequence(data: StorySequenceRequest, current_user: dict = Depends(get_current_user)):
    """Gera sequência de stories com narrativa"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_multi_platform_generator(brand_identity=brand_identity)
    
    try:
        result = await generator.generate_story_sequence(
            theme=data.theme,
            story_type=data.story_type,
            number_of_stories=data.number_of_stories
        )
        
        # Salvar sequência
        sequence_id = str(uuid4())
        await db.story_sequences.insert_one({
            "id": sequence_id,
            "user_id": current_user["id"],
            "theme": data.theme,
            "story_type": data.story_type,
            "sequence": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        await consume_credits(current_user["id"], 3, f"Sequência de Stories: {data.theme}")
        
        return {
            "success": True,
            "sequence_id": sequence_id,
            "sequence": result,
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar sequência: {str(e)}")

@app.get("/api/ai/story-types")
async def get_story_types(current_user: dict = Depends(get_current_user)):
    """Retorna tipos de sequência de stories disponíveis"""
    return {
        "success": True,
        "story_types": [
            {"id": "dia_a_dia", "label": "Dia a Dia", "desc": "Rotina na clínica"},
            {"id": "antes_depois", "label": "Antes & Depois", "desc": "Transformação gradual"},
            {"id": "bastidores", "label": "Bastidores", "desc": "Por trás das câmeras"},
            {"id": "educativo", "label": "Educativo", "desc": "Ensinar com storytelling"},
            {"id": "venda", "label": "Venda", "desc": "Conduzir para oferta"}
        ]
    }

# =============================================================================
# CONTENT TEMPLATES ROUTES
# =============================================================================

@app.post("/api/templates")
async def create_template(data: TemplateCreate, current_user: dict = Depends(get_current_user)):
    """Cria um novo template de conteúdo"""
    template_id = str(uuid4())
    
    await db.content_templates.insert_one({
        "id": template_id,
        "user_id": current_user["id"],
        "name": data.name,
        "description": data.description,
        "template_type": data.template_type,
        "platform": data.platform,
        "content": data.content,
        "variables": data.variables or [],
        "usage_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "template_id": template_id, "message": "Template criado com sucesso"}

@app.get("/api/templates")
async def list_templates(current_user: dict = Depends(get_current_user)):
    """Lista todos os templates do usuário"""
    templates = await db.content_templates.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"success": True, "templates": templates}

@app.get("/api/templates/{template_id}")
async def get_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Obtém um template específico"""
    template = await db.content_templates.find_one(
        {"id": template_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not template:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return {"success": True, "template": template}

@app.put("/api/templates/{template_id}")
async def update_template(template_id: str, data: TemplateUpdate, current_user: dict = Depends(get_current_user)):
    """Atualiza um template"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.name:
        update_data["name"] = data.name
    if data.description is not None:
        update_data["description"] = data.description
    if data.content:
        update_data["content"] = data.content
    if data.variables is not None:
        update_data["variables"] = data.variables
    
    result = await db.content_templates.update_one(
        {"id": template_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return {"success": True, "message": "Template atualizado"}

@app.delete("/api/templates/{template_id}")
async def delete_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Deleta um template"""
    result = await db.content_templates.delete_one(
        {"id": template_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template não encontrado")
    
    return {"success": True, "message": "Template deletado"}

# =============================================================================
# POST SCHEDULER ROUTES
# =============================================================================

@app.post("/api/scheduled-posts")
async def schedule_post(data: SchedulePostRequest, current_user: dict = Depends(get_current_user)):
    """Agenda um post para publicação futura"""
    post_id = str(uuid4())
    
    await db.scheduled_posts.insert_one({
        "id": post_id,
        "user_id": current_user["id"],
        "content": data.content,
        "platform": data.platform,
        "scheduled_for": data.scheduled_for,
        "media_url": data.media_url,
        "hashtags": data.hashtags or [],
        "status": "agendado",  # agendado, publicado, erro
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "post_id": post_id, "message": "Post agendado com sucesso"}

@app.get("/api/scheduled-posts")
async def list_scheduled_posts(current_user: dict = Depends(get_current_user)):
    """Lista posts agendados"""
    posts = await db.scheduled_posts.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("scheduled_for", 1).to_list(100)
    
    return {"success": True, "posts": posts}

@app.delete("/api/scheduled-posts/{post_id}")
async def delete_scheduled_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Cancela um post agendado"""
    result = await db.scheduled_posts.delete_one(
        {"id": post_id, "user_id": current_user["id"], "status": "agendado"}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado ou já publicado")
    
    return {"success": True, "message": "Post cancelado"}

@app.post("/api/ai/generate-persona")
async def generate_persona(data: PersonaGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Generate deep persona using OÁSIS method with brand identity"""
    session_id = f"persona_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        result = await lucresia.generate_persona(data.servico, data.nicho)
        
        # Save persona
        await db.personas.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "servico": data.servico,
            "persona": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume 5 credits for persona generation
        await consume_credits(current_user["id"], 5, f"Persona profunda: {data.servico}")
        
        return {"success": True, "persona": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar persona: {str(e)}")

@app.post("/api/ai/generate-ebook")
async def generate_ebook(data: EbookGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Generate complete ebook"""
    session_id = f"ebook_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        result = await lucresia.generate_ebook(data.topic, data.targetAudience, data.chapters)
        
        # Save ebook
        await db.ebooks.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "topic": data.topic,
            "ebook": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume 10 credits for ebook generation
        await consume_credits(current_user["id"], 10, f"E-book: {data.topic}")
        
        return {"success": True, "ebook": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar e-book: {str(e)}")

# =============================================================================
# NEW STRUCTURED EBOOK ROUTES
# =============================================================================

@app.post("/api/ebook/generate-structured")
async def generate_structured_ebook_endpoint(data: StructuredEbookGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Gera e-book estruturado usando o Sistema Editorial Elevare com QA automático"""
    try:
        # Gerar conteúdo estruturado via LLM com validação automática
        result = await generate_structured_ebook(
            topic=data.topic,
            audience=data.audience,
            goal=data.goal,
            tone=data.tone,
            author=data.author
        )
        
        # Salvar no banco
        ebook_id = str(uuid4())
        await db.ebooks_structured.insert_one({
            "id": ebook_id,
            "user_id": current_user["id"],
            "topic": data.topic,
            "audience": data.audience,
            "goal": data.goal,
            "tone": data.tone,
            "author": data.author,
            "structured_content": result["structured_ebook"],
            "readable_content": structured_ebook_to_readable_text(result["structured_ebook"]),
            "qa_report": result.get("qa_report", {}),
            "generation_attempts": result.get("attempts", 1),
            "status": "approved" if result.get("qa_report", {}).get("aprovado", False) else "review",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir 15 créditos para geração de e-book estruturado
        await consume_credits(current_user["id"], 15, f"E-book Estruturado: {data.topic}")
        
        response_data = {
            "success": True,
            "ebook_id": ebook_id,
            "structured_ebook": result["structured_ebook"],
            "readable_content": structured_ebook_to_readable_text(result["structured_ebook"]),
            "qa_report": result.get("qa_report", {}),
            "attempts": result.get("attempts", 1)
        }
        
        # Adicionar aviso se houver
        if result.get("warning"):
            response_data["warning"] = result["warning"]
        
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar e-book estruturado: {str(e)}")


@app.post("/api/ebook/update-structured")
async def update_structured_ebook_endpoint(data: StructuredEbookUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Atualiza conteúdo de e-book estruturado após edição"""
    try:
        # Validar schema
        if not is_valid_structured_ebook(data.structured_content):
            raise HTTPException(status_code=400, detail="Conteúdo estruturado inválido")
        
        # Atualizar no banco
        result = await db.ebooks_structured.update_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {
                "$set": {
                    "structured_content": data.structured_content,
                    "readable_content": structured_ebook_to_readable_text(data.structured_content),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        return {"success": True, "message": "E-book atualizado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar e-book: {str(e)}")


@app.post("/api/ebook/generate-html")
async def generate_ebook_html_endpoint(data: StructuredEbookPDFRequest, current_user: dict = Depends(get_current_user)):
    """Gera HTML renderizado do e-book com template selecionado"""
    try:
        # Buscar e-book
        ebook = await db.ebooks_structured.find_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        # Renderizar HTML
        html_content = render_structured_ebook(ebook["structured_content"], data.template)
        
        return {
            "success": True,
            "html": html_content,
            "template": data.template
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar HTML: {str(e)}")


@app.get("/api/ebook/templates")
async def get_ebook_templates(current_user: dict = Depends(get_current_user)):
    """Lista templates disponíveis para e-books"""
    return {
        "success": True,
        "templates": get_available_templates()
    }


# IMPORTANTE: Rotas específicas ANTES de rotas com parâmetros
@app.get("/api/ebook/mental-triggers")
async def get_mental_triggers_ebook_route(current_user: dict = Depends(get_current_user)):
    """Lista gatilhos mentais para e-books"""
    return {
        "success": True,
        "triggers": MENTAL_TRIGGERS_EBOOK,
        "categories": ["urgency", "trust", "connection", "psychology", "attention", "status"]
    }


@app.get("/api/ebook/{ebook_id}")
async def get_structured_ebook(ebook_id: str, current_user: dict = Depends(get_current_user)):
    """Busca e-book estruturado por ID"""
    ebook = await db.ebooks_structured.find_one(
        {"id": ebook_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book não encontrado")
    
    return {"success": True, "ebook": ebook}


@app.get("/api/ebook")
async def list_structured_ebooks(current_user: dict = Depends(get_current_user)):
    """Lista todos os e-books estruturados do usuário"""
    ebooks = await db.ebooks_structured.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"success": True, "ebooks": ebooks}


@app.delete("/api/ebook/{ebook_id}")
async def delete_structured_ebook(ebook_id: str, current_user: dict = Depends(get_current_user)):
    """Remove e-book estruturado"""
    result = await db.ebooks_structured.delete_one(
        {"id": ebook_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="E-book não encontrado")
    
    return {"success": True, "message": "E-book removido com sucesso"}


# =============================================================================
# EBOOK COVER & PDF GENERATION (NOVO)
# =============================================================================

class CoverGenerateRequest(BaseModel):
    ebook_id: str
    style: str = "modern"  # modern, classic, minimalist, vibrant
    color_scheme: Optional[str] = None
    custom_prompt: Optional[str] = None

class PDFGenerateRequest(BaseModel):
    ebook_id: str
    template: str = "educational"  # educational, marketing, storytelling
    include_cover: bool = True

@app.post("/api/ebook/generate-cover")
async def generate_ebook_cover(data: CoverGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Gera capa do e-book usando IA (gpt-image-1)"""
    try:
        # Buscar e-book
        ebook = await db.ebooks_structured.find_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        # Extrair título
        structured = ebook.get("structured_content", {})
        title = structured.get("meta", {}).get("title", ebook.get("topic", "E-book"))
        
        # Mapear estilos para prompts
        style_prompts = {
            "modern": "sleek, contemporary design with geometric shapes and gradients, purple and gold tones",
            "classic": "elegant, sophisticated design with serif typography and gold accents on dark background",
            "minimalist": "clean, simple design with lots of white space and subtle lavender colors",
            "vibrant": "bold colors, dynamic composition, eye-catching and energetic purple gradients"
        }
        
        base_prompt = f"""Professional e-book cover design for '{title}'.
Style: {style_prompts.get(data.style, style_prompts['modern'])}.
{f'Color scheme: {data.color_scheme}.' if data.color_scheme else 'Color scheme: elegant purple and gold.'}
{data.custom_prompt if data.custom_prompt else ''}
High quality, commercial grade, suitable for digital publishing.
Aesthetic clinic and beauty professional theme.
No text on the cover - just visual design elements and patterns."""

        # Gerar imagem usando emergentintegrations
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key não configurada")
        
        image_gen = OpenAIImageGeneration(api_key=api_key)
        images = await image_gen.generate_images(
            prompt=base_prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail="Nenhuma imagem gerada")
        
        # Converter para base64
        import base64
        image_base64 = base64.b64encode(images[0]).decode('utf-8')
        cover_url = f"data:image/png;base64,{image_base64}"
        
        # Atualizar e-book com capa
        await db.ebooks_structured.update_one(
            {"id": data.ebook_id},
            {"$set": {"cover_url": cover_url, "cover_style": data.style, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Consumir créditos (5 para geração de capa)
        await consume_credits(current_user["id"], 5, "Capa E-book IA")
        
        return {
            "success": True,
            "cover_url": cover_url,
            "style": data.style
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cover generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar capa: {str(e)}")

# Endpoint genérico para geração de imagem
class ImageGenerationRequest(BaseModel):
    prompt: str
    size: str = "1792x1024"  # Formato banner
    quality: str = "standard"

@app.post("/api/ai/generate-image")
async def generate_image(
    data: ImageGenerationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Gera uma imagem usando IA (OpenAI gpt-image-1)
    Custo: 1 crédito
    """
    try:
        # Verificar créditos
        user_credits = current_user.get("credits", 0)
        if user_credits < 1:
            raise HTTPException(status_code=402, detail="Créditos insuficientes")
        
        from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration
        
        api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="API key não configurada")
        
        image_gen = OpenAIImageGeneration(api_key=api_key)
        images = await image_gen.generate_images(
            prompt=data.prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        
        if not images or len(images) == 0:
            raise HTTPException(status_code=500, detail="Nenhuma imagem gerada")
        
        # Converter para base64
        import base64
        image_base64 = base64.b64encode(images[0]).decode('utf-8')
        image_url = f"data:image/png;base64,{image_base64}"
        
        # Consumir créditos
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$inc": {"credits": -1}}
        )
        
        return {
            "success": True,
            "image_url": image_url,
            "credits_remaining": user_credits - 1
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao gerar imagem: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar imagem: {str(e)}")


@app.post("/api/ebook/generate-pdf")
async def generate_ebook_pdf(data: PDFGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Gera PDF do e-book com template selecionado"""
    try:
        # Buscar e-book
        ebook = await db.ebooks_structured.find_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        structured = ebook.get("structured_content", {})
        if not structured:
            raise HTTPException(status_code=400, detail="Conteúdo não gerado ainda")
        
        # Gerar PDF usando fpdf2
        from fpdf import FPDF
        
        class EbookPDF(FPDF):
            def __init__(self, template: str):
                super().__init__()
                self.template = template
                self.set_auto_page_break(auto=True, margin=15)
                
                # Template colors - Elevare palette
                self.colors = {
                    "educational": {"primary": (139, 92, 246), "secondary": (167, 139, 250), "text": (30, 41, 59)},
                    "marketing": {"primary": (217, 70, 239), "secondary": (236, 72, 153), "text": (30, 41, 59)},
                    "storytelling": {"primary": (124, 58, 237), "secondary": (139, 92, 246), "text": (30, 41, 59)}
                }.get(template, {"primary": (139, 92, 246), "secondary": (167, 139, 250), "text": (30, 41, 59)})
            
            def header(self):
                if self.page_no() > 1:
                    self.set_font('Helvetica', 'I', 8)
                    self.set_text_color(*self.colors["secondary"])
                    self.cell(0, 10, self.title if hasattr(self, 'title') else '', align='C')
                    self.ln(10)
            
            def footer(self):
                self.set_y(-15)
                self.set_font('Helvetica', 'I', 8)
                self.set_text_color(128, 128, 128)
                self.cell(0, 10, f'Página {self.page_no()}', align='C')
        
        pdf = EbookPDF(data.template)
        meta = structured.get("meta", {})
        pdf.title = meta.get("title", "E-book Elevare")
        
        # Tentar adicionar fontes DejaVu se disponíveis
        try:
            pdf.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', uni=True)
            pdf.add_font('DejaVu', 'B', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', uni=True)
            pdf.add_font('DejaVu', 'I', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf', uni=True)
            font_name = 'DejaVu'
        except:
            font_name = 'Helvetica'
        
        # Página de capa
        pdf.add_page()
        pdf.set_fill_color(*pdf.colors["primary"])
        pdf.rect(0, 0, 210, 297, 'F')
        
        pdf.set_y(80)
        pdf.set_font(font_name, 'B', 28)
        pdf.set_text_color(255, 255, 255)
        pdf.multi_cell(0, 12, meta.get('title', 'E-book'), align='C')
        
        if meta.get('subtitle'):
            pdf.ln(10)
            pdf.set_font(font_name, 'I' if font_name == 'DejaVu' else '', 14)
            pdf.multi_cell(0, 8, meta.get('subtitle', ''), align='C')
        
        pdf.set_y(240)
        pdf.set_font(font_name, '', 12)
        pdf.cell(0, 10, f"Por: {meta.get('author', 'Elevare NeuroVendas')}", align='C')
        pdf.ln(8)
        pdf.set_font(font_name, 'I' if font_name == 'DejaVu' else '', 10)
        pdf.cell(0, 10, f"Para: {meta.get('audience', '')}", align='C')
        
        # Páginas de conteúdo
        sections = structured.get("sections", [])
        for i, section in enumerate(sections):
            if section.get("type") == "hero":
                continue  # Já foi na capa
            
            pdf.add_page()
            
            # Título da seção
            if section.get("title"):
                pdf.set_font(font_name, 'B', 20)
                pdf.set_text_color(*pdf.colors["primary"])
                pdf.multi_cell(0, 10, section.get("title", ""), align='L')
                pdf.ln(8)
            
            # Subtítulo
            if section.get("subtitle"):
                pdf.set_font(font_name, 'I' if font_name == 'DejaVu' else '', 12)
                pdf.set_text_color(*pdf.colors["secondary"])
                pdf.multi_cell(0, 7, section.get("subtitle", ""))
                pdf.ln(5)
            
            # Blocos de conteúdo
            pdf.set_text_color(*pdf.colors["text"])
            for block in section.get("blocks", []):
                if block.get("type") == "paragraph":
                    pdf.set_font(font_name, '', 11)
                    text = block.get("text", "")
                    # Remover tags HTML básicas
                    import re
                    text = re.sub(r'<[^>]+>', '', text)
                    pdf.multi_cell(0, 6, text)
                    pdf.ln(4)
                    
                elif block.get("type") == "bullet_list":
                    pdf.set_font(font_name, '', 11)
                    for item in block.get("items", []):
                        item_text = re.sub(r'<[^>]+>', '', item)
                        pdf.cell(8, 6, chr(149))  # Bullet point
                        pdf.multi_cell(0, 6, item_text)
                    pdf.ln(3)
                    
                elif block.get("type") == "callout":
                    pdf.set_fill_color(243, 232, 255)  # Light purple
                    pdf.set_font(font_name, 'I' if font_name == 'DejaVu' else '', 10)
                    text = re.sub(r'<[^>]+>', '', block.get("text", ""))
                    pdf.multi_cell(0, 6, text, fill=True)
                    pdf.ln(5)
        
        # Gerar bytes do PDF
        pdf_bytes = bytes(pdf.output())
        
        # Converter para base64
        import base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        pdf_url = f"data:application/pdf;base64,{pdf_base64}"
        
        # Atualizar e-book com PDF URL
        await db.ebooks_structured.update_one(
            {"id": data.ebook_id},
            {"$set": {"pdf_url": pdf_url, "pdf_template": data.template, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Consumir créditos (3 para PDF)
        await consume_credits(current_user["id"], 3, "PDF E-book")
        
        return {
            "success": True,
            "pdf_url": pdf_url,
            "template": data.template
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")


# Biblioteca de Gatilhos Mentais para E-books
MENTAL_TRIGGERS_EBOOK = [
    {"id": "1", "name": "Escassez", "category": "urgency", "description": "Criar senso de limitação para impulsionar ação imediata", "example": "Apenas 10 vagas disponíveis!", "power": 9},
    {"id": "2", "name": "Urgência", "category": "urgency", "description": "Estabelecer prazo limitado para decisão", "example": "Oferta válida apenas hoje!", "power": 9},
    {"id": "3", "name": "Prova Social", "category": "trust", "description": "Mostrar que outros já compraram/aprovaram", "example": "Mais de 10.000 clientes satisfeitos", "power": 8},
    {"id": "4", "name": "Autoridade", "category": "trust", "description": "Demonstrar expertise e credenciais", "example": "Recomendado por especialistas", "power": 8},
    {"id": "5", "name": "Reciprocidade", "category": "connection", "description": "Oferecer algo de valor primeiro", "example": "E-book gratuito como presente", "power": 7},
    {"id": "6", "name": "Compromisso", "category": "psychology", "description": "Pequenos compromissos levam a maiores", "example": "Comece com o plano gratuito", "power": 7},
    {"id": "7", "name": "Afinidade", "category": "connection", "description": "Criar conexão emocional com o público", "example": "Eu também já passei por isso...", "power": 8},
    {"id": "8", "name": "Novidade", "category": "attention", "description": "Apresentar algo novo e exclusivo", "example": "Método revolucionário!", "power": 7},
    {"id": "9", "name": "Antecipação", "category": "attention", "description": "Criar expectativa sobre algo futuro", "example": "Em breve: a maior novidade do ano", "power": 6},
    {"id": "10", "name": "Curiosidade", "category": "attention", "description": "Despertar interesse com informação incompleta", "example": "O segredo que ninguém conta...", "power": 8},
    {"id": "11", "name": "Exclusividade", "category": "status", "description": "Oferecer acesso privilegiado", "example": "Apenas para membros VIP", "power": 7},
    {"id": "12", "name": "Pertencimento", "category": "connection", "description": "Fazer parte de um grupo especial", "example": "Junte-se à nossa comunidade", "power": 7},
    {"id": "13", "name": "Simplicidade", "category": "psychology", "description": "Facilitar a decisão e ação", "example": "Em apenas 3 passos simples", "power": 6},
    {"id": "14", "name": "Especificidade", "category": "trust", "description": "Usar números e dados específicos", "example": "Aumento de 47.3% nas vendas", "power": 7},
    {"id": "15", "name": "Garantia", "category": "trust", "description": "Eliminar risco da decisão", "example": "Garantia de 30 dias ou seu dinheiro de volta", "power": 8},
    {"id": "16", "name": "História", "category": "connection", "description": "Conectar através de narrativas", "example": "Tudo começou quando eu...", "power": 9},
    {"id": "17", "name": "Contraste", "category": "psychology", "description": "Comparar antes/depois ou opções", "example": "De R$997 por apenas R$197", "power": 8},
    {"id": "18", "name": "Dor/Prazer", "category": "psychology", "description": "Ativar motivadores primários", "example": "Nunca mais sofra com...", "power": 9},
    {"id": "19", "name": "Razão", "category": "psychology", "description": "Fornecer justificativa lógica", "example": "Porque você merece o melhor", "power": 6},
    {"id": "20", "name": "Segurança", "category": "trust", "description": "Transmitir confiança e proteção", "example": "Dados protegidos e criptografados", "power": 7},
]


# ═══════════════════════════════════════════════════════════════════════════════
# E-BOOK GENERATOR V2 - Motor Interno (SEM DEPENDÊNCIA EXTERNA)
# ═══════════════════════════════════════════════════════════════════════════════

class EbookV2Request(BaseModel):
    """Request para criar e-book com motor interno V2"""
    title: str
    topic: str
    audience: str
    tone: str = "profissional"
    num_chapters: int = 5
    author: str = "Elevare NeuroVendas"

@app.post("/api/ebook/generate-v2")
async def create_ebook_v2(
    data: EbookV2Request,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria e-book usando motor interno V2 (GPT-4o + PDF)
    SEM dependência do Gamma - 100% interno
    
    Retorna:
        - ebook_id: ID do e-book salvo
        - pdf_url: URL para download do PDF
        - ebook_data: Dados estruturados do e-book
    """
    try:
        # Verificar API key do LLM
        api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="Serviço de IA não configurado. Configure EMERGENT_LLM_KEY ou OPENAI_API_KEY."
            )
        
        # Iniciar geração
        ebook_generator = get_ebook_generator()
        
        # Gerar e-book completo (conteúdo + PDF)
        result = await ebook_generator.generate_complete_ebook(
            title=data.title,
            topic=data.topic,
            target_audience=data.audience,
            tone=data.tone,
            num_chapters=data.num_chapters,
            output_dir="/tmp/ebooks"
        )
        
        # Salvar no banco
        ebook_id = str(uuid4())
        ebook_record = {
            "id": ebook_id,
            "user_id": current_user["id"],
            "title": data.title,
            "topic": data.topic,
            "audience": data.audience,
            "tone": data.tone,
            "author": data.author,
            "num_chapters": data.num_chapters,
            "pdf_path": result["pdf_path"],
            "pdf_filename": result["pdf_filename"],
            "ebook_data": result["ebook_data"],
            "pages": result["pages"],
            "status": "completed",
            "type": "internal_v2",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.ebooks.insert_one(ebook_record)
        
        # Consumir créditos
        await consume_credits(current_user["id"], CREDIT_COSTS["ebook"], f"E-book V2: {data.title}")
        
        # Log para analytics
        await db.usage_tracking.insert_one({
            "user_id": current_user["id"],
            "action": "ebook_v2_created",
            "ebook_id": ebook_id,
            "title": data.title,
            "chapters": data.num_chapters,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        # XP
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"xp": 100}}
        )
        
        return {
            "success": True,
            "ebook_id": ebook_id,
            "title": result["title"],
            "pdf_filename": result["pdf_filename"],
            "pages": result["pages"],
            "chapters": result["chapters"],
            "message": "E-book criado com sucesso!",
            "xp_earned": 100
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Erro ao criar e-book V2: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar e-book: {str(e)}")


@app.get("/api/ebook/download/{ebook_id}")
async def download_ebook_pdf(
    ebook_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Download do PDF do e-book
    """
    from fastapi.responses import FileResponse
    
    # Buscar e-book
    ebook = await db.ebooks.find_one({
        "id": ebook_id,
        "user_id": current_user["id"]
    })
    
    if not ebook:
        raise HTTPException(status_code=404, detail="E-book não encontrado")
    
    pdf_path = ebook.get("pdf_path")
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF não disponível")
    
    return FileResponse(
        path=pdf_path,
        filename=ebook.get("pdf_filename", "ebook.pdf"),
        media_type="application/pdf"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# GAMMA API (DEPRECATED) - Redirecionado para V2
# ═══════════════════════════════════════════════════════════════════════════════

class GammaEbookRequest(BaseModel):
    """Request para criar e-book (compatibilidade - usa V2 internamente)"""
    title: str
    topic: str
    audience: str
    tone: str = "profissional"
    num_chapters: int = 8
    additional_instructions: Optional[str] = None

class GammaBlogRequest(BaseModel):
    """Request para criar artigo de blog via Gamma"""
    title: str
    topic: str
    audience: str
    article_type: str = "educativo"
    tone: str = "profissional"
    keywords: Optional[str] = None
    call_to_action: Optional[str] = None

@app.post("/api/gamma/create-ebook")
async def create_ebook_gamma(
    data: GammaEbookRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    DEPRECATED: Este endpoint agora usa o motor interno V2
    Mantido para compatibilidade com frontend existente
    """
    # Redirecionar para V2
    v2_request = EbookV2Request(
        title=data.title,
        topic=data.topic,
        audience=data.audience,
        tone=data.tone,
        num_chapters=min(data.num_chapters, 8)  # Limitar a 8 capítulos
    )
    return await create_ebook_v2(v2_request, current_user)

@app.post("/api/gamma/create-blog")
async def create_blog_gamma(
    data: GammaBlogRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Cria um artigo de blog usando o motor Gamma (API)
    Retorna URL do documento gerado
    """
    try:
        # Verificar se API key está configurada
        gamma_api_key = os.environ.get("GAMMA_API_KEY")
        if not gamma_api_key:
            raise HTTPException(
                status_code=503,
                detail="Motor de criação em configuração. Em breve disponível."
            )
        
        # Verificar créditos do usuário (3 créditos para blog)
        user_credits = current_user.get("credits_remaining", current_user.get("credits", 0))
        if user_credits < 3:
            raise HTTPException(status_code=402, detail="Créditos insuficientes")
        
        # Construir configuração do blog
        config = build_blog_config(
            title=data.title,
            topic=data.topic,
            audience=data.audience,
            article_type=data.article_type,
            tone=data.tone,
            keywords=data.keywords,
            call_to_action=data.call_to_action,
        )
        
        # Gerar via Gamma API (aguarda conclusão)
        result = await gamma_service.generate_and_wait(config, max_wait_seconds=120)
        
        # Deduzir créditos
        user_id_for_update = current_user.get("_id") or current_user.get("id")
        if user_id_for_update:
            from bson import ObjectId
            if isinstance(user_id_for_update, str) and len(user_id_for_update) == 24:
                try:
                    user_id_for_update = ObjectId(user_id_for_update)
                except:
                    pass
            await db.users.update_one(
                {"_id": user_id_for_update},
                {"$inc": {"credits_remaining": -3}}
            )
        
        # Salvar no banco
        blog_record = {
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "title": data.title,
            "topic": data.topic,
            "audience": data.audience,
            "article_type": data.article_type,
            "tone": data.tone,
            "keywords": data.keywords,
            "gamma_generation_id": result.get("generationId"),
            "gamma_url": result.get("gammaUrl"),
            "status": "completed",
            "type": "gamma_blog",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.blogs.insert_one(blog_record)
        
        return {
            "success": True,
            "blog_id": blog_record["id"],
            "gamma_url": result.get("gammaUrl"),
            "credits_remaining": user_credits - 3,
        }
        
    except TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Geração demorou mais que o esperado. Tente novamente."
        )
    except HTTPException:
        raise  # Re-lançar HTTPException sem modificar
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Erro ao criar blog: {e}")
        raise HTTPException(status_code=500, detail="Erro ao criar artigo")

@app.get("/api/gamma/status/{generation_id}")
async def check_gamma_status(
    generation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Verifica status de uma geração Gamma"""
    try:
        gamma_api_key = os.environ.get("GAMMA_API_KEY")
        if not gamma_api_key:
            raise HTTPException(status_code=503, detail="Motor não configurado")
        
        result = await gamma_service.check_status(generation_id)
        return {
            "success": True,
            "status": result.get("status"),
            "gamma_url": result.get("gammaUrl"),
            "credits": result.get("credits"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gamma/my-content")
async def list_gamma_content(
    content_type: Optional[str] = None,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Lista e-books e blogs criados pelo usuário"""
    try:
        query = {"user_id": current_user["id"]}
        
        if content_type == "ebook":
            query["type"] = "gamma_ebook"
        elif content_type == "blog":
            query["type"] = "gamma_blog"
        else:
            query["type"] = {"$in": ["gamma_ebook", "gamma_blog"]}
        
        # Buscar e-books
        ebooks_cursor = db.ebooks.find(
            {**query, "type": "gamma_ebook"},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        ebooks = await ebooks_cursor.to_list(length=limit)
        
        # Buscar blogs
        blogs_cursor = db.blogs.find(
            {**query, "type": "gamma_blog"},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit)
        blogs = await blogs_cursor.to_list(length=limit)
        
        return {
            "success": True,
            "ebooks": ebooks,
            "blogs": blogs,
            "total": len(ebooks) + len(blogs),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/generate-script")
async def generate_script(data: ScriptDirectRequest, current_user: dict = Depends(get_current_user)):
    """Generate Direct/WhatsApp automation script"""
    session_id = f"script_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        result = await lucresia.generate_script_direct(data.tipo)
        
        # Save script
        await db.scripts.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "tipo": data.tipo,
            "script": result,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume 3 credits for script generation
        await consume_credits(current_user["id"], 3, f"Script {data.tipo}")
        
        return {"success": True, "script": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar script: {str(e)}")

# =============================================================================
# PROMPTS LIBRARY ROUTES (EXPANDIDO)
# =============================================================================

@app.get("/api/biblioteca/prompts")
async def get_prompts_library(current_user: dict = Depends(get_current_user)):
    """Get all strategic prompts - versão básica"""
    return {
        "success": True,
        "prompts": PROMPTS_BIBLIOTECA
    }

@app.get("/api/biblioteca/prompts-estrategicos")
async def get_prompts_estrategicos(current_user: dict = Depends(get_current_user)):
    """Get all strategic prompts - versão completa com 15+ prompts"""
    return {
        "success": True,
        "prompts": PROMPTS_ESTRATEGICOS,
        "categorias": ["autoridade", "vendas", "educativo", "prova_social", "conexao", 
                      "estrategia", "relacionamento", "design", "copy", "video", "engajamento", "conteudo", "instagram"]
    }

@app.get("/api/biblioteca/prompts-estrategicos/{prompt_id}")
async def get_prompt_by_id(prompt_id: str, current_user: dict = Depends(get_current_user)):
    """Get specific prompt by ID"""
    if prompt_id not in PROMPTS_ESTRATEGICOS:
        raise HTTPException(status_code=404, detail="Prompt não encontrado")
    return {
        "success": True,
        "prompt": PROMPTS_ESTRATEGICOS[prompt_id]
    }

@app.get("/api/biblioteca/templates")
async def get_templates_library(current_user: dict = Depends(get_current_user)):
    """Get all content templates - versão básica"""
    return {
        "success": True,
        "templates": TEMPLATES_CONTEUDO
    }

@app.get("/api/biblioteca/templates-calendario")
async def get_templates_calendario(current_user: dict = Depends(get_current_user)):
    """Get all calendar templates"""
    return {
        "success": True,
        "templates": TEMPLATES_CALENDARIO
    }

@app.get("/api/biblioteca/tons")
async def get_tons_comunicacao(current_user: dict = Depends(get_current_user)):
    """Get all communication tones"""
    return {
        "success": True,
        "tons": TONS_COMUNICACAO
    }

@app.get("/api/biblioteca/objetivos")
async def get_objetivos_estrategicos(current_user: dict = Depends(get_current_user)):
    """Get all strategic objectives"""
    return {
        "success": True,
        "objetivos": OBJETIVOS_ESTRATEGICOS
    }

@app.get("/api/biblioteca/tipos-conteudo")
async def get_tipos_conteudo(current_user: dict = Depends(get_current_user)):
    """Get all content types"""
    return {
        "success": True,
        "tipos": TIPOS_CONTEUDO
    }

@app.post("/api/biblioteca/gerar-from-prompt")
async def gerar_conteudo_from_prompt(
    data: GenerateFromPromptRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Generate content from a strategic prompt"""
    if data.prompt_id not in PROMPTS_ESTRATEGICOS:
        raise HTTPException(status_code=404, detail="Prompt não encontrado")
    
    prompt_base = PROMPTS_ESTRATEGICOS[data.prompt_id]
    
    # Replace variables in prompt
    prompt_text = prompt_base["prompt"]
    for var, value in data.variaveis.items():
        prompt_text = prompt_text.replace(f"[{var.upper()}]", value)
        prompt_text = prompt_text.replace(f"[{var}]", value)
    
    # Add tone instruction
    tom_info = TONS_COMUNICACAO.get(data.tom, TONS_COMUNICACAO["profissional"])
    prompt_text += f"\n\nTom de comunicação: {tom_info['nome']} - {tom_info['descricao']}"
    
    session_id = f"prompt_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(prompt_text)
        
        # Save generated content
        await db.generated_content.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "prompt_id": data.prompt_id,
            "prompt_titulo": prompt_base["titulo"],
            "variaveis": data.variaveis,
            "tom": data.tom,
            "content": response,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume credits
        await consume_credits(current_user["id"], 2, f"Conteúdo: {prompt_base['titulo']}")
        
        return {
            "success": True,
            "content": response,
            "prompt_usado": prompt_base["titulo"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar conteúdo: {str(e)}")

# =============================================================================
# CALENDÁRIO ELEVARE 360° ROUTES
# =============================================================================

@app.get("/api/calendario/temas-mensais")
async def get_temas_mensais(current_user: dict = Depends(get_current_user)):
    """Get all monthly themes"""
    return {
        "success": True,
        "temas": TEMAS_MENSAIS_ELEVARE
    }

@app.get("/api/calendario/tema/{mes}")
async def get_tema_mes(mes: str, current_user: dict = Depends(get_current_user)):
    """Get theme for specific month"""
    if mes.lower() not in TEMAS_MENSAIS_ELEVARE:
        raise HTTPException(status_code=404, detail="Mês não encontrado")
    return {
        "success": True,
        "tema": TEMAS_MENSAIS_ELEVARE[mes.lower()]
    }

@app.post("/api/calendario/gerar-sugestoes")
async def gerar_sugestoes_calendario(
    data: GenerateCalendarRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Generate calendar suggestions for a month"""
    mes_lower = data.mes.lower()
    if mes_lower not in TEMAS_MENSAIS_ELEVARE:
        raise HTTPException(status_code=404, detail="Mês não encontrado")
    
    tema_mes = TEMAS_MENSAIS_ELEVARE[mes_lower]
    tom_info = TONS_COMUNICACAO.get(data.tom_preferido, TONS_COMUNICACAO["acolhedor"])
    
    # Build prompt for calendar generation
    prompt = f"""Gere um calendário de conteúdo para o mês de {tema_mes['mes']} com o tema "{tema_mes['tema_principal']}".

Subtemas disponíveis: {', '.join(tema_mes['subtemas'])}

Configurações:
- Posts por semana: {data.posts_por_semana}
- Tipos de conteúdo: {', '.join(data.tipos_conteudo)}
- Tom de comunicação: {tom_info['nome']} ({tom_info['descricao']})

Gere em formato JSON uma lista com {data.posts_por_semana * 4} posts (4 semanas), cada um com:
{{
    "semana": 1-4,
    "dia_semana": "segunda/terça/etc",
    "tipo": "feed/reels/stories/etc",
    "titulo": "título do post",
    "subtema": "subtema relacionado",
    "objetivo": "engajar/educar/vender/inspirar",
    "legenda_sugerida": "legenda completa",
    "hashtags": ["lista", "de", "hashtags"],
    "horario_sugerido": "melhor horário"
}}

Distribua os tipos de conteúdo e objetivos de forma equilibrada.
Responda APENAS com o JSON válido, sem texto adicional."""

    session_id = f"calendario_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(prompt)
        
        # Try to parse JSON
        import json
        try:
            sugestoes = json.loads(response)
        except:
            sugestoes = {"raw_response": response}
        
        # Save suggestions
        await db.calendario_sugestoes.insert_one({
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "mes": data.mes,
            "tema": tema_mes['tema_principal'],
            "sugestoes": sugestoes,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consume credits
        await consume_credits(current_user["id"], 5, f"Calendário: {tema_mes['mes']}")
        
        return {
            "success": True,
            "mes": tema_mes['mes'],
            "tema_principal": tema_mes['tema_principal'],
            "sugestoes": sugestoes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar calendário: {str(e)}")

@app.get("/api/calendario/posts")
async def get_calendar_posts(current_user: dict = Depends(get_current_user)):
    """Get all calendar posts for user"""
    posts = await db.calendar_posts.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).sort("data_agendada", 1).to_list(1000)
    return {"success": True, "posts": posts}

@app.get("/api/calendario/posts/semana")
async def get_calendar_posts_week(current_user: dict = Depends(get_current_user)):
    """Get calendar posts for current week"""
    hoje = datetime.now(timezone.utc)
    inicio_semana = hoje - timedelta(days=hoje.weekday())
    fim_semana = inicio_semana + timedelta(days=6)
    
    posts = await db.calendar_posts.find({
        "user_id": current_user["id"],
        "data_agendada": {
            "$gte": inicio_semana.strftime("%Y-%m-%d"),
            "$lte": fim_semana.strftime("%Y-%m-%d")
        }
    }, {"_id": 0}).sort("data_agendada", 1).to_list(100)
    
    return {
        "success": True,
        "semana": {
            "inicio": inicio_semana.strftime("%Y-%m-%d"),
            "fim": fim_semana.strftime("%Y-%m-%d")
        },
        "posts": posts
    }

@app.post("/api/calendario/posts")
async def create_calendar_post(
    data: CalendarPostCreate, 
    current_user: dict = Depends(get_current_user)
):
    """Create a new calendar post"""
    post_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    post = {
        "id": post_id,
        "user_id": current_user["id"],
        "titulo": data.titulo,
        "tipo": data.tipo,
        "data_agendada": data.data_agendada,
        "horario": data.horario,
        "legenda": data.legenda,
        "hashtags": data.hashtags,
        "tema_mensal": data.tema_mensal,
        "subtema": data.subtema,
        "objetivo": data.objetivo,
        "tom": data.tom,
        "plataforma": data.plataforma,
        "status": "planejado",
        "created_at": now,
        "updated_at": now
    }
    
    await db.calendar_posts.insert_one(post)
    return {"success": True, "post": {k: v for k, v in post.items() if k != "_id"}}

@app.put("/api/calendario/posts/{post_id}")
async def update_calendar_post(
    post_id: str, 
    data: CalendarPostUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update a calendar post"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.calendar_posts.update_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    post = await db.calendar_posts.find_one({"id": post_id}, {"_id": 0})
    return {"success": True, "post": post}

@app.put("/api/calendario/posts/{post_id}/status/{status}")
async def update_post_status(
    post_id: str, 
    status: str, 
    current_user: dict = Depends(get_current_user)
):
    """Update post status (planejado, em_criacao, aprovado, postado)"""
    valid_statuses = ["planejado", "em_criacao", "aprovado", "postado"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid_statuses}")
    
    update_data = {
        "status": status,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    if status == "postado":
        update_data["publicado_em"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.calendar_posts.update_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    return {"success": True, "message": f"Status atualizado para {status}"}

@app.delete("/api/calendario/posts/{post_id}")
async def delete_calendar_post(
    post_id: str, 
    current_user: dict = Depends(get_current_user)
):
    """Delete a calendar post"""
    result = await db.calendar_posts.delete_one(
        {"id": post_id, "user_id": current_user["id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"success": True, "message": "Post removido"}

@app.get("/api/calendario/stats")
async def get_calendar_stats(current_user: dict = Depends(get_current_user)):
    """Get calendar statistics"""
    user_id = current_user["id"]
    
    total = await db.calendar_posts.count_documents({"user_id": user_id})
    planejados = await db.calendar_posts.count_documents({"user_id": user_id, "status": "planejado"})
    em_criacao = await db.calendar_posts.count_documents({"user_id": user_id, "status": "em_criacao"})
    aprovados = await db.calendar_posts.count_documents({"user_id": user_id, "status": "aprovado"})
    postados = await db.calendar_posts.count_documents({"user_id": user_id, "status": "postado"})
    
    # Count by type
    tipos_count = {}
    for tipo in ["feed", "reels", "stories", "bastidores", "cta", "carrossel"]:
        count = await db.calendar_posts.count_documents({"user_id": user_id, "tipo": tipo})
        tipos_count[tipo] = count
    
    # Calculate execution rate
    taxa_execucao = round((postados / total * 100), 1) if total > 0 else 0
    
    return {
        "success": True,
        "stats": {
            "total": total,
            "planejados": planejados,
            "em_criacao": em_criacao,
            "aprovados": aprovados,
            "postados": postados,
            "taxa_execucao": taxa_execucao,
            "por_tipo": tipos_count
        }
    }

@app.post("/api/calendario/gerar-legenda")
async def gerar_legenda_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate 3 caption variations for a post"""
    post = await db.calendar_posts.find_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    prompt = f"""Gere 3 variações de legenda para este post de Instagram:

Título: {post.get('titulo', '')}
Tipo: {post.get('tipo', '')}
Tema: {post.get('tema_mensal', '')}
Subtema: {post.get('subtema', '')}
Objetivo: {post.get('objetivo', '')}

Gere em formato JSON:
{{
    "tecnica": "legenda com tom técnico/científico",
    "emocional": "legenda com tom emocional/acolhedor",
    "venda": "legenda com tom comercial/CTA forte"
}}

Cada legenda deve ter: gancho inicial, corpo, CTA e hashtags.
Responda APENAS com o JSON válido."""

    session_id = f"legenda_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(prompt)
        
        import json
        try:
            legendas = json.loads(response)
        except:
            legendas = {"raw_response": response}
        
        await consume_credits(current_user["id"], 2, "Geração de legendas")
        
        return {
            "success": True,
            "post_id": post_id,
            "legendas": legendas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar legendas: {str(e)}")

# =============================================================================
# CAMPANHAS ELEVARE 360° - SISTEMA DE NEUROVENDAS
# =============================================================================

# Ciclo Neurovendedor - 6 dias de conteúdo estratégico
CICLO_NEUROVENDEDOR = [
    {
        "dia": 1,
        "foco_neuro": "Impacto",
        "cerebro_alvo": "Reptiliano",
        "tipo_conteudo": "Reels / Frase Instintiva",
        "objetivo": "Captar atenção instantânea",
        "gatilhos": ["curiosidade", "medo", "urgência"],
        "exemplo": "O que o espelho te devolveria se pudesse responder hoje?"
    },
    {
        "dia": 2,
        "foco_neuro": "Identificação",
        "cerebro_alvo": "Límbico",
        "tipo_conteudo": "Storytelling / Bastidor",
        "objetivo": "Criar conexão emocional",
        "gatilhos": ["pertencimento", "empatia", "vulnerabilidade"],
        "exemplo": "Eu também já me escondi atrás da blusa larga."
    },
    {
        "dia": 3,
        "foco_neuro": "Autoridade",
        "cerebro_alvo": "Neocórtex",
        "tipo_conteudo": "Dica Técnica / Carrossel",
        "objetivo": "Demonstrar expertise",
        "gatilhos": ["prova", "dados", "credibilidade"],
        "exemplo": "O frio inteligente sinaliza o corpo a eliminar o que não faz mais sentido."
    },
    {
        "dia": 4,
        "foco_neuro": "Educação",
        "cerebro_alvo": "Neocórtex",
        "tipo_conteudo": "Carrossel / Mini Aula",
        "objetivo": "Entregar valor",
        "gatilhos": ["novidade", "transformação", "passo-a-passo"],
        "exemplo": "3 sinais de que sua pele está pedindo ajuda"
    },
    {
        "dia": 5,
        "foco_neuro": "Prova+Oferta",
        "cerebro_alvo": "Límbico/Reptiliano",
        "tipo_conteudo": "Depoimento + CTA",
        "objetivo": "Converter com prova social",
        "gatilhos": ["prova_social", "escassez", "garantia"],
        "exemplo": "Ela entrou tímida, saiu orgulhosa. Quer viver isso com a sua história?"
    },
    {
        "dia": 6,
        "foco_neuro": "Encantamento",
        "cerebro_alvo": "Límbico",
        "tipo_conteudo": "Bastidor / Agradecimento",
        "objetivo": "Fidelizar e encantar",
        "gatilhos": ["reciprocidade", "exclusividade", "comunidade"],
        "exemplo": "Obrigada por confiar. Sua transformação é o meu propósito."
    }
]

@app.get("/api/campanhas/ciclo-neuro")
async def get_ciclo_neurovendedor(current_user: dict = Depends(get_current_user)):
    """Retorna o ciclo neurovendedor de 6 dias"""
    return {
        "success": True,
        "ciclo": CICLO_NEUROVENDEDOR,
        "descricao": "Ciclo biológico da decisão: Instinto → Emoção → Razão"
    }

@app.get("/api/campanhas/stats")
async def get_campanhas_stats(current_user: dict = Depends(get_current_user)):
    """Estatísticas gerais das campanhas"""
    user_id = current_user["id"]
    
    total = await db.campanhas.count_documents({"user_id": user_id})
    em_rascunho = await db.campanhas.count_documents({"user_id": user_id, "status": "rascunho"})
    em_execucao = await db.campanhas.count_documents({"user_id": user_id, "status": "em_execucao"})
    concluidas = await db.campanhas.count_documents({"user_id": user_id, "status": "concluida"})
    
    total_posts = await db.posts_campanha.count_documents({"user_id": user_id})
    posts_postados = await db.posts_campanha.count_documents({"user_id": user_id, "status": "postado"})
    
    taxa_execucao = round((posts_postados / total_posts * 100), 1) if total_posts > 0 else 0
    
    return {
        "success": True,
        "stats": {
            "campanhas_total": total,
            "em_rascunho": em_rascunho,
            "em_execucao": em_execucao,
            "concluidas": concluidas,
            "posts_total": total_posts,
            "posts_postados": posts_postados,
            "taxa_execucao": taxa_execucao
        }
    }

@app.get("/api/campanhas")
async def get_campanhas(current_user: dict = Depends(get_current_user)):
    """Lista todas as campanhas do usuário"""
    campanhas = await db.campanhas.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"success": True, "campanhas": campanhas}

@app.get("/api/campanhas/{campanha_id}")
async def get_campanha(campanha_id: str, current_user: dict = Depends(get_current_user)):
    """Retorna uma campanha específica com seus posts"""
    campanha = await db.campanhas.find_one(
        {"id": campanha_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    # Buscar posts da campanha
    posts = await db.posts_campanha.find(
        {"campanha_id": campanha_id},
        {"_id": 0}
    ).sort("dia_do_ciclo", 1).to_list(10)
    
    return {
        "success": True,
        "campanha": campanha,
        "posts": posts
    }

@app.post("/api/campanhas")
async def create_campanha(data: CampanhaCreate, current_user: dict = Depends(get_current_user)):
    """Cria uma nova campanha"""
    campanha_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    # Calcular data fim baseado na duração
    data_inicio = data.data_inicio or now[:10]
    
    campanha = {
        "id": campanha_id,
        "user_id": current_user["id"],
        "nome": data.nome,
        "objetivo_estrategico": data.objetivo_estrategico,
        "tom_comunicacao": data.tom_comunicacao,
        "emocao_principal": data.emocao_principal,
        "duracao_dias": data.duracao_dias,
        "tema_base": data.tema_base,
        "descricao": data.descricao,
        "data_inicio": data_inicio,
        "status": "rascunho",
        "posts_gerados": 0,
        "posts_postados": 0,
        "created_at": now,
        "updated_at": now
    }
    
    await db.campanhas.insert_one(campanha)
    return {"success": True, "campanha": {k: v for k, v in campanha.items() if k != "_id"}}

@app.put("/api/campanhas/{campanha_id}")
async def update_campanha(
    campanha_id: str,
    data: CampanhaUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza uma campanha"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.campanhas.update_one(
        {"id": campanha_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    campanha = await db.campanhas.find_one({"id": campanha_id}, {"_id": 0})
    return {"success": True, "campanha": campanha}

@app.delete("/api/campanhas/{campanha_id}")
async def delete_campanha(campanha_id: str, current_user: dict = Depends(get_current_user)):
    """Remove uma campanha e seus posts"""
    # Deletar posts da campanha
    await db.posts_campanha.delete_many({"campanha_id": campanha_id})
    
    # Deletar campanha
    result = await db.campanhas.delete_one(
        {"id": campanha_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    return {"success": True, "message": "Campanha removida"}

@app.post("/api/campanhas/{campanha_id}/gerar-sequencia")
async def gerar_sequencia_campanha(
    campanha_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Gera a sequência completa de 6 posts para uma campanha usando IA"""
    campanha = await db.campanhas.find_one(
        {"id": campanha_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    # Verificar deduplicação de tema
    tema_hash = campanha["tema_base"].lower().strip()
    tema_existente = await db.temas_global_pool.find_one({"tema_hash": tema_hash})
    
    if tema_existente:
        # Incrementar uso
        await db.temas_global_pool.update_one(
            {"tema_hash": tema_hash},
            {
                "$inc": {"usos": 1},
                "$set": {"ultimo_uso": datetime.now(timezone.utc).isoformat()}
            }
        )
    else:
        # Registrar novo tema
        await db.temas_global_pool.insert_one({
            "id": str(uuid4()),
            "tema_hash": tema_hash,
            "tema_texto": campanha["tema_base"],
            "usos": 1,
            "primeiro_uso": datetime.now(timezone.utc).isoformat(),
            "ultimo_uso": datetime.now(timezone.utc).isoformat()
        })
    
    # Gerar posts com IA
    tom_info = TONS_COMUNICACAO.get(campanha["tom_comunicacao"].lower(), TONS_COMUNICACAO["acolhedor"])
    
    # Obter identidade da marca para personalização
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    brand_context = ""
    if brand_identity:
        brand_context = f"""
IDENTIDADE DA MARCA:
- Marca: {brand_identity.get('brand_name', 'Não definido')}
- Segmento: {brand_identity.get('segment', 'estética')}
- Especialidade: {brand_identity.get('main_specialty', '')}
- Posicionamento: {brand_identity.get('positioning', '')}
- Estilo Visual: {brand_identity.get('visual_style', '')}
- Frases-chave: {', '.join(brand_identity.get('key_phrases', []))}
"""

    prompt = f"""Você é a LucresIA, especialista em neurovendas para estética. 
Gere uma sequência de 6 posts seguindo o CICLO NEUROVENDEDOR para a campanha:

CAMPANHA: {campanha['nome']}
TEMA BASE: {campanha['tema_base']}
OBJETIVO: {campanha['objetivo_estrategico']}
TOM: {tom_info['nome']} - {tom_info['descricao']}
EMOÇÃO PRINCIPAL: {campanha['emocao_principal']}
{brand_context}
CICLO A SEGUIR:
1. IMPACTO (Reptiliano) - Reels/Frase instintiva - Captar atenção
2. IDENTIFICAÇÃO (Límbico) - Storytelling/Bastidor - Criar conexão
3. AUTORIDADE (Neocórtex) - Dica Técnica/Carrossel - Demonstrar expertise
4. EDUCAÇÃO (Neocórtex) - Carrossel/Mini Aula - Entregar valor
5. PROVA+OFERTA (Límbico/Reptiliano) - Depoimento+CTA - Converter
6. ENCANTAMENTO (Límbico) - Bastidor/Agradecimento - Fidelizar

Para CADA post, gere em JSON:
{{
    "dia": 1-6,
    "titulo": "título curto",
    "tipo_conteudo": "tipo sugerido",
    "legenda": "legenda completa com gancho, corpo e CTA",
    "cta": "call-to-action específico",
    "gatilhos": ["lista", "de", "gatilhos"],
    "dica_visual": "sugestão de visual/design"
}}

Responda APENAS com um array JSON válido dos 6 posts."""

    session_id = f"campanha_{current_user['id']}_{uuid4()}"
    user_context = current_user.get("onboarding_data", {})
    
    lucresia = LucresIA(session_id=session_id, user_context=user_context, brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(prompt)
        
        import json
        try:
            posts_gerados = json.loads(response)
        except:
            # Tentar extrair JSON da resposta
            import re
            json_match = re.search(r'\[[\s\S]*\]', response)
            if json_match:
                posts_gerados = json.loads(json_match.group())
            else:
                raise HTTPException(status_code=500, detail="Erro ao parsear resposta da IA")
        
        # Calcular datas
        from datetime import datetime as dt
        data_inicio = dt.fromisoformat(campanha["data_inicio"].replace("Z", "+00:00")) if "T" in campanha["data_inicio"] else dt.strptime(campanha["data_inicio"], "%Y-%m-%d")
        
        # Criar posts no banco
        posts_criados = []
        for i, post_data in enumerate(posts_gerados):
            ciclo_info = CICLO_NEUROVENDEDOR[i] if i < len(CICLO_NEUROVENDEDOR) else CICLO_NEUROVENDEDOR[-1]
            data_programada = data_inicio + timedelta(days=i)
            
            post = {
                "id": str(uuid4()),
                "campanha_id": campanha_id,
                "user_id": current_user["id"],
                "dia_do_ciclo": i + 1,
                "foco_neuro": ciclo_info["foco_neuro"],
                "cerebro_alvo": ciclo_info["cerebro_alvo"],
                "tipo_conteudo": post_data.get("tipo_conteudo", ciclo_info["tipo_conteudo"]),
                "titulo": post_data.get("titulo", ""),
                "legenda": post_data.get("legenda", ""),
                "cta": post_data.get("cta", ""),
                "gatilhos": post_data.get("gatilhos", ciclo_info["gatilhos"]),
                "dica_visual": post_data.get("dica_visual", ""),
                "data_programada": data_programada.strftime("%Y-%m-%d"),
                "status": "planejado",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.posts_campanha.insert_one(post)
            posts_criados.append({k: v for k, v in post.items() if k != "_id"})
        
        # Atualizar campanha
        await db.campanhas.update_one(
            {"id": campanha_id},
            {
                "$set": {
                    "posts_gerados": len(posts_criados),
                    "status": "em_execucao",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Consumir créditos
        await consume_credits(current_user["id"], 5, f"Sequência campanha: {campanha['nome']}")
        
        return {
            "success": True,
            "message": f"{len(posts_criados)} posts gerados com sucesso",
            "posts": posts_criados
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar sequência: {str(e)}")

@app.get("/api/campanhas/{campanha_id}/posts")
async def get_posts_campanha(campanha_id: str, current_user: dict = Depends(get_current_user)):
    """Lista posts de uma campanha"""
    posts = await db.posts_campanha.find(
        {"campanha_id": campanha_id, "user_id": current_user["id"]},
        {"_id": 0}
    ).sort("dia_do_ciclo", 1).to_list(10)
    
    return {"success": True, "posts": posts}

@app.put("/api/campanhas/posts/{post_id}")
async def update_post_campanha(
    post_id: str,
    data: PostCampanhaUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza um post de campanha"""
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.posts_campanha.update_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    post = await db.posts_campanha.find_one({"id": post_id}, {"_id": 0})
    return {"success": True, "post": post}

@app.post("/api/campanhas/posts/{post_id}/gerar-copy")
async def gerar_copy_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Regenera a copy de um post específico"""
    post = await db.posts_campanha.find_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    campanha = await db.campanhas.find_one({"id": post["campanha_id"]}, {"_id": 0})
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    ciclo_info = next((c for c in CICLO_NEUROVENDEDOR if c["dia"] == post["dia_do_ciclo"]), CICLO_NEUROVENDEDOR[0])
    
    prompt = f"""Gere uma legenda PODEROSA para este post de Instagram:

CONTEXTO DA CAMPANHA:
- Nome: {campanha['nome']}
- Tema: {campanha['tema_base']}
- Tom: {campanha['tom_comunicacao']}
- Emoção: {campanha['emocao_principal']}

ETAPA DO CICLO: {ciclo_info['foco_neuro']} (Dia {post['dia_do_ciclo']})
- Cérebro alvo: {ciclo_info['cerebro_alvo']}
- Objetivo: {ciclo_info['objetivo']}
- Gatilhos: {', '.join(ciclo_info['gatilhos'])}

Tipo de conteúdo: {post['tipo_conteudo']}

Estrutura da legenda:
1. GANCHO (1 linha que para o scroll)
2. CONTEXTO HUMANO (2-3 linhas de conexão)
3. MICROAULA (1-2 linhas de valor)
4. CTA ELEGANTE (1 linha de ação)

Responda em JSON:
{{
    "titulo": "título curto",
    "legenda": "legenda completa",
    "cta": "call-to-action",
    "hashtags": ["5", "hashtags", "relevantes"]
}}"""

    session_id = f"copy_{current_user['id']}_{uuid4()}"
    brand_identity = await get_user_brand_identity(current_user["id"])
    lucresia = LucresIA(session_id=session_id, user_context=current_user.get("onboarding_data", {}), brand_identity=brand_identity)
    
    try:
        response = await lucresia.send_message(prompt)
        
        import json
        try:
            copy_data = json.loads(response)
        except:
            import re
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                copy_data = json.loads(json_match.group())
            else:
                copy_data = {"legenda": response}
        
        # Atualizar post
        await db.posts_campanha.update_one(
            {"id": post_id},
            {
                "$set": {
                    "titulo": copy_data.get("titulo", post.get("titulo", "")),
                    "legenda": copy_data.get("legenda", ""),
                    "cta": copy_data.get("cta", ""),
                    "hashtags": copy_data.get("hashtags", []),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        await consume_credits(current_user["id"], 2, "Regenerar copy")
        
        post_atualizado = await db.posts_campanha.find_one({"id": post_id}, {"_id": 0})
        return {"success": True, "post": post_atualizado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar copy: {str(e)}")

# =============================================================================
# IMAGE GENERATION ROUTES
# =============================================================================

@app.post("/api/images/generate")
async def generate_image(data: GenerateImageRequest, current_user: dict = Depends(get_current_user)):
    """Gera uma imagem a partir de um prompt"""
    try:
        image_gen = get_image_generator()
        result = await image_gen.generate_image(
            prompt=data.prompt,
            style=data.style
        )
        
        if result["success"]:
            await consume_credits(current_user["id"], 5, f"Gerar imagem: {data.prompt[:30]}...")
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao gerar imagem"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar imagem: {str(e)}")

@app.post("/api/campanhas/posts/{post_id}/gerar-imagem")
async def generate_post_image(
    post_id: str,
    data: Optional[GeneratePostImageRequest] = None,
    current_user: dict = Depends(get_current_user)
):
    """Gera uma imagem para um post de campanha específico"""
    # Buscar post
    post = await db.posts_campanha.find_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    # Buscar campanha para contexto
    campanha = await db.campanhas.find_one({"id": post["campanha_id"]}, {"_id": 0})
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    try:
        image_gen = get_image_generator()
        
        # Se tem prompt customizado, usar ele
        if data and data.custom_prompt:
            result = await image_gen.generate_image(
                prompt=data.custom_prompt,
                style="professional"
            )
        else:
            # Gerar imagem baseada no contexto do post
            result = await image_gen.generate_post_image(
                post_title=post.get("titulo", ""),
                post_type=post.get("tipo_conteudo", "Feed"),
                tema_base=campanha.get("tema_base", ""),
                foco_neuro=post.get("foco_neuro", "Impacto"),
                cerebro_alvo=post.get("cerebro_alvo", "Límbico")
            )
        
        if result["success"]:
            # Salvar referência da imagem no post
            await db.posts_campanha.update_one(
                {"id": post_id},
                {
                    "$set": {
                        "imagem_base64": result["image_base64"],
                        "imagem_prompt": result.get("prompt_used", ""),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            await consume_credits(current_user["id"], 5, f"Gerar imagem post: {post.get('titulo', '')[:20]}")
            
            return {
                "success": True,
                "image_base64": result["image_base64"],
                "prompt_used": result.get("prompt_used", ""),
                "post_id": post_id
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao gerar imagem"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar imagem: {str(e)}")

@app.get("/api/campanhas/posts/{post_id}/imagem")
async def get_post_image(post_id: str, current_user: dict = Depends(get_current_user)):
    """Retorna a imagem de um post"""
    post = await db.posts_campanha.find_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"_id": 0, "imagem_base64": 1, "imagem_prompt": 1}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    if not post.get("imagem_base64"):
        return {"success": False, "message": "Este post não tem imagem gerada"}
    
    return {
        "success": True,
        "image_base64": post.get("imagem_base64"),
        "prompt_used": post.get("imagem_prompt", "")
    }

# =============================================================================
# CONTENT VERIFICATION ROUTES
# =============================================================================

@app.post("/api/verify/content")
async def verify_content(data: VerifyContentRequest, current_user: dict = Depends(get_current_user)):
    """Verifica a qualidade e precisão de um conteúdo"""
    try:
        verifier = get_content_verifier()
        result = await verifier.verify_content(data.content, data.content_type)
        
        if result["success"]:
            await consume_credits(current_user["id"], 2, f"Verificação de conteúdo ({data.content_type})")
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro na verificação"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar conteúdo: {str(e)}")

@app.post("/api/verify/campaign/{campanha_id}")
async def verify_campaign(campanha_id: str, current_user: dict = Depends(get_current_user)):
    """Verifica todos os posts de uma campanha"""
    # Buscar campanha
    campanha = await db.campanhas.find_one(
        {"id": campanha_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not campanha:
        raise HTTPException(status_code=404, detail="Campanha não encontrada")
    
    # Buscar posts
    posts = await db.posts_campanha.find(
        {"campanha_id": campanha_id},
        {"_id": 0}
    ).to_list(10)
    
    if not posts:
        raise HTTPException(status_code=400, detail="Campanha não tem posts para verificar")
    
    try:
        verifier = get_content_verifier()
        result = await verifier.verify_campaign_posts(posts)
        
        if result["success"]:
            # Salvar resultado da verificação na campanha
            await db.campanhas.update_one(
                {"id": campanha_id},
                {
                    "$set": {
                        "ultima_verificacao": datetime.now(timezone.utc).isoformat(),
                        "score_verificacao": result.get("score_medio"),
                        "posts_aprovados": result.get("posts_aprovados"),
                        "recomendacao_verificacao": result.get("recomendacao_geral")
                    }
                }
            )
            
            await consume_credits(current_user["id"], len(posts) * 2, f"Verificação de campanha ({len(posts)} posts)")
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro na verificação"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar campanha: {str(e)}")

@app.post("/api/verify/post/{post_id}")
async def verify_post(post_id: str, current_user: dict = Depends(get_current_user)):
    """Verifica um post específico"""
    post = await db.posts_campanha.find_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not post:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    
    content = f"{post.get('titulo', '')}\n\n{post.get('legenda', '')}\n\nCTA: {post.get('cta', '')}"
    
    try:
        verifier = get_content_verifier()
        result = await verifier.verify_content(content, "post de Instagram")
        
        if result["success"]:
            # Salvar resultado da verificação no post
            await db.posts_campanha.update_one(
                {"id": post_id},
                {
                    "$set": {
                        "verificado": True,
                        "score_verificacao": result.get("score_qualidade"),
                        "aprovado": result.get("aprovado"),
                        "alertas_verificacao": result.get("alertas", []),
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            await consume_credits(current_user["id"], 2, "Verificação de post")
            return {**result, "post_id": post_id}
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro na verificação"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao verificar post: {str(e)}")

@app.post("/api/verify/suggest-improvements")
async def suggest_content_improvements(data: SuggestImprovementsRequest, current_user: dict = Depends(get_current_user)):
    """Sugere melhorias para um conteúdo"""
    try:
        verifier = get_content_verifier()
        result = await verifier.suggest_improvements(data.content)
        
        if result["success"]:
            await consume_credits(current_user["id"], 2, "Sugestões de melhoria")
            return result
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao sugerir melhorias"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao sugerir melhorias: {str(e)}")

# =============================================================================
# LEADS ROUTES
# =============================================================================

@app.get("/api/leads")
async def get_leads(current_user: dict = Depends(get_current_user)):
    leads = await db.leads.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return {"success": True, "leads": leads}

@app.post("/api/leads")
async def create_lead(lead_data: LeadCreate, current_user: dict = Depends(get_current_user)):
    lead_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    lead = {
        "id": lead_id,
        "user_id": current_user["id"],
        "nome": lead_data.nome,
        "email": lead_data.email,
        "telefone": lead_data.telefone,
        "procedimento": lead_data.procedimento,
        "origem": lead_data.origem,
        "temperatura": lead_data.temperatura,
        "status": "novo",
        "valor_estimado": lead_data.valor_estimado,
        "observacoes": lead_data.observacoes,
        "created_at": now,
        "updated_at": now,
    }
    
    await db.leads.insert_one(lead)
    return {"success": True, "lead": {k: v for k, v in lead.items() if k != "_id"}}

@app.put("/api/leads/{lead_id}")
async def update_lead(lead_id: str, lead_data: LeadUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in lead_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.leads.update_one(
        {"id": lead_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    return {"success": True, "lead": lead}

@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.leads.delete_one({"id": lead_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    return {"success": True, "message": "Lead removido"}

# =============================================================================
# CALENDAR ROUTES
# =============================================================================

@app.get("/api/calendar/posts")
async def get_calendar_posts(current_user: dict = Depends(get_current_user)):
    posts = await db.calendar_posts.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return {"success": True, "posts": posts}

@app.post("/api/calendar/posts")
async def create_calendar_post(data: CalendarPostCreate, current_user: dict = Depends(get_current_user)):
    post_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    post = {
        "id": post_id,
        "user_id": current_user["id"],
        "titulo": data.titulo,
        "tipo": data.tipo,
        "data_agendada": data.data_agendada,
        "horario": data.horario,
        "legenda": data.legenda,
        "hashtags": data.hashtags,
        "status": "pendente",
        "created_at": now
    }
    
    await db.calendar_posts.insert_one(post)
    return {"success": True, "post": {k: v for k, v in post.items() if k != "_id"}}

@app.put("/api/calendar/posts/{post_id}/publish")
async def mark_post_published(post_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.calendar_posts.update_one(
        {"id": post_id, "user_id": current_user["id"]},
        {"$set": {"status": "publicado", "publicado_em": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"success": True, "message": "Post marcado como publicado"}

@app.delete("/api/calendar/posts/{post_id}")
async def delete_calendar_post(post_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.calendar_posts.delete_one({"id": post_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post não encontrado")
    return {"success": True, "message": "Post removido"}

# =============================================================================
# AGENDAMENTOS ROUTES
# =============================================================================

@app.get("/api/agendamentos")
async def get_agendamentos(current_user: dict = Depends(get_current_user)):
    agendamentos = await db.agendamentos.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(1000)
    return {"success": True, "agendamentos": agendamentos}

@app.post("/api/agendamentos")
async def create_agendamento(data: AgendamentoCreate, current_user: dict = Depends(get_current_user)):
    agendamento_id = str(uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    agendamento = {
        "id": agendamento_id,
        "user_id": current_user["id"],
        "cliente_nome": data.cliente_nome,
        "procedimento": data.procedimento,
        "valor": data.valor,
        "data": data.data,
        "horario": data.horario,
        "status": "pendente",
        "observacoes": data.observacoes,
        "created_at": now,
    }
    
    await db.agendamentos.insert_one(agendamento)
    return {"success": True, "agendamento": {k: v for k, v in agendamento.items() if k != "_id"}}

# =============================================================================
# GENERATED CONTENT ROUTES
# =============================================================================

@app.get("/api/content")
async def get_content(current_user: dict = Depends(get_current_user)):
    content = await db.generated_content.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    return {"success": True, "content": content}

@app.get("/api/ebooks")
async def get_ebooks(current_user: dict = Depends(get_current_user)):
    ebooks = await db.ebooks.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(50)
    return {"success": True, "ebooks": ebooks}

@app.get("/api/personas")
async def get_personas(current_user: dict = Depends(get_current_user)):
    personas = await db.personas.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(50)
    return {"success": True, "personas": personas}

@app.get("/api/scripts")
async def get_scripts(current_user: dict = Depends(get_current_user)):
    scripts = await db.scripts.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(50)
    return {"success": True, "scripts": scripts}

# =============================================================================
# DASHBOARD STATS
# =============================================================================

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Count leads by temperature
    leads_count = await db.leads.count_documents({"user_id": user_id})
    leads_quentes = await db.leads.count_documents({"user_id": user_id, "temperatura": "quente"})
    leads_mornos = await db.leads.count_documents({"user_id": user_id, "temperatura": "morno"})
    
    # Count agendamentos
    agendamentos_count = await db.agendamentos.count_documents({"user_id": user_id})
    
    # Sum faturamento
    pipeline = [
        {"$match": {"user_id": user_id, "status": "realizado"}},
        {"$group": {"_id": None, "total": {"$sum": "$valor"}}}
    ]
    faturamento_result = await db.agendamentos.aggregate(pipeline).to_list(1)
    faturamento = faturamento_result[0]["total"] if faturamento_result else 0
    
    # Content counts
    content_count = await db.generated_content.count_documents({"user_id": user_id})
    ebooks_count = await db.ebooks.count_documents({"user_id": user_id})
    personas_count = await db.personas.count_documents({"user_id": user_id})
    
    return {
        "success": True,
        "stats": {
            "leads_total": leads_count,
            "leads_quentes": leads_quentes,
            "leads_mornos": leads_mornos,
            "agendamentos": agendamentos_count,
            "faturamento": faturamento,
            "conteudos_gerados": content_count,
            "ebooks_gerados": ebooks_count,
            "personas_criadas": personas_count,
            "credits_remaining": current_user.get("credits_remaining", 100),
            "xp": current_user.get("xp", 0),
            "level": current_user.get("level", 1)
        }
    }

# =============================================================================
# SUBSCRIPTION PLANS
# =============================================================================

@app.get("/api/plans")
async def get_plans():
    return {
        "success": True,
        "plans": [
            {
                "id": "essencial",
                "name": "Essencial",
                "price": 57.00,
                "credits": 50,
                "badge": None,
                "tagline": "Créditos focados em vender sem complicar",
                "description": "Para quem está começando a vender com conteúdo inteligente.",
                "limits": {
                    "ebooks": 4,
                    "sites": 1,
                    "slides": 1,
                    "blogs": 0
                },
                "features": [
                    "50 créditos/mês",
                    "Até 4 E-books automáticos (isca ou venda)",
                    "1 Site/landing page por mês",
                    "1 Apresentação de slides",
                    "Carrosséis automáticos",
                    "Bio estratégica (OÁSIS)",
                    "Legendas com NeuroVendas",
                    "Calendário base de conteúdo"
                ],
                "use_case": "1-2 e-books/mês + posts estratégicos",
                "result": "Começa a captar leads e parecer profissional",
                "guarantee": "7 dias de garantia incondicional"
            },
            {
                "id": "profissional",
                "name": "Profissional",
                "price": 107.00,
                "credits": 150,
                "badge": "MAIS POPULAR",
                "tagline": "Instagram vira canal de vendas",
                "description": "Para quem quer previsibilidade, não só presença.",
                "limits": {
                    "ebooks": 6,
                    "sites": 2,
                    "slides": 3,
                    "blogs": 4
                },
                "features": [
                    "150 créditos/mês",
                    "Tudo do Essencial +",
                    "Até 6 E-books em volume estratégico",
                    "2 Sites/landing pages",
                    "3 Apresentações de slides",
                    "4 Artigos SEO para blog",
                    "Stories e carrosséis em sequência",
                    "Scripts de WhatsApp que fecham agenda",
                    "Calendário de Vendas Estratégico"
                ],
                "use_case": "3-6 e-books/mês + site + conteúdo recorrente",
                "result": "Instagram vira canal de vendas real",
                "guarantee": "7 dias de garantia incondicional"
            },
            {
                "id": "premium",
                "name": "Premium",
                "price": 197.00,
                "credits": 350,
                "badge": "ESCALA",
                "tagline": "Marketing vira sistema, não tarefa",
                "description": "Para clínicas que pensam como empresa.",
                "limits": {
                    "ebooks": 10,
                    "sites": 2,
                    "slides": 5,
                    "blogs": 10
                },
                "features": [
                    "350 créditos/mês",
                    "Tudo do Profissional +",
                    "Até 10 E-books em escala comercial",
                    "2 Sites de campanha",
                    "5 Apresentações (propostas, aulas)",
                    "10 Artigos SEO/mês para blog",
                    "Campanhas automatizadas",
                    "Dashboard e dados estratégicos",
                    "Suporte VIP WhatsApp"
                ],
                "use_case": "8-15 e-books/mês + páginas + campanhas",
                "result": "Marketing vira sistema automatizado",
                "guarantee": "7 dias de garantia incondicional"
            }
        ],
        "philosophy": "Aqui você não compra promessas infinitas. Compra créditos que viram conteúdo, leads e vendas.",
        "upsells": {
            "ebooks_extra_5": {"price": 39, "description": "+5 e-books extras"},
            "site_extra": {"price": 29, "description": "+1 site/landing extra"},
            "slides_extra_3": {"price": 19, "description": "+3 apresentações extras"}
        }
    }

# =============================================================================
# BRAND IDENTITY ROUTES (Construtor de Personalidade da Marca - Estética)
# =============================================================================

# Configurações de segmentos e opções
BRAND_SEGMENTS = [
    {"id": "estetica_geral", "label": "Estética Geral"},
    {"id": "criomodelagem", "label": "Criomodelagem"},
    {"id": "harmonizacao", "label": "Harmonização Facial"},
    {"id": "clinica_premium", "label": "Clínica Premium"},
    {"id": "corporal", "label": "Estética Corporal"},
    {"id": "facial", "label": "Estética Facial"},
    {"id": "spa_wellness", "label": "Spa & Bem-estar"},
]

BRAND_SPECIALTIES = [
    {"id": "criolipólise", "label": "Criolipólise"},
    {"id": "corporal", "label": "Tratamentos Corporais"},
    {"id": "facial", "label": "Tratamentos Faciais"},
    {"id": "emagrecimento", "label": "Emagrecimento Estético"},
    {"id": "harmonizacao", "label": "Harmonização"},
    {"id": "laser", "label": "Laser e Luz Pulsada"},
    {"id": "massagem", "label": "Massoterapia"},
    {"id": "depilacao", "label": "Depilação"},
]

BRAND_POSITIONING = [
    {"id": "acessivel", "label": "Acessível", "desc": "Preços competitivos, volume alto"},
    {"id": "premium", "label": "Premium", "desc": "Alto padrão, experiência exclusiva"},
    {"id": "autoridade_tecnica", "label": "Autoridade Técnica", "desc": "Foco em resultados científicos"},
    {"id": "acolhedora", "label": "Acolhedora", "desc": "Humanizada, conexão emocional"},
    {"id": "inovadora", "label": "Inovadora", "desc": "Tecnologia de ponta"},
]

VISUAL_STYLES = [
    {"id": "clean", "label": "Clean", "desc": "Minimalista e moderno"},
    {"id": "sofisticado", "label": "Sofisticado", "desc": "Elegante e refinado"},
    {"id": "feminino", "label": "Feminino", "desc": "Delicado e acolhedor"},
    {"id": "clinico", "label": "Clínico", "desc": "Profissional e técnico"},
    {"id": "natural", "label": "Natural", "desc": "Orgânico e acolhedor"},
    {"id": "luxuoso", "label": "Luxuoso", "desc": "Premium e exclusivo"},
]

FONT_STYLES = [
    {"id": "moderna", "label": "Moderna", "fonts": ["Montserrat", "Poppins", "Inter"]},
    {"id": "classica", "label": "Clássica", "fonts": ["Playfair Display", "Cormorant", "Libre Baskerville"]},
    {"id": "minimalista", "label": "Minimalista", "fonts": ["Roboto", "Open Sans", "Lato"]},
    {"id": "elegante", "label": "Elegante", "fonts": ["Italiana", "Didot", "Bodoni"]},
]

@app.get("/api/brand-identity/options")
async def get_brand_identity_options(current_user: dict = Depends(get_current_user)):
    """Retorna todas as opções disponíveis para configuração da marca"""
    return {
        "success": True,
        "options": {
            "segments": BRAND_SEGMENTS,
            "specialties": BRAND_SPECIALTIES,
            "positioning": BRAND_POSITIONING,
            "visual_styles": VISUAL_STYLES,
            "font_styles": FONT_STYLES,
        }
    }

@app.get("/api/brand-identity")
async def get_brand_identity(current_user: dict = Depends(get_current_user)):
    """Retorna a identidade de marca do usuário"""
    identity = await db.brand_identity.find_one(
        {"user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not identity:
        return {
            "success": True,
            "identity": {
                "user_id": current_user["id"],
                "brand_name": None,
                "segment": None,
                "main_specialty": None,
                "positioning": None,
                "colors": {
                    "primary": "#7C3AED",
                    "secondary": "#8B5CF6",
                    "accent": "#F59E0B",
                    "background": "#FFFFFF"
                },
                "preferred_font": "Montserrat",
                "font_style": "moderna",
                "visual_style": "clean",
                "logo_base64": None,
                "professional_photos": [],
                "clinic_photos": [],
                "appearance_mode": "sometimes",
                "key_phrases": [],
                "instagram_handle": None,
                "website": None,
                "setup_completed": False,
                "created_at": None,
                "updated_at": None
            },
            "is_new": True
        }
    
    return {"success": True, "identity": identity, "is_new": False}

@app.post("/api/brand-identity")
async def create_or_update_brand_identity(
    data: BrandIdentityCreate,
    current_user: dict = Depends(get_current_user)
):
    """Cria ou atualiza a identidade de marca"""
    now = datetime.now(timezone.utc).isoformat()
    
    existing = await db.brand_identity.find_one({"user_id": current_user["id"]})
    
    identity_data = {
        "user_id": current_user["id"],
        "brand_name": data.brand_name,
        "segment": data.segment,
        "main_specialty": data.main_specialty,
        "positioning": data.positioning,
        "colors": data.colors.dict() if data.colors else {
            "primary": "#7C3AED", "secondary": "#8B5CF6", 
            "accent": "#F59E0B", "background": "#FFFFFF"
        },
        "preferred_font": data.preferred_font or "Montserrat",
        "font_style": data.font_style or "moderna",
        "visual_style": data.visual_style or "clean",
        "logo_base64": data.logo_base64,
        "professional_photos": data.professional_photos or [],
        "clinic_photos": data.clinic_photos or [],
        "appearance_mode": data.appearance_mode or "sometimes",
        "key_phrases": data.key_phrases or [],
        "instagram_handle": data.instagram_handle,
        "website": data.website,
        "setup_completed": data.setup_completed or False,
        "updated_at": now
    }
    
    if existing:
        await db.brand_identity.update_one(
            {"user_id": current_user["id"]},
            {"$set": identity_data}
        )
    else:
        identity_data["id"] = str(uuid4())
        identity_data["created_at"] = now
        await db.brand_identity.insert_one(identity_data)
    
    result = await db.brand_identity.find_one(
        {"user_id": current_user["id"]},
        {"_id": 0}
    )
    
    return {"success": True, "identity": result, "message": "Identidade da marca salva com sucesso"}

@app.put("/api/brand-identity")
async def update_brand_identity(
    data: BrandIdentityUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualiza campos específicos da identidade de marca"""
    update_data = {}
    
    for field in [
        "brand_name", "segment", "main_specialty", "positioning",
        "preferred_font", "font_style", "visual_style", "logo_base64",
        "professional_photos", "clinic_photos", "appearance_mode",
        "key_phrases", "instagram_handle", "website", "setup_completed"
    ]:
        value = getattr(data, field, None)
        if value is not None:
            update_data[field] = value
    
    if data.colors is not None:
        update_data["colors"] = data.colors.dict()
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Nenhum campo para atualizar")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.brand_identity.update_one(
        {"user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        # Create new if doesn't exist
        identity_data = {
            "id": str(uuid4()),
            "user_id": current_user["id"],
            "brand_name": None,
            "segment": None,
            "main_specialty": None,
            "positioning": None,
            "colors": {"primary": "#7C3AED", "secondary": "#8B5CF6", "accent": "#F59E0B", "background": "#FFFFFF"},
            "preferred_font": "Montserrat",
            "font_style": "moderna",
            "visual_style": "clean",
            "logo_base64": None,
            "professional_photos": [],
            "clinic_photos": [],
            "appearance_mode": "sometimes",
            "key_phrases": [],
            "instagram_handle": None,
            "website": None,
            "setup_completed": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            **update_data
        }
        await db.brand_identity.insert_one(identity_data)
    
    identity = await db.brand_identity.find_one(
        {"user_id": current_user["id"]},
        {"_id": 0}
    )
    
    return {"success": True, "identity": identity}

@app.delete("/api/brand-identity/logo")
async def delete_brand_identity_logo(current_user: dict = Depends(get_current_user)):
    """Remove o logo da marca"""
    result = await db.brand_identity.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"logo_base64": None, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Identidade de marca não encontrada")
    
    return {"success": True, "message": "Logo removido"}

@app.delete("/api/brand-identity/professional-photo/{index}")
async def delete_professional_photo(index: int, current_user: dict = Depends(get_current_user)):
    """Remove uma foto da profissional pelo índice"""
    identity = await db.brand_identity.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not identity:
        raise HTTPException(status_code=404, detail="Identidade de marca não encontrada")
    
    photos = identity.get("professional_photos", [])
    if index < 0 or index >= len(photos):
        raise HTTPException(status_code=400, detail="Índice inválido")
    
    photos.pop(index)
    await db.brand_identity.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"professional_photos": photos, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Foto removida"}

@app.delete("/api/brand-identity/clinic-photo/{index}")
async def delete_clinic_photo(index: int, current_user: dict = Depends(get_current_user)):
    """Remove uma foto da clínica pelo índice"""
    identity = await db.brand_identity.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    if not identity:
        raise HTTPException(status_code=404, detail="Identidade de marca não encontrada")
    
    photos = identity.get("clinic_photos", [])
    if index < 0 or index >= len(photos):
        raise HTTPException(status_code=400, detail="Índice inválido")
    
    photos.pop(index)
    await db.brand_identity.update_one(
        {"user_id": current_user["id"]},
        {"$set": {"clinic_photos": photos, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Foto removida"}

@app.post("/api/brand-identity/generate-campaign-image")
async def generate_campaign_image(
    data: GenerateCampaignImageRequest,
    current_user: dict = Depends(get_current_user)
):
    """Gera imagem de campanha usando a identidade da marca"""
    identity = await db.brand_identity.find_one(
        {"user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not identity or not identity.get("setup_completed"):
        raise HTTPException(
            status_code=400, 
            detail="Configure a identidade da sua marca primeiro"
        )
    
    # Construir prompt baseado na identidade da marca
    brand_context = f"""
MARCA: {identity.get('brand_name', 'Clínica de Estética')}
SEGMENTO: {identity.get('segment', 'estética')}
ESPECIALIDADE: {identity.get('main_specialty', 'tratamentos estéticos')}
POSICIONAMENTO: {identity.get('positioning', 'profissional')}
ESTILO VISUAL: {identity.get('visual_style', 'clean')}
CORES: Primária {identity.get('colors', {}).get('primary', '#7C3AED')}, 
       Secundária {identity.get('colors', {}).get('secondary', '#8B5CF6')}, 
       Destaque {identity.get('colors', {}).get('accent', '#F59E0B')}
"""
    
    campaign_prompts = {
        "carrossel": "arte para carrossel do Instagram, design profissional de agência",
        "anuncio": "anúncio para Meta Ads, visual impactante e conversivo",
        "post": "post para feed do Instagram, estética premium",
        "capa": "capa para destaque do Instagram, design elegante",
        "stories": "arte para stories, formato vertical 9:16",
    }
    
    campaign_format = campaign_prompts.get(data.campaign_type, "arte para redes sociais")
    
    prompt = f"""Crie uma {campaign_format} para uma clínica de estética.

CONTEXTO DA MARCA:
{brand_context}

TEMA DA CAMPANHA: {data.campaign_theme}

A imagem deve:
- Seguir a paleta de cores da marca
- Ter estilo visual {identity.get('visual_style', 'clean')}
- Parecer feita por agência profissional
- NÃO parecer imagem genérica de banco ou IA óbvia
- Transmitir {identity.get('positioning', 'profissionalismo')}

{data.custom_prompt or ''}
"""
    
    try:
        image_gen = get_image_generator()
        result = await image_gen.generate_image(
            prompt=prompt,
            style="professional"
        )
        
        if result["success"]:
            await consume_credits(current_user["id"], 5, f"Imagem de campanha: {data.campaign_type}")
            return {
                "success": True,
                "image_base64": result["image_base64"],
                "prompt_used": prompt,
                "campaign_type": data.campaign_type
            }
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Erro ao gerar imagem"))
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar imagem: {str(e)}")

@app.post("/api/brand-identity/analyze")
async def analyze_brand_identity_ai(
    data: AnalyzeBrandRequest,
    current_user: dict = Depends(get_current_user)
):
    """Analisa perfil e sugere configurações de identidade"""
    prompt = f"""Você é uma diretora de arte e estrategista de marketing especializada em estética.
Analise as informações e sugira a configuração de identidade visual perfeita.

INFORMAÇÕES:
- Instagram: {data.instagram_handle or 'Não informado'}
- Bio: {data.bio_text or 'Não informada'}
- Conteúdo: {data.sample_content or 'Não informado'}

Sugira em JSON:
{{
    "segment": "segmento ideal",
    "main_specialty": "especialidade identificada",
    "positioning": "posicionamento recomendado (acessivel/premium/autoridade_tecnica/acolhedora/inovadora)",
    "colors": {{
        "primary": "#hex",
        "secondary": "#hex",
        "accent": "#hex",
        "background": "#hex"
    }},
    "font_style": "moderna/classica/minimalista/elegante",
    "visual_style": "clean/sofisticado/feminino/clinico/natural/luxuoso",
    "key_phrases": ["até 5 frases-chave"],
    "reasoning": "explicação das escolhas"
}}"""

    session_id = f"brand_ai_{current_user['id']}_{uuid4()}"
    existing_brand = await get_user_brand_identity(current_user["id"])
    lucresia = LucresIA(session_id=session_id, user_context=current_user.get("onboarding_data", {}), brand_identity=existing_brand)
    
    try:
        response = await lucresia.send_message(prompt)
        
        import json
        import re
        
        try:
            suggestions = json.loads(response)
        except:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                suggestions = json.loads(json_match.group())
            else:
                suggestions = {"raw_response": response}
        
        await consume_credits(current_user["id"], 3, "Análise de identidade com IA")
        
        return {"success": True, "suggestions": suggestions}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na análise: {str(e)}")

# =============================================================================
# SEO BLOG GENERATOR ROUTES (Fábrica de Conteúdo SEO)
# =============================================================================

@app.get("/api/seo/article-types")
async def get_seo_article_types(current_user: dict = Depends(get_current_user)):
    """Retorna tipos de artigo disponíveis para geração SEO"""
    return {
        "success": True,
        "article_types": [
            {"id": k, "name": v["name"], "description": v["description"], "word_count": v["word_count"]}
            for k, v in ARTICLE_TYPES.items()
        ]
    }

@app.get("/api/seo/awareness-levels")
async def get_seo_awareness_levels(current_user: dict = Depends(get_current_user)):
    """Retorna níveis de consciência do leitor"""
    return {
        "success": True,
        "awareness_levels": [
            {"id": k, "name": v["name"], "description": v["description"], "approach": v["approach"]}
            for k, v in AWARENESS_LEVELS.items()
        ]
    }

@app.post("/api/seo/generate-article")
async def generate_seo_article(data: SEOArticleGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Gera artigo SEO completo otimizado para Google"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    
    # Determinar o tema (suporta ambos os campos)
    topic = data.topic or data.tema or data.keyword
    
    # Construir instruções customizadas com novos campos
    custom_parts = []
    if data.objetivo:
        custom_parts.append(f"Objetivo do conteúdo: {data.objetivo}")
    if data.dores:
        custom_parts.append(f"Dores que o texto resolve: {data.dores}")
    if data.publico:
        custom_parts.append(f"Público-alvo: {data.publico}")
    if data.enquadramento:
        custom_parts.append(f"Enquadramento clínico: {data.enquadramento}")
    if data.custom_instructions:
        custom_parts.append(data.custom_instructions)
    
    full_instructions = "\n".join(custom_parts) if custom_parts else None
    
    generator = get_seo_blog_generator(brand_identity=brand_identity)
    
    try:
        article = await generator.generate_article(
            keyword=data.keyword,
            topic=topic,
            article_type=data.article_type,
            awareness_level=data.awareness_level,
            location=data.location,
            tone=data.tone,
            include_faq=data.include_faq,
            custom_instructions=full_instructions
        )
        
        # Salvar artigo gerado
        article_id = str(uuid4())
        await db.seo_articles.insert_one({
            "id": article_id,
            "user_id": current_user["id"],
            "keyword": data.keyword,
            "topic": topic,
            "article_type": data.article_type,
            "objetivo": data.objetivo,
            "dores": data.dores,
            "publico": data.publico,
            "enquadramento": data.enquadramento,
            "article": article,
            "status": "rascunho",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Consumir créditos (5 para artigo SEO completo)
        await consume_credits(current_user["id"], 5, f"Artigo SEO: {data.keyword}")
        
        return {
            "success": True,
            "article_id": article_id,
            "article": article,
            "content": article,  # Alias para compatibilidade
            "brand_identity_applied": brand_identity is not None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar artigo: {str(e)}")

@app.post("/api/seo/generate-ideas")
async def generate_seo_ideas(data: SEOArticleIdeasRequest, current_user: dict = Depends(get_current_user)):
    """Gera ideias de artigos baseadas na especialidade"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_seo_blog_generator(brand_identity=brand_identity)
    
    try:
        ideas = await generator.generate_article_ideas(
            specialty=data.specialty,
            location=data.location,
            count=data.count
        )
        
        # Consumir 2 créditos
        await consume_credits(current_user["id"], 2, f"Ideias SEO: {data.specialty}")
        
        return {
            "success": True,
            "ideas": ideas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar ideias: {str(e)}")

@app.post("/api/seo/improve-article")
async def improve_seo_article(data: SEOArticleImproveRequest, current_user: dict = Depends(get_current_user)):
    """Analisa e melhora um artigo existente para SEO"""
    brand_identity = await get_user_brand_identity(current_user["id"])
    generator = get_seo_blog_generator(brand_identity=brand_identity)
    
    try:
        improvements = await generator.improve_article(
            content=data.content,
            keyword=data.keyword,
            feedback=data.feedback
        )
        
        # Consumir 3 créditos
        await consume_credits(current_user["id"], 3, f"Melhoria SEO: {data.keyword}")
        
        return {
            "success": True,
            "improvements": improvements
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao melhorar artigo: {str(e)}")

@app.get("/api/seo/articles")
async def list_seo_articles(current_user: dict = Depends(get_current_user)):
    """Lista artigos SEO do usuário"""
    articles = await db.seo_articles.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"success": True, "articles": articles}

@app.get("/api/seo/articles/{article_id}")
async def get_seo_article(article_id: str, current_user: dict = Depends(get_current_user)):
    """Obtém um artigo SEO específico"""
    article = await db.seo_articles.find_one(
        {"id": article_id, "user_id": current_user["id"]},
        {"_id": 0}
    )
    
    if not article:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"success": True, "article": article}

@app.put("/api/seo/articles/{article_id}")
async def update_seo_article(article_id: str, data: SEOArticleUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Atualiza um artigo SEO"""
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    
    if data.title:
        update_data["article.title"] = data.title
    if data.content:
        update_data["article.content"] = data.content
    if data.meta_description:
        update_data["article.meta_description"] = data.meta_description
    if data.status:
        update_data["status"] = data.status
    if data.published_url:
        update_data["published_url"] = data.published_url
    
    result = await db.seo_articles.update_one(
        {"id": article_id, "user_id": current_user["id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"success": True, "message": "Artigo atualizado"}

@app.delete("/api/seo/articles/{article_id}")
async def delete_seo_article(article_id: str, current_user: dict = Depends(get_current_user)):
    """Deleta um artigo SEO"""
    result = await db.seo_articles.delete_one(
        {"id": article_id, "user_id": current_user["id"]}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artigo não encontrado")
    
    return {"success": True, "message": "Artigo deletado"}

@app.get("/api/seo/stats")
async def get_seo_stats(current_user: dict = Depends(get_current_user)):
    """Retorna estatísticas de SEO do usuário"""
    user_id = current_user["id"]
    
    total = await db.seo_articles.count_documents({"user_id": user_id})
    rascunhos = await db.seo_articles.count_documents({"user_id": user_id, "status": "rascunho"})
    publicados = await db.seo_articles.count_documents({"user_id": user_id, "status": "publicado"})
    
    # Calcular score médio de SEO
    articles = await db.seo_articles.find(
        {"user_id": user_id},
        {"article.seo_score.score": 1}
    ).to_list(100)
    
    scores = [a.get("article", {}).get("seo_score", {}).get("score", 0) for a in articles if a.get("article", {}).get("seo_score")]
    avg_score = round(sum(scores) / len(scores)) if scores else 0
    
    # Nível de autoridade baseado em artigos publicados
    if publicados >= 50:
        authority_level = "Platina"
    elif publicados >= 30:
        authority_level = "Ouro"
    elif publicados >= 15:
        authority_level = "Prata"
    elif publicados >= 5:
        authority_level = "Bronze"
    else:
        authority_level = "Iniciante"
    
    return {
        "success": True,
        "stats": {
            "total_articles": total,
            "rascunhos": rascunhos,
            "publicados": publicados,
            "avg_seo_score": avg_score,
            "authority_level": authority_level,
            "authority_progress": min(publicados, 50),
            "authority_next_level": 50 if authority_level != "Platina" else 50
        }
    }

# =============================================================================
# GAMIFICATION ROUTES (Sistema de Créditos e Recompensas)
# =============================================================================

@app.get("/api/credits/balance")
async def get_credits_balance(current_user: dict = Depends(get_current_user)):
    """Retorna saldo de créditos do usuário"""
    return {
        "success": True,
        "credits": current_user.get("credits_remaining", 0),
        "monthly_limit": current_user.get("monthly_credits_limit", 100),
        "plan": current_user.get("plan", "FREE")
    }

@app.get("/api/credits/history")
async def get_credits_history(current_user: dict = Depends(get_current_user)):
    """Retorna histórico de uso de créditos"""
    logs = await db.credit_logs.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    
    return {"success": True, "history": logs}

@app.get("/api/credits/costs")
async def get_credit_costs(current_user: dict = Depends(get_current_user)):
    """Retorna tabela de custos de créditos por recurso"""
    return {
        "success": True,
        "costs": CREDIT_COSTS
    }

@app.get("/api/gamification/rewards")
async def get_available_rewards(current_user: dict = Depends(get_current_user)):
    """Retorna recompensas disponíveis e status de cada uma"""
    user_id = current_user["id"]
    
    # Buscar recompensas já resgatadas
    claimed = await db.rewards_claimed.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    claimed_types = {r["reward_type"]: r for r in claimed}
    
    rewards_status = []
    for reward_type, reward_info in GAMIFICATION_REWARDS.items():
        claimed_data = claimed_types.get(reward_type)
        
        if reward_info.get("one_time"):
            available = claimed_data is None
            claimed_count = 1 if claimed_data else 0
        else:
            claimed_count = claimed_data.get("count", 0) if claimed_data else 0
            max_limit = reward_info.get("max_per_month", reward_info.get("max_per_day", 999))
            available = claimed_count < max_limit
        
        rewards_status.append({
            "type": reward_type,
            "credits": reward_info["credits"],
            "description": reward_info["description"],
            "one_time": reward_info.get("one_time", False),
            "available": available,
            "claimed_count": claimed_count
        })
    
    return {"success": True, "rewards": rewards_status}

@app.post("/api/gamification/claim")
async def claim_reward(data: ClaimRewardRequest, current_user: dict = Depends(get_current_user)):
    """Resgata uma recompensa de gamificação"""
    user_id = current_user["id"]
    reward_type = data.reward_type
    
    # Verificar se recompensa existe
    if reward_type not in GAMIFICATION_REWARDS:
        raise HTTPException(status_code=400, detail="Tipo de recompensa inválido")
    
    reward_info = GAMIFICATION_REWARDS[reward_type]
    
    # Verificar se já resgatou (para one_time)
    existing = await db.rewards_claimed.find_one({
        "user_id": user_id,
        "reward_type": reward_type
    })
    
    if reward_info.get("one_time") and existing:
        raise HTTPException(status_code=400, detail="Você já resgatou esta recompensa")
    
    # Para recompensas recorrentes, verificar limite
    if not reward_info.get("one_time"):
        count = existing.get("count", 0) if existing else 0
        max_limit = reward_info.get("max_per_month", reward_info.get("max_per_day", 999))
        if count >= max_limit:
            raise HTTPException(status_code=400, detail="Limite de resgates atingido")
    
    # Adicionar créditos
    credits_earned = reward_info["credits"]
    await add_credits(user_id, credits_earned, reward_info["description"], reward_type)
    
    # Registrar resgate
    if existing:
        await db.rewards_claimed.update_one(
            {"user_id": user_id, "reward_type": reward_type},
            {
                "$inc": {"count": 1},
                "$set": {"last_claimed": datetime.now(timezone.utc).isoformat()}
            }
        )
    else:
        await db.rewards_claimed.insert_one({
            "id": str(uuid4()),
            "user_id": user_id,
            "reward_type": reward_type,
            "count": 1,
            "proof_url": data.proof_url,
            "first_claimed": datetime.now(timezone.utc).isoformat(),
            "last_claimed": datetime.now(timezone.utc).isoformat()
        })
    
    # Buscar novo saldo
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "credits_remaining": 1})
    
    return {
        "success": True,
        "message": f"Parabéns! Você ganhou {credits_earned} créditos!",
        "credits_earned": credits_earned,
        "new_balance": user.get("credits_remaining", 0)
    }

@app.get("/api/gamification/referral-code")
async def get_referral_code(current_user: dict = Depends(get_current_user)):
    """Retorna código de indicação do usuário"""
    user_id = current_user["id"]
    
    # Verificar se já tem código
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "referral_code": 1})
    
    if not user.get("referral_code"):
        # Gerar código único
        code = f"ELEV{user_id[:6].upper()}"
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"referral_code": code}}
        )
    else:
        code = user["referral_code"]
    
    # Contar indicações
    referrals = await db.referrals.find({"referrer_id": user_id}).to_list(100)
    total_signups = len(referrals)
    total_paid = len([r for r in referrals if r.get("converted_paid")])
    total_credits_earned = sum(r.get("credits_earned", 0) for r in referrals)
    
    return {
        "success": True,
        "referral_code": code,
        "referral_link": f"https://neurovendas.elevare.com.br/register?ref={code}",
        "stats": {
            "total_signups": total_signups,
            "total_paid": total_paid,
            "total_credits_earned": total_credits_earned
        }
    }

@app.post("/api/gamification/apply-referral")
async def apply_referral_code(data: ReferralCodeRequest, current_user: dict = Depends(get_current_user)):
    """Aplica código de indicação (para novo usuário)"""
    user_id = current_user["id"]
    code = data.code.upper()
    
    # Verificar se usuário já usou um código
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "referred_by": 1, "created_at": 1})
    
    if user.get("referred_by"):
        raise HTTPException(status_code=400, detail="Você já utilizou um código de indicação")
    
    # Verificar se código existe
    referrer = await db.users.find_one({"referral_code": code}, {"_id": 0, "id": 1, "name": 1})
    
    if not referrer:
        raise HTTPException(status_code=404, detail="Código de indicação inválido")
    
    if referrer["id"] == user_id:
        raise HTTPException(status_code=400, detail="Você não pode usar seu próprio código")
    
    # Registrar indicação
    referral_id = str(uuid4())
    await db.referrals.insert_one({
        "id": referral_id,
        "referrer_id": referrer["id"],
        "referred_id": user_id,
        "code_used": code,
        "converted_paid": False,
        "credits_earned": 25,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Marcar usuário como indicado
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"referred_by": referrer["id"]}}
    )
    
    # Dar créditos ao indicador
    await add_credits(referrer["id"], 25, f"Indicação: novo cadastro", "referral_signup")
    
    # Dar bônus ao novo usuário também
    await add_credits(user_id, 10, "Bônus: cadastro por indicação", "referral_bonus")
    
    return {
        "success": True,
        "message": "Código aplicado! Você ganhou 10 créditos de bônus!",
        "credits_earned": 10
    }

@app.get("/api/gamification/leaderboard")
async def get_leaderboard(current_user: dict = Depends(get_current_user)):
    """Retorna ranking de usuários por créditos ganhos"""
    # Top 10 usuários com mais créditos ganhos por indicação
    pipeline = [
        {"$match": {"amount": {"$gt": 0}}},
        {"$group": {
            "_id": "$user_id",
            "total_earned": {"$sum": "$amount"}
        }},
        {"$sort": {"total_earned": -1}},
        {"$limit": 10}
    ]
    
    top_users = await db.credit_logs.aggregate(pipeline).to_list(10)
    
    leaderboard = []
    for i, item in enumerate(top_users):
        user = await db.users.find_one({"id": item["_id"]}, {"_id": 0, "name": 1, "email": 1})
        if user:
            name = user.get("name", user.get("email", "").split("@")[0])
            # Mascarar parte do nome
            masked_name = name[:2] + "***" + name[-1] if len(name) > 3 else name
            leaderboard.append({
                "rank": i + 1,
                "name": masked_name,
                "credits_earned": item["total_earned"],
                "is_you": item["_id"] == current_user["id"]
            })
    
    return {"success": True, "leaderboard": leaderboard}

@app.get("/api/gamification/social-links")
async def get_social_links():
    """Retorna links das redes sociais Elevare"""
    return {
        "success": True,
        "social_links": {
            "instagram": "https://instagram.com/elevare.estetica",
            "youtube": "https://youtube.com/@elevare",
            "tiktok": "https://tiktok.com/@elevare",
            "linkedin": "https://linkedin.com/company/elevare"
        }
    }

# =============================================================================
# STRIPE PAYMENT ROUTES
# =============================================================================

@app.post("/api/payments/create-checkout")
async def create_checkout_session(data: SubscriptionCheckoutRequest, request: Request, current_user: dict = Depends(get_current_user)):
    """Cria sessão de checkout do Stripe para assinatura"""
    
    # Validar plano
    if data.plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=400, detail="Plano inválido")
    
    plan = SUBSCRIPTION_PLANS[data.plan_id]
    
    # Configurar Stripe
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    if not stripe_api_key:
        raise HTTPException(status_code=500, detail="Stripe não configurado")
    
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url=webhook_url)
    
    # Construir URLs de sucesso/cancelamento
    origin = data.origin_url.rstrip("/")
    success_url = f"{origin}/dashboard/planos?session_id={{CHECKOUT_SESSION_ID}}&status=success"
    cancel_url = f"{origin}/dashboard/planos?status=cancelled"
    
    # Metadata para rastrear
    metadata = {
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "plan_id": data.plan_id,
        "plan_name": plan["name"],
        "credits": str(plan["credits"])
    }
    
    try:
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
        
        return {
            "success": True,
            "checkout_url": session.url,
            "session_id": session.session_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar checkout: {str(e)}")

@app.get("/api/payments/status/{session_id}")
async def get_payment_status(session_id: str, current_user: dict = Depends(get_current_user)):
    """Verifica status do pagamento e atualiza se necessário"""
    
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
            "already_processed": True
        }
    
    # Verificar status no Stripe
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=stripe_api_key, webhook_url="")
    
    try:
        status_response = await stripe_checkout.get_checkout_status(session_id)
        
        # Atualizar transação
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
                            "plan": transaction["plan_id"],
                            "plan_name": plan["name"],
                            "subscription_active": True,
                            "subscription_updated_at": datetime.now(timezone.utc).isoformat()
                        },
                        "$inc": {"credits_remaining": plan["credits"]}
                    }
                )
                
                update_data["credits_added"] = plan["credits"]
                update_data["processed_at"] = datetime.now(timezone.utc).isoformat()
        
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
        raise HTTPException(status_code=500, detail=f"Erro ao verificar status: {str(e)}")

@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request):
    """Webhook para eventos do Stripe"""
    stripe_api_key = os.environ.get("STRIPE_API_KEY")
    stripe_webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature", "")
        
        stripe_checkout = StripeCheckout(
            api_key=stripe_api_key, 
            webhook_url="",
            webhook_secret=stripe_webhook_secret
        )
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Processar evento
        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            
            # Buscar transação
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
                                "plan": transaction["plan_id"],
                                "plan_name": plan["name"],
                                "subscription_active": True,
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
        
        return {"success": True, "received": True}
        
    except Exception as e:
        print(f"Webhook error: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/api/payments/history")
async def get_payment_history(current_user: dict = Depends(get_current_user)):
    """Retorna histórico de pagamentos do usuário"""
    transactions = await db.payment_transactions.find(
        {"user_id": current_user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).limit(20).to_list(20)
    
    return {"success": True, "transactions": transactions}

# =============================================================================
# INSTAGRAM OAUTH ROUTES
# =============================================================================

INSTAGRAM_APP_ID = os.environ.get("INSTAGRAM_APP_ID", "")
INSTAGRAM_APP_SECRET = os.environ.get("INSTAGRAM_APP_SECRET", "")
INSTAGRAM_REDIRECT_URI = os.environ.get("INSTAGRAM_REDIRECT_URI", "")

@app.get("/api/instagram/authorize")
async def instagram_authorize(current_user: dict = Depends(get_current_user)):
    """Inicia fluxo OAuth do Instagram"""
    if not INSTAGRAM_APP_ID:
        raise HTTPException(status_code=500, detail="Instagram não configurado")
    
    # Gerar state para segurança
    state = str(uuid4())
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": current_user["id"],
        "provider": "instagram",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # URL de autorização do Instagram
    auth_url = (
        f"https://api.instagram.com/oauth/authorize"
        f"?client_id={INSTAGRAM_APP_ID}"
        f"&redirect_uri={INSTAGRAM_REDIRECT_URI}"
        f"&scope=user_profile,user_media"
        f"&response_type=code"
        f"&state={state}"
    )
    
    return {"success": True, "auth_url": auth_url}

@app.get("/api/instagram/callback")
async def instagram_callback(code: str = None, state: str = None, error: str = None):
    """Callback do OAuth Instagram"""
    from fastapi.responses import RedirectResponse
    import httpx
    
    frontend_url = os.environ.get("FRONTEND_URL", "https://aivendas-1.preview.emergentagent.com")
    
    if error:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_error={error}")
    
    if not code or not state:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_error=missing_params")
    
    # Verificar state
    oauth_state = await db.oauth_states.find_one({"state": state, "provider": "instagram"})
    if not oauth_state:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_error=invalid_state")
    
    user_id = oauth_state["user_id"]
    await db.oauth_states.delete_one({"state": state})
    
    try:
        # Trocar code por access_token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://api.instagram.com/oauth/access_token",
                data={
                    "client_id": INSTAGRAM_APP_ID,
                    "client_secret": INSTAGRAM_APP_SECRET,
                    "grant_type": "authorization_code",
                    "redirect_uri": INSTAGRAM_REDIRECT_URI,
                    "code": code
                }
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_error=token_failed")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            instagram_user_id = token_data.get("user_id")
            
            # Buscar perfil do usuário
            profile_response = await client.get(
                f"https://graph.instagram.com/{instagram_user_id}",
                params={
                    "fields": "id,username,account_type,media_count",
                    "access_token": access_token
                }
            )
            
            profile_data = profile_response.json() if profile_response.status_code == 200 else {}
            
            # Salvar conexão no banco
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "instagram_connected": True,
                        "instagram_user_id": instagram_user_id,
                        "instagram_username": profile_data.get("username"),
                        "instagram_access_token": access_token,
                        "instagram_connected_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_success=true")
            
    except Exception as e:
        print(f"Instagram OAuth error: {str(e)}")
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?instagram_error=exception")

@app.post("/api/instagram/disconnect")
async def instagram_disconnect(current_user: dict = Depends(get_current_user)):
    """Desconecta Instagram"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "instagram_connected": False,
                "instagram_access_token": None
            }
        }
    )
    return {"success": True, "message": "Instagram desconectado"}

# =============================================================================
# CANVA OAUTH ROUTES
# =============================================================================

CANVA_CLIENT_ID = os.environ.get("CANVA_CLIENT_ID", "")
CANVA_CLIENT_SECRET = os.environ.get("CANVA_CLIENT_SECRET", "")
CANVA_REDIRECT_URI = os.environ.get("CANVA_REDIRECT_URI", "")

@app.get("/api/canva/authorize")
async def canva_authorize(current_user: dict = Depends(get_current_user)):
    """Inicia fluxo OAuth do Canva"""
    if not CANVA_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Canva não configurado")
    
    # Gerar state para segurança
    state = str(uuid4())
    await db.oauth_states.insert_one({
        "state": state,
        "user_id": current_user["id"],
        "provider": "canva",
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # URL de autorização do Canva
    scopes = os.environ.get("CANVA_SCOPES", "design:read,design:content:read")
    auth_url = (
        f"https://www.canva.com/api/oauth/authorize"
        f"?client_id={CANVA_CLIENT_ID}"
        f"&redirect_uri={CANVA_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&state={state}"
    )
    
    return {"success": True, "auth_url": auth_url}

@app.get("/api/canva/callback")
async def canva_callback(code: str = None, state: str = None, error: str = None):
    """Callback do OAuth Canva"""
    from fastapi.responses import RedirectResponse
    import httpx
    
    frontend_url = os.environ.get("FRONTEND_URL", "https://aivendas-1.preview.emergentagent.com")
    
    if error:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_error={error}")
    
    if not code or not state:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_error=missing_params")
    
    # Verificar state
    oauth_state = await db.oauth_states.find_one({"state": state, "provider": "canva"})
    if not oauth_state:
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_error=invalid_state")
    
    user_id = oauth_state["user_id"]
    await db.oauth_states.delete_one({"state": state})
    
    try:
        # Trocar code por access_token
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                "https://api.canva.com/rest/v1/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": CANVA_REDIRECT_URI
                },
                auth=(CANVA_CLIENT_ID, CANVA_CLIENT_SECRET or ""),
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            
            if token_response.status_code != 200:
                return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_error=token_failed")
            
            token_data = token_response.json()
            access_token = token_data.get("access_token")
            refresh_token = token_data.get("refresh_token")
            
            # Salvar conexão no banco
            await db.users.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "canva_connected": True,
                        "canva_access_token": access_token,
                        "canva_refresh_token": refresh_token,
                        "canva_connected_at": datetime.now(timezone.utc).isoformat()
                    }
                }
            )
            
            return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_success=true")
            
    except Exception as e:
        print(f"Canva OAuth error: {str(e)}")
        return RedirectResponse(f"{frontend_url}/dashboard/configuracoes?canva_error=exception")

@app.post("/api/canva/disconnect")
async def canva_disconnect(current_user: dict = Depends(get_current_user)):
    """Desconecta Canva"""
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "canva_connected": False,
                "canva_access_token": None,
                "canva_refresh_token": None
            }
        }
    )
    return {"success": True, "message": "Canva desconectado"}

# =============================================================================
# NOVO SISTEMA DE E-BOOKS (Elevare E-books)
# =============================================================================

class NewEbookGenerateRequest(BaseModel):
    professional_name: str
    specialty: str
    main_topic: str
    objective: str
    structure_type: str
    selected_chapters: List[str]
    include_sources: bool = False
    writing_tone: str = "equilibrado"
    visual_style: str = "clean-profissional"
    chapter_variations: Dict[str, str] = {}

class NewEbookUpdateRequest(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    introduction: Optional[str] = None
    conclusion: Optional[str] = None
    next_step: Optional[str] = None

class NewEbookPDFRequest(BaseModel):
    ebook_id: str

class NewEbookRefineRequest(BaseModel):
    ebook_id: str
    chapter_id: str
    refinement_prompt: str

# Estruturas de e-book
EBOOK_STRUCTURES = {
    "educativa-explicativa": {
        "name": "Educativa e Explicativa",
        "chapters": ["O que é e por que funciona", "Como age no organismo", "Principais benefícios", "Dúvidas mais comuns"]
    },
    "historia-pratica": {
        "name": "História + Orientação Prática", 
        "chapters": ["História real de transformação", "O que fez a diferença", "Como aplicar na sua rotina", "O que você pode esperar"]
    },
    "direto-solucao": {
        "name": "Direto ao Ponto (Solução)",
        "chapters": ["O problema que você enfrenta", "A solução que funciona", "Como ela resolve seu problema", "Seu próximo passo"]
    }
}

# Esquemas de cores
COLOR_SCHEMES = {
    "clean-profissional": {"primary": "#4F46E5", "secondary": "#7C3AED", "accent": "#D4A853"},
    "acolhedor-feminino": {"primary": "#EC4899", "secondary": "#A855F7", "accent": "#D4A853"},
    "moderno-impactante": {"primary": "#06B6D4", "secondary": "#F59E0B", "accent": "#EC4899"}
}

@app.post("/api/ebook-new/generate")
async def generate_new_ebook(data: NewEbookGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Gera um novo e-book usando LucresIA"""
    try:
        # Verificar créditos
        user_credits = current_user.get("credits", 0)
        if user_credits < 5:
            raise HTTPException(status_code=402, detail="Créditos insuficientes. Necessário: 5 créditos.")
        
        # Inicializar LucresIA
        lucresia = LucresIA()
        
        # Preparar prompt para gerar conteúdo
        structure = EBOOK_STRUCTURES.get(data.structure_type, EBOOK_STRUCTURES["educativa-explicativa"])
        
        prompt = f"""Você é LUCRÉSIA, especialista em criar e-books para profissionais de estética.

Crie um e-book completo sobre "{data.main_topic}" para {data.professional_name}, especialista em {data.specialty}.

Objetivo do material: {data.objective}

Tom de escrita: {data.writing_tone}
{"Inclua fontes e referências científicas quando relevante." if data.include_sources else ""}

ESTRUTURA OBRIGATÓRIA - Responda EXATAMENTE neste formato JSON:
{{
    "titulo": "Título magnético (máximo 50 caracteres)",
    "subtitulo": "Promessa clara de valor (máximo 80 caracteres)",
    "introducao": "Abertura que conecta com o leitor (2-3 parágrafos)",
    "capitulos": [
        {{"numero": 1, "titulo": "{structure['chapters'][0]}", "conteudo": "Texto completo do capítulo (3-4 parágrafos)", "fonte": "Referência se aplicável"}},
        {{"numero": 2, "titulo": "{structure['chapters'][1]}", "conteudo": "Texto completo do capítulo (3-4 parágrafos)", "fonte": "Referência se aplicável"}},
        {{"numero": 3, "titulo": "{structure['chapters'][2]}", "conteudo": "Texto completo do capítulo (3-4 parágrafos)", "fonte": "Referência se aplicável"}},
        {{"numero": 4, "titulo": "{structure['chapters'][3]}", "conteudo": "Texto completo do capítulo (3-4 parágrafos)", "fonte": "Referência se aplicável"}}
    ],
    "conclusao": "Síntese poderosa (2-3 parágrafos)",
    "proximoPasso": "Orientação clara para ação (1-2 parágrafos)"
}}

IMPORTANTE: Retorne APENAS o JSON válido, sem texto antes ou depois."""

        # Gerar conteúdo
        response = await lucresia.generate(prompt)
        
        # Parsear resposta JSON
        try:
            # Limpar resposta
            content_text = response.strip()
            if content_text.startswith("```json"):
                content_text = content_text[7:]
            if content_text.startswith("```"):
                content_text = content_text[3:]
            if content_text.endswith("```"):
                content_text = content_text[:-3]
            content_text = content_text.strip()
            
            content = json.loads(content_text)
        except json.JSONDecodeError:
            # Fallback: criar conteúdo estruturado básico
            content = {
                "titulo": f"Guia Completo: {data.main_topic}",
                "subtitulo": f"Tudo sobre {data.main_topic.lower()} para transformar seus resultados",
                "introducao": f"Bem-vindo a este guia sobre {data.main_topic}. Aqui você encontrará informações valiosas para sua jornada.",
                "capitulos": [
                    {"numero": i+1, "titulo": ch, "conteudo": f"Conteúdo detalhado sobre {ch.lower()}.", "fonte": ""} 
                    for i, ch in enumerate(structure["chapters"])
                ],
                "conclusao": "Esperamos que este material tenha sido útil para você.",
                "proximoPasso": "Entre em contato para agendar sua consulta."
            }
        
        # Criar ID único
        ebook_id = str(uuid4())
        
        # Preparar capítulos para salvar
        chapters = []
        for cap in content.get("capitulos", []):
            chapter_id = str(uuid4())
            chapters.append({
                "id": chapter_id,
                "chapter_number": cap.get("numero", 0),
                "title": cap.get("titulo", ""),
                "content": cap.get("conteudo", ""),
                "source": cap.get("fonte", "")
            })
        
        # Salvar no banco
        ebook_record = {
            "id": ebook_id,
            "user_id": current_user["id"],
            "title": content.get("titulo", ""),
            "subtitle": content.get("subtitulo", ""),
            "introduction": content.get("introducao", ""),
            "conclusion": content.get("conclusao", ""),
            "next_step": content.get("proximoPasso", ""),
            "chapters": chapters,
            "professional_name": data.professional_name,
            "specialty": data.specialty,
            "main_topic": data.main_topic,
            "objective": data.objective,
            "structure_type": data.structure_type,
            "writing_tone": data.writing_tone,
            "visual_style": data.visual_style,
            "status": "draft",
            "views": 0,
            "downloads": 0,
            "pdf_url": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.ebooks_new.insert_one(ebook_record)
        
        # Deduzir créditos
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$inc": {"credits": -5}}
        )
        
        return {
            "success": True,
            "ebook_id": ebook_id,
            "content": {
                "titulo": content.get("titulo", ""),
                "subtitulo": content.get("subtitulo", "")
            },
            "credits_remaining": user_credits - 5
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao gerar e-book: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar e-book: {str(e)}")

@app.get("/api/ebook-new/list")
async def list_new_ebooks(current_user: dict = Depends(get_current_user)):
    """Lista e-books do usuário"""
    try:
        ebooks = await db.ebooks_new.find(
            {"user_id": current_user["id"]},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {"success": True, "ebooks": ebooks}
    except Exception as e:
        print(f"Erro ao listar e-books: {e}")
        raise HTTPException(status_code=500, detail="Erro ao listar e-books")

@app.get("/api/ebook-new/{ebook_id}")
async def get_new_ebook(ebook_id: str, current_user: dict = Depends(get_current_user)):
    """Obtém um e-book específico"""
    try:
        ebook = await db.ebooks_new.find_one(
            {"id": ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        # Incrementar views
        await db.ebooks_new.update_one(
            {"id": ebook_id},
            {"$inc": {"views": 1}}
        )
        
        return {"success": True, "ebook": ebook}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao obter e-book: {e}")
        raise HTTPException(status_code=500, detail="Erro ao obter e-book")

@app.put("/api/ebook-new/{ebook_id}")
async def update_new_ebook(ebook_id: str, data: NewEbookUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Atualiza um e-book"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if data.title is not None:
            update_data["title"] = data.title
        if data.subtitle is not None:
            update_data["subtitle"] = data.subtitle
        if data.introduction is not None:
            update_data["introduction"] = data.introduction
        if data.conclusion is not None:
            update_data["conclusion"] = data.conclusion
        if data.next_step is not None:
            update_data["next_step"] = data.next_step
        
        result = await db.ebooks_new.update_one(
            {"id": ebook_id, "user_id": current_user["id"]},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        return {"success": True, "message": "E-book atualizado"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao atualizar e-book: {e}")
        raise HTTPException(status_code=500, detail="Erro ao atualizar e-book")

@app.delete("/api/ebook-new/{ebook_id}")
async def delete_new_ebook(ebook_id: str, current_user: dict = Depends(get_current_user)):
    """Deleta um e-book"""
    try:
        result = await db.ebooks_new.delete_one(
            {"id": ebook_id, "user_id": current_user["id"]}
        )
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        return {"success": True, "message": "E-book deletado"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao deletar e-book: {e}")
        raise HTTPException(status_code=500, detail="Erro ao deletar e-book")

@app.post("/api/ebook-new/{ebook_id}/download")
async def record_ebook_download(ebook_id: str, current_user: dict = Depends(get_current_user)):
    """Registra download do e-book"""
    try:
        await db.ebooks_new.update_one(
            {"id": ebook_id, "user_id": current_user["id"]},
            {"$inc": {"downloads": 1}}
        )
        return {"success": True}
    except Exception as e:
        return {"success": False}

@app.post("/api/ebook-new/generate-pdf")
async def generate_new_ebook_pdf(data: NewEbookPDFRequest, current_user: dict = Depends(get_current_user)):
    """Gera PDF do e-book"""
    try:
        from fpdf import FPDF
        import base64
        
        # Buscar e-book
        ebook = await db.ebooks_new.find_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        # Configurações de cores
        colors = COLOR_SCHEMES.get(ebook.get("visual_style", "clean-profissional"), COLOR_SCHEMES["clean-profissional"])
        
        # Converter hex para RGB
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        primary_rgb = hex_to_rgb(colors["primary"])
        secondary_rgb = hex_to_rgb(colors["secondary"])
        accent_rgb = hex_to_rgb(colors["accent"])
        
        # Criar PDF
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=20)
        
        # Registrar fonte
        try:
            pdf.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', uni=True)
            pdf.add_font('DejaVu', 'B', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', uni=True)
            font_name = 'DejaVu'
        except:
            font_name = 'Helvetica'
        
        # ===== CAPA =====
        pdf.add_page()
        pdf.set_fill_color(*primary_rgb)
        pdf.rect(0, 0, 210, 297, 'F')
        
        # Decoração
        pdf.set_fill_color(255, 255, 255)
        pdf.set_draw_color(*accent_rgb)
        pdf.set_line_width(1)
        pdf.line(30, 120, 180, 120)
        
        # Título
        pdf.set_text_color(255, 255, 255)
        pdf.set_font(font_name, 'B', 28)
        pdf.set_y(130)
        pdf.multi_cell(0, 12, ebook.get("title", "E-book"), align='C')
        
        # Subtítulo
        pdf.set_font(font_name, '', 14)
        pdf.set_y(170)
        pdf.multi_cell(0, 8, ebook.get("subtitle", ""), align='C')
        
        # Linha decorativa
        pdf.line(30, 195, 180, 195)
        
        # Autor
        pdf.set_font(font_name, '', 12)
        pdf.set_y(240)
        pdf.cell(0, 10, f"Por {ebook.get('professional_name', '')}", align='C')
        
        # Rodapé
        pdf.set_font(font_name, '', 9)
        pdf.set_y(270)
        pdf.cell(0, 10, "Gerado pela Plataforma Elevare", align='C')
        
        # ===== SUMÁRIO =====
        pdf.add_page()
        pdf.set_text_color(*primary_rgb)
        pdf.set_font(font_name, 'B', 24)
        pdf.cell(0, 15, "Sumário", ln=True)
        
        pdf.set_draw_color(*accent_rgb)
        pdf.set_line_width(1)
        pdf.line(10, 35, 60, 35)
        
        pdf.set_y(50)
        pdf.set_text_color(30, 30, 30)
        pdf.set_font(font_name, '', 12)
        
        pdf.cell(0, 10, "Introdução", ln=True)
        for cap in ebook.get("chapters", []):
            pdf.cell(0, 10, f"Capítulo {cap.get('chapter_number', '')}: {cap.get('title', '')}", ln=True)
        pdf.cell(0, 10, "Conclusão", ln=True)
        pdf.cell(0, 10, "Próximos Passos", ln=True)
        
        # ===== INTRODUÇÃO =====
        pdf.add_page()
        pdf.set_text_color(*primary_rgb)
        pdf.set_font(font_name, 'B', 22)
        pdf.cell(0, 15, "Introdução", ln=True)
        
        pdf.set_draw_color(*accent_rgb)
        pdf.line(10, pdf.get_y(), 60, pdf.get_y())
        pdf.set_y(pdf.get_y() + 15)
        
        pdf.set_text_color(30, 30, 30)
        pdf.set_font(font_name, '', 11)
        pdf.multi_cell(0, 7, ebook.get("introduction", ""))
        
        # ===== CAPÍTULOS =====
        for cap in ebook.get("chapters", []):
            pdf.add_page()
            
            # Badge do capítulo
            pdf.set_text_color(*accent_rgb)
            pdf.set_font(font_name, 'B', 10)
            pdf.cell(0, 10, f"CAPÍTULO {cap.get('chapter_number', '')}", ln=True)
            
            # Título do capítulo
            pdf.set_text_color(*primary_rgb)
            pdf.set_font(font_name, 'B', 18)
            pdf.multi_cell(0, 10, cap.get("title", ""))
            
            # Linha
            pdf.set_draw_color(*secondary_rgb)
            pdf.line(10, pdf.get_y() + 5, 200, pdf.get_y() + 5)
            pdf.set_y(pdf.get_y() + 15)
            
            # Conteúdo
            pdf.set_text_color(30, 30, 30)
            pdf.set_font(font_name, '', 11)
            pdf.multi_cell(0, 7, cap.get("content", ""))
            
            # Fonte
            if cap.get("source"):
                pdf.set_y(pdf.get_y() + 10)
                pdf.set_text_color(100, 100, 100)
                pdf.set_font(font_name, '', 9)
                pdf.cell(0, 7, f"Referência: {cap.get('source')}", ln=True)
        
        # ===== CONCLUSÃO =====
        pdf.add_page()
        pdf.set_text_color(*primary_rgb)
        pdf.set_font(font_name, 'B', 22)
        pdf.cell(0, 15, "Conclusão", ln=True)
        
        pdf.set_draw_color(*accent_rgb)
        pdf.line(10, pdf.get_y(), 60, pdf.get_y())
        pdf.set_y(pdf.get_y() + 15)
        
        pdf.set_text_color(30, 30, 30)
        pdf.set_font(font_name, '', 11)
        pdf.multi_cell(0, 7, ebook.get("conclusion", ""))
        
        # ===== PRÓXIMOS PASSOS =====
        pdf.add_page()
        pdf.set_text_color(*primary_rgb)
        pdf.set_font(font_name, 'B', 22)
        pdf.cell(0, 15, "Próximos Passos", ln=True)
        
        pdf.set_draw_color(*accent_rgb)
        pdf.line(10, pdf.get_y(), 80, pdf.get_y())
        pdf.set_y(pdf.get_y() + 15)
        
        pdf.set_text_color(30, 30, 30)
        pdf.set_font(font_name, '', 11)
        pdf.multi_cell(0, 7, ebook.get("next_step", ""))
        
        # Agradecimento
        pdf.set_y(pdf.get_y() + 30)
        pdf.set_text_color(*primary_rgb)
        pdf.set_font(font_name, 'B', 14)
        pdf.cell(0, 10, "Obrigado pela leitura!", align='C', ln=True)
        
        pdf.set_text_color(30, 30, 30)
        pdf.set_font(font_name, '', 11)
        pdf.cell(0, 8, f"Este material foi preparado por {ebook.get('professional_name', '')}", align='C', ln=True)
        
        # Rodapé
        pdf.set_y(260)
        pdf.set_text_color(150, 150, 150)
        pdf.set_font(font_name, '', 9)
        pdf.cell(0, 8, "━" * 50, align='C', ln=True)
        pdf.set_text_color(*secondary_rgb)
        pdf.set_font(font_name, 'B', 10)
        pdf.cell(0, 8, "Gerado pela Plataforma Elevare", align='C', ln=True)
        pdf.set_text_color(150, 150, 150)
        pdf.set_font(font_name, '', 9)
        pdf.cell(0, 8, "Inteligência Editorial para Profissionais de Estética", align='C', ln=True)
        
        # Gerar PDF como base64
        pdf_bytes = pdf.output(dest='S').encode('latin-1')
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        pdf_url = f"data:application/pdf;base64,{pdf_base64}"
        
        # Atualizar e-book com URL do PDF
        await db.ebooks_new.update_one(
            {"id": data.ebook_id},
            {
                "$set": {
                    "pdf_url": pdf_url,
                    "status": "published",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {
            "success": True,
            "pdf_url": pdf_url,
            "message": "PDF gerado com sucesso"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao gerar PDF: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar PDF: {str(e)}")

@app.post("/api/ebook-new/refine-chapter")
async def refine_new_ebook_chapter(data: NewEbookRefineRequest, current_user: dict = Depends(get_current_user)):
    """Aperfeiçoa um capítulo do e-book"""
    try:
        # Buscar e-book
        ebook = await db.ebooks_new.find_one(
            {"id": data.ebook_id, "user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not ebook:
            raise HTTPException(status_code=404, detail="E-book não encontrado")
        
        # Encontrar capítulo
        chapter = None
        chapter_idx = -1
        for idx, ch in enumerate(ebook.get("chapters", [])):
            if ch.get("id") == data.chapter_id:
                chapter = ch
                chapter_idx = idx
                break
        
        if not chapter:
            raise HTTPException(status_code=404, detail="Capítulo não encontrado")
        
        # Inicializar LucresIA
        lucresia = LucresIA()
        
        # Gerar refinamento
        prompt = f"""Você é LUCRÉSIA, especialista em criar conteúdo para profissionais de estética.

Aperfeiçoe o seguinte capítulo de e-book com base na solicitação do usuário:

CAPÍTULO ATUAL:
Título: {chapter.get('title')}
Conteúdo: {chapter.get('content')}

SOLICITAÇÃO DO USUÁRIO: {data.refinement_prompt}

Retorne APENAS o novo conteúdo do capítulo (sem o título), mantendo a qualidade e tom profissional."""

        refined_content = await lucresia.generate(prompt)
        
        # Atualizar capítulo
        ebook["chapters"][chapter_idx]["content"] = refined_content.strip()
        
        await db.ebooks_new.update_one(
            {"id": data.ebook_id},
            {
                "$set": {
                    "chapters": ebook["chapters"],
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        return {"success": True, "message": "Capítulo aperfeiçoado"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao aperfeiçoar capítulo: {e}")
        raise HTTPException(status_code=500, detail="Erro ao aperfeiçoar capítulo")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
