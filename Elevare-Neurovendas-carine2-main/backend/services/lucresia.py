"""LucresIA - Inteligência Estratégica da Plataforma Elevare

IA especializada em estética, criada por Carine Marques com 20+ anos de experiência.
Método OÁSIS DE CONVERSÃO integrado.
"""

import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv

load_dotenv()

LUCRESIA_SYSTEM_PROMPT = """
🔮 PROMPT OFICIAL — LUCRESIA | ELEVARE NEUROVENDAS

Você é Lucresia, a Inteligência Estratégica da Plataforma Elevare NeuroVendas.
Sua função é transformar conversas em vendas, agendamentos e decisões inteligentes de negócio, especialmente para profissionais da estética, saúde e bem-estar.

Você atua como:
- Assistente de atendimento
- Gestora de agenda
- Analista de conversão
- Consultora estratégica de faturamento

Você não é robótica, não usa linguagem genérica e não promete milagres.
Você fala de forma clara, profissional, acolhedora e objetiva.

🎯 OBJETIVO PRINCIPAL
Converter contatos em:
- Agendamentos confirmados
- Vendas de sessões ou pacotes
- Dados estratégicos para análise do negócio

E gerar insights práticos para melhorar:
- Conversão
- Ticket médio
- Ocupação da agenda

🧠 MÉTODO OÁSIS DE CONVERSÃO

Tagline: Transforme a sede do cliente em venda — rápido, preciso e com autoridade.

Princípios norteadores:
1. Sede primeiro, currículo depois - Fale do resultado que ela quer, não do seu certificado
2. Micro-dor vende mais que a dor óbvia - Use micro-dores emocionais para puxar a decisão
3. Ofertas cristalinas - Responda: Solução / Cliente / Diferencial com especificidade cirúrgica
4. Conteúdo orientado à ação - Framework AISV (Atenção, Interesse, Solução, Venda)
5. Automação com humanidade - Use automação para escalar, não para desumanizar

📝 FRAMEWORK AISV PARA CONTEÚDO:
- ATENÇÃO: Gancho com micro-dor + promessa curta
- INTERESSE: Amplifique a micro-dor, mini-caso
- SOLUÇÃO: Contraste antes/depois, explique por que funciona
- VENDA/CTA: Nome do método + CTA direto

🗣️ TOM DE VOZ
- Profissional
- Humano
- Seguro
- Sem promessas exageradas
- Sem termos técnicos desnecessários
- Focado em resultado

Você fala como uma gestora experiente, não como robô.

🚫 O QUE VOCÊ NÃO DEVE FAZER
- Não usar linguagem genérica de chatbot
- Não responder apenas "valores"
- Não prometer resultados garantidos
- Não inventar dados
- Não ignorar contexto da conversa

🧩 MISSÃO FINAL
Seu papel é simples e poderoso:
👉 Ajudar profissionais a ganharem dinheiro com mais consciência, organização e previsibilidade.

Você é o braço inteligente do Elevare.
Você existe para transformar atendimento em negócio.
"""

class LucresIA:
    """LucresIA - IA especializada em estética e neurovendas"""
    
    def __init__(self, session_id: str, user_context: dict = None, brand_identity: dict = None):
        self.api_key = os.environ.get("EMERGENT_LLM_KEY")
        self.session_id = session_id
        self.user_context = user_context or {}
        self.brand_identity = brand_identity or {}
        
        # Personalizar system prompt com contexto do usuário e identidade da marca
        system_message = LUCRESIA_SYSTEM_PROMPT
        
        # Adicionar contexto do usuário
        if user_context:
            system_message += f"\n\n📊 CONTEXTO DO USUÁRIO:\n"
            if user_context.get("name"):
                system_message += f"Nome: {user_context['name']}\n"
            if user_context.get("nicho"):
                system_message += f"Nicho: {user_context['nicho']}\n"
            if user_context.get("especialidade"):
                system_message += f"Especialidade: {user_context['especialidade']}\n"
            if user_context.get("publico_alvo"):
                system_message += f"Público-alvo: {user_context['publico_alvo']}\n"
            if user_context.get("tom_voz"):
                system_message += f"Tom de voz preferido: {user_context['tom_voz']}\n"
        
        # Adicionar identidade da marca
        if brand_identity:
            system_message += f"\n\n🎨 IDENTIDADE DA MARCA:\n"
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
            system_message += "\nUse essa identidade para personalizar todas as respostas e conteúdos gerados.\n"
        
        self.chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4o")
    
    async def send_message(self, message: str) -> str:
        """Envia mensagem para LucresIA e retorna resposta"""
        user_message = UserMessage(text=message)
        response = await self.chat.send_message(user_message)
        return response
    
    async def analyze_bio(self, instagram_handle: str, bio_text: str = None) -> dict:
        """Analisa bio do Instagram como DOCUMENTO DE IDENTIDADE ESTRATÉGICA DA MARCA"""
        
        prompt = f"""🎯 TAREFA OBRIGATÓRIA:
Trate a bio fornecida como DOCUMENTO DE IDENTIDADE ESTRATÉGICA DA MARCA, com prioridade máxima.

Perfil: @{instagram_handle}
{f'Bio atual: {bio_text}' if bio_text else 'Bio não fornecida - analise apenas o handle e faça perguntas estratégicas.'}

📋 EXECUÇÃO OBRIGATÓRIA:

1. ANÁLISE COMO ESTRATEGISTA DE BRANDING:
Analise a bio como um estrategista de branding e marketing de autoridade analisaria.
NÃO faça análise superficial. INTERPRETE. OPINE. TOME POSIÇÃO.

2. EXTRAIA E DEFINA EXPLICITAMENTE:
- Arquétipo dominante da marca (qual personalidade de marca ela projeta?)
- Promessa central (qual transformação ela promete?)
- Público real (quem é o cliente IDEAL, não genérico?)
- Tom de voz permitido (como essa marca DEVE falar?)
- Linguagem proibida (o que essa marca JAMAIS deve dizer?)
- Nível de autoridade esperado (especialista, mentor, parceira, referência?)
- Posicionamento competitivo (do que ela se diferencia? Do que ela se AFASTA?)

3. GERE O MANIFESTO DE IDENTIDADE DA MARCA:
- Essência da marca em 1 frase (não pode ser genérica)
- 3 Princípios inegociáveis (o que essa marca defende de forma intransigente)
- Estilo narrativo obrigatório (como ela conta histórias)
- Tipo de conteúdo PROIBIDO (o que essa marca JAMAIS deve produzir)

4. REESCREVA A BIO FINAL:
- Com clareza estratégica absoluta
- Com posicionamento FORTE e diferenciado
- SEM frases genéricas que qualquer marca usaria
- SEM tom neutro ou institucional
- COM voz autoral reconhecível

5. VALIDAÇÃO CRÍTICA:
Antes de entregar, valide internamente:
"Isso poderia ser publicado por qualquer marca de estética?"
Se SIM, refaça até que seja INEQUIVOCAMENTE reconhecível como ESTA marca.

Forneça em formato JSON:
{{
    "score": 0-100,
    "diagnostico_estrategico": "Diagnóstico direto e sem rodeios do estado atual da bio",
    "identidade_estrategica": {{
        "arquetipo_dominante": "nome do arquétipo + explicação",
        "promessa_central": "a transformação prometida",
        "publico_real": "descrição específica do cliente ideal",
        "tom_de_voz": "como a marca deve falar",
        "linguagem_proibida": ["lista de termos/abordagens proibidas"],
        "nivel_autoridade": "tipo de autoridade projetada",
        "posicionamento": {{
            "diferencia_de": "do que ela se diferencia",
            "afasta_de": "do que ela se afasta completamente"
        }}
    }},
    "manifesto_marca": {{
        "essencia": "essência da marca em 1 frase única e poderosa",
        "principios_inegociaveis": ["3 princípios que a marca defende"],
        "estilo_narrativo": "como essa marca conta histórias",
        "conteudo_proibido": ["tipos de conteúdo que essa marca NUNCA deve produzir"]
    }},
    "pontos_fortes": ["o que já funciona estrategicamente"],
    "falhas_criticas": ["problemas sérios que enfraquecem a marca"],
    "micro_dores_identificadas": ["micro-dores emocionais do público que podem ser exploradas"],
    "bio_estrategica": "bio completamente reescrita com posicionamento forte e voz autoral",
    "ganchos_autorais": ["3 ganchos de conteúdo únicos para essa marca"],
    "cta_diferenciado": "CTA que só essa marca poderia usar",
    "proximos_passos_estrategicos": ["3 ações estratégicas prioritárias"],
    "veredicto_final": "opinião direta e honesta sobre o potencial da marca"
}}

REGRA CRÍTICA: Seja DIRETO, OPINATIVO e ESTRATÉGICO. 
NÃO seja neutro. NÃO seja genérico. NÃO seja diplomático demais.
A IA que não toma posição é inútil.

Responda APENAS com o JSON válido."""
        
        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        # Tentar parsear como JSON
        import json
        try:
            # Limpar resposta se tiver markdown
            clean_response = response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.startswith("```"):
                clean_response = clean_response[3:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            return json.loads(clean_response.strip())
        except:
            return {"raw_response": response, "score": 0}
    
    async def generate_content_aisv(self, tema: str, tipo: str, tom: str = "profissional") -> dict:
        """Gera conteúdo usando framework NeuroVendas Elevare"""
        
        # Contexto da marca
        brand_context = ""
        if self.brand_identity:
            brand_context = f"""
IDENTIDADE DA MARCA:
- Marca: {self.brand_identity.get('brand_name', 'Não definido')}
- Segmento: {self.brand_identity.get('segment', 'estética')}
- Especialidade: {self.brand_identity.get('main_specialty', 'Não definido')}
- Posicionamento: {self.brand_identity.get('positioning', 'profissional')}
- Estilo Visual: {self.brand_identity.get('visual_style', 'clean')}
- Frases-chave: {', '.join(self.brand_identity.get('key_phrases', [])) or 'Não definidas'}

Use essa identidade para personalizar o conteúdo.
"""
        
        if tipo == "carrossel":
            prompt = f"""Crie um carrossel de 8 slides usando a ESTRUTURA NEUROVENDAS ELEVARE:

{brand_context}

Tema: {tema}
Tom: {tom}

ESTRUTURA OBRIGATÓRIA:

SLIDE 1 - HOOK VISCERAL:
Quebra de padrão ou promessa clara e realista. Faça PARAR de rolar.

SLIDES 2-3 - DOR REAL:
Dor real do profissional ou cliente. Linguagem simples, cotidiana, sem jargão.
Faça ela pensar "isso sou eu".

SLIDES 4-5 - CONSCIÊNCIA DO CUSTO INVISÍVEL:
Tempo perdido, dinheiro na mesa, agenda vazia, desgaste emocional.
O preço de NÃO resolver isso.

SLIDES 6-7 - NOVA PERSPECTIVA:
Solução possível, sem promessas irreais, sem linguagem médica proibida.
Mostre que existe caminho.

SLIDE 8 - CTA:
CTA direto e acionável (comentar, direct, salvar, link).

REGRAS DE ESCRITA (TRAVAS DO SISTEMA):
✅ Frases curtas e escaneáveis
✅ Linguagem humana, direta e brasileira
✅ Tom de quem vive clínica, lida com agenda vazia
❌ ZERO clichês de marketing genérico
❌ ZERO emojis excessivos
❌ ZERO promessas milagrosas
❌ ZERO termos médicos ou garantias

Forneça em formato JSON:
{{
    "titulo": "título do conteúdo",
    "tipo": "carrossel",
    "slides": [
        {{
            "numero": 1,
            "fase": "HOOK",
            "texto": "texto do slide (máx 30 palavras)",
            "dica_visual": "sugestão visual específica"
        }}
    ],
    "legenda_completa": "legenda para postar (máx 200 palavras)",
    "hashtags": ["5 hashtags relevantes"],
    "melhor_horario": "sugestão de horário",
    "cta": "call-to-action"
}}

Responda APENAS com o JSON válido."""
        else:
            prompt = f"""Crie um conteúdo completo usando o Framework NeuroVendas para:

{brand_context}

Tema: {tema}
Tipo: {tipo} (post/reels/stories)
Tom: {tom}

REGRAS DE ESCRITA:
✅ Frases curtas e escaneáveis
✅ Linguagem humana, direta e brasileira
✅ Tom de quem vive a realidade da clínica
❌ ZERO clichês de marketing
❌ ZERO promessas milagrosas

Estrutura:
- GANCHO: Micro-dor + promessa curta
- DESENVOLVIMENTO: Amplifique a dor, mini-caso
- VIRADA: Nova perspectiva, solução
- CTA: Ação clara e direta

Forneça em formato JSON:
{{
    "titulo": "título do conteúdo",
    "tipo": "{tipo}",
    "slides": [
        {{
            "numero": 1,
            "fase": "GANCHO",
            "texto": "texto do slide",
            "dica_visual": "sugestão de visual"
        }}
    ],
    "legenda_completa": "legenda para postar",
    "hashtags": ["lista de hashtags"],
    "melhor_horario": "sugestão de horário",
    "cta": "call-to-action"
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
    
    async def generate_persona(self, servico: str, nicho: str = "estética") -> dict:
        """Gera persona profunda usando método OÁSIS"""
        prompt = f"""Você é um analista de marketing especialista em psicologia do consumidor e neuromarketing.

Crie a persona ideal para: {servico}
Nicho: {nicho}

Inclua em formato JSON:
{{
    "nome": "nome fictício da persona",
    "idade": "faixa etária",
    "ocupacao": "profissão",
    "local": "cidade/região",
    "rotina": "descrição da rotina diária",
    "dor_principal": "a maior dor/problema",
    "micro_dores": ["5 micro-dores emocionais específicas"],
    "medos_profundos": ["5 medos que ela não verbaliza"],
    "crencas_limitantes": ["crenças que a impedem de agir"],
    "tentativas_anteriores": [
        {{
            "o_que_tentou": "descrição",
            "por_que_falhou": "motivo da frustração"
        }}
    ],
    "gatilhos_acao": ["3 gatilhos que fazem ela agir"],
    "desejo_verdadeiro": "o que ela realmente quer (1 frase)",
    "provas_que_convencem": [
        "tipo de depoimento",
        "resultado mensurável",
        "garantia"
    ],
    "frase_interna": "o que ela pensa quando vê seu anúncio",
    "objecoes_comuns": ["objeções que ela vai levantar"]
}}

Use linguagem vívida e emotiva. Responda APENAS com o JSON válido."""
        
        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        import json
        try:
            return json.loads(response)
        except:
            return {"raw_response": response}
    
    async def generate_ebook(self, topic: str, target_audience: str, chapters: int = 5) -> dict:
        """Gera e-book completo"""
        prompt = f"""Crie um e-book completo sobre: {topic}

Público-alvo: {target_audience}
Número de capítulos: {chapters}

Use o método OÁSIS - comece pela dor/sede do cliente, não pelo currículo.

Forneça em formato JSON:
{{
    "titulo": "título chamativo",
    "subtitulo": "subtítulo",
    "descricao": "descrição para landing page",
    "capitulos": [
        {{
            "numero": 1,
            "titulo": "título do capítulo",
            "conteudo": "conteúdo em markdown (mínimo 300 palavras)"
        }}
    ],
    "conclusao": "conclusão do e-book",
    "cta_final": "call-to-action final",
    "prompt_capa": "prompt para gerar capa com IA"
}}

Seja detalhado e prático. Responda APENAS com o JSON válido."""
        
        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        import json
        try:
            return json.loads(response)
        except:
            return {"raw_response": response}
    
    async def generate_script_direct(self, tipo: str = "premium") -> dict:
        """Gera scripts para automação de Direct/WhatsApp"""
        prompt = f"""Crie um fluxo completo de mensagens para Direct/WhatsApp usando método OÁSIS.

Tipo: {tipo} (fast = baixo ticket/volume | premium = alto ticket/qualificação)

Forneça em formato JSON:
{{
    "tipo": "{tipo}",
    "trigger": "como ativar o fluxo",
    "mensagem_inicial": "primeira mensagem automática",
    "sequencia": [
        {{
            "numero": 1,
            "objetivo": "objetivo da mensagem",
            "texto": "texto da mensagem",
            "automatica": true/false
        }}
    ],
    "respostas_objecoes": [
        {{
            "objecao": "objeção comum",
            "resposta": "como responder"
        }}
    ],
    "fechamento": "script de fechamento",
    "dicas": ["dicas para melhor conversão"]
}}

Responda APENAS com o JSON válido."""
        
        user_message = UserMessage(text=prompt)
        response = await self.chat.send_message(user_message)
        
        import json
        try:
            return json.loads(response)
        except:
            return {"raw_response": response}


# Biblioteca de Prompts Estratégicos
PROMPTS_BIBLIOTECA = {
    "persona_profunda": {
        "titulo": "Criar Persona Profunda",
        "descricao": "Gera persona detalhada com micro-dores e gatilhos",
        "categoria": "estrategia",
        "prompt": """Você é um analista de marketing especialista em psicologia do consumidor e neuromarketing. 
Crie a persona ideal para [NOME DO SERVIÇO]. 
Inclua: nome, idade, ocupação, rotina, dor principal, 5 micro-dores, 5 medos profundos, 
crenças limitantes, tentativas anteriores (com frustrações), gatilhos emocionais, 
desejos verdadeiros e provas que a convenceriam. Use linguagem vívida e emotiva."""
    },
    "carrossel_aisv": {
        "titulo": "Carrossel AISV (8 slides)",
        "descricao": "Estrutura completa de carrossel que converte",
        "categoria": "conteudo",
        "prompt": """Crie um carrossel de 8 slides usando framework AISV:

Slide 1 (GANCHO): micro-dor + promessa curta. (ex.: "Cansada de esconder as coxas no verão?")
Slides 2-4 (INTERESSE): amplifique a micro-dor, conte mini-caso + faça dizer "sim" mentalmente.
Slides 5-7 (SOLUÇÃO): contraste antes/depois, explique por que funciona (sem jargão técnico).
Slide 8 (VENDA/CTA): Nome do método + CTA direto (comente palavra-chave / link no direct).

Tema: [INSERIR TEMA]"""
    },
    "oferta_cristalina": {
        "titulo": "Fórmula de Oferta Cristalina",
        "descricao": "Copy mestre para qualquer oferta",
        "categoria": "copy",
        "prompt": """Use esta fórmula para criar uma oferta irresistível:

[Quem] consegue [resultado mensurável e emocional] em [prazo] através de [metodologia/nome do protocolo], sem [objeção óbvia].

Exemplo:
Mulheres após os 35 conseguem reduzir celulite visível e recuperar confiança em 6 semanas com o protocolo Oásis Sculpt™ — sem dietas extremas nem sessões diárias na clínica.

Crie 3 variações para: [INSERIR SERVIÇO]"""
    },
    "ganchos_magneticos": {
        "titulo": "Ganchos Magnéticos",
        "descricao": "10 ganchos que param o scroll",
        "categoria": "conteudo",
        "prompt": """Crie 10 ganchos magnéticos para posts sobre [TEMA] usando micro-dores.

Exemplos de estrutura:
- "Se [micro-dor], leia isso."
- "[Erro comum]: X erros que te prendem ao [problema]."
- "Como [resultado] em [prazo] sem [objeção]."

Foco em: despertar curiosidade, gerar identificação imediata, não revelar tudo no gancho."""
    },
    "bio_otimizada": {
        "titulo": "Bio do Instagram Otimizada",
        "descricao": "Bio que converte visitantes em clientes",
        "categoria": "instagram",
        "prompt": """Crie uma bio otimizada para Instagram de profissional de estética:

Elementos obrigatórios:
1. Proposta de valor clara (resultado, não procedimento)
2. Social proof (número de clientes/anos de experiência)
3. Diferencial único
4. CTA direto
5. Emojis estratégicos (máximo 3)

Serviço principal: [INSERIR]
Diferencial: [INSERIR]
Localização: [INSERIR]"""
    },
    "script_whatsapp_fast": {
        "titulo": "Script WhatsApp - Volume",
        "descricao": "Fluxo rápido para alto volume de leads",
        "categoria": "vendas",
        "prompt": """Crie um script de WhatsApp para alto volume:

Mensagem inicial auto:
"Oi! Obrigada por comentar. Você quer: 1) saber preço; 2) ver resultados; 3) agendar avaliação? Responda 1, 2 ou 3."

Crie as respostas para cada opção + fechamento."""
    },
    "script_whatsapp_premium": {
        "titulo": "Script WhatsApp - Premium",
        "descricao": "Fluxo de qualificação para alto ticket",
        "categoria": "vendas",
        "prompt": """Crie um script de WhatsApp premium para qualificação:

Mensagem inicial auto:
"Obrigada! Antes de te mandar os detalhes: me conta em 1 frase qual a maior frustração hoje com [problema]."

Crie sequência de qualificação + proposta + fechamento."""
    },
    "roteiro_reels": {
        "titulo": "Roteiro de Reels Viral",
        "descricao": "Estrutura de 30s que engaja",
        "categoria": "conteudo",
        "prompt": """Crie um roteiro de Reels de 30 segundos:

🎬 CENA 1 (0-3s): GANCHO
"Você precisa conhecer isso!"

🎬 CENA 2 (3-10s): PROBLEMA
"Muitas pessoas sofrem com..."

🎬 CENA 3 (10-20s): SOLUÇÃO
"E é por isso que [método] pode te ajudar!"

🎬 CENA 4 (20-25s): PROVA
"Já ajudamos centenas de clientes..."

🎬 CENA 5 (25-30s): CTA
"Link na bio para agendar!"

Tema: [INSERIR TEMA]"""
    },
    "sequencia_stories": {
        "titulo": "Sequência de Stories",
        "descricao": "5 stories que vendem",
        "categoria": "conteudo",
        "prompt": """Crie uma sequência de 5 stories que vendem:

🔵 STORY 1: Enquete (gera engajamento)
🔵 STORY 2: Educativo (gera valor)
🔵 STORY 3: Prova social (gera confiança)
🔵 STORY 4: Benefícios (gera desejo)
🔵 STORY 5: CTA (gera ação)

Tema: [INSERIR TEMA]"""
    },
    "checklist_atendimento": {
        "titulo": "Checklist Pré-Atendimento",
        "descricao": "Lista completa para preparar atendimento",
        "categoria": "operacional",
        "prompt": """Crie um checklist completo de pré-atendimento para clínica de estética:

✅ 24h antes
✅ 2h antes
✅ 30min antes
✅ No momento
✅ Após o procedimento

Inclua: ambiente, materiais, comunicação com cliente, follow-up."""
    }
}

# Templates de Conteúdo Prontos
TEMPLATES_CONTEUDO = {
    "post_autoridade": {
        "titulo": "Post de Autoridade",
        "tipo": "autoridade",
        "cor": "purple",
        "estrutura": """✨ [GANCHO DE AUTORIDADE]

[Estatística ou fato surpreendente]

[Sua experiência/expertise]

[Dica prática]

💡 Salve esse post para consultar depois!

#estetica #autoridade #dica"""
    },
    "post_desejo": {
        "titulo": "Post de Desejo",
        "tipo": "desejo",
        "cor": "pink",
        "estrutura": """🌟 Imagine [resultado desejado]...

[Descreva a transformação em detalhes sensoriais]

[Como ela vai se sentir]

[Prova de que é possível]

✨ Quer saber como? Comente [PALAVRA-CHAVE]

#transformacao #resultado #beleza"""
    },
    "post_fechamento": {
        "titulo": "Post de Fechamento",
        "tipo": "fechamento",
        "cor": "green",
        "estrutura": """🎯 [OFERTA DIRETA]

⏰ [Urgência/Escassez]

✅ [Benefício 1]
✅ [Benefício 2]
✅ [Benefício 3]

🎁 [Bônus especial]

📱 Agende agora pelo link na bio!

#promocao #agenda #estetica"""
    },
    "post_conexao": {
        "titulo": "Post de Conexão",
        "tipo": "conexao",
        "cor": "amber",
        "estrutura": """💬 [Pergunta que gera identificação]

[História pessoal ou de cliente]

[Vulnerabilidade autêntica]

[Mensagem inspiradora]

❤️ Comente se você se identificou!

#conexao #historia #inspiracao"""
    }
}
