"""
Biblioteca de Prompts Estratégicos - Plataforma Estética Lucrativa
Calendário Elevare 360° - Geração inteligente de temas
"""

# =============================================================================
# BIBLIOTECA DE PROMPTS ESTRATÉGICOS
# =============================================================================

PROMPTS_ESTRATEGICOS = {
    # 1. Autoridade e Diferenciação
    "autoridade_diferenciacao": {
        "id": "autoridade_diferenciacao",
        "titulo": "Autoridade e Diferenciação",
        "categoria": "autoridade",
        "descricao": "Posicione-se como referência em resultados reais",
        "icone": "crown",
        "cor": "purple",
        "prompt": """Crie um post para Instagram que posicione uma esteticista como referência em resultados reais, destacando técnica + propósito. Use tom de voz acolhedor e assertivo, com frase de impacto no início e CTA que convida à ação (ex: 'me chama no direct pra entender o que seu corpo realmente precisa').""",
        "variaveis": ["nicho", "procedimento", "diferencial"],
        "exemplo_uso": "Usar quando quiser mostrar expertise e criar conexão"
    },
    
    # 2. Destruição de Objeções
    "destruicao_objecoes": {
        "id": "destruicao_objecoes",
        "titulo": "Destruição de Objeções",
        "categoria": "vendas",
        "descricao": "Transforme objeções em oportunidades de conexão",
        "icone": "shield",
        "cor": "red",
        "prompt": """Transforme a objeção 'estética é futilidade' em um post emocional e educativo. Mostre que estética é autocuidado, saúde e confiança. Construa uma narrativa curta, com gancho emocional, uma verdade científica e uma virada inspiradora.""",
        "variaveis": ["objecao_comum", "argumento_cientifico"],
        "exemplo_uso": "Usar para quebrar crenças limitantes do público"
    },
    
    # 3. Educação e Neurovendas
    "educacao_neurovendas": {
        "id": "educacao_neurovendas",
        "titulo": "Educação e Neurovendas",
        "categoria": "educativo",
        "descricao": "Eduque usando gatilhos mentais de autoridade",
        "icone": "brain",
        "cor": "blue",
        "prompt": """Crie um conteúdo educativo com linguagem acessível que use gatilhos mentais de autoridade e curiosidade para explicar como [PROCEDIMENTO] funciona de verdade — sem promessas milagrosas. Finalize com um CTA sutil para avaliação personalizada.""",
        "variaveis": ["procedimento", "beneficio_principal", "publico"],
        "exemplo_uso": "Usar para educar e gerar desejo ao mesmo tempo"
    },
    
    # 4. Transformações Reais (Prova Social)
    "transformacoes_reais": {
        "id": "transformacoes_reais",
        "titulo": "Transformações Reais",
        "categoria": "prova_social",
        "descricao": "Conte histórias de transformação que vendem",
        "icone": "sparkles",
        "cor": "green",
        "prompt": """Escreva um post que conte a história de uma cliente que recuperou autoestima com tratamento estético. Use narrativa emocional + técnica (como antes e depois, mas em formato de storytelling). Finalize com convite para conhecer o protocolo usado.""",
        "variaveis": ["nome_cliente", "problema_inicial", "resultado", "protocolo"],
        "exemplo_uso": "Usar para mostrar resultados reais com emoção"
    },
    
    # 5. Conexão e Humanização
    "conexao_humanizacao": {
        "id": "conexao_humanizacao",
        "titulo": "Conexão e Humanização",
        "categoria": "conexao",
        "descricao": "Mostre bastidores e crie proximidade",
        "icone": "heart",
        "cor": "pink",
        "prompt": """Monte um roteiro de stories para mostrar bastidores de atendimento, com tom leve e verdadeiro. Inclua 1 erro comum das clientes, 1 bastidor do dia e 1 dica prática. Feche com caixinha interativa.""",
        "variaveis": ["tipo_atendimento", "dica_do_dia"],
        "exemplo_uso": "Usar para criar conexão genuína com a audiência"
    },
    
    # 6. Campanhas Temáticas
    "campanhas_tematicas": {
        "id": "campanhas_tematicas",
        "titulo": "Campanhas Temáticas",
        "categoria": "estrategia",
        "descricao": "Crie conteúdo alinhado ao tema do mês",
        "icone": "calendar",
        "cor": "amber",
        "prompt": """Crie 3 ideias de postagens para o tema do mês [TEMA_MENSAL], voltadas a profissionais de estética. Combine ciência e emoção, mostrando erros comuns + soluções estratégicas + autoridade técnica.""",
        "variaveis": ["tema_mensal", "nicho", "nivel_tecnico"],
        "exemplo_uso": "Usar para planejar conteúdo mensal estratégico"
    },
    
    # 7. Ofertas e Vendas Humanizadas
    "ofertas_humanizadas": {
        "id": "ofertas_humanizadas",
        "titulo": "Ofertas e Vendas Humanizadas",
        "categoria": "vendas",
        "descricao": "Venda com elegância, sem parecer apelação",
        "icone": "gift",
        "cor": "emerald",
        "prompt": """Crie um post para vender um pacote estético de forma elegante, sem parecer apelação. Use o conceito de valor percebido, mostrando o que o pacote entrega além do tratamento (ex: acompanhamento, confiança, resultado sustentado).""",
        "variaveis": ["nome_pacote", "valor", "beneficios", "bonus"],
        "exemplo_uso": "Usar para converter seguidores em clientes"
    },
    
    # 8. Encantamento e Fidelização
    "encantamento_fidelizacao": {
        "id": "encantamento_fidelizacao",
        "titulo": "Encantamento e Fidelização",
        "categoria": "relacionamento",
        "descricao": "Fidelize clientes em cada ponto de contato",
        "icone": "star",
        "cor": "yellow",
        "prompt": """Gere uma sequência de 3 posts com foco em encantamento da cliente: primeiro contato, atendimento e pós-venda. Mostre frases certas a usar, postura profissional e gatilhos de empatia.""",
        "variaveis": ["tipo_servico", "momento_jornada"],
        "exemplo_uso": "Usar para criar experiência memorável"
    },
    
    # 9. Storytelling de Marca Pessoal
    "storytelling_marca": {
        "id": "storytelling_marca",
        "titulo": "Storytelling de Marca Pessoal",
        "categoria": "autoridade",
        "descricao": "Conte sua história de forma inspiradora",
        "icone": "book",
        "cor": "indigo",
        "prompt": """Crie uma legenda contando a trajetória de uma esteticista que quase desistiu, mas hoje tem agenda cheia. Use uma virada inspiradora, linguagem emocional e uma frase final que gere identificação.""",
        "variaveis": ["desafio_superado", "momento_virada", "resultado_atual"],
        "exemplo_uso": "Usar para criar conexão através da vulnerabilidade"
    },
    
    # 10. Comunicação Visual e Emoção
    "comunicacao_visual": {
        "id": "comunicacao_visual",
        "titulo": "Comunicação Visual e Emoção",
        "categoria": "design",
        "descricao": "Crie conceitos visuais que transmitem emoção",
        "icone": "palette",
        "cor": "violet",
        "prompt": """Descreva um conceito visual para um post do Instagram com estética clean e elegante. Use lavanda + dourado suave, destaque o rosto da profissional e adicione frase de poder sobre autoestima e propósito.""",
        "variaveis": ["tema_visual", "mensagem_principal", "cores"],
        "exemplo_uso": "Usar para briefar designer ou criar você mesma"
    },
    
    # EXTRAS - Combinações Inteligentes
    "titulos_atrativos": {
        "id": "titulos_atrativos",
        "titulo": "Títulos Atrativos",
        "categoria": "copy",
        "descricao": "Crie títulos que param o scroll",
        "icone": "zap",
        "cor": "orange",
        "prompt": """Crie 5 variações de títulos curtos e chamativos para post no Instagram sobre [TEMA]. Use curiosidade, contradição e autoridade para gerar cliques.""",
        "variaveis": ["tema", "tom"],
        "exemplo_uso": "Usar para testar diferentes ganchos"
    },
    
    "roteiro_reels": {
        "id": "roteiro_reels",
        "titulo": "Roteiro de Reels Viral",
        "categoria": "video",
        "descricao": "Estrutura de Reels que engaja",
        "icone": "video",
        "cor": "rose",
        "prompt": """Gere um roteiro de Reels com 3 cenas curtas sobre [TEMA], tom humano e educativo. Finalize com frase de impacto e CTA para agendamento.""",
        "variaveis": ["tema", "duracao", "cta"],
        "exemplo_uso": "Usar para criar Reels com estrutura viral"
    },
    
    "engajamento_stories": {
        "id": "engajamento_stories",
        "titulo": "Engajamento em Stories",
        "categoria": "engajamento",
        "descricao": "Perguntas estratégicas que geram interação",
        "icone": "message-circle",
        "cor": "cyan",
        "prompt": """Crie perguntas estratégicas para stories sobre [TEMA] que gerem interação e identificação (enquete + caixinha).""",
        "variaveis": ["tema", "objetivo"],
        "exemplo_uso": "Usar para aumentar engajamento nos stories"
    },
    
    # Novos prompts avançados
    "carrossel_aisv_completo": {
        "id": "carrossel_aisv_completo",
        "titulo": "Carrossel AISV Completo",
        "categoria": "conteudo",
        "descricao": "8 slides que convertem usando framework AISV",
        "icone": "layers",
        "cor": "purple",
        "prompt": """Crie um carrossel de 8 slides usando framework AISV:

Slide 1 (ATENÇÃO/GANCHO): micro-dor + promessa curta. (ex.: "Cansada de esconder as coxas no verão?")
Slides 2-4 (INTERESSE): amplifique a micro-dor, conte mini-caso + faça dizer "sim" mentalmente.
Slides 5-7 (SOLUÇÃO): contraste antes/depois, explique por que funciona (sem jargão técnico).
Slide 8 (VENDA/CTA): Nome do método + CTA direto (comente palavra-chave / link no direct).

Tema: [TEMA]
Público: [PUBLICO]
Tom: [TOM]""",
        "variaveis": ["tema", "publico", "tom", "procedimento"],
        "exemplo_uso": "Usar para criar carrossel que converte"
    },
    
    "script_whatsapp_premium": {
        "id": "script_whatsapp_premium",
        "titulo": "Script WhatsApp Premium",
        "categoria": "vendas",
        "descricao": "Fluxo de qualificação para alto ticket",
        "icone": "message-square",
        "cor": "green",
        "prompt": """Crie um script de WhatsApp premium para qualificação de lead de alto ticket:

Mensagem inicial auto:
"Obrigada! Antes de te mandar os detalhes: me conta em 1 frase qual a maior frustração hoje com [PROBLEMA]."

Inclua:
- Sequência de qualificação (3 perguntas)
- Respostas para objeções comuns
- Proposta de valor
- Fechamento

Procedimento: [PROCEDIMENTO]
Valor: [VALOR]""",
        "variaveis": ["procedimento", "valor", "objecoes_comuns"],
        "exemplo_uso": "Usar para converter leads qualificados"
    },
    
    "bio_instagram_oasis": {
        "id": "bio_instagram_oasis",
        "titulo": "Bio Instagram Método OÁSIS",
        "categoria": "instagram",
        "descricao": "Bio otimizada que converte visitantes",
        "icone": "instagram",
        "cor": "pink",
        "prompt": """Crie uma bio otimizada para Instagram usando Método OÁSIS:

Elementos obrigatórios:
1. Proposta de valor clara (resultado, não procedimento)
2. Social proof (nº de clientes/anos de experiência)
3. Diferencial único
4. CTA direto
5. Emojis estratégicos (máximo 3)

Serviço principal: [SERVICO]
Diferencial: [DIFERENCIAL]
Localização: [CIDADE]
Anos de experiência: [ANOS]""",
        "variaveis": ["servico", "diferencial", "cidade", "anos"],
        "exemplo_uso": "Usar para otimizar perfil do Instagram"
    },
    
    "persona_micro_dores": {
        "id": "persona_micro_dores",
        "titulo": "Persona com Micro-dores",
        "categoria": "estrategia",
        "descricao": "Persona profunda com gatilhos emocionais",
        "icone": "users",
        "cor": "blue",
        "prompt": """Você é um analista de marketing especialista em psicologia do consumidor e neuromarketing. 
Crie a persona ideal para [SERVICO]. 

Inclua:
- Nome, idade, ocupação, rotina
- Dor principal
- 5 micro-dores (que ela não verbaliza)
- 5 medos profundos
- Crenças limitantes
- Tentativas anteriores (com frustrações)
- Gatilhos emocionais que fazem agir
- Desejos verdadeiros
- Provas que a convenceriam

Use linguagem vívida e emotiva.""",
        "variaveis": ["servico", "nicho", "faixa_etaria"],
        "exemplo_uso": "Usar para entender profundamente seu público"
    }
}

# =============================================================================
# TEMPLATES DE CONTEÚDO - CALENDÁRIO
# =============================================================================

TEMPLATES_CALENDARIO = {
    "autoridade": {
        "id": "autoridade",
        "titulo": "Post de Autoridade",
        "tipo": "autoridade",
        "cor": "purple",
        "icone": "crown",
        "objetivo": "Posicionar como especialista",
        "estrutura": """✨ [GANCHO DE AUTORIDADE]

[Estatística ou fato surpreendente]

[Sua experiência/expertise]

[Dica prática]

💡 Salve esse post para consultar depois!

#estetica #autoridade #dica"""
    },
    "desejo": {
        "id": "desejo",
        "titulo": "Post de Desejo",
        "tipo": "desejo",
        "cor": "pink",
        "icone": "heart",
        "objetivo": "Criar desejo pelo resultado",
        "estrutura": """🌟 Imagine [resultado desejado]...

[Descreva a transformação em detalhes sensoriais]

[Como ela vai se sentir]

[Prova de que é possível]

✨ Quer saber como? Comente [PALAVRA-CHAVE]

#transformacao #resultado #beleza"""
    },
    "fechamento": {
        "id": "fechamento",
        "titulo": "Post de Fechamento",
        "tipo": "fechamento",
        "cor": "green",
        "icone": "target",
        "objetivo": "Converter em venda",
        "estrutura": """🎯 [OFERTA DIRETA]

⏰ [Urgência/Escassez]

✅ [Benefício 1]
✅ [Benefício 2]
✅ [Benefício 3]

🎁 [Bônus especial]

📱 Agende agora pelo link na bio!

#promocao #agenda #estetica"""
    },
    "conexao": {
        "id": "conexao",
        "titulo": "Post de Conexão",
        "tipo": "conexao",
        "cor": "amber",
        "icone": "message-circle",
        "objetivo": "Criar proximidade",
        "estrutura": """💬 [Pergunta que gera identificação]

[História pessoal ou de cliente]

[Vulnerabilidade autêntica]

[Mensagem inspiradora]

❤️ Comente se você se identificou!

#conexao #historia #inspiracao"""
    },
    "educativo": {
        "id": "educativo",
        "titulo": "Post Educativo",
        "tipo": "educativo",
        "cor": "blue",
        "icone": "book-open",
        "objetivo": "Educar e gerar valor",
        "estrutura": """📚 [TÍTULO EDUCATIVO]

Você sabia que [fato surpreendente]?

Muitas pessoas pensam que [mito comum]...

Mas a verdade é: [verdade científica]

Na prática: [dica aplicável]

💡 Salva esse post!

#educacao #dica #aprendizado"""
    },
    "bastidores": {
        "id": "bastidores",
        "titulo": "Post de Bastidores",
        "tipo": "bastidores",
        "cor": "slate",
        "icone": "camera",
        "objetivo": "Mostrar autenticidade",
        "estrutura": """📸 BASTIDORES DO DIA...

[Momento real do atendimento]

[Detalhe que ninguém vê]

[Reflexão pessoal]

Isso aqui é a realidade de quem [ama o que faz / cuida de verdade].

🤍 Você gosta de ver os bastidores?

#bastidores #realidade #rotina"""
    }
}

# =============================================================================
# TEMAS MENSAIS - CALENDÁRIO ELEVARE
# =============================================================================

TEMAS_MENSAIS_ELEVARE = {
    "janeiro": {
        "mes": "Janeiro",
        "tema_principal": "Renovação e Metas",
        "subtemas": [
            "Detox corporal pós-festas",
            "Protocolos de renovação celular",
            "Planejamento de tratamentos anuais",
            "Reset da pele após verão"
        ],
        "cor": "cyan",
        "icone": "sparkles"
    },
    "fevereiro": {
        "mes": "Fevereiro",
        "tema_principal": "Amor Próprio e Autoestima",
        "subtemas": [
            "Rituais de autocuidado",
            "Tratamentos para se amar",
            "Presente de autoestima",
            "Conexão corpo-mente"
        ],
        "cor": "pink",
        "icone": "heart"
    },
    "marco": {
        "mes": "Março",
        "tema_principal": "Poder Feminino",
        "subtemas": [
            "Empoderamento através da estética",
            "Mulheres que transformam",
            "Histórias de superação",
            "Estética e carreira"
        ],
        "cor": "purple",
        "icone": "crown"
    },
    "abril": {
        "mes": "Abril",
        "tema_principal": "Saúde da Pele",
        "subtemas": [
            "Transição outono-inverno",
            "Hidratação profunda",
            "Proteção contra ressecamento",
            "Vitaminas para a pele"
        ],
        "cor": "green",
        "icone": "leaf"
    },
    "maio": {
        "mes": "Maio",
        "tema_principal": "Cuidado e Maternidade",
        "subtemas": [
            "Estética para mães",
            "Recuperação pós-parto",
            "Autocuidado na maternidade",
            "Presentes para mães"
        ],
        "cor": "rose",
        "icone": "heart"
    },
    "junho": {
        "mes": "Junho",
        "tema_principal": "Flacidez Inteligente",
        "subtemas": [
            "Protocolos anti-flacidez",
            "Firmeza sem cirurgia",
            "Tecnologias de lifting",
            "Prevenção x tratamento"
        ],
        "cor": "violet",
        "icone": "zap"
    },
    "julho": {
        "mes": "Julho",
        "tema_principal": "Celulite Estratégica",
        "subtemas": [
            "Entendendo a celulite",
            "Protocolos combinados",
            "Mitos e verdades",
            "Resultados sustentáveis"
        ],
        "cor": "amber",
        "icone": "target"
    },
    "agosto": {
        "mes": "Agosto",
        "tema_principal": "Preparação Verão",
        "subtemas": [
            "Projeto corpo verão",
            "Tratamentos corporais",
            "Cronograma de resultados",
            "Expectativas realistas"
        ],
        "cor": "orange",
        "icone": "sun"
    },
    "setembro": {
        "mes": "Setembro",
        "tema_principal": "Saúde Mental e Estética",
        "subtemas": [
            "Autoestima e saúde mental",
            "Estética como terapia",
            "Cuidado holístico",
            "Bem-estar integral"
        ],
        "cor": "yellow",
        "icone": "brain"
    },
    "outubro": {
        "mes": "Outubro",
        "tema_principal": "Prevenção e Consciência",
        "subtemas": [
            "Estética e saúde",
            "Cuidados preventivos",
            "Check-up estético",
            "Sinais de alerta"
        ],
        "cor": "pink",
        "icone": "shield"
    },
    "novembro": {
        "mes": "Novembro",
        "tema_principal": "Preparação Festas",
        "subtemas": [
            "Protocolos express",
            "Glow para festas",
            "Tratamentos de última hora",
            "Manutenção de resultados"
        ],
        "cor": "gold",
        "icone": "sparkles"
    },
    "dezembro": {
        "mes": "Dezembro",
        "tema_principal": "Celebração e Gratidão",
        "subtemas": [
            "Retrospectiva de resultados",
            "Agradecimento às clientes",
            "Metas para o próximo ano",
            "Presentes e vouchers"
        ],
        "cor": "red",
        "icone": "gift"
    }
}

# =============================================================================
# TONS DE COMUNICAÇÃO
# =============================================================================

TONS_COMUNICACAO = {
    "tecnico": {
        "id": "tecnico",
        "nome": "Técnico",
        "descricao": "Linguagem científica acessível",
        "caracteristicas": [
            "Referências científicas curtas",
            "Termos técnicos explicados",
            "Dados e estatísticas",
            "Tom profissional"
        ],
        "exemplo": "Estudos mostram que a criolipólise reduz até 25% da gordura localizada em uma única sessão..."
    },
    "acolhedor": {
        "id": "acolhedor",
        "nome": "Acolhedor",
        "descricao": "Proximidade e empatia",
        "caracteristicas": [
            "Linguagem calorosa",
            "Empatia genuína",
            "Tom de conversa",
            "Validação emocional"
        ],
        "exemplo": "Eu sei como é difícil olhar no espelho e não se reconhecer. Você não está sozinha..."
    },
    "provocador": {
        "id": "provocador",
        "nome": "Provocador",
        "descricao": "Contradição e CTA forte",
        "caracteristicas": [
            "Questiona crenças",
            "Ganchos controversos",
            "Chamadas diretas",
            "Urgência"
        ],
        "exemplo": "Você vai continuar gastando dinheiro em cremes que não funcionam ou vai fazer diferente?"
    },
    "inspirador": {
        "id": "inspirador",
        "nome": "Inspirador",
        "descricao": "Motivação e transformação",
        "caracteristicas": [
            "Histórias de superação",
            "Linguagem elevada",
            "Visão de futuro",
            "Empoderamento"
        ],
        "exemplo": "Cada mulher que entra aqui sai diferente. Não apenas no corpo, mas na forma de se ver..."
    },
    "comercial": {
        "id": "comercial",
        "nome": "Comercial",
        "descricao": "Foco em conversão",
        "caracteristicas": [
            "Benefícios claros",
            "Ofertas diretas",
            "Urgência/escassez",
            "CTA forte"
        ],
        "exemplo": "ÚLTIMAS 3 VAGAS com 40% OFF! Agende agora e garanta seu protocolo completo..."
    }
}

# =============================================================================
# OBJETIVOS ESTRATÉGICOS
# =============================================================================

OBJETIVOS_ESTRATEGICOS = {
    "engajar": {
        "id": "engajar",
        "nome": "Engajar",
        "descricao": "Aumentar interação e alcance",
        "metricas": ["comentários", "compartilhamentos", "salvamentos"],
        "tipos_conteudo": ["enquete", "caixinha", "carrossel", "meme"],
        "cor": "blue"
    },
    "educar": {
        "id": "educar",
        "nome": "Educar",
        "descricao": "Gerar valor e autoridade",
        "metricas": ["salvamentos", "tempo de visualização", "novos seguidores"],
        "tipos_conteudo": ["tutorial", "explicativo", "dica", "mito x verdade"],
        "cor": "green"
    },
    "vender": {
        "id": "vender",
        "nome": "Vender",
        "descricao": "Converter em agendamentos/vendas",
        "metricas": ["cliques no link", "mensagens no direct", "agendamentos"],
        "tipos_conteudo": ["oferta", "depoimento", "antes/depois", "urgência"],
        "cor": "amber"
    },
    "inspirar": {
        "id": "inspirar",
        "nome": "Inspirar",
        "descricao": "Criar conexão emocional",
        "metricas": ["comentários emocionais", "compartilhamentos", "mentions"],
        "tipos_conteudo": ["história", "bastidores", "reflexão", "transformação"],
        "cor": "purple"
    }
}

# =============================================================================
# TIPOS DE CONTEÚDO
# =============================================================================

TIPOS_CONTEUDO = {
    "feed": {
        "id": "feed",
        "nome": "Post Feed",
        "descricao": "Post estático no feed",
        "formatos": ["imagem única", "carrossel", "texto"],
        "duracao_ideal": None,
        "icone": "image"
    },
    "reels": {
        "id": "reels",
        "nome": "Reels",
        "descricao": "Vídeo curto vertical",
        "formatos": ["tutorial", "trend", "bastidores", "antes/depois"],
        "duracao_ideal": "15-30 segundos",
        "icone": "video"
    },
    "stories": {
        "id": "stories",
        "nome": "Stories",
        "descricao": "Conteúdo efêmero 24h",
        "formatos": ["enquete", "caixinha", "countdown", "link"],
        "duracao_ideal": "5-15 segundos",
        "icone": "clock"
    },
    "bastidores": {
        "id": "bastidores",
        "nome": "Bastidores",
        "descricao": "Conteúdo autêntico do dia a dia",
        "formatos": ["rotina", "preparação", "atendimento", "equipe"],
        "duracao_ideal": None,
        "icone": "camera"
    },
    "cta": {
        "id": "cta",
        "nome": "CTA Direto",
        "descricao": "Chamada para ação específica",
        "formatos": ["oferta", "agendamento", "link", "direct"],
        "duracao_ideal": None,
        "icone": "mouse-pointer"
    },
    "carrossel": {
        "id": "carrossel",
        "nome": "Carrossel AISV",
        "descricao": "Sequência de slides com framework",
        "formatos": ["8-10 slides", "educativo", "storytelling"],
        "duracao_ideal": None,
        "icone": "layers"
    }
}
