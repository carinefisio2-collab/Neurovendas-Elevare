import { useState, useEffect } from 'react';
import { X, ArrowRight, CheckCircle2, Download, Instagram, LogOut } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ========== TIPOS ==========
interface Opcao {
  texto: string;
  pontos: number;
}

interface Pergunta {
  id: number;
  bloco: string;
  texto: string;
  opcoes: Opcao[];
}

interface RespostaUsuario {
  perguntaId: number;
  bloco: string;
  pontos: number;
  opcaoTexto: string;
}

// ========== 18 PERGUNTAS PREMIUM ==========
const perguntasPremium: Pergunta[] = [
  // BLOCO 1 — IDENTIDADE PROFISSIONAL
  {
    id: 1,
    bloco: "identidade",
    texto: "Hoje, como você se apresenta ao mercado?",
    opcoes: [
      { texto: "Esteticista", pontos: 2 },
      { texto: "Especialista em uma técnica", pontos: 3 },
      { texto: "Profissional da saúde estética", pontos: 4 },
      { texto: "Empresária da estética", pontos: 5 },
      { texto: "Ainda não sei explicar claramente", pontos: 1 }
    ]
  },
  {
    id: 2,
    bloco: "identidade",
    texto: "Quando alguém pergunta \"por que escolher você?\", o que vem primeiro à sua mente?",
    opcoes: [
      { texto: "Resultado técnico", pontos: 3 },
      { texto: "Preço acessível", pontos: 2 },
      { texto: "Atendimento humano", pontos: 3 },
      { texto: "Método próprio", pontos: 5 },
      { texto: "Fico insegura para responder", pontos: 1 }
    ]
  },
  {
    id: 3,
    bloco: "identidade",
    texto: "Você sente que domina mais:",
    opcoes: [
      { texto: "A técnica", pontos: 2 },
      { texto: "O atendimento", pontos: 3 },
      { texto: "A gestão", pontos: 4 },
      { texto: "O marketing", pontos: 4 },
      { texto: "Nada de forma consistente", pontos: 1 }
    ]
  },
  // BLOCO 2 — POSICIONAMENTO & BIO
  {
    id: 4,
    bloco: "posicionamento",
    texto: "Sua bio do Instagram hoje:",
    opcoes: [
      { texto: "Atrai pacientes ideais", pontos: 5 },
      { texto: "Explica, mas não vende", pontos: 3 },
      { texto: "Está confusa", pontos: 1 },
      { texto: "Fala de tudo um pouco", pontos: 2 },
      { texto: "Nunca parei para pensar estrategicamente nela", pontos: 1 }
    ]
  },
  {
    id: 5,
    bloco: "posicionamento",
    texto: "Seu conteúdo gera mais:",
    opcoes: [
      { texto: "Desejo", pontos: 5 },
      { texto: "Autoridade", pontos: 4 },
      { texto: "Engajamento vazio", pontos: 2 },
      { texto: "Dúvidas", pontos: 1 },
      { texto: "Silêncio", pontos: 1 }
    ]
  },
  {
    id: 6,
    bloco: "posicionamento",
    texto: "Você sente que precisa postar promoções para ter agenda cheia?",
    opcoes: [
      { texto: "Sempre", pontos: 1 },
      { texto: "Quase sempre", pontos: 2 },
      { texto: "Às vezes", pontos: 3 },
      { texto: "Raramente", pontos: 4 },
      { texto: "Nunca", pontos: 5 }
    ]
  },
  // BLOCO 3 — FINANCEIRO & PRECIFICAÇÃO
  {
    id: 7,
    bloco: "financeiro",
    texto: "Como você define seus preços hoje?",
    opcoes: [
      { texto: "Pelo mercado", pontos: 2 },
      { texto: "Pelo custo", pontos: 2 },
      { texto: "Pelo que o paciente aceita pagar", pontos: 1 },
      { texto: "Pelo valor que entrego", pontos: 5 },
      { texto: "Não tenho clareza", pontos: 1 }
    ]
  },
  {
    id: 8,
    bloco: "financeiro",
    texto: "Quando alguém diz \"está caro\", você:",
    opcoes: [
      { texto: "Justifica", pontos: 2 },
      { texto: "Dá desconto", pontos: 1 },
      { texto: "Se sente mal", pontos: 1 },
      { texto: "Explica o valor com segurança", pontos: 5 },
      { texto: "Perde a venda", pontos: 2 }
    ]
  },
  {
    id: 9,
    bloco: "financeiro",
    texto: "Seu faturamento mensal hoje é:",
    opcoes: [
      { texto: "Instável e imprevisível", pontos: 1 },
      { texto: "Estável, mas baixo", pontos: 2 },
      { texto: "Estável e confortável", pontos: 4 },
      { texto: "Crescente", pontos: 5 },
      { texto: "Não controlo com clareza", pontos: 1 }
    ]
  },
  // BLOCO 4 — ROTINA & NEGÓCIO
  {
    id: 10,
    bloco: "rotina",
    texto: "Sua agenda depende mais de:",
    opcoes: [
      { texto: "Indicação", pontos: 3 },
      { texto: "Promoções", pontos: 1 },
      { texto: "Instagram", pontos: 2 },
      { texto: "Estratégia previsível", pontos: 5 },
      { texto: "Sorte", pontos: 1 }
    ]
  },
  {
    id: 11,
    bloco: "rotina",
    texto: "Você tem processos claros para:",
    opcoes: [
      { texto: "Captação", pontos: 2 },
      { texto: "Conversão", pontos: 3 },
      { texto: "Pós-venda", pontos: 3 },
      { texto: "Nenhum", pontos: 1 },
      { texto: "Todos", pontos: 5 }
    ]
  },
  {
    id: 12,
    bloco: "rotina",
    texto: "Hoje você se sente mais:",
    opcoes: [
      { texto: "Cansada", pontos: 1 },
      { texto: "Confusa", pontos: 1 },
      { texto: "Sobrecarregada", pontos: 2 },
      { texto: "Organizada", pontos: 4 },
      { texto: "No controle", pontos: 5 }
    ]
  },
  // BLOCO 5 — PERFIL EMPREENDEDOR
  {
    id: 13,
    bloco: "empreendedor",
    texto: "Você investe mais em:",
    opcoes: [
      { texto: "Cursos técnicos", pontos: 2 },
      { texto: "Ferramentas", pontos: 3 },
      { texto: "Estratégia", pontos: 5 },
      { texto: "Nada no momento", pontos: 1 },
      { texto: "Tudo sem critério", pontos: 1 }
    ]
  },
  {
    id: 14,
    bloco: "empreendedor",
    texto: "Quando algo não dá resultado, você:",
    opcoes: [
      { texto: "Desiste", pontos: 1 },
      { texto: "Culpa o mercado", pontos: 1 },
      { texto: "Culpa a si mesma", pontos: 2 },
      { texto: "Analisa e ajusta", pontos: 5 },
      { texto: "Fica paralisada", pontos: 1 }
    ]
  },
  {
    id: 15,
    bloco: "empreendedor",
    texto: "Você se vê, no futuro, como:",
    opcoes: [
      { texto: "Autônoma", pontos: 2 },
      { texto: "Dona de clínica", pontos: 4 },
      { texto: "Referência", pontos: 5 },
      { texto: "Educadora", pontos: 4 },
      { texto: "Não consigo visualizar", pontos: 1 }
    ]
  },
  // BLOCO 6 — VISÃO & DECISÃO
  {
    id: 16,
    bloco: "visao",
    texto: "O que mais te impede de crescer hoje?",
    opcoes: [
      { texto: "Falta de tempo", pontos: 2 },
      { texto: "Falta de dinheiro", pontos: 2 },
      { texto: "Falta de clareza", pontos: 3 },
      { texto: "Falta de apoio", pontos: 2 },
      { texto: "Medo", pontos: 1 }
    ]
  },
  {
    id: 17,
    bloco: "visao",
    texto: "Você acredita que sua clínica pode ser um negócio escalável?",
    opcoes: [
      { texto: "Sim, claramente", pontos: 5 },
      { texto: "Talvez", pontos: 3 },
      { texto: "Nunca pensei nisso", pontos: 2 },
      { texto: "Acho que não", pontos: 1 },
      { texto: "Não sei o que é escala", pontos: 1 }
    ]
  },
  {
    id: 18,
    bloco: "visao",
    texto: "Se tivesse um método claro, você:",
    opcoes: [
      { texto: "Executaria imediatamente", pontos: 5 },
      { texto: "Precisaria de segurança", pontos: 3 },
      { texto: "Ficaria em dúvida", pontos: 2 },
      { texto: "Não mudaria", pontos: 1 },
      { texto: "Não sei", pontos: 1 }
    ]
  }
];

type Stage = 'intro' | 'quiz' | 'contact' | 'resultado';

export default function DiagnosticQuizModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [stage, setStage] = useState<Stage>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respostas, setRespostas] = useState<RespostaUsuario[]>([]);
  const [contactInfo, setContactInfo] = useState({ name: '', email: '', whatsapp: '' });
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const totalPerguntas = perguntasPremium.length;
  const progressPercent = ((currentQuestion + 1) / totalPerguntas) * 100;

  const handleStartQuiz = () => {
    setStage('quiz');
    setCurrentQuestion(0);
    setRespostas([]);
  };

  const handleAnswer = (opcao: Opcao) => {
    const perguntaAtual = perguntasPremium[currentQuestion];
    const novaResposta: RespostaUsuario = {
      perguntaId: perguntaAtual.id,
      bloco: perguntaAtual.bloco,
      pontos: opcao.pontos,
      opcaoTexto: opcao.texto
    };

    const novasRespostas = [...respostas, novaResposta];
    setRespostas(novasRespostas);

    if (currentQuestion + 1 < totalPerguntas) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // Ir direto para resultado, sem pedir contato
      setTimeout(() => {
        // Salvar apenas respostas no localStorage (sem dados de contato)
        const diagnosticoData = {
          timestamp: new Date().toISOString(),
          respostas: novasRespostas,
          resultados: calcularResultados(novasRespostas)
        };
        localStorage.setItem('elevare_diagnostic_result', JSON.stringify(diagnosticoData));
        setStage('resultado');
      }, 300);
    }
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salvar no localStorage
    const diagnosticoData = {
      timestamp: new Date().toISOString(),
      contactInfo,
      respostas,
      resultados: calcularResultados()
    };
    localStorage.setItem('elevare_diagnostic_result', JSON.stringify(diagnosticoData));
    
    setStage('resultado');
  };

  const calcularResultados = (respostasParam?: RespostaUsuario[]) => {
    const respostasParaCalcular = respostasParam || respostas;
    
    const scoresPorBloco: Record<string, number> = {
      identidade: 0,
      posicionamento: 0,
      financeiro: 0,
      rotina: 0,
      empreendedor: 0,
      visao: 0
    };

    respostasParaCalcular.forEach(r => {
      if (scoresPorBloco[r.bloco] !== undefined) {
        scoresPorBloco[r.bloco] += r.pontos;
      }
    });

    const scoreTotal = Object.values(scoresPorBloco).reduce((a, b) => a + b, 0);
    const maxTotal = 90;
    const indiceElevare = Math.round((scoreTotal / maxTotal) * 100);

    let classificacao = "";
    if (indiceElevare <= 35) classificacao = "Em Construção";
    else if (indiceElevare <= 55) classificacao = "Em Crescimento";
    else if (indiceElevare <= 75) classificacao = "Estruturado";
    else classificacao = "Pronto para Escala";

    let nivelGeral = "";
    if (indiceElevare <= 30) nivelGeral = "Amadora Técnica";
    else if (indiceElevare <= 50) nivelGeral = "Profissional Operacional";
    else if (indiceElevare <= 70) nivelGeral = "Empresária em Construção";
    else nivelGeral = "Empresária Estratégica";

    const areaMaturidade = scoresPorBloco.identidade + scoresPorBloco.empreendedor;
    const areaConsciencia = scoresPorBloco.posicionamento + scoresPorBloco.visao;
    const areaNegocio = scoresPorBloco.financeiro + scoresPorBloco.rotina;

    return {
      scoreTotal,
      indiceElevare,
      classificacao,
      nivelGeral,
      scoresPorBloco,
      areaMaturidade: { score: areaMaturidade, max: 30 },
      areaConsciencia: { score: areaConsciencia, max: 30 },
      areaNegocio: { score: areaNegocio, max: 30 }
    };
  };

  const gerarAnalise = (resultados: ReturnType<typeof calcularResultados>) => {
    const { areaMaturidade, areaConsciencia, areaNegocio, scoresPorBloco, indiceElevare } = resultados;
    const nome = contactInfo.name.split(' ')[0]; // Primeiro nome

    // ===== ANÁLISE PROFUNDA POR BLOCO =====
    
    // IDENTIDADE (perguntas 1-3)
    const scoreIdentidade = scoresPorBloco.identidade;
    let analiseIdentidade = "";
    if (scoreIdentidade <= 6) {
      analiseIdentidade = `${nome}, você ainda não tem clareza sobre quem você é no mercado. Suas respostas indicam que você se apresenta de forma genérica ("esteticista") e ainda não consolidou um diferencial claro. Isso significa que você está competindo por preço, não por valor. Quando alguém pergunta "por que escolher você?", você hesita ou fala de técnica - mas o mercado premium não compra técnica, compra transformação e método próprio. Sua identidade profissional está indefinida, e isso é seu ponto cego número 1.`;
    } else if (scoreIdentidade <= 10) {
      analiseIdentidade = `${nome}, você está em transição. Percebe que ser "mais uma esteticista" não te diferencia, mas ainda não conseguiu articular com clareza o que te torna única. Você domina a técnica, mas não transformou isso em posicionamento estratégico. O mercado te vê como competente, mas não como referência. Falta construir uma narrativa de autoridade que te posicione acima da concorrência técnica.`;
    } else {
      analiseIdentidade = `${nome}, você tem consciência profissional avançada. Sabe quem é, o valor que entrega e como se diferencia. Sua identidade está consolidada e trabalha a seu favor. Você não é "mais uma" - é uma escolha consciente do cliente. Isso é raro e valioso. Agora o desafio é amplificar essa clareza em todos os pontos de contato com o mercado.`;
    }

    // POSICIONAMENTO (perguntas 4-6)
    const scorePosicionamento = scoresPorBloco.posicionamento;
    let analisePosicionamento = "";
    if (scorePosicionamento <= 6) {
      analisePosicionamento = `${nome}, sua comunicação está sabotando seu negócio. Sua bio do Instagram não atrai, apenas descreve. Seu conteúdo gera engajamento vazio (curtidas sem conversão) ou pior: silêncio. Você sente que precisa fazer promoção para encher agenda - isso é o sintoma de quem não comunica valor estratégico. O problema não é "postar mais", é reposicionar toda sua presença digital para que ela trabalhe como vendedora 24h. Hoje ela está morna, genérica e perdida no mar de perfis iguais.`;
    } else if (scorePosicionamento <= 10) {
      analisePosicionamento = `${nome}, você entende marketing, mas não executa com consistência. Sua bio tem potencial mas não converte como deveria. Seu conteúdo oscila entre autoridade e improviso. Você ainda depende de promoções para gerar movimento, o que indica que seu posicionamento não está blindado. Há clareza teórica, mas falta método na execução. Você está a 3 ajustes estratégicos de virar referência no seu nicho.`;
    } else {
      analisePosicionamento = `${nome}, seu posicionamento é sólido. Sua bio atrai o público certo, seu conteúdo gera desejo (não só curtida), e você raramente precisa dar desconto para fechar. Isso é resultado de comunicação estratégica, não sorte. Você construiu autoridade e agora colhe os frutos. O próximo nível é escalar essa autoridade para novos canais e públicos sem perder a essência.`;
    }

    // FINANCEIRO (perguntas 7-9)
    const scoreFinanceiro = scoresPorBloco.financeiro;
    let analiseFinanceiro = "";
    if (scoreFinanceiro <= 6) {
      analiseFinanceiro = `${nome}, seu financeiro está no vermelho emocional. Você define preços pelo mercado ou pelo que o cliente "aceita pagar" - isso é terceirizar sua precificação para quem não entende seu valor. Quando ouvem "está caro", você justifica, desconta ou se sente mal. Isso não é mindset, é falta de método de precificação baseado em valor real. Seu faturamento é instável porque você não controla variáveis - você reage ao mercado ao invés de liderar sua categoria de preço. Sem clareza financeira, você trabalha muito e lucra pouco.`;
    } else if (scoreFinanceiro <= 10) {
      analiseFinanceiro = `${nome}, você tem controle básico, mas não domínio estratégico. Seus preços têm alguma lógica (custo ou mercado), mas não refletem valor percebido. Quando alguém diz "está caro", você explica com segurança, mas ainda perde vendas. Seu faturamento é estável, porém baixo ou apenas confortável - não crescente. Você está gerenciando, não escalando. Falta visão de precificação premium e previsibilidade de receita.`;
    } else {
      analiseFinanceiro = `${nome}, você domina seu financeiro. Define preços por valor entregue, responde objeções com segurança e seu faturamento é crescente e previsível. Isso coloca você no top 10% do mercado de estética. Você não trabalha para pagar contas - trabalha para construir patrimônio. O próximo passo é otimizar margem e criar linhas de receita escaláveis (mentorias, produtos, etc).`;
    }

    // ROTINA & NEGÓCIO (perguntas 10-12)
    const scoreRotina = scoresPorBloco.rotina;
    let analiseRotina = "";
    if (scoreRotina <= 6) {
      analiseRotina = `${nome}, você está operando no caos organizado. Sua agenda depende de indicação (instável), promoção (queima margem) ou sorte (imponderável). Você não tem processos claros para captação, conversão ou pós-venda - tudo é improvisado, reativo. Isso te deixa cansada, sobrecarregada e presa na operação. Enquanto você for "a empresa", não há escala. Sem sistema, você não constrói negócio - constrói emprego instável.`;
    } else if (scoreRotina <= 10) {
      analiseRotina = `${nome}, você tem rotina, mas não estratégia previsível. Alguns processos existem, mas são fragmentados. Você se sente organizada em alguns momentos e confusa em outros. Sua agenda vem mais de esforço pessoal do que de sistema automatizado. Você está no meio do caminho: saiu do caos, mas ainda não chegou na máquina previsível. Falta documentar processos e criar fluxos que funcionem sem você.`;
    } else {
      analiseRotina = `${nome}, você comanda um negócio estruturado. Tem processos para tudo: captação, conversão, pós-venda. Sua agenda é previsível, seu método é replicável. Você está no controle, não correndo atrás. Isso te coloca em posição de escalar: contratar, delegar, expandir. O desafio agora é otimizar tempo e ampliar capacidade sem perder qualidade.`;
    }

    // EMPREENDEDOR (perguntas 13-15)
    const scoreEmpreendedor = scoresPorBloco.empreendedor;
    let analiseEmpreendedor = "";
    if (scoreEmpreendedor <= 6) {
      analiseEmpreendedor = `${nome}, seu perfil empreendedor está em desenvolvimento. Você investe em cursos técnicos (que não resolvem seu problema de negócio) ou não investe em nada. Quando algo falha, você desiste, culpa o mercado ou fica paralisada. Não consegue visualizar um futuro claro. Isso não é falta de capacidade - é falta de mentalidade empresarial estruturada. Você ainda pensa como profissional autônoma, não como empresária. Precisa mudar a pergunta de "como fazer melhor" para "como fazer diferente".`;
    } else if (scoreEmpreendedor <= 10) {
      analiseEmpreendedor = `${nome}, você tem mentalidade empreendedora em construção. Investe em ferramentas e estratégia, não só em técnica. Quando algo falha, analisa e ajusta (não desiste). Se vê como empresária, mas oscila entre confiança e insegurança. Você está no caminho certo, mas ainda não desenvolveu a resiliência e visão de longo prazo de quem escala. Falta consistência e método para transformar tentativas em resultados.`;
    } else {
      analiseEmpreendedor = `${nome}, você pensa como empresária estratégica. Investe em estratégia, não improvisa. Quando algo falha, você diagnostica, ajusta e evolui. Se vê como referência ou educadora, não apenas prestadora de serviço. Você saiu da operação e entrou na gestão. Isso é raro. Agora é sobre acelerar crescimento com método, não só com esforço.`;
    }

    // VISÃO (perguntas 16-18)
    const scoreVisao = scoresPorBloco.visao;
    let analiseVisao = "";
    if (scoreVisao <= 6) {
      analiseVisao = `${nome}, você está paralisada por falta de clareza. Tempo, dinheiro, apoio - tudo parece insuficiente. Mas a verdade dura: seu maior bloqueio é interno. Você não acredita que sua clínica pode ser um negócio escalável porque nunca viu um método claro que te mostrasse como. Você está presa na armadilha da "falta de", quando o problema real é "falta de direção". Até ter um mapa, você vai continuar rodando em círculos, não importa quanto trabalhe.`;
    } else if (scoreVisao <= 10) {
      analiseVisao = `${nome}, você acredita em crescimento, mas não tem o mapa. Sabe que quer mais, mas não sabe exatamente como chegar lá. Oscila entre otimismo e dúvida. Se tivesse um método claro, você executaria - mas precisa de segurança antes de agir. Você não é indecisa, é estratégica. Só precisa do plano certo para destravar esse potencial que está represado.`;
    } else {
      analiseVisao = `${nome}, você tem visão empresarial clara. Acredita em escala, sabe que pode crescer e está pronta para executar. Se tivesse um método, faria imediatamente. Essa mentalidade de ação é o que separa quem constrói império de quem fica no "um dia eu faço". Você já tem o combustível - agora é sobre ter o veículo certo (método) para chegar mais rápido.`;
    }

    // ===== ANÁLISE CONSOLIDADA =====
    const areas = [
      { nome: "Identidade", score: scoreIdentidade, max: 15 },
      { nome: "Posicionamento", score: scorePosicionamento, max: 15 },
      { nome: "Financeiro", score: scoreFinanceiro, max: 15 },
      { nome: "Rotina", score: scoreRotina, max: 15 },
      { nome: "Empreendedor", score: scoreEmpreendedor, max: 15 },
      { nome: "Visão", score: scoreVisao, max: 15 }
    ];
    
    const areaFraca = areas.reduce((prev, curr) => 
      (curr.score / curr.max) < (prev.score / prev.max) ? curr : prev
    );
    const areaForte = areas.reduce((prev, curr) => 
      (curr.score / curr.max) > (prev.score / prev.max) ? curr : prev
    );

    let diagnosticoFinal = "";
    let proximoPasso = "";

    if (indiceElevare <= 35) {
      diagnosticoFinal = `${nome}, você está no estágio "Em Construção". Isso não é julgamento - é diagnóstico. Você tem talento técnico, mas seu negócio está operando sem fundação estratégica. Suas decisões são reativas, não proativas. Você trabalha MUITO, mas os resultados não refletem esse esforço. O problema? Você está tentando construir um prédio sem planta. Cada ação é isolada, não conectada a um sistema maior. Seu maior risco agora é burnout por falta de direção.`;
      proximoPasso = `Foco absoluto: FUNDAÇÃO. Antes de criar mais conteúdo, fazer mais posts ou adicionar mais serviços, você precisa definir QUEM você é no mercado e QUAL problema você resolve melhor que ninguém. Sem isso, todo esforço é desperdício de energia. Comece pelo Módulo de Posicionamento Premium e Identidade Profissional.`;
    } else if (indiceElevare <= 55) {
      diagnosticoFinal = `${nome}, você está "Em Crescimento". Saiu do básico, mas ainda não chegou na consistência. Você tem momentos de clareza seguidos de confusão. Algumas coisas funcionam, outras não - e você não sabe exatamente por quê. Está fazendo mais do que a média, mas os resultados ainda são imprevisíveis. O problema? Você está acumulando táticas sem estratégia. É como ter peças de quebra-cabeça sem ver a imagem final.`;
      proximoPasso = `Foco: CONSISTÊNCIA. Você já tem elementos que funcionam - agora precisa conectá-los num sistema previsível. Pare de adicionar mais ferramentas e comece a dominar o que já tem. Invista em Processos & Automação e Precificação Estratégica para estabilizar antes de escalar.`;
    } else if (indiceElevare <= 75) {
      diagnosticoFinal = `${nome}, você está "Estruturada". Tem controle, processos e resultados previsíveis. Você saiu da operação e entrou na gestão. Sabe o que funciona e replica com consistência. Seu negócio não depende só de você - tem sistema. O desafio agora não é sobreviver, é otimizar e escalar sem perder qualidade. Você está pronta para o próximo nível.`;
      proximoPasso = `Foco: ESCALA INTELIGENTE. Você já domina o jogo local. Agora é sobre ampliar alcance (tráfego pago, parcerias, educação) e aumentar ticket médio (reposicionamento premium, pacotes de valor). Invista em Estratégias de Captação Avançada e Autoridade Digital.`;
    } else {
      diagnosticoFinal = `${nome}, você está "Pronta para Escala". Índice acima de 75% coloca você no top 5% do mercado de estética. Você tem visão, método, controle financeiro e mentalidade empresarial. Seu negócio não é hobby nem emprego - é máquina de crescimento. O único limite agora é velocidade de execução e ousadia estratégica. Você pode 10x seu faturamento nos próximos 12-18 meses com o método certo.`;
      proximoPasso = `Foco: ACELERAÇÃO E DIVERSIFICAÇÃO. Expanda para novos mercados (online, B2B, educação), crie produtos escaláveis (cursos, mentorias), construa time de alta performance. Você não precisa de mais fundamentos - precisa de estratégia de escala agressiva e inteligente.`;
    }

    return {
      analiseIdentidade,
      analisePosicionamento,
      analiseFinanceiro,
      analiseRotina,
      analiseEmpreendedor,
      analiseVisao,
      diagnosticoFinal,
      proximoPasso,
      areaFraca: areaFraca.nome,
      areaForte: areaForte.nome,
      nome
    };
  };

  const resetQuiz = () => {
    setStage('intro');
    setCurrentQuestion(0);
    setRespostas([]);
    setContactInfo({ name: '', email: '', whatsapp: '' });
  };

  const handleClose = () => {
    resetQuiz();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#1F2937]/10 hover:bg-[#1F2937]/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-[#1F2937]" />
        </button>

        {/* INTRO */}
        {stage === 'intro' && (
          <div className="p-8 sm:p-12 text-center">
            <span className="inline-block bg-accent-gold text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              Gratuito • 8 minutos
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-4 leading-tight">
              Diagnóstico Premium Elevare™
            </h2>
            
            <p className="text-lg text-[#1F2937]/70 mb-8 leading-relaxed max-w-xl mx-auto">
              Descubra o <strong>Índice Elevare™</strong> do seu negócio: um panorama real sobre posicionamento, vendas e próximos passos.
            </p>

            <div className="bg-[#F9F9F9] rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
              <h3 className="font-bold text-[#1F2937] mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#4F46E5]" />
                O que você receberá:
              </h3>
              <ul className="space-y-2 text-sm text-[#1F2937]/70">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold font-bold">•</span>
                  <span>Análise de identidade, posicionamento e modelo de negócio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold font-bold">•</span>
                  <span>18 perguntas estratégicas com diagnóstico personalizado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold font-bold">•</span>
                  <span>Resultado claro e imediato, sem burocracia</span>
                </li>
              </ul>
            </div>

            <Button
              onClick={handleStartQuiz}
              size="lg"
              className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold px-10 py-7 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Começar Diagnóstico
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}

        {/* QUIZ */}
        {stage === 'quiz' && (
          <div className="p-6 sm:p-10">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#4F46E5]">
                  Pergunta {currentQuestion + 1} de {totalPerguntas}
                </span>
                <span className="text-sm font-bold text-[#1F2937]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-2 bg-[#F9F9F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <h3 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6 leading-tight">
              {perguntasPremium[currentQuestion].texto}
            </h3>

            {/* Options */}
            <div className="space-y-3">
              {perguntasPremium[currentQuestion].opcoes.map((opcao, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opcao)}
                  onMouseEnter={() => setHoveredOption(idx)}
                  onMouseLeave={() => setHoveredOption(null)}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                    hoveredOption === idx
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 shadow-md'
                      : 'border-[#4F46E5]/20 bg-white hover:border-[#4F46E5]/40'
                  }`}
                >
                  <span className="text-[#1F2937] font-medium">{opcao.texto}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTACT */}
        {stage === 'contact' && (
          <div className="p-8 sm:p-12">
            <div className="text-center mb-8">
              <CheckCircle2 className="w-16 h-16 text-[#4F46E5] mx-auto mb-4" />
              <h3 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-3">
                Diagnóstico Concluído!
              </h3>
              <p className="text-[#1F2937]/70">
                Preencha seus dados para receber o resultado personalizado
              </p>
            </div>

            <form onSubmit={handleSubmitContact} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Nome completo</label>
                <Input
                  type="text"
                  required
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  placeholder="Maria Silva"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">Email</label>
                <Input
                  type="email"
                  required
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  placeholder="maria@email.com"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">WhatsApp</label>
                <Input
                  type="tel"
                  required
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold py-6"
              >
                Ver Meu Resultado
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </div>
        )}

        {/* RESULTADO COMPLETO */}
        {stage === 'resultado' && (() => {
          const resultados = calcularResultados();
          const analise = gerarAnalise(resultados);
          
          return (
            <div className="p-8 sm:p-12 max-h-[85vh] overflow-y-auto">
              {/* Saudação Personalizada */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1F2937] mb-2">
                  {analise.nome}, seu Diagnóstico está pronto
                </h2>
                <p className="text-[#1F2937]/60">Preparamos uma análise profunda e personalizada para você</p>
              </div>

              {/* Índice + Classificação */}
              <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-3xl p-8 text-center text-white mb-8 shadow-xl">
                <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur-sm text-5xl font-bold mb-4">
                  {resultados.indiceElevare}
                </div>
                <h3 className="text-2xl font-bold mb-2">Índice Elevare™</h3>
                <div className="inline-block bg-accent-gold px-6 py-2 rounded-full font-bold text-lg">
                  {resultados.classificacao}
                </div>
                <p className="mt-3 text-white/90">Nível: <strong>{resultados.nivelGeral}</strong></p>
              </div>

              {/* Diagnóstico Final Personalizado */}
              <div className="bg-white border-2 border-[#4F46E5]/20 rounded-2xl p-6 mb-8">
                <h4 className="font-bold text-[#1F2937] text-xl mb-4 flex items-center gap-2">
                  🎯 Diagnóstico Completo
                </h4>
                <p className="text-[#1F2937]/80 leading-relaxed mb-6">{analise.diagnosticoFinal}</p>
                
                <div className="bg-[#F9F9F9] rounded-xl p-5">
                  <h5 className="font-bold text-[#4F46E5] mb-2">Seu Próximo Passo:</h5>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.proximoPasso}</p>
                </div>
              </div>

              {/* Análises Detalhadas por Bloco */}
              <div className="space-y-6 mb-8">
                <h4 className="font-bold text-[#1F2937] text-xl mb-4">📊 Análise Profunda por Área</h4>
                
                {/* Identidade */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">1. Identidade Profissional</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.identidade}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.identidade / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analiseIdentidade}</p>
                </div>

                {/* Posicionamento */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">2. Posicionamento & Comunicação</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.posicionamento}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.posicionamento / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analisePosicionamento}</p>
                </div>

                {/* Financeiro */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">3. Gestão Financeira</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.financeiro}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.financeiro / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analiseFinanceiro}</p>
                </div>

                {/* Rotina */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">4. Rotina & Processos</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.rotina}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.rotina / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analiseRotina}</p>
                </div>

                {/* Empreendedor */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">5. Mentalidade Empreendedora</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.empreendedor}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.empreendedor / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analiseEmpreendedor}</p>
                </div>

                {/* Visão */}
                <div className="bg-[#F9F9F9] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-bold text-[#1F2937]">6. Visão & Execução</h5>
                    <span className="text-[#4F46E5] font-bold">{resultados.scoresPorBloco.visao}/15</span>
                  </div>
                  <div className="h-2 bg-white rounded-full mb-4 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4F46E5] to-accent-gold" style={{ width: `${(resultados.scoresPorBloco.visao / 15) * 100}%` }} />
                  </div>
                  <p className="text-sm text-[#1F2937]/70 leading-relaxed">{analise.analiseVisao}</p>
                </div>
              </div>

              {/* Pontos Fortes e Fracos */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
                  <h5 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                    💪 Seu Ponto Mais Forte
                  </h5>
                  <p className="text-green-700 font-semibold">{analise.areaForte}</p>
                  <p className="text-xs text-green-600 mt-2">Mantenha esse padrão e amplifique</p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5">
                  <h5 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                    🎯 Seu Maior Gargalo
                  </h5>
                  <p className="text-red-700 font-semibold">{analise.areaFraca}</p>
                  <p className="text-xs text-red-600 mt-2">Priorize essa área para destravar crescimento</p>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════════════════════════ */}
              {/* 3 CAMINHOS APÓS O RESULTADO */}
              {/* ═══════════════════════════════════════════════════════════════════ */}
              
              <div className="bg-gradient-to-br from-[#F9F9F9] to-white rounded-2xl p-6 mb-6 border-2 border-[#4F46E5]/20">
                <h4 className="text-xl font-bold text-[#1F2937] text-center mb-2">
                  {analise.nome}, o que você quer fazer agora?
                </h4>
                <p className="text-[#1F2937]/60 text-center text-sm mb-6">
                  Escolha uma das opções abaixo
                </p>
                
                <div className="space-y-4">
                  {/* OPÇÃO 1: Baixar PDF */}
                  <button
                    onClick={() => {
                      // Gerar e baixar PDF do relatório
                      const reportContent = `
DIAGNÓSTICO ELEVARE - RELATÓRIO PERSONALIZADO
=============================================

Nome: ${analise.nome}
Data: ${new Date().toLocaleDateString('pt-BR')}

ÍNDICE ELEVARE™: ${resultados.indiceElevare}/100
Classificação: ${resultados.classificacao}

${analise.feedback}

PONTUAÇÕES POR ÁREA:
- Visão: ${resultados.porcentagens.visao}%
- Execução: ${resultados.porcentagens.execucao}%
- Financeiro: ${resultados.porcentagens.financeiro}%

PONTO FORTE: ${resultados.pontoForte}
GARGALO: ${resultados.gargalo}

---
Relatório gerado por Elevare NeuroVendas
www.elevare.com.br
                      `.trim();
                      
                      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `diagnostico-elevare-${analise.nome.toLowerCase().replace(/\s+/g, '-')}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white border-2 border-[#4F46E5]/20 rounded-xl hover:border-[#4F46E5]/40 hover:bg-[#4F46E5]/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#4F46E5]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#4F46E5]/20 transition-colors">
                      <Download className="w-6 h-6 text-[#4F46E5]" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-[#1F2937]">📥 Baixar meu relatório</p>
                      <p className="text-sm text-[#1F2937]/60">Salvar o diagnóstico para consultar depois</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-[#4F46E5]/50 group-hover:text-[#4F46E5] transition-colors" />
                  </button>

                  {/* OPÇÃO 2: Continuar para avaliação Instagram (DESTAQUE) */}
                  <button
                    onClick={() => {
                      const diagnosticData = {
                        step1: {
                          timestamp: new Date().toISOString(),
                          contactInfo,
                          respostas,
                          resultados: {...resultados, analise}
                        }
                      };
                      localStorage.setItem('elevare_diagnostic_flow', JSON.stringify(diagnosticData));
                      window.location.href = '/quick-register-presence';
                    }}
                    className="w-full flex items-center gap-4 p-5 bg-gradient-to-r from-[#4F46E5] to-[#6366F1] rounded-xl hover:from-[#4338CA] hover:to-[#4F46E5] transition-all group shadow-lg shadow-[#4F46E5]/25"
                  >
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Instagram className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white text-lg">📱 Avaliar meu Instagram / Site</p>
                      <p className="text-sm text-white/80">Criar conta gratuita e analisar minha presença digital</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-accent-gold text-white text-xs font-bold px-2 py-1 rounded-full">
                          🎁 GRÁTIS
                        </span>
                        <span className="text-white/70 text-xs">100 créditos + acesso mensal renovável</span>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>

                  {/* OPÇÃO 3: Sair */}
                  <button
                    onClick={() => {
                      onClose();
                    }}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-[#1F2937]/10 rounded-xl hover:bg-[#F9F9F9] transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#1F2937]/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1F2937]/10 transition-colors">
                      <LogOut className="w-6 h-6 text-[#1F2937]/50" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[#1F2937]/70">Sair por enquanto</p>
                      <p className="text-sm text-[#1F2937]/50">Voltar para a página inicial</p>
                    </div>
                  </button>
                </div>

                {/* Nota sobre acesso gratuito */}
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 text-center">
                    <strong>💡 Ao criar sua conta gratuita:</strong> você ganha acesso às ferramentas do Elevare 
                    com <strong>100 créditos mensais renováveis</strong>. Sem cartão, sem compromisso!
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </DialogContent>
    </Dialog>
  );
}
