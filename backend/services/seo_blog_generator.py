"""
SEO Blog Generator - Fábrica de Conteúdo SEO para Estética
Gera artigos otimizados para Google com foco em keywords locais.
"""

import os
import uuid
import re
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

# Tipos de artigo para estética
ARTICLE_TYPES = {
    "procedimento": {
        "name": "Guia de Procedimento",
        "description": "Artigo completo sobre um procedimento estético",
        "structure": ["O que é", "Como funciona", "Benefícios", "Indicações", "Contraindicações", "Resultados", "FAQ"],
        "word_count": 1500
    },
    "comparativo": {
        "name": "Comparativo",
        "description": "Compara dois ou mais procedimentos/tratamentos",
        "structure": ["Introdução", "Procedimento A", "Procedimento B", "Comparação", "Qual escolher", "Conclusão"],
        "word_count": 1200
    },
    "mitos_verdades": {
        "name": "Mitos e Verdades",
        "description": "Desmistifica crenças sobre procedimentos",
        "structure": ["Introdução", "Mito 1", "Mito 2", "Mito 3", "Mito 4", "Mito 5", "Conclusão"],
        "word_count": 1000
    },
    "antes_depois": {
        "name": "Resultados (Antes e Depois)",
        "description": "Foca em resultados reais e transformações",
        "structure": ["Introdução", "Como funciona", "Caso 1", "Caso 2", "O que esperar", "Cuidados", "Conclusão"],
        "word_count": 1000
    },
    "guia_local": {
        "name": "Guia Local",
        "description": "Artigo otimizado para busca local (ex: 'Botox em SP')",
        "structure": ["Introdução", "Sobre o procedimento", "Por que escolher [cidade]", "Nossa clínica", "Diferenciais", "Como agendar"],
        "word_count": 800
    },
    "lista": {
        "name": "Lista/Listicle",
        "description": "Formato de lista (ex: '7 benefícios da limpeza de pele')",
        "structure": ["Introdução", "Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7", "Conclusão"],
        "word_count": 1200
    }
}

# Níveis de consciência do leitor
AWARENESS_LEVELS = {
    "inconsciente": {
        "name": "Inconsciente do Problema",
        "description": "Não sabe que tem o problema",
        "approach": "Educar sobre o problema antes de apresentar a solução"
    },
    "consciente_problema": {
        "name": "Consciente do Problema",
        "description": "Sabe que tem o problema, não conhece soluções",
        "approach": "Apresentar soluções disponíveis de forma educativa"
    },
    "consciente_solucao": {
        "name": "Consciente da Solução",
        "description": "Conhece soluções, está comparando",
        "approach": "Diferenciar sua solução das alternativas"
    },
    "consciente_produto": {
        "name": "Consciente do Produto",
        "description": "Conhece seu serviço, está decidindo",
        "approach": "Remover objeções e facilitar a decisão"
    }
}


class SEOBlogGenerator:
    """Gerador de artigos SEO otimizados para estética"""
    
    def __init__(self, brand_identity: dict = None):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.brand_identity = brand_identity or {}
        
        system_message = """Você é um especialista em SEO e copywriting para o nicho de estética e beleza.
Sua missão é criar artigos que:

1. RANQUEIAM no Google (SEO técnico impecável)
2. ENGAJAM o leitor (copy persuasivo)
3. CONVERTEM em agendamentos (CTA estratégico)

Regras de ouro:
- Linguagem humanizada, nunca robótica
- Parágrafos curtos (máx 3 linhas)
- Subtítulos a cada 200-300 palavras
- Keywords naturalmente inseridas
- Meta description persuasiva (150-160 caracteres)
- Heading hierarchy (H1 > H2 > H3)
- Perguntas frequentes para featured snippets"""
        
        if brand_identity:
            system_message += f"""

IDENTIDADE DA MARCA:
- Marca: {brand_identity.get('brand_name', '')}
- Posicionamento: {brand_identity.get('positioning', '')}
- Especialidade: {brand_identity.get('main_specialty', '')}
- Estilo: {brand_identity.get('visual_style', '')}
- Frases-chave: {', '.join(brand_identity.get('key_phrases', []))}"""
        
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id=f"seo_blog_{uuid.uuid4().hex[:8]}",
            system_message=system_message
        ).with_model("openai", "gpt-4o")
    
    def calculate_seo_score(self, article: dict, keyword: str) -> dict:
        """Calcula score de SEO interno baseado em boas práticas"""
        score = 0
        max_score = 100
        factors = []
        
        title = article.get("title", "")
        content = article.get("content", "")
        meta_description = article.get("meta_description", "")
        
        # 1. Keyword no título (15 pontos)
        if keyword.lower() in title.lower():
            score += 15
            factors.append({"factor": "Keyword no título", "status": "pass", "points": 15})
        else:
            factors.append({"factor": "Keyword no título", "status": "fail", "points": 0, "tip": "Inclua a keyword principal no título"})
        
        # 2. Keyword na meta description (10 pontos)
        if keyword.lower() in meta_description.lower():
            score += 10
            factors.append({"factor": "Keyword na meta description", "status": "pass", "points": 10})
        else:
            factors.append({"factor": "Keyword na meta description", "status": "fail", "points": 0, "tip": "Inclua a keyword na meta description"})
        
        # 3. Tamanho da meta description (10 pontos)
        meta_len = len(meta_description)
        if 150 <= meta_len <= 160:
            score += 10
            factors.append({"factor": "Meta description ideal (150-160 chars)", "status": "pass", "points": 10})
        elif 120 <= meta_len <= 180:
            score += 5
            factors.append({"factor": "Meta description aceitável", "status": "warning", "points": 5, "tip": "Ideal: 150-160 caracteres"})
        else:
            factors.append({"factor": "Meta description", "status": "fail", "points": 0, "tip": f"Atual: {meta_len} chars. Ideal: 150-160"})
        
        # 4. Tamanho do conteúdo (15 pontos)
        word_count = len(content.split())
        if word_count >= 1500:
            score += 15
            factors.append({"factor": f"Conteúdo extenso ({word_count} palavras)", "status": "pass", "points": 15})
        elif word_count >= 800:
            score += 10
            factors.append({"factor": f"Conteúdo médio ({word_count} palavras)", "status": "warning", "points": 10, "tip": "Ideal: 1500+ palavras"})
        else:
            score += 5
            factors.append({"factor": f"Conteúdo curto ({word_count} palavras)", "status": "fail", "points": 5, "tip": "Artigos mais longos ranqueiam melhor"})
        
        # 5. Subtítulos H2/H3 (15 pontos)
        h2_count = content.count("## ")
        h3_count = content.count("### ")
        if h2_count >= 4 and h3_count >= 2:
            score += 15
            factors.append({"factor": f"Estrutura de headings ({h2_count} H2, {h3_count} H3)", "status": "pass", "points": 15})
        elif h2_count >= 2:
            score += 8
            factors.append({"factor": f"Estrutura básica ({h2_count} H2)", "status": "warning", "points": 8, "tip": "Adicione mais subtítulos"})
        else:
            factors.append({"factor": "Falta estrutura de headings", "status": "fail", "points": 0, "tip": "Use H2 e H3 para organizar"})
        
        # 6. Densidade de keyword (10 pontos)
        keyword_count = content.lower().count(keyword.lower())
        density = (keyword_count / word_count) * 100 if word_count > 0 else 0
        if 1 <= density <= 2.5:
            score += 10
            factors.append({"factor": f"Densidade de keyword ideal ({density:.1f}%)", "status": "pass", "points": 10})
        elif 0.5 <= density <= 3:
            score += 5
            factors.append({"factor": f"Densidade de keyword ({density:.1f}%)", "status": "warning", "points": 5, "tip": "Ideal: 1-2.5%"})
        else:
            factors.append({"factor": f"Densidade de keyword ({density:.1f}%)", "status": "fail", "points": 0, "tip": "Muito baixa ou muito alta"})
        
        # 7. Presença de FAQ (10 pontos)
        has_faq = "perguntas frequentes" in content.lower() or "faq" in content.lower() or "dúvidas" in content.lower()
        if has_faq:
            score += 10
            factors.append({"factor": "Seção de FAQ presente", "status": "pass", "points": 10})
        else:
            factors.append({"factor": "Sem seção de FAQ", "status": "fail", "points": 0, "tip": "FAQs ajudam a aparecer em featured snippets"})
        
        # 8. CTA presente (10 pontos)
        cta_keywords = ["agendar", "agende", "whatsapp", "contato", "consulta", "avaliação"]
        has_cta = any(cta in content.lower() for cta in cta_keywords)
        if has_cta:
            score += 10
            factors.append({"factor": "CTA presente", "status": "pass", "points": 10})
        else:
            factors.append({"factor": "Sem CTA claro", "status": "fail", "points": 0, "tip": "Inclua chamada para ação"})
        
        # 9. Links internos sugeridos (5 pontos - sempre passa se tem sugestões)
        if article.get("internal_links_suggestions"):
            score += 5
            factors.append({"factor": "Sugestões de links internos", "status": "pass", "points": 5})
        
        # Classificação
        if score >= 85:
            classification = "Excelente"
            color = "green"
        elif score >= 70:
            classification = "Bom"
            color = "blue"
        elif score >= 50:
            classification = "Regular"
            color = "yellow"
        else:
            classification = "Precisa melhorar"
            color = "red"
        
        return {
            "score": score,
            "max_score": max_score,
            "percentage": round((score / max_score) * 100),
            "classification": classification,
            "color": color,
            "factors": factors,
            "word_count": word_count
        }
    
    async def generate_article(
        self,
        keyword: str,
        topic: str,
        article_type: str = "procedimento",
        awareness_level: str = "consciente_problema",
        location: str = None,
        tone: str = "profissional",
        include_faq: bool = True,
        custom_instructions: str = None
    ) -> dict:
        """Gera artigo SEO completo com Método NeuroVendas Elevare"""
        
        type_info = ARTICLE_TYPES.get(article_type, ARTICLE_TYPES["procedimento"])
        awareness_info = AWARENESS_LEVELS.get(awareness_level, AWARENESS_LEVELS["consciente_problema"])
        
        location_context = f"\nLOCALIZAÇÃO: {location} (otimize para busca local)" if location else ""
        
        brand_context = ""
        if self.brand_identity:
            brand_context = f"""
IDENTIDADE DA MARCA:
- Marca: {self.brand_identity.get('brand_name', 'Clínica de Estética')}
- Posicionamento: {self.brand_identity.get('positioning', 'profissional')}
- Especialidade: {self.brand_identity.get('main_specialty', '')}
- Frases-chave: {', '.join(self.brand_identity.get('key_phrases', []))}
"""
        
        # Prompt principal da Fábrica de Conteúdo SEO Elevare
        prompt = f"""Você é um assistente de escrita avançado para profissionais da estética. Sua função é gerar artigos completos, SEO-friendly, com NeuroVendas Elevare, usando **todas as escolhas do profissional** como guia.

### ENTRADAS DO PROFISSIONAL:
- **Palavra-chave principal:** {keyword}
- **Tema do artigo:** {topic}
- **Tipo de artigo:** {type_info['name']} - {type_info['description']}
- **Nível de consciência do leitor:** {awareness_info['name']} - {awareness_info['approach']}
- **Tom de voz:** {tone}
{location_context}
{brand_context}
{f"**Instruções adicionais do profissional:** {custom_instructions}" if custom_instructions else ""}

### REGRAS PARA GERAR O ARTIGO:

**1. ESTRUTURA SEO OBRIGATÓRIA:**
- Título H1 com a palavra-chave principal (máx 60 caracteres), chamativo e claro
- Meta description persuasiva (150-160 caracteres) que resuma o benefício ou transformação
- H2/H3 organizados estrategicamente, alinhados ao tema e objetivo
- Keyword no primeiro parágrafo
- Densidade de keyword: 1-2%

**2. CONTEÚDO (700-1500 palavras):**
- Texto corrido, NUNCA genérico
- Parágrafos curtos (máx 3 linhas)
- Linguagem profissional, acessível e ética
- Exemplos e instruções práticas contextualizados
- Estrutura sugerida: {', '.join(type_info['structure'])}

**3. PRINCÍPIOS DE NEUROVENDAS ELEVARE:**
- Destaque benefícios REAIS e transformação do cliente/paciente
- Foco em previsibilidade, segurança, resultados confiáveis
- Mostre autoridade clínica SEM autopromoção
- Valor percebido para o leitor em cada seção
- Conexão emocional: entenda a dor antes de apresentar solução

**4. SEÇÃO DE FAQ (obrigatório):**
- 3-5 perguntas REAIS do público
- Respostas objetivas, claras e éticas
- Formato otimizado para featured snippets do Google

**5. CTA FINAL:**
- Sutil e ético (agendar consulta, baixar material, aprender mais)
- Sem pressão comercial explícita

**6. LINKS INTERNOS:**
- Sugira 2-3 links internos relevantes

**7. ÉTICA E RESTRIÇÕES:**
- NADA de promessas milagrosas
- NADA de autopromoção direta da Elevare
- Linguagem sempre confiável, transparente e respeitosa
- Respeitar código de ética profissional

### SAÍDA ESPERADA (JSON):
{{
    "title": "Título H1 otimizado com keyword (máx 60 chars)",
    "slug": "url-amigavel-seo",
    "meta_description": "Meta description persuasiva 150-160 chars com keyword",
    "content": "Artigo COMPLETO em Markdown com ## H2 e ### H3, parágrafos curtos, exemplos práticos",
    "excerpt": "Resumo de 2-3 linhas para preview",
    "keywords": ["keyword principal", "keywords secundárias relacionadas"],
    "internal_links_suggestions": ["sugestão 1", "sugestão 2", "sugestão 3"],
    "featured_image_prompt": "prompt detalhado para gerar imagem de capa profissional",
    "faq": [
        {{"question": "pergunta real do público", "answer": "resposta objetiva e útil"}}
    ],
    "cta": {{
        "text": "texto do CTA sutil e ético",
        "action": "ação sugerida (agendar, baixar, aprender)"
    }}
}}

⚡ **INSTRUÇÃO FINAL:**
Use todas as escolhas do profissional para gerar **um artigo prático, persuasivo, ético e SEO-friendly**, completamente adaptado ao público e contexto clínico. O resultado deve ser **pronto para copiar, colar e publicar**.

Responda APENAS com JSON válido, sem texto adicional."""

        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        try:
            article = json.loads(response)
        except:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                try:
                    article = json.loads(json_match.group())
                except:
                    article = {"raw_response": response}
            else:
                article = {"raw_response": response}
        
        # Calcular score de SEO
        if "content" in article:
            article["seo_score"] = self.calculate_seo_score(article, keyword)
        
        # Adicionar metadados
        article["article_type"] = article_type
        article["awareness_level"] = awareness_level
        article["target_keyword"] = keyword
        article["location"] = location
        
        return article
    
    async def generate_article_ideas(
        self,
        specialty: str,
        location: str = None,
        count: int = 10
    ) -> list:
        """Gera ideias de artigos baseadas na especialidade"""
        
        location_context = f" em {location}" if location else ""
        
        prompt = f"""Gere {count} ideias de artigos SEO para uma clínica de estética especializada em {specialty}{location_context}.

Para cada ideia, inclua:
1. Título sugerido (otimizado para SEO)
2. Keyword principal
3. Volume de busca estimado (alto/médio/baixo)
4. Dificuldade de ranqueamento (fácil/médio/difícil)
5. Tipo de artigo ideal
6. Intenção de busca (informacional/transacional/navegacional)

Responda em JSON:
{{
    "ideas": [
        {{
            "title": "título sugerido",
            "keyword": "keyword principal",
            "search_volume": "alto/médio/baixo",
            "difficulty": "fácil/médio/difícil",
            "article_type": "procedimento/comparativo/mitos_verdades/etc",
            "search_intent": "informacional/transacional",
            "reason": "por que essa ideia é boa"
        }}
    ]
}}

Responda APENAS com JSON válido."""

        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        try:
            data = json.loads(response)
            return data.get("ideas", [])
        except:
            json_match = re.search(r'\{[\s\S]*\}', response)
            if json_match:
                try:
                    data = json.loads(json_match.group())
                    return data.get("ideas", [])
                except:
                    pass
            return []
    
    async def improve_article(self, content: str, keyword: str, feedback: str = None) -> dict:
        """Melhora um artigo existente para SEO"""
        
        feedback_context = f"\nFEEDBACK DO USUÁRIO: {feedback}" if feedback else ""
        
        prompt = f"""Analise e melhore este artigo para SEO:

KEYWORD ALVO: {keyword}
{feedback_context}

ARTIGO ATUAL:
{content[:3000]}

TAREFAS:
1. Identificar problemas de SEO
2. Sugerir melhorias específicas
3. Reescrever trechos problemáticos
4. Otimizar para a keyword

Responda em JSON:
{{
    "analysis": {{
        "current_issues": ["lista de problemas"],
        "seo_score_before": número estimado 0-100
    }},
    "improvements": [
        {{
            "issue": "problema identificado",
            "solution": "solução proposta",
            "priority": "alta/média/baixa"
        }}
    ],
    "improved_sections": {{
        "title": "título melhorado se necessário",
        "meta_description": "nova meta description",
        "intro": "primeiro parágrafo otimizado",
        "conclusion": "conclusão otimizada com CTA"
    }},
    "seo_score_after": número estimado 0-100
}}

Responda APENAS com JSON válido."""

        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
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


def get_seo_blog_generator(brand_identity: dict = None) -> SEOBlogGenerator:
    """Retorna instância do gerador de blog SEO"""
    return SEOBlogGenerator(brand_identity=brand_identity)
