"""
🧠 SISTEMA EDITORIAL ELEVARE - NÚCLEO OBRIGATÓRIO

Este módulo é o DNA invisível de TODOS os geradores de conteúdo longo:
- E-books
- Artigos de Blog
- Conteúdo SEO
- Materiais Educacionais Premium

Contém:
1. Prompt Mestre Editorial (geração)
2. Editor Fantasma (QA automático com reescrita)
3. Banco Editorial de Referência
4. Trava de Sistema (validação obrigatória)
"""

from typing import Dict, List, Tuple, Optional
import re

# ============================================================================
# 📚 BANCO EDITORIAL DE REFERÊNCIA (OBRIGATÓRIO)
# ============================================================================

BANCO_EDITORIAL = {
    "psicologia_decisao": {
        "nome": "Psicologia & Decisão",
        "autores": [
            {"nome": "Daniel Kahneman", "obra": "Thinking, Fast and Slow", "conceitos": ["Sistema 1 e 2", "Vieses cognitivos", "Heurísticas", "WYSIATI"]},
            {"nome": "Amos Tversky", "obra": "Judgment Under Uncertainty", "conceitos": ["Teoria da Perspectiva", "Aversão à perda", "Ancoragem"]},
            {"nome": "Dan Ariely", "obra": "Predictably Irrational", "conceitos": ["Irracionalidade previsível", "Efeito chamariz", "Gratuidade"]},
            {"nome": "Richard Thaler", "obra": "Nudge", "conceitos": ["Arquitetura de escolha", "Nudges", "Paternalismo libertário", "Contabilidade mental"]},
            {"nome": "Barry Schwartz", "obra": "The Paradox of Choice", "conceitos": ["Paradoxo da escolha", "Paralisia decisória", "Satisficing vs Maximizing"]},
        ]
    },
    "neurociencia_emocao": {
        "nome": "Neurociência & Emoção",
        "autores": [
            {"nome": "Antonio Damasio", "obra": "O Erro de Descartes", "conceitos": ["Marcadores somáticos", "Emoção na decisão", "Hipótese do marcador somático"]},
            {"nome": "Joseph LeDoux", "obra": "The Emotional Brain", "conceitos": ["Amígdala", "Processamento emocional", "Memória emocional"]},
            {"nome": "Paul Zak", "obra": "The Moral Molecule", "conceitos": ["Oxitocina", "Confiança", "Neurociência social", "Empatia"]},
            {"nome": "Lisa Feldman Barrett", "obra": "How Emotions Are Made", "conceitos": ["Teoria da emoção construída", "Previsão cerebral"]},
        ]
    },
    "persuasao_influencia": {
        "nome": "Persuasão & Influência",
        "autores": [
            {"nome": "Robert Cialdini", "obra": "Influence: The Psychology of Persuasion", "conceitos": ["6 princípios da persuasão", "Reciprocidade", "Escassez", "Autoridade", "Consistência", "Afeição", "Prova social"]},
            {"nome": "Robert Cialdini", "obra": "Pre-Suasion", "conceitos": ["Pré-suasão", "Momento privilegiado", "Atenção canalizada"]},
            {"nome": "BJ Fogg", "obra": "Tiny Habits", "conceitos": ["Behavior Model (B=MAP)", "Motivação + Habilidade + Gatilho", "Hábitos mínimos"]},
            {"nome": "Nir Eyal", "obra": "Hooked", "conceitos": ["Modelo Hook", "Gatilhos internos/externos", "Recompensas variáveis", "Investimento"]},
            {"nome": "Jonah Berger", "obra": "Contagious", "conceitos": ["STEPPS", "Viralidade", "Moeda social", "Gatilhos"]},
        ]
    },
    "marketing_estrategia": {
        "nome": "Marketing & Estratégia",
        "autores": [
            {"nome": "Philip Kotler", "obra": "Marketing Management", "conceitos": ["Mix de marketing", "Segmentação", "Posicionamento", "4Ps"]},
            {"nome": "Seth Godin", "obra": "This is Marketing", "conceitos": ["Marketing de permissão", "Tribos", "Menor mercado viável", "Status"]},
            {"nome": "Al Ries & Jack Trout", "obra": "Positioning", "conceitos": ["Posicionamento mental", "Diferenciação", "Primeira posição"]},
            {"nome": "Simon Sinek", "obra": "Start With Why", "conceitos": ["Golden Circle", "Por quê antes do quê", "Liderança inspiradora"]},
        ],
        "instituicoes": [
            "Harvard Business Review",
            "McKinsey Insights",
            "MIT Sloan Management Review",
            "Stanford Graduate School of Business"
        ]
    },
    "comportamento_consumidor": {
        "nome": "Comportamento do Consumidor",
        "journals": [
            "Journal of Consumer Research",
            "Journal of Marketing Research",
            "Journal of Consumer Psychology",
            "Journal of Behavioral Decision Making"
        ],
        "instituicoes": [
            "APA (American Psychological Association)",
            "Association for Consumer Research",
            "Marketing Science Institute",
            "Behavioral Science & Policy Association"
        ]
    }
}

# ============================================================================
# 🔒 CONSTANTES DE QUALIDADE (TRAVA DE SISTEMA)
# ============================================================================

REGRAS_MINIMAS = {
    "ebook": {
        "palavras_minimas_capitulo": 600,
        "palavras_maximas_capitulo": 900,
        "capitulos_minimos": 6,
        "referencias_minimas": 5,
        "blocos_minimos_por_capitulo": 5
    },
    "artigo_blog": {
        "palavras_minimas": 800,
        "referencias_minimas": 3
    },
    "conteudo_seo": {
        "palavras_minimas": 1200,
        "referencias_minimas": 4
    }
}

# Palavras/frases proibidas (linguagem de coach/blog raso)
TERMOS_PROIBIDOS = [
    "acredite em você",
    "basta querer",
    "o segredo é",
    "fórmula mágica",
    "resultados garantidos",
    "ganhe dinheiro",
    "fique rico",
    "sucesso garantido",
    "método infalível",
    "100% comprovado",
    "revolucionário",
    "transforme sua vida",
    "milhões de reais",
    "dinheiro fácil",
    "sem esforço"
]

# ============================================================================
# 🧠 PROMPT MESTRE EDITORIAL (GERAÇÃO)
# ============================================================================

PROMPT_MESTRE_EDITORIAL = """
═══════════════════════════════════════════════════════════════════════════════
🧠 PROMPT MESTRE EDITORIAL — NÚCLEO ELEVARE (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════════════════

Você é um Editor-Chefe Sênior, com formação em:
• Neurociência aplicada ao consumo
• Psicologia comportamental
• Marketing ético e educacional
• Escrita editorial de padrão internacional

Você NÃO gera conteúdo genérico, raso, motivacional ou inflado.

═══════════════════════════════════════════════════════════════════════════════
🔒 REGRA ABSOLUTA
═══════════════════════════════════════════════════════════════════════════════

Todo conteúdo deve ser PROFUNDO, COERENTE, EDUCACIONAL, APLICÁVEL e digno de ser citado em aula, palestra ou material profissional.

═══════════════════════════════════════════════════════════════════════════════
❌ É PROIBIDO
═══════════════════════════════════════════════════════════════════════════════

• Conteúdo em formato de tópicos vazios
• Textos genéricos ou óbvios
• Promessas irreais ou sensacionalistas
• Linguagem de "blog raso" ou "coach"
• Frases como: "acredite em você", "basta querer", "o segredo é", "fórmula mágica"
• Títulos sem desenvolvimento real
• Listas sem explicação de cada ponto

═══════════════════════════════════════════════════════════════════════════════
✅ É OBRIGATÓRIO
═══════════════════════════════════════════════════════════════════════════════

• Clareza conceitual
• Explicação de mecanismos psicológicos (causa → efeito → aplicação)
• Aplicação prática no contexto profissional
• Escrita fluida, madura e didática
• Linguagem neutra, global e profissional
• Referências a autores e estudos reconhecidos
• Progressão lógica do início ao fim

═══════════════════════════════════════════════════════════════════════════════
📚 REFERÊNCIAS OBRIGATÓRIAS
═══════════════════════════════════════════════════════════════════════════════

Todo conteúdo DEVE citar, ao longo do texto E ao final:

PSICOLOGIA & DECISÃO:
• Daniel Kahneman (Thinking, Fast and Slow) — Sistema 1 e 2, Vieses cognitivos
• Amos Tversky — Teoria da Perspectiva, Aversão à perda
• Dan Ariely (Predictably Irrational) — Irracionalidade previsível
• Richard Thaler (Nudge) — Arquitetura de escolha

NEUROCIÊNCIA & EMOÇÃO:
• Antonio Damasio (O Erro de Descartes) — Marcadores somáticos
• Joseph LeDoux — Processamento emocional
• Paul Zak — Oxitocina e confiança

PERSUASÃO & INFLUÊNCIA:
• Robert Cialdini (Influence) — 6 princípios da persuasão
• BJ Fogg (Tiny Habits) — Behavior Model (B=MAP)
• Nir Eyal (Hooked) — Modelo Hook

MARKETING & ESTRATÉGIA:
• Philip Kotler — Marketing Management
• Harvard Business Review
• McKinsey Insights

CONCEITOS RECONHECIDOS:
• Heurísticas, viés cognitivo, tomada de decisão, percepção de valor
• Economia comportamental, nudges, arquitetura de escolha

⚠️ Se não houver referências plausíveis, o conteúdo NÃO deve ser gerado.

═══════════════════════════════════════════════════════════════════════════════
🎯 OBJETIVO FINAL
═══════════════════════════════════════════════════════════════════════════════

Criar conteúdo que:
• Educa antes de vender
• Constrói autoridade REAL
• Reduz objeções naturalmente
• Poderia ser assinado por um especialista humano
• Seria aceito em uma publicação acadêmica ou profissional

Se o conteúdo não atingir esse nível, REESCREVA até atingir.
"""

# ============================================================================
# 🔍 EDITOR FANTASMA (QA AUTOMÁTICO)
# ============================================================================

PROMPT_EDITOR_FANTASMA = """
═══════════════════════════════════════════════════════════════════════════════
🔍 EDITOR FANTASMA — CONTROLE DE QUALIDADE AUTOMÁTICO
═══════════════════════════════════════════════════════════════════════════════

Você é um Revisor Crítico Editorial Sênior.
Avalie o conteúdo gerado com RIGOR PROFISSIONAL.

═══════════════════════════════════════════════════════════════════════════════
CHECKLIST DE AVALIAÇÃO (responda internamente)
═══════════════════════════════════════════════════════════════════════════════

1. Este conteúdo ENSINA algo novo ou apenas repete o óbvio?
2. Um profissional experiente teria ORGULHO de assinar este material?
3. Há explicação de CAUSA, EFEITO e MECANISMO psicológico?
4. O texto tem INÍCIO, DESENVOLVIMENTO LÓGICO e CONCLUSÃO clara?
5. Existem REFERÊNCIAS conceituais ou autores reconhecíveis?
6. O conteúdo gera AUTORIDADE ou apenas preenche espaço?
7. Cada parágrafo adiciona valor real ou é "enchimento"?
8. A linguagem é profissional ou soa como "blog genérico"?

═══════════════════════════════════════════════════════════════════════════════
CRITÉRIO DE APROVAÇÃO
═══════════════════════════════════════════════════════════════════════════════

• Se QUALQUER resposta for "não" → REPROVADO
• Conteúdo reprovado DEVE ser reescrito automaticamente

═══════════════════════════════════════════════════════════════════════════════
AÇÃO EM CASO DE REPROVAÇÃO
═══════════════════════════════════════════════════════════════════════════════

1. Reescrever aprofundando conceitos
2. Expandir exemplos com casos reais
3. Incluir referências de autores reconhecidos
4. Eliminar frases vazias ou genéricas
5. Adicionar explicação de mecanismos
6. Garantir progressão lógica

⚠️ Somente liberar quando atingir PADRÃO EDITORIAL PREMIUM.
"""

# ============================================================================
# FUNÇÕES DE VALIDAÇÃO
# ============================================================================

def validar_termos_proibidos(texto: str) -> Tuple[bool, List[str]]:
    """Verifica se o texto contém termos proibidos"""
    texto_lower = texto.lower()
    termos_encontrados = []
    
    for termo in TERMOS_PROIBIDOS:
        if termo.lower() in texto_lower:
            termos_encontrados.append(termo)
    
    return len(termos_encontrados) == 0, termos_encontrados


def contar_palavras(texto: str) -> int:
    """Conta palavras no texto"""
    return len(texto.split())


def verificar_referencias(texto: str) -> Tuple[bool, List[str]]:
    """Verifica se o texto contém referências do banco editorial"""
    texto_lower = texto.lower()
    referencias_encontradas = []
    
    # Lista de autores para verificar
    autores_chave = [
        "kahneman", "tversky", "ariely", "thaler", "damasio", 
        "ledoux", "zak", "cialdini", "fogg", "eyal", "kotler",
        "godin", "sinek", "harvard", "mckinskin", "mit sloan"
    ]
    
    for autor in autores_chave:
        if autor in texto_lower:
            referencias_encontradas.append(autor)
    
    # Mínimo 3 referências para aprovar
    return len(referencias_encontradas) >= 3, referencias_encontradas


def validar_estrutura_ebook(ebook: dict) -> Tuple[bool, List[str]]:
    """Valida estrutura completa do e-book"""
    problemas = []
    
    sections = ebook.get("sections", [])
    capitulos = [s for s in sections if s.get("type") == "section"]
    
    # Verificar número mínimo de capítulos
    if len(capitulos) < REGRAS_MINIMAS["ebook"]["capitulos_minimos"]:
        problemas.append(f"E-book tem apenas {len(capitulos)} capítulos (mínimo: {REGRAS_MINIMAS['ebook']['capitulos_minimos']})")
    
    # Verificar cada capítulo
    for i, cap in enumerate(capitulos):
        titulo = cap.get("title", f"Capítulo {i+1}")
        blocos = cap.get("blocks", [])
        
        # Contar palavras do capítulo
        texto_capitulo = " ".join([
            b.get("text", "") if b.get("type") == "paragraph" else
            " ".join(b.get("items", [])) if b.get("type") == "bullet_list" else
            b.get("text", "")
            for b in blocos
        ])
        
        palavras = contar_palavras(texto_capitulo)
        
        if palavras < REGRAS_MINIMAS["ebook"]["palavras_minimas_capitulo"]:
            problemas.append(f"'{titulo}' tem {palavras} palavras (mínimo: {REGRAS_MINIMAS['ebook']['palavras_minimas_capitulo']})")
        
        if len(blocos) < REGRAS_MINIMAS["ebook"]["blocos_minimos_por_capitulo"]:
            problemas.append(f"'{titulo}' tem {len(blocos)} blocos (mínimo: {REGRAS_MINIMAS['ebook']['blocos_minimos_por_capitulo']})")
    
    # Verificar referências no texto completo
    texto_completo = extrair_texto_completo(ebook)
    tem_referencias, refs = verificar_referencias(texto_completo)
    
    if not tem_referencias:
        problemas.append(f"Poucas referências encontradas ({len(refs)}). Mínimo: 3 autores/fontes")
    
    # Verificar termos proibidos
    sem_termos_proibidos, termos = validar_termos_proibidos(texto_completo)
    if not sem_termos_proibidos:
        problemas.append(f"Termos proibidos encontrados: {', '.join(termos)}")
    
    return len(problemas) == 0, problemas


def extrair_texto_completo(ebook: dict) -> str:
    """Extrai todo o texto do e-book em uma string"""
    partes = []
    
    meta = ebook.get("meta", {})
    partes.append(meta.get("title", ""))
    partes.append(meta.get("subtitle", ""))
    
    for section in ebook.get("sections", []):
        if section.get("type") == "hero":
            partes.append(section.get("title", ""))
            partes.append(section.get("subtitle", ""))
        elif section.get("type") == "section":
            partes.append(section.get("title", ""))
            for block in section.get("blocks", []):
                if block.get("type") == "paragraph":
                    partes.append(block.get("text", ""))
                elif block.get("type") == "bullet_list":
                    partes.extend(block.get("items", []))
                elif block.get("type") == "callout":
                    partes.append(block.get("text", ""))
    
    return " ".join(partes)


def get_prompt_mestre() -> str:
    """Retorna o Prompt Mestre Editorial"""
    return PROMPT_MESTRE_EDITORIAL


def get_prompt_editor_fantasma() -> str:
    """Retorna o prompt do Editor Fantasma"""
    return PROMPT_EDITOR_FANTASMA


def get_banco_editorial_formatado() -> str:
    """Retorna banco editorial formatado para inclusão em prompts"""
    sections = []
    
    for cluster_key, cluster in BANCO_EDITORIAL.items():
        section = f"\n📚 {cluster['nome'].upper()}\n"
        
        if "autores" in cluster:
            for autor in cluster["autores"]:
                section += f"• {autor['nome']} — \"{autor['obra']}\"\n"
                section += f"  Conceitos: {', '.join(autor['conceitos'])}\n"
        
        if "instituicoes" in cluster:
            section += "Instituições:\n"
            for inst in cluster["instituicoes"]:
                section += f"• {inst}\n"
        
        if "journals" in cluster:
            section += "Journals Acadêmicos:\n"
            for journal in cluster["journals"]:
                section += f"• {journal}\n"
        
        sections.append(section)
    
    return "\n".join(sections)


def gerar_relatorio_qa(ebook: dict) -> dict:
    """Gera relatório completo de QA do e-book"""
    texto_completo = extrair_texto_completo(ebook)
    
    # Validações
    estrutura_ok, problemas_estrutura = validar_estrutura_ebook(ebook)
    termos_ok, termos_proibidos = validar_termos_proibidos(texto_completo)
    referencias_ok, referencias = verificar_referencias(texto_completo)
    
    total_palavras = contar_palavras(texto_completo)
    capitulos = [s for s in ebook.get("sections", []) if s.get("type") == "section"]
    
    return {
        "aprovado": estrutura_ok and termos_ok and referencias_ok,
        "total_palavras": total_palavras,
        "total_capitulos": len(capitulos),
        "referencias_encontradas": referencias,
        "termos_proibidos_encontrados": termos_proibidos,
        "problemas": problemas_estrutura,
        "checklist": {
            "estrutura_valida": estrutura_ok,
            "sem_termos_proibidos": termos_ok,
            "referencias_suficientes": referencias_ok,
            "palavras_minimas_atingidas": total_palavras >= (REGRAS_MINIMAS["ebook"]["palavras_minimas_capitulo"] * len(capitulos))
        }
    }
