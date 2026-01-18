"""
Templates de Prompts Premium para Neurovendas
Sistema de geração de apresentações de alta conversão para estética
"""

from typing import Dict, Optional

class NeurovendasPromptBuilder:
    """Construtor de prompts otimizados para conversão em estética"""
    
    @staticmethod
    def build_procedimento_prompt(
        procedimento: str,
        publico_alvo: str = "pacientes de alto ticket",
        problema_principal: str = None,
        diferencial_clinica: str = None,
        preco_investimento: str = None
    ) -> str:
        """
        Constrói prompt premium para apresentação de procedimento estético
        
        Args:
            procedimento: Nome do procedimento (ex: "Harmonização Facial")
            publico_alvo: Perfil do público (padrão: alto ticket)
            problema_principal: Dor principal a ser abordada
            diferencial_clinica: O que torna a clínica única
            preco_investimento: Faixa de preço (opcional)
        """
        
        # Problema padrão se não fornecido
        if not problema_principal:
            problema_principal = "perda de autoestima e sinais visíveis de envelhecimento"
        
        # Diferencial padrão
        if not diferencial_clinica:
            diferencial_clinica = "tecnologia de ponta, segurança comprovada e resultados naturais"
        
        prompt = f"""### ROLE
Você é um Especialista em Neurovendas e Designer de Luxo para Clínicas de Estética Avançada.

### OBJECTIVE
Crie uma apresentação de vendas premium para o procedimento: **{procedimento}**. 

O objetivo é converter {publico_alvo} usando gatilhos de:
- Autoridade (credibilidade técnica e científica)
- Segurança (processo seguro e tecnologia avançada)
- Desejo Visual (resultados naturais e transformação real)

### VISUAL STYLE GUIDE
**Cores:** Paleta "Quiet Luxury"
- Primária: Nude (#F5E6D3), Off-white (#FAF9F6)
- Acentos: Champagne (#F7E7CE), Rose Gold (#B76E79)
- Contraste: Cinza Elegante (#4A4A4A)

**Imagens:** Fotos de alta qualidade que evoquem:
- Limpeza e higiene hospitalar
- Tecnologia médica de ponta
- Resultados naturais e sutis
- Bem-estar e autoestima

**Tipografia:**
- Títulos: Fonte serifada (autoridade e tradição)
- Corpo: Sans-serif clean (modernidade e clareza)

### STRUCTURE (Slide a Slide)

**SLIDE 1 - CAPA MAGNÉTICA**
Título: "A Arte da [Benefício Emocional do {procedimento}]"
Subtítulo: Transformação natural que respeita sua essência
Visual: Imagem limpa e elegante relacionada ao procedimento

**SLIDE 2 - O DESPERTAR (Gatilho de Dor)**
Título: "O Que o Espelho Diz Hoje?"
Conteúdo:
- Identificação da dor: {problema_principal}
- Impacto na autoestima e confiança
- O custo emocional de adiar a solução
Visual: Contraste sutil entre preocupação e esperança

**SLIDE 3 - A CIÊNCIA POR TRÁS**
Título: "Como Funciona a Transformação?"
Conteúdo:
- Explicação neurocientífica acessível do procedimento
- Mecanismo de ação nas camadas profundas
- Por que funciona: ciência + arte
Visual: Ilustração médica clean ou diagrama elegante

**SLIDE 4 - O DIFERENCIAL ÚNICO**
Título: "Por Que Escolher Este Método?"
Conteúdo:
- {diferencial_clinica}
- Segurança comprovada cientificamente
- Resultados naturais e duradouros
- Tecnologia de última geração
Visual: Ícones de certificações ou tecnologia

**SLIDE 5 - PROVA SOCIAL (Transformações Reais)**
Título: "Resultados Que Falam Por Si"
Conteúdo:
- [ESPAÇO RESERVADO] Antes e Depois
- Depoimentos de pacientes satisfeitas
- Estatísticas de satisfação
Visual: Grid profissional de resultados

**SLIDE 6 - O INVESTIMENTO (Ancoragem de Valor)**
Título: "Investimento no Seu Bem-Estar"
Conteúdo:
- Apresentar valor como "Custo do Bem-estar" vs "Preço"
- Comparação: "Quanto você investe mensalmente em [outros produtos]?"
- Parcelamento acessível e facilidades{f'''
- Investimento: {preco_investimento}''' if preco_investimento else ''}
Visual: Layout clean focado no benefício, não no preço

**SLIDE 7 - CTA FINAL (Comando Direto)**
Título: "Sua Transformação Começa Agora"
Conteúdo:
- Chamada clara: "Agende Sua Avaliação Gratuita"
- Senso de urgência (sem pressão): "Vagas limitadas por mês"
- Garantia de satisfação
- Botão de ação destacado
Visual: Imagem inspiradora de confiança

**SLIDE 8 - ENCERRAMENTO (Autoridade)**
Título: "Você Merece Se Sentir Bem"
Conteúdo:
- Reforço da credibilidade da clínica
- Contatos e redes sociais
- Certificações e prêmios
Visual: Logo da clínica + selos de qualidade

### LANGUAGE & TONE
**Idioma:** Português Brasileiro (PT-BR)

**Tom de Voz:** 
- Elegante e sofisticado (público alto ticket)
- Empático e acolhedor (compreende as dores)
- Autoritário sem ser arrogante (credibilidade técnica)

**Vocabulário:**
✅ USE: "Transformação natural", "Bem-estar", "Autoestima", "Investimento", "Sua essência"
❌ EVITE: Termos excessivamente técnicos sem contexto

**Regra de Ouro:**
Em vez de "Estimular fibroblastos" → Use "Acordar a produção natural de juventude da sua pele"
Em vez de "Aplicação de toxina botulínica" → Use "Suavização natural de linhas de expressão"

### GATILHOS MENTAIS APLICADOS
1. **Autoridade:** Ciência, certificações, tecnologia
2. **Prova Social:** Resultados reais, depoimentos
3. **Escassez:** Vagas limitadas (sem pressão)
4. **Reciprocidade:** Avaliação gratuita
5. **Ancoragem:** Investimento vs. preço
6. **Desejo:** Transformação e autoestima

### OUTPUT FORMAT
Retorne uma apresentação de 8 slides em formato estruturado, pronta para o Gamma gerar com design premium.
Cada slide deve ter:
- Título impactante
- Conteúdo persuasivo e conciso
- Sugestão de visual específico
- Gatilho mental aplicado

**IMPORTANTE:** 
- Mantenha linguagem acessível e elegante
- Foque no benefício emocional final
- Use storytelling sutil (jornada do paciente)
- Evite jargões médicos sem explicação
"""
        
        return prompt
    
    @staticmethod
    def build_script_vendas_prompt(
        procedimento: str,
        etapa_funil: str = "consultoria inicial",
        objecao_principal: str = "preço alto"
    ) -> str:
        """
        Constrói prompt para script de vendas via WhatsApp/Presencial
        
        Args:
            procedimento: Procedimento a ser vendido
            etapa_funil: Etapa do funil (inicial, apresentação, fechamento)
            objecao_principal: Principal objeção a ser trabalhada
        """
        
        prompt = f"""### ROLE
Você é uma Consultora de Neurovendas especializada em Estética de Alto Ticket.

### OBJECTIVE
Crie um script de vendas persuasivo para {etapa_funil} do procedimento **{procedimento}**.

O script deve:
- Construir rapport genuíno
- Identificar dores emocionais profundas
- Apresentar solução natural e sem pressão
- Trabalhar a objeção: "{objecao_principal}"
- Conduzir para próxima etapa do funil

### STRUCTURE DO SCRIPT

**1. ABERTURA (Rapport)**
- Acolhimento caloroso
- Pergunta de interesse genuíno
- Conexão emocional

**2. DESCOBERTA (Dor)**
- Perguntas estratégicas abertas
- Escuta ativa
- Validação emocional

**3. APRESENTAÇÃO (Solução)**
- Introdução natural do {procedimento}
- Foco em benefícios emocionais
- Casos de sucesso similares

**4. MANEJO DE OBJEÇÃO**
- Antecipação da objeção "{objecao_principal}"
- Resposta empática e lógica
- Reframing positivo

**5. FECHAMENTO (Próximo Passo)**
- Call to action suave
- Criação de próximo compromisso
- Reforço de confiança

### TONE & LANGUAGE
- Tom: Consultivo, empático, confiante
- Linguagem: Natural e conversacional
- Evitar: Jargões técnicos, pressão de vendas

### OUTPUT
Retorne o script completo linha a linha, com indicações de pausas e ênfases.
"""
        
        return prompt
    
    @staticmethod
    def build_ebook_premium_prompt(
        titulo: str,
        tema: str,
        publico: str
    ) -> str:
        """
        Constrói prompt para e-book educativo premium de estética
        """
        
        prompt = f"""### ROLE
Você é uma Estrategista de Conteúdo Premium para o mercado de Estética Avançada.

### OBJECTIVE
Crie um e-book educativo e persuasivo sobre: **{tema}**

**Título:** {titulo}
**Público-alvo:** {publico}

### BRAND VOICE - ELEVARE NEUROVENDAS
- Elegante e acessível
- Científico mas humanizado
- Inspirador e prático

### STRUCTURE (E-book Premium)

**CAPA**
- Título principal: {titulo}
- Subtítulo emocional
- Design: Minimalista luxury

**INTRODUÇÃO (200-250 palavras)**
- Conexão imediata com a dor do leitor
- Promessa clara do e-book
- Estabelecimento de autoridade

**CAPÍTULOS (5-7 capítulos)**
Cada capítulo deve ter:
- Título atrativo com benefício claro
- Conteúdo educativo de valor (400-500 palavras)
- Exemplos práticos e aplicáveis
- Gatilhos mentais sutis
- Box de destaque com insight importante
- 3-5 pontos-chave ao final

**Estrutura sugerida:**
1. O Problema Que Ninguém Fala
2. A Ciência Por Trás da Solução
3. Mitos e Verdades Sobre {tema}
4. Como Escolher o Melhor Procedimento
5. Resultados: O Que Esperar
6. Cuidados e Manutenção
7. Seu Plano de Ação

**CONCLUSÃO (150-200 palavras)**
- Recapitulação dos principais aprendizados
- Empoderamento do leitor
- CTA suave para consultoria

**CTA FINAL**
- Oferta de avaliação gratuita
- Link para agendamento
- Reforço de autoridade da clínica

### CONTENT GUIDELINES
✅ Use linguagem acessível e elegante
✅ Inclua dados científicos explicados
✅ Conte histórias reais (anonimizadas)
✅ Foque em resultados emocionais
✅ Seja honesto sobre limitações

❌ Evite jargões sem contexto
❌ Não faça promessas irreais
❌ Não pressione vendas

### VISUAL ELEMENTS
Para cada capítulo, sugira:
- Tipo de imagem ideal
- Cores predominantes
- Elementos gráficos (ícones, ilustrações)

### OUTPUT FORMAT
Retorne o e-book completo estruturado em JSON:
{{
  "capa": {{"titulo": "", "subtitulo": "", "visual": ""}},
  "introducao": "texto...",
  "capitulos": [
    {{
      "numero": 1,
      "titulo": "",
      "conteudo": "",
      "pontos_chave": [],
      "box_destaque": "",
      "visual_sugerido": ""
    }}
  ],
  "conclusao": "",
  "cta_final": ""
}}
"""
        
        return prompt


# Funções helper para uso fácil
def get_prompt_procedimento(procedimento: str, **kwargs) -> str:
    """Helper para obter prompt de procedimento"""
    builder = NeurovendasPromptBuilder()
    return builder.build_procedimento_prompt(procedimento, **kwargs)

def get_prompt_script_vendas(procedimento: str, **kwargs) -> str:
    """Helper para obter prompt de script de vendas"""
    builder = NeurovendasPromptBuilder()
    return builder.build_script_vendas_prompt(procedimento, **kwargs)

def get_prompt_ebook_premium(titulo: str, tema: str, publico: str) -> str:
    """Helper para obter prompt de e-book premium"""
    builder = NeurovendasPromptBuilder()
    return builder.build_ebook_premium_prompt(titulo, tema, publico)
