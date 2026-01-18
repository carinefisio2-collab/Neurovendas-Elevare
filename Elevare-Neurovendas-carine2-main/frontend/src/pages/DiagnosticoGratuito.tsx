import { useState } from "react";
import { useNavigate } from "react-router-dom";
// VERSÃO PÚBLICA - SEM AUTENTICAÇÃO

// ========== TIPOS ==========
interface Opcao {
  texto: string;
  pontos: number;
  categoria?: string;
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

// ========== 18 PERGUNTAS PREMIUM - 6 BLOCOS ==========
const perguntasPremium: Pergunta[] = [
  // BLOCO 1 — IDENTIDADE PROFISSIONAL (Consciência)
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
  // BLOCO 2 — POSICIONAMENTO & BIO (Percepção de Valor)
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
  // BLOCO 3 — FINANCEIRO & PRECIFICAÇÃO (Lucro ou Medo)
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
  // BLOCO 4 — ROTINA & NEGÓCIO (Empresária ou Operacional)
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
  // BLOCO 5 — PERFIL EMPREENDEDOR (Avaliação Crítica)
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

// ========== PALETA ELEVARE (HARMONIZADA COM LANDING PAGE) ==========
const COLORS = {
  primary: "#4F46E5",       // Indigo principal
  primaryLight: "#6366F1",  // Indigo light
  primaryDark: "#4338CA",   // Indigo dark
  secondary: "#8B5CF6",     // Violet
  accent: "#D4AF37",        // Dourado/Gold
  background: "#F9F9F9",    // Background suave
  white: "#FFFFFF",
  text: "#1F2937",          // Cinza escuro
  textLight: "#6B7280",     // Cinza médio
  muted: "#9CA3AF",         // Cinza claro
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  gold: "#D4AF37",
};

type Stage = "intro" | "quiz" | "resultado-final";

// ========== COMPONENTE PRINCIPAL ==========
export default function DiagnosticoGratuito() {
  const navigate = useNavigate();
  // VERSÃO PÚBLICA - SEM AUTENTICAÇÃO

  const [stage, setStage] = useState<Stage>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [respostas, setRespostas] = useState<RespostaUsuario[]>([]);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

  const totalPerguntas = perguntasPremium.length;
  const progressPercent = ((currentQuestion + 1) / totalPerguntas) * 100;

  // ========== HANDLERS ==========
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

    // Salvar no localStorage para persistência
    localStorage.setItem('diagnostico_gratuito_respostas', JSON.stringify(novasRespostas));

    if (currentQuestion + 1 < totalPerguntas) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStage("resultado-final");
    }
  };

  // ========== CÁLCULOS DO DIAGNÓSTICO ==========
  const calcularResultados = () => {
    // Scores por bloco
    const scoresPorBloco: Record<string, number> = {
      identidade: 0,
      posicionamento: 0,
      financeiro: 0,
      rotina: 0,
      empreendedor: 0,
      visao: 0
    };

    const maxPorBloco: Record<string, number> = {
      identidade: 15,     // 3 perguntas x 5 pontos
      posicionamento: 15, // 3 perguntas x 5 pontos
      financeiro: 15,     // 3 perguntas x 5 pontos
      rotina: 15,         // 3 perguntas x 5 pontos
      empreendedor: 15,   // 3 perguntas x 5 pontos
      visao: 15           // 3 perguntas x 5 pontos
    };

    respostas.forEach(r => {
      if (scoresPorBloco[r.bloco] !== undefined) {
        scoresPorBloco[r.bloco] += r.pontos;
      }
    });

    // Score total (máximo 90 pontos = 18 perguntas x 5)
    const scoreTotal = Object.values(scoresPorBloco).reduce((a, b) => a + b, 0);
    const maxTotal = 90;

    // Índice Elevare™ (0-100)
    const indiceElevare = Math.round((scoreTotal / maxTotal) * 100);

    // Classificação
    let classificacao = "";
    if (indiceElevare <= 35) classificacao = "Em Construção";
    else if (indiceElevare <= 55) classificacao = "Em Crescimento";
    else if (indiceElevare <= 75) classificacao = "Estruturado";
    else classificacao = "Pronto para Escala";

    // Nível Geral
    let nivelGeral = "";
    if (indiceElevare <= 30) nivelGeral = "Amadora Técnica";
    else if (indiceElevare <= 50) nivelGeral = "Profissional Operacional";
    else if (indiceElevare <= 70) nivelGeral = "Empresária em Construção";
    else nivelGeral = "Empresária Estratégica";

    // Áreas de análise (3 grandes blocos)
    const areaMaturidade = scoresPorBloco.identidade + scoresPorBloco.empreendedor;
    const areaConsciencia = scoresPorBloco.posicionamento + scoresPorBloco.visao;
    const areaNegocio = scoresPorBloco.financeiro + scoresPorBloco.rotina;

    return {
      scoreTotal,
      maxTotal,
      indiceElevare,
      classificacao,
      nivelGeral,
      scoresPorBloco,
      maxPorBloco,
      areaMaturidade: { score: areaMaturidade, max: 30 },
      areaConsciencia: { score: areaConsciencia, max: 30 },
      areaNegocio: { score: areaNegocio, max: 30 }
    };
  };

  const gerarAnalise = (resultados: ReturnType<typeof calcularResultados>) => {
    const { indiceElevare, areaMaturidade, areaConsciencia, areaNegocio, scoresPorBloco } = resultados;

    // Identificar gargalo principal
    const areas = [
      { nome: "Maturidade Profissional", score: areaMaturidade.score, max: areaMaturidade.max },
      { nome: "Consciência Empresarial", score: areaConsciencia.score, max: areaConsciencia.max },
      { nome: "Gestão de Negócio", score: areaNegocio.score, max: areaNegocio.max }
    ];
    const areaFraca = areas.reduce((prev, curr) => 
      (curr.score / curr.max) < (prev.score / prev.max) ? curr : prev
    );

    // Análise por área
    const analiseMaturidade = areaMaturidade.score <= 12 
      ? { nivel: "Iniciante", texto: "Você ainda se posiciona como técnica, não como empresária. Sua identidade profissional está indefinida, o que dificulta a diferenciação no mercado." }
      : areaMaturidade.score <= 20 
      ? { nivel: "Em Desenvolvimento", texto: "Você está em transição. Já percebe que técnica sozinha não basta, mas ainda não consolidou sua identidade como referência." }
      : { nivel: "Consolidado", texto: "Você tem clareza sobre quem é e o valor que entrega. Sua identidade profissional já trabalha a seu favor." };

    const analiseConsciencia = areaConsciencia.score <= 12
      ? { nivel: "Baixa", texto: "Seu posicionamento está confuso. Você não comunica valor com clareza e depende de promoções para atrair clientes." }
      : areaConsciencia.score <= 20
      ? { nivel: "Moderada", texto: "Você entende a importância do posicionamento, mas ainda não executa de forma consistente. Há potencial não explorado." }
      : { nivel: "Alta", texto: "Seu posicionamento é estratégico. Você atrai o público certo e não depende de descontos para fechar." };

    const analiseNegocio = areaNegocio.score <= 12
      ? { nivel: "Crítico", texto: "Seu negócio opera no improviso. Sem processos claros e controle financeiro, você trabalha muito e lucra pouco." }
      : areaNegocio.score <= 20
      ? { nivel: "Em Estruturação", texto: "Você tem alguns controles, mas falta visão estratégica. Seus preços provavelmente não refletem o valor real." }
      : { nivel: "Estruturado", texto: "Você tem processos e controle financeiro. Agora é otimizar para escalar com previsibilidade." };

    // Gargalo e foco
    let gargaloPrincipal = "";
    let focoEstrategico = "";
    let fraseImpacto = "";

    if (areaFraca.nome === "Maturidade Profissional") {
      gargaloPrincipal = "Identidade profissional indefinida";
      focoEstrategico = "Construir posicionamento e método próprio";
      fraseImpacto = "Seu problema hoje não é técnica. É posicionamento e narrativa.";
    } else if (areaFraca.nome === "Consciência Empresarial") {
      gargaloPrincipal = "Comunicação sem estratégia de valor";
      focoEstrategico = "Reposicionar sua presença digital para atrair pacientes ideais";
      fraseImpacto = "Você tem competência, mas o mercado não enxerga. Sua comunicação precisa mudar.";
    } else {
      gargaloPrincipal = "Gestão e processos desorganizados";
      focoEstrategico = "Estruturar financeiro e criar previsibilidade";
      fraseImpacto = "Você está trabalhando para o negócio, não o negócio trabalhando para você.";
    }

    // Módulos recomendados
    const modulosRecomendados: string[] = [];
    if (scoresPorBloco.posicionamento <= 8) modulosRecomendados.push("Construtor de Bio Magnética");
    if (scoresPorBloco.financeiro <= 8) modulosRecomendados.push("Precificação Estratégica");
    if (scoresPorBloco.rotina <= 8) modulosRecomendados.push("Processos & Automação");
    if (scoresPorBloco.identidade <= 8) modulosRecomendados.push("Posicionamento Premium");
    if (modulosRecomendados.length < 2) {
      modulosRecomendados.push("Estratégias de Captação");
      modulosRecomendados.push("Escala Inteligente");
    }

    return {
      analiseMaturidade,
      analiseConsciencia,
      analiseNegocio,
      gargaloPrincipal,
      focoEstrategico,
      fraseImpacto,
      modulosRecomendados: modulosRecomendados.slice(0, 3)
    };
  };

  // ========== TELA INTRO ==========
  if (stage === "intro") {
    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #fff 100%)`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '48px 32px',
            boxShadow: '0 4px 24px rgba(75, 0, 130, 0.08)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                background: COLORS.gold,
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                marginBottom: '24px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}>
                Gratuito • 5 minutos
              </span>

              <h1 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                fontWeight: 500,
                color: COLORS.primary,
                margin: '0 0 12px 0',
                lineHeight: 1.2,
              }}>
                Diagnóstico Profissional Gratuito
              </h1>

              <p style={{
                fontSize: '16px',
                color: COLORS.muted,
                lineHeight: 1.8,
                margin: '0 0 40px 0',
              }}>
                Entenda onde você está, por que trava e o que precisa ajustar para crescer com lucro, posicionamento e leveza.
              </p>
            </div>

            {/* Estrutura do diagnóstico */}
            <div style={{ margin: '0 0 40px 0' }}>
              {[
                { num: 1, titulo: "Identidade & Posicionamento", desc: "Como você se apresenta ao mercado?" },
                { num: 2, titulo: "Financeiro & Precificação", desc: "Seu preço reflete valor ou medo?" },
                { num: 3, titulo: "Rotina & Modelo de Negócio", desc: "Você é empresária ou operacional?" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  padding: '16px 0',
                  borderBottom: idx < 2 ? `1px solid ${COLORS.secondary}` : 'none',
                }}>
                  <span style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: COLORS.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                    flexShrink: 0,
                  }}>{item.num}</span>
                  <div>
                    <strong style={{ color: '#111827', fontSize: '15px' }}>{item.titulo}</strong>
                    <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: '14px' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefícios */}
            <div style={{
              margin: '0 0 32px 0',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '12px',
            }}>
              {[
                "18 perguntas estratégicas em 6 dimensões",
                "Índice Elevare™ com classificação precisa",
                "Análise sintética com recomendações práticas"
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 0',
                }}>
                  <span style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: COLORS.success,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}>✓</span>
                  <span style={{ color: '#374151', fontSize: '14px' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              data-testid="start-diagnosis-btn"
              style={{
                width: '100%',
                padding: '18px 24px',
                background: COLORS.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setStage("quiz")}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(75, 0, 130, 0.25)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Iniciar Diagnóstico Gratuito
            </button>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', marginTop: '20px' }}>
              Confidencial • Estrutura profissional • Resultado imediato
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== TELA QUIZ ==========
  if (stage === "quiz") {
    const perguntaAtual = perguntasPremium[currentQuestion];
    const blocoNomes: Record<string, string> = {
      identidade: "Identidade Profissional",
      posicionamento: "Posicionamento & Bio",
      financeiro: "Financeiro & Precificação",
      rotina: "Rotina & Negócio",
      empreendedor: "Perfil Empreendedor",
      visao: "Visão & Decisão"
    };

    return (
      <div style={{
        minHeight: '100vh',
        background: COLORS.background,
        fontFamily: "'Inter', -apple-system, sans-serif",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '600px' }}>
          {/* Progress */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '13px',
              color: '#6b7280'
            }}>
              <span>{blocoNomes[perguntaAtual.bloco]}</span>
              <span>{currentQuestion + 1} de {totalPerguntas}</span>
            </div>
            <div style={{
              width: '100%',
              height: '6px',
              background: COLORS.secondary,
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
                borderRadius: '3px',
                transition: 'width 0.3s ease',
                width: `${progressPercent}%`
              }} />
            </div>
            {/* Tempo estimado restante */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '8px',
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              <span>⏱️ ~{Math.ceil((totalPerguntas - currentQuestion - 1) * 0.4)} min restantes</span>
            </div>
          </div>

          {/* Card da pergunta */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '40px 32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.08)',
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 500,
              color: COLORS.text,
              margin: '0 0 32px 0',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {perguntaAtual.texto}
            </h2>

            <div>
              {perguntaAtual.opcoes.map((opcao, index) => (
                <button
                  key={index}
                  data-testid={`option-${index}`}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    background: hoveredOption === index ? '#f9fafb' : '#fff',
                    border: `2px solid ${hoveredOption === index ? COLORS.primary : '#e5e7eb'}`,
                    borderRadius: '12px',
                    fontSize: '15px',
                    color: COLORS.text,
                    cursor: 'pointer',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleAnswer(opcao)}
                  onMouseOver={() => setHoveredOption(index)}
                  onMouseOut={() => setHoveredOption(null)}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: hoveredOption === index ? COLORS.primary : '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: hoveredOption === index ? '#fff' : '#6b7280',
                    flexShrink: 0,
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={{ flex: 1 }}>{opcao.texto}</span>
                  <span style={{ color: '#9ca3af' }}>→</span>
                </button>
              ))}
            </div>

            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '24px' }}>
              Responda com sinceridade para um diagnóstico preciso
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ========== TELA RESULTADO FINAL ==========
  if (stage === "resultado-final") {
    const resultados = calcularResultados();
    const analise = gerarAnalise(resultados);

    const getCorClassificacao = (classificacao: string) => {
      if (classificacao === "Em Construção") return COLORS.error;
      if (classificacao === "Em Crescimento") return COLORS.warning;
      if (classificacao === "Estruturado") return "#3b82f6";
      return COLORS.success;
    };

    const corClassificacao = getCorClassificacao(resultados.classificacao);

    return (
      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${COLORS.background} 0%, #fff 100%)`,
        fontFamily: "'Inter', -apple-system, sans-serif",
        padding: '40px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>

          {/* NAVEGAÇÃO */}
          <div className="flex items-center gap-2 mb-4">
            <BackButton />
            <HomeButton />
          </div>

          {/* CABEÇALHO */}
          <div style={{
            background: COLORS.white,
            borderRadius: '24px',
            padding: '48px 32px',
            boxShadow: '0 4px 24px rgba(75, 0, 130, 0.08)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <span style={{
              display: 'inline-block',
              background: COLORS.gold,
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '20px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}>
              Diagnóstico Completo
            </span>

            <h1 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              fontWeight: 500,
              color: COLORS.primary,
              margin: '0 0 8px 0',
              lineHeight: 1.2,
            }}>
              Diagnóstico Premium Elevare™
            </h1>
            <p style={{
              fontSize: '16px',
              color: COLORS.muted,
              margin: 0,
            }}>
              Onde você está hoje — e o que está travando seu crescimento
            </p>
          </div>

          {/* ÍNDICE ELEVARE™ */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 24px 0',
            }}>
              Índice Elevare™
            </h2>

            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: `5px solid ${corClassificacao}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              background: `linear-gradient(135deg, ${corClassificacao}10 0%, transparent 100%)`,
            }}>
              <span style={{
                fontSize: '48px',
                fontWeight: 700,
                color: corClassificacao,
                lineHeight: 1,
              }}>
                {resultados.indiceElevare}
              </span>
              <span style={{ fontSize: '16px', color: COLORS.muted }}>/ 100</span>
            </div>

            <div style={{
              display: 'inline-block',
              background: `${corClassificacao}15`,
              color: corClassificacao,
              padding: '12px 24px',
              borderRadius: '30px',
              fontSize: '15px',
              fontWeight: 600,
            }}>
              Classificação: {resultados.classificacao}
            </div>
          </div>

          {/* RESULTADOS POR ÁREA (3 BLOCOS) */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: COLORS.text,
              margin: '0 0 24px 0',
            }}>
              Resultados por Área
            </h2>

            {[
              { titulo: "Maturidade Profissional", analise: analise.analiseMaturidade, score: resultados.areaMaturidade },
              { titulo: "Consciência Empresarial", analise: analise.analiseConsciencia, score: resultados.areaConsciencia },
              { titulo: "Gestão de Negócio", analise: analise.analiseNegocio, score: resultados.areaNegocio },
            ].map((area, idx) => {
              const percent = Math.round((area.score.score / area.score.max) * 100);
              const cor = percent <= 40 ? COLORS.error : percent <= 66 ? COLORS.warning : COLORS.success;

              return (
                <div key={idx} style={{
                  padding: '20px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: idx < 2 ? '16px' : 0,
                  borderLeft: `4px solid ${cor}`,
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                  }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: COLORS.text, margin: 0 }}>
                      {area.titulo}
                    </h3>
                    <span style={{
                      background: `${cor}20`,
                      color: cor,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}>
                      {area.analise.nivel}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: COLORS.muted,
                    lineHeight: 1.7,
                    margin: 0,
                  }}>
                    {area.analise.texto}
                  </p>
                  <div style={{
                    marginTop: '12px',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${percent}%`,
                      background: cor,
                      borderRadius: '3px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* TRADUÇÃO EXECUTIVA */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: COLORS.text,
              margin: '0 0 16px 0',
            }}>
              Em português claro:
            </h2>
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.primary}08 0%, ${COLORS.primaryLight}08 100%)`,
              borderRadius: '12px',
              padding: '24px',
              borderLeft: `4px solid ${COLORS.primary}`,
            }}>
              <p style={{
                fontSize: '15px',
                color: COLORS.text,
                lineHeight: 1.8,
                margin: 0,
              }}>
                {resultados.indiceElevare <= 35 ? (
                  <>Você está operando no modo sobrevivência. Sua agenda depende de fatores que você não controla, seu preço não reflete valor e sua comunicação não atrai os pacientes certos. Isso significa vendas imprevisíveis, cansaço constante e a sensação de que algo está errado — mas sem clareza do quê.</>
                ) : resultados.indiceElevare <= 55 ? (
                  <>Você já percebeu que técnica não basta e está buscando evoluir. Porém, ainda falta estrutura. Você trabalha muito, tem competência, mas a inconsistência nos processos e no posicionamento impede que seu negócio cresça de forma previsível e lucrativa.</>
                ) : resultados.indiceElevare <= 75 ? (
                  <>Você está no caminho certo. Tem consciência empresarial e alguns processos estruturados. Agora é hora de refinar: otimizar o que funciona, eliminar o que não funciona e criar as condições para escalar sem perder qualidade de vida.</>
                ) : (
                  <>Você opera como empresária. Tem clareza, processos e visão de crescimento. O próximo passo é escalar: multiplicar resultados, delegar com confiança e transformar sua clínica em um negócio que funciona sem depender 100% de você.</>
                )}
              </p>
            </div>
          </div>

          {/* SÍNTESE ESTRATÉGICA FINAL */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: COLORS.text,
              margin: '0 0 24px 0',
            }}>
              Síntese Estratégica
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div style={{
                padding: '16px 20px',
                background: `${COLORS.error}08`,
                borderRadius: '12px',
                borderLeft: `4px solid ${COLORS.error}`,
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.error, textTransform: 'uppercase' }}>
                  Gargalo Principal
                </span>
                <p style={{ fontSize: '15px', color: COLORS.text, margin: '8px 0 0', fontWeight: 500 }}>
                  {analise.gargaloPrincipal}
                </p>
              </div>

              <div style={{
                padding: '16px 20px',
                background: `${COLORS.primary}08`,
                borderRadius: '12px',
                borderLeft: `4px solid ${COLORS.primary}`,
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: COLORS.primary, textTransform: 'uppercase' }}>
                  Foco Estratégico Recomendado
                </span>
                <p style={{ fontSize: '15px', color: COLORS.text, margin: '8px 0 0', fontWeight: 500 }}>
                  {analise.focoEstrategico}
                </p>
              </div>

              <div style={{
                padding: '20px',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
                borderRadius: '12px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '16px',
                  color: '#fff',
                  margin: 0,
                  fontWeight: 500,
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                }}>
                  "{analise.fraseImpacto}"
                </p>
              </div>
            </div>
          </div>

          {/* NÍVEL GERAL */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 16px 0',
            }}>
              Seu Nível Geral
            </h2>
            <p style={{
              fontSize: '28px',
              fontWeight: 600,
              color: COLORS.primary,
              margin: 0,
            }}>
              {resultados.nivelGeral}
            </p>
          </div>

          {/* PONTE COM O PRODUTO */}
          <div style={{
            background: COLORS.white,
            borderRadius: '20px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(75, 0, 130, 0.06)',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: 600,
              color: COLORS.text,
              margin: '0 0 8px 0',
            }}>
              Com esse diagnóstico, os módulos mais indicados para você são:
            </h2>
            <p style={{
              fontSize: '14px',
              color: COLORS.muted,
              margin: '0 0 20px 0',
            }}>
              Baseado nas áreas que mais precisam de atenção:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analise.modulosRecomendados.map((modulo, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '12px',
                }}>
                  <span style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: COLORS.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '14px',
                  }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: '15px', color: COLORS.text, fontWeight: 500 }}>
                    {modulo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ENCERRAMENTO ELEGANTE */}
          <div style={{
            background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.8,
              margin: 0,
            }}>
              Este foi seu diagnóstico gratuito — uma visão clara de onde você está hoje.
              <br /><br />
              O próximo passo é transformar consciência em ação.
              <br />
              Escolha como deseja continuar:
            </p>
          </div>

          {/* 3 OPÇÕES FINAIS (CRÍTICO!) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Opção 1: Baixar PDF */}
            <button
              data-testid="download-pdf-btn"
              style={{
                padding: '24px 16px',
                background: COLORS.white,
                border: `2px solid ${COLORS.accent}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = COLORS.accent;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => alert('Funcionalidade de PDF em desenvolvimento')}
            >
              <span style={{ fontSize: '32px' }}>📄</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.text }}>
                Baixar PDF
              </span>
              <span style={{ fontSize: '12px', color: COLORS.muted, textAlign: 'center' }}>
                Salve para comparar evolução
              </span>
            </button>

            {/* Opção 2: Análise de Presença Digital ou Ver Resultados */}
            <button
              data-testid="analise-presenca-btn"
              style={{
                padding: '24px 16px',
                background: `linear-gradient(135deg, ${COLORS.primary}10 0%, ${COLORS.secondary}10 100%)`,
                border: `2px solid ${COLORS.primary}`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 70, 229, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => {
                const analiseCompleta = localStorage.getItem('analise_presenca_completa');
                if (analiseCompleta) {
                  navigate("/diagnostics-complete");
                } else {
                  navigate("/analise-presenca-digital");
                }
              }}
            >
              <span style={{ fontSize: '32px' }}>{localStorage.getItem('analise_presenca_completa') ? '🎉' : '✨'}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.primary }}>
                {localStorage.getItem('analise_presenca_completa') ? 'Ver Meus Resultados Completos' : 'Análise de Presença Digital'}
              </span>
              <span style={{ fontSize: '12px', color: COLORS.textLight, textAlign: 'center' }}>
                {localStorage.getItem('analise_presenca_completa') ? 'Diagnóstico + Análise concluídos!' : 'Analise Instagram e site gratuitamente'}
              </span>
            </button>

            {/* Opção 3: Sair */}
            <button
              data-testid="exit-btn"
              style={{
                padding: '24px 16px',
                background: COLORS.white,
                border: `2px solid #e5e7eb`,
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = COLORS.textLight;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => navigate("/hub")}
            >
              <span style={{ fontSize: '32px' }}>👋</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: COLORS.text }}>
                Sair
              </span>
              <span style={{ fontSize: '12px', color: COLORS.textLight, textAlign: 'center' }}>
                Voltar para página inicial
              </span>
            </button>
          </div>

          {/* Botão de Refazer */}
          <div style={{ textAlign: 'center' }}>
            <button
              data-testid="redo-diagnosis-btn"
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: COLORS.muted,
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
              onClick={() => {
                setStage("intro");
                setCurrentQuestion(0);
                setRespostas([]);
                localStorage.removeItem('diagnostico_gratuito_respostas');
              }}
            >
              Refazer Diagnóstico
            </button>
          </div>

          <p style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px',
            marginTop: '24px',
          }}>
            Diagnóstico Premium Elevare™ • Confidencial • {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
