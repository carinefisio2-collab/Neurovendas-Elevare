/**
 * Central NeuroVendas Elevare™
 * 
 * Sistema estratégico de decisão para esteticistas.
 * Todos os prompts restaurados + LucresIA integrada
 */

import { useState } from 'react';
import { Check, Copy, Brain, Target, Shield, Zap, Sparkles, X, Send, Loader2 } from 'lucide-react';
import NeuroVendasLayout from '@/components/dashboard/NeuroVendasLayout';
import { BackButton, HomeButton } from '@/components/ui/page-header';
import { api } from '@/lib/api';

// ═══════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════════════

interface PromptCard {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  neurovendas: {
    atencao: string;
    identificacao: string;
    seguranca: string;
    decisao: string;
  };
  objetivo: string;
  quandoUsar: string;
  prompt: string;
  isPro?: boolean;
}

// ═══════════════════════════════════════════════════════════════════
// TODOS OS PROMPTS - RESTAURADOS + NOVOS
// ═══════════════════════════════════════════════════════════════════

const prompts: PromptCard[] = [
  // ═══════════════════════════════════════════════════════════════════
  // PROMPTS ORIGINAIS RESTAURADOS
  // ═══════════════════════════════════════════════════════════════════
  {
    id: '1',
    category: 'autoridade',
    title: 'Autoridade que não grita',
    subtitle: 'Posicione-se como referência sem prometer milagres',
    neurovendas: {
      atencao: 'micro-dor/contraste',
      identificacao: 'dor silenciosa',
      seguranca: 'prova técnica',
      decisao: 'micro-ação/CTA seguro'
    },
    objetivo: 'Construir autoridade baseada em resultado, método e propósito',
    quandoUsar: 'Leads frios ou pós-conteúdo educativo',
    prompt: 'Crie um post para Instagram que posicione uma esteticista como referência em resultados reais, destacando técnica + propósito. Use tom acolhedor e assertivo. Finalize com CTA para avaliação individual.'
  },
  {
    id: '2',
    category: 'vendas',
    title: 'Venda com coerência',
    subtitle: 'Oferta guiada que ativa decisão sem pressão',
    neurovendas: {
      atencao: 'contraste expectativa/reality',
      identificacao: 'frustração anterior',
      seguranca: 'método e acompanhamento',
      decisao: 'micro-ação CTA seguro'
    },
    objetivo: 'Converter leads quentes sem desgaste emocional',
    quandoUsar: 'Pós-conteúdo educativo ou leads engajados',
    prompt: 'Crie um post apresentando um pacote estético como um processo guiado, mostrando valor real. Finalize com convite seguro para avaliação individual.'
  },
  {
    id: '3',
    category: 'educativo',
    title: 'Educação que gera decisão',
    subtitle: 'Explique procedimentos com ciência e clareza',
    neurovendas: {
      atencao: 'curiosidade inicial',
      identificacao: 'necessidade de entender',
      seguranca: 'explicação científica',
      decisao: 'micro-ação para agendar'
    },
    objetivo: 'Educar para criar confiança',
    quandoUsar: 'Leads frios ou conteúdo de blog/Instagram',
    prompt: 'Crie conteúdo educativo explicando [PROCEDIMENTO], mostrando como funciona, sem promessas milagrosas, finalizando com convite sutil para avaliação.'
  },
  {
    id: '4',
    category: 'conexao',
    title: 'Transformações Reais',
    subtitle: 'Conte histórias que vendem sem vender',
    neurovendas: {
      atencao: 'narrativa emocional',
      identificacao: 'cliente similar',
      seguranca: 'resultado comprovado',
      decisao: 'convite à ação'
    },
    objetivo: 'Prova social que gera confiança',
    quandoUsar: 'Instagram, stories ou carrossel',
    prompt: 'Conte a história de uma cliente que recuperou autoestima com tratamento estético, detalhando antes/depois em storytelling. Finalize com convite para conhecer o protocolo.'
  },
  {
    id: '5',
    category: 'conexao',
    title: 'Bastidores que conectam',
    subtitle: 'Stories reais que geram proximidade',
    neurovendas: {
      atencao: 'erro comum + curiosidade',
      identificacao: 'cliente se reconhece',
      seguranca: 'transparência da profissional',
      decisao: 'interação via caixinha'
    },
    objetivo: 'Humanizar atendimento e aumentar engajamento',
    quandoUsar: 'Stories diários ou reels curtos',
    prompt: 'Crie roteiro de stories mostrando bastidores, 1 erro comum, 1 bastidor do dia e 1 dica prática. Feche com caixinha interativa.'
  },
  {
    id: '6',
    category: 'estrategia',
    title: 'Campanhas temáticas estratégicas',
    subtitle: 'Conteúdo alinhado ao tema do mês',
    neurovendas: {
      atencao: 'tema do mês + dor',
      identificacao: 'problemas comuns',
      seguranca: 'autoridade técnica',
      decisao: 'micro-conversão CTA'
    },
    objetivo: 'Engajamento e autoridade alinhados à temporada',
    quandoUsar: 'Planejamento mensal de conteúdo',
    prompt: 'Crie 3 ideias de postagens para [TEMA_MENSAL], mostrando erros + soluções + autoridade técnica.'
  },
  {
    id: '7',
    category: 'vendas',
    title: 'Ofertas humanizadas',
    subtitle: 'Venda sem parecer apelação',
    neurovendas: {
      atencao: 'destaque do valor percebido',
      identificacao: 'necessidade real da cliente',
      seguranca: 'benefícios extras e acompanhamento',
      decisao: 'CTA elegante'
    },
    objetivo: 'Converter com elegância',
    quandoUsar: 'Leads prontos para compra',
    prompt: 'Crie post vendendo pacote estético mostrando valor real e acompanhamento, finalizando com CTA elegante.'
  },
  {
    id: '8',
    category: 'relacionamento',
    title: 'Encantamento e fidelização',
    subtitle: 'Seja lembrada em cada ponto de contato',
    neurovendas: {
      atencao: 'mensagens personalizadas',
      identificacao: 'experiência da cliente',
      seguranca: 'consistência do atendimento',
      decisao: 'engajamento contínuo'
    },
    objetivo: 'Fidelização e indicação',
    quandoUsar: 'Pós-venda e acompanhamento',
    prompt: 'Gere sequência de 3 posts para primeiro contato, atendimento e pós-venda, com frases e postura profissional para encantar.'
  },
  {
    id: '9',
    category: 'autoridade',
    title: 'Storytelling de Marca Pessoal',
    subtitle: 'Conte sua trajetória inspiradora',
    neurovendas: {
      atencao: 'jornada de superação',
      identificacao: 'profissional aspirante',
      seguranca: 'resultados alcançados',
      decisao: 'engajamento e identificação'
    },
    objetivo: 'Autoridade e conexão emocional',
    quandoUsar: 'Postagens de marca pessoal',
    prompt: 'Crie legenda contando trajetória da esteticista, virada inspiradora e frase final que gere identificação.'
  },
  {
    id: '10',
    category: 'conteudo',
    title: 'Comunicação Visual e Emoção',
    subtitle: 'Conceitos visuais que transmitem emoção',
    neurovendas: {
      atencao: 'estética visual',
      identificacao: 'conexão com público',
      seguranca: 'harmonia de cores e design',
      decisao: 'desejo de engajamento'
    },
    objetivo: 'Criar impacto visual e emocional',
    quandoUsar: 'Posts Instagram, carrosséis e Reels',
    prompt: 'Descreva conceito visual clean, lavanda + dourado suave, destaque rosto da profissional e frase de poder sobre autoestima.'
  },
  {
    id: '11',
    category: 'copy',
    title: 'Títulos Atrativos',
    subtitle: 'Faça o público parar o scroll',
    neurovendas: {
      atencao: 'curiosidade e contraste',
      identificacao: 'dor ou desejo',
      seguranca: 'clareza e promessa real',
      decisao: 'clique/engajamento'
    },
    objetivo: 'Aumentar CTR em postagens',
    quandoUsar: 'Postagens Instagram, carrosséis e títulos de blog',
    prompt: 'Crie 5 variações de títulos curtos e chamativos sobre [TEMA] usando curiosidade, contradição e autoridade.'
  },
  {
    id: '12',
    category: 'video',
    title: 'Roteiro de Reels Viral',
    subtitle: 'Estrutura que engaja',
    neurovendas: {
      atencao: 'micro-gancho inicial',
      identificacao: 'problema reconhecível',
      seguranca: 'narrativa lógica',
      decisao: 'CTA direto'
    },
    objetivo: 'Engajamento e conversão via vídeo',
    quandoUsar: 'Reels Instagram',
    prompt: 'Crie roteiro com 3 cenas curtas sobre [TEMA], tom humano/educativo, frase de impacto + CTA para agendamento.'
  },
  {
    id: '13',
    category: 'engajamento',
    title: 'Engajamento em Stories',
    subtitle: 'Perguntas estratégicas que geram interação',
    neurovendas: {
      atencao: 'pergunta interessante',
      identificacao: 'dor/desafio do público',
      seguranca: 'simplicidade e clareza',
      decisao: 'interação via caixinha/enquete'
    },
    objetivo: 'Aumentar engajamento e participação',
    quandoUsar: 'Stories Instagram',
    prompt: 'Crie perguntas estratégicas sobre [TEMA] para stories, usando enquete + caixinha, que gerem identificação e interação.'
  },
  {
    id: '14',
    category: 'conteudo',
    title: 'Carrossel AISV Completo',
    subtitle: '8 slides que convertem',
    neurovendas: {
      atencao: 'micro-dor + promessa',
      identificacao: 'mini-casos + micro-dor',
      seguranca: 'explicação simples',
      decisao: 'CTA claro'
    },
    objetivo: 'Engajar e converter usando framework AISV',
    quandoUsar: 'Carrossel Instagram',
    prompt: 'Crie carrossel de 8 slides seguindo AISV (Atenção, Interesse, Segurança, Venda) sobre [TEMA], com CTA para agendamento.'
  },
  {
    id: '15',
    category: 'estrategia',
    title: 'Análise de Concorrência Ética',
    subtitle: 'Destaque-se sem copiar a concorrência',
    neurovendas: {
      atencao: 'ponto de diferenciação',
      identificacao: 'lacuna no mercado',
      seguranca: 'seu método único',
      decisao: 'escolha pela autenticidade'
    },
    objetivo: 'Identificar oportunidades e reforçar sua singularidade',
    quandoUsar: 'Planejamento estratégico trimestral',
    prompt: 'Analise 3 perfis de concorrentes e identifique 1 lacuna de conteúdo ou abordagem. Crie 1 post que preencha essa lacuna com sua perspectiva única.'
  },
  {
    id: '16',
    category: 'copy',
    title: 'Legendas que Conectam',
    subtitle: 'Transforme posts simples em mini-histórias',
    neurovendas: {
      atencao: 'gancho emocional',
      identificacao: 'vulnerabilidade ou superação',
      seguranca: 'lição aprendida',
      decisao: 'convite para compartilhar'
    },
    objetivo: 'Aumentar comentários e salvamentos',
    quandoUsar: 'Posts de foto única no Instagram',
    prompt: 'Crie uma legenda para uma foto de [TEMA] usando a estrutura de storytelling: Contexto, Conflito, Resolução e Moral da História. Finalize com uma pergunta aberta.'
  },
  {
    id: '17',
    category: 'vendas',
    title: 'Quebra de Objeções Clássicas',
    subtitle: 'Responda ao "está caro" com valor',
    neurovendas: {
      atencao: 'reconhecer a objeção',
      identificacao: 'validar a preocupação',
      seguranca: 'recontextualizar com valor',
      decisao: 'oferecer um caminho (não um desconto)'
    },
    objetivo: 'Transformar objeções em oportunidades de venda',
    quandoUsar: 'Conteúdo para stories ou DMs',
    prompt: 'Crie uma resposta em vídeo (roteiro) para a objeção "seu tratamento é caro", focando nos resultados, na segurança do método e no custo de não resolver o problema.'
  },
  {
    id: '18',
    category: 'relacionamento',
    title: 'Pós-Venda que Fideliza',
    subtitle: 'Transforme clientes em fãs da sua marca',
    neurovendas: {
      atencao: 'cuidado genuíno',
      identificacao: 'experiência pós-procedimento',
      seguranca: 'suporte contínuo',
      decisao: 'pedido de feedback ou depoimento'
    },
    objetivo: 'Aumentar a taxa de recompra e indicações',
    quandoUsar: 'Mensagens de WhatsApp 1 semana após o procedimento',
    prompt: 'Crie uma mensagem de acompanhamento pós-venda para uma cliente que realizou [PROCEDIMENTO], perguntando sobre os resultados e sutilmente pedindo um depoimento em vídeo.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // NOVOS PROMPTS FREE
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'decisao-ansiedade',
    category: 'vendas',
    title: 'Decisão Sem Ansiedade',
    subtitle: 'Ajude a cliente a decidir sem medo',
    neurovendas: {
      atencao: 'medo de errar',
      identificacao: 'indecisão silenciosa',
      seguranca: 'orientação profissional',
      decisao: 'escolha guiada'
    },
    objetivo: 'Reduzir desistência por insegurança',
    quandoUsar: 'Leads que somem após orçamento',
    prompt: 'Crie uma mensagem acolhedora ajudando a cliente a decidir sobre um tratamento estético, validando o medo de errar e reforçando que a decisão será acompanhada profissionalmente. Finalize com convite seguro para avaliação.'
  },
  {
    id: 'anti-charlatanismo',
    category: 'autoridade',
    title: 'Conteúdo Anti-Charlatanismo',
    subtitle: 'Eduque sem atacar, posicione sem confronto',
    neurovendas: {
      atencao: 'promessa exagerada do mercado',
      identificacao: 'confusão da cliente',
      seguranca: 'ciência e ética',
      decisao: 'confiança na profissional'
    },
    objetivo: 'Diferenciação ética',
    quandoUsar: 'Mercado saturado / promessas milagrosas',
    prompt: 'Crie um post educativo mostrando como identificar promessas milagrosas na estética e por que resultados reais exigem método, constância e avaliação individual. Use tom profissional, sem ataques diretos.'
  },
  {
    id: 'pre-venda-educativa',
    category: 'vendas',
    title: 'Pré-Venda Educativa',
    subtitle: 'Prepare a cliente antes da oferta',
    neurovendas: {
      atencao: 'erro comum antes do tratamento',
      identificacao: 'expectativa irreal',
      seguranca: 'alinhamento prévio',
      decisao: 'prontidão para compra'
    },
    objetivo: 'Aumentar taxa de fechamento',
    quandoUsar: 'Stories ou sequência de posts',
    prompt: 'Crie uma sequência curta de conteúdo preparando a cliente para investir em um tratamento estético, ajustando expectativas e mostrando o papel da avaliação profissional.'
  },

  // ═══════════════════════════════════════════════════════════════════
  // PROMPTS DE GESTÃO (anteriormente PRO)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'limite-profissional',
    category: 'gestao',
    title: 'Conteúdo de Limite Profissional',
    subtitle: 'Educar a cliente a respeitar seu tempo e valor',
    neurovendas: {
      atencao: 'comportamento comum inadequado',
      identificacao: 'profissional se reconhece',
      seguranca: 'postura firme e humana',
      decisao: 'ajuste de expectativa'
    },
    objetivo: 'Reduzir desgaste emocional',
    quandoUsar: 'Clientes que pedem "só uma perguntinha"',
    prompt: 'Crie um post explicando, de forma elegante, por que avaliações e orientações profissionais exigem tempo, preparo e responsabilidade. Reforce valor sem soar defensiva.',
  },
  {
    id: 'agenda-cheia',
    category: 'gestao',
    title: 'Autoridade Silenciosa em Agenda Cheia',
    subtitle: 'Quando você não precisa implorar por clientes',
    neurovendas: {
      atencao: 'agenda limitada',
      identificacao: 'desejo de prioridade',
      seguranca: 'profissional requisitada',
      decisao: 'ação rápida'
    },
    objetivo: 'Valorizar agenda sem arrogância',
    quandoUsar: 'Alta demanda ou poucas vagas',
    prompt: 'Crie um post comunicando poucas vagas para avaliação estética, reforçando critério, acompanhamento e qualidade do atendimento, sem urgência forçada.',
  },
  {
    id: 'profissional-cansada',
    category: 'gestao',
    title: 'Conteúdo para Profissional Cansada',
    subtitle: 'Marca pessoal com verdade emocional',
    neurovendas: {
      atencao: 'exaustão silenciosa',
      identificacao: 'profissional se vê ali',
      seguranca: 'humanidade e verdade',
      decisao: 'conexão profunda'
    },
    objetivo: 'Conexão com outras profissionais',
    quandoUsar: 'Marca pessoal / bastidores',
    prompt: 'Crie uma legenda sincera sobre os desafios emocionais de trabalhar com estética, equilibrando técnica, expectativas de clientes e autocuidado profissional. Finalize com frase de força e pertencimento.',
  }
];

// ═══════════════════════════════════════════════════════════════════
// CATEGORIAS DE FILTRO - TODAS RESTAURADAS
// ═══════════════════════════════════════════════════════════════════

const categories = [
  { id: 'all', name: 'Todos' },
  { id: 'autoridade', name: 'Autoridade' },
  { id: 'vendas', name: 'Vendas' },
  { id: 'educativo', name: 'Educativo' },
  { id: 'conexao', name: 'Conexão' },
  { id: 'estrategia', name: 'Estratégia' },
  { id: 'relacionamento', name: 'Relacionamento' },
  { id: 'conteudo', name: 'Conteúdo' },
  { id: 'copy', name: 'Copy' },
  { id: 'video', name: 'Vídeo' },
  { id: 'engajamento', name: 'Engajamento' },
  { id: 'gestao', name: 'Gestão' }
];

// ═══════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

export default function Biblioteca() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Chat LucresIA
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptCard | null>(null);
  const [userInput, setUserInput] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  const filteredPrompts = activeFilter === 'all' 
    ? prompts 
    : prompts.filter(p => p.category === activeFilter);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenChat = (prompt: PromptCard) => {
    setSelectedPrompt(prompt);
    setChatOpen(true);
    setChatResponse(null);
    setUserInput('');
  };

  // ═══════════════════════════════════════════════════════════════════
  // COMPORTAMENTO INTELIGENTE LUCRESIA
  // ═══════════════════════════════════════════════════════════════════
  const detectAction = (input: string): 'adaptar' | 'aprofundar' | 'converter' => {
    const lower = input.toLowerCase().trim();
    
    const formatKeywords = ['post', 'reels', 'stories', 'story', 'whats', 'whatsapp', 'carrossel', 'legenda', 'roteiro', 'email'];
    if (formatKeywords.some(k => lower.includes(k))) return 'converter';
    
    const deepKeywords = ['autoridade', 'confiança', 'emoção', 'técnica', 'profundo', 'estratégico', 'mais', 'ciência'];
    if (deepKeywords.some(k => lower.includes(k))) return 'aprofundar';
    
    return 'adaptar';
  };

  const handleChatSubmit = async () => {
    if (!userInput.trim() || !selectedPrompt) return;
    
    setChatLoading(true);
    const action = detectAction(userInput);
    
    let systemPrompt = `Você é LucresIA, copiloto estratégico da Plataforma Elevare.
REGRAS RÍGIDAS:
- Gere APENAS: título curto + conteúdo final pronto + CTA coerente
- NÃO explique método
- NÃO repita o prompt original
- NÃO eduque
- NÃO faça perguntas
- Máximo 150 palavras

CONTEXTO DO PROMPT:
Título: ${selectedPrompt.title}
Objetivo: ${selectedPrompt.objetivo}
Prompt Base: ${selectedPrompt.prompt}

AÇÃO DETECTADA: ${action.toUpperCase()}
INPUT DA USUÁRIA: ${userInput}`;

    try {
      const response = await api.post('/api/ai/chat', {
        message: systemPrompt,
        context: 'biblioteca_neurovendas'
      });
      
      setChatResponse(response.data.response || response.data.message);
    } catch (error) {
      setChatResponse('Erro ao processar. Tente novamente.');
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <NeuroVendasLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Navigation */}
        <div className="flex items-center gap-2 px-4 pt-4">
          <BackButton />
          <HomeButton />
        </div>

        {/* Hero Section */}
        <div className="text-center py-12 px-4 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-b border-purple-100">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#7c3aed] shadow-lg shadow-purple-500/30 mb-4">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            Central NeuroVendas Elevare™
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Prompts estratégicos que educam, conectam e vendem — sem apelação, com ciência e resultado real.
          </p>
        </div>

        {/* Container */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Comece a usar agora */}
          <p className="text-center text-sm text-slate-500 mb-4">Comece a usar agora</p>
          
          {/* Filters - TODAS AS CATEGORIAS */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  activeFilter === cat.id
                    ? cat.id === 'gestao' 
                      ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-md'
                      : 'bg-[#4B0082] text-white shadow-md'
                    : cat.id === 'gestao'
                      ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-[#4B0082] hover:text-[#4B0082]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
              >

                {/* Card Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#4B0082] bg-purple-50 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-1 pr-12" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
                
                {/* Card Body */}
                <div className="p-5 flex-grow space-y-4">
                  {/* NeuroVendas Box */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-100">
                    <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      NeuroVendas Ativado
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-amber-700">
                      <div><span className="font-medium">Atenção:</span> {item.neurovendas.atencao}</div>
                      <div><span className="font-medium">Identificação:</span> {item.neurovendas.identificacao}</div>
                      <div><span className="font-medium">Segurança:</span> {item.neurovendas.seguranca}</div>
                      <div><span className="font-medium">Decisão:</span> {item.neurovendas.decisao}</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Target className="w-3 h-3 text-[#4B0082]" />
                        Objetivo Estratégico:
                      </span>
                      <p className="text-slate-600 mt-0.5">{item.objetivo}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-[#4B0082]" />
                        Quando usar:
                      </span>
                      <p className="text-slate-600 mt-0.5">{item.quandoUsar}</p>
                    </div>
                  </div>

                  {/* Prompt Box */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Prompt Elevare:</p>
                    <p className="text-sm text-slate-700 line-clamp-3">{item.prompt}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleCopy(item.prompt, item.id)}
                    className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      copiedId === item.id
                        ? 'bg-green-500 text-white'
                        : 'bg-[#4B0082] text-white hover:bg-[#3a006b]'
                    }`}
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Usar Prompt
                      </>
                    )}
                  </button>
                  
                  {/* Botão LucresIA */}
                  <button
                    onClick={() => handleOpenChat(item)}
                    className="w-full py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border border-[#4B0082] text-[#4B0082] hover:bg-purple-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ajustar com LucresIA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Modal - LucresIA */}
        {chatOpen && selectedPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4B0082] to-[#7c3aed] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">LucresIA</h3>
                    <p className="text-xs text-slate-500">{selectedPrompt.title}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Mensagem inicial da LucresIA */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-slate-800 font-semibold mb-3">
                    Objetivo captado.
                  </p>
                  <p className="text-sm text-slate-600 mb-3">
                    Escolha como evoluir este conteúdo:
                  </p>
                  <div className="space-y-3 text-sm text-slate-600">
                    <div>
                      <p className="font-semibold text-slate-700">1️⃣ Adaptar</p>
                      <p className="text-slate-500 text-xs ml-4">(ex: "para criomodelagem", "para iniciantes", "para Instagram")</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">2️⃣ Aprofundar</p>
                      <p className="text-slate-500 text-xs ml-4">(ex: "mais técnica do procedimento", "mais autoridade profissional", "mais ciência, menos emoção")</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">3️⃣ Converter</p>
                      <p className="text-slate-500 text-xs ml-4">(ex: "post curto", "roteiro de stories", "mensagem de WhatsApp para agendamento")</p>
                    </div>
                  </div>
                </div>

                {/* Resposta da LucresIA */}
                {chatResponse && (
                  <div className="bg-white rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#4B0082]" />
                      <span className="text-xs font-semibold text-[#4B0082]">Resultado</span>
                    </div>
                    <div className="text-sm text-slate-700 whitespace-pre-wrap">
                      {chatResponse}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(chatResponse);
                        setCopiedId('chat-response');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="mt-3 text-xs text-[#4B0082] hover:underline flex items-center gap-1"
                    >
                      {copiedId === 'chat-response' ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copiar resultado
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-200 bg-slate-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChatSubmit()}
                    placeholder="Digite: criomodelagem, post, WhatsApp..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4B0082]/20 focus:border-[#4B0082]"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={handleChatSubmit}
                    disabled={chatLoading || !userInput.trim()}
                    className="px-4 py-3 bg-[#4B0082] text-white rounded-xl hover:bg-[#3a006b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chatLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                  1 input → 1 resposta → pronto para usar
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </NeuroVendasLayout>
  );
}
