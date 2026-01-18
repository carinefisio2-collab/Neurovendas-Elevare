/**
 * ELEVARE 365 PRO - Calendário de NeuroVendas
 * 
 * Design original fornecido pelo cliente
 * Integrado à plataforma NeuroVendas
 */

import React, { useState, useMemo, useEffect } from 'react';
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { 
  Sparkles, Zap, ChevronLeft, 
  Layout, Copy, RefreshCcw, 
  ChevronRight, Table, Grid, Target, X,
  TrendingUp, HeartPulse, Send, Mail, Video, Image as ImageIcon,
  CalendarDays, Info, ShieldAlert, BarChart3, CheckCircle,
  Camera, Layers, Palette, ArrowRight, Clock, Loader2, AlertCircle
} from 'lucide-react';

// ============================================
// TYPES & ENUMS
// ============================================

enum PostStatus {
  RASCUNHO = 'Rascunho',
  PROCESSANDO = 'Processando',
  PRONTO = 'Pronto',
  REVISAR = 'Revisar'
}

enum PostType {
  FEED = 'Feed Estático',
  STORIES = 'Stories',
  REELS = 'Reels',
  CARROSSEL = 'Carrossel'
}

enum Archetype {
  EDUCACIONAL = 'Educacional',
  AUTORIDADE = 'Autoridade',
  PROVA_SOCIAL = 'Prova Social',
  BASTIDORES = 'Bastidores',
  VENDA = 'Venda'
}

enum ContentStage {
  PLANTIO = 'Plantio 🌱',
  AQUECIMENTO = 'Aquecimento 🔥',
  CONVERSAO = 'Conversão 💰',
  RETENCAO = 'Retenção 🛠'
}

enum StorytellingModel {
  ESPELHO = 'História-espelho (Identificação)',
  VIRADA = 'Virada Silenciosa (Mudança Interna)',
  MENTIRA = 'Quebra de Mentira (Autoridade)',
  BASTIDOR = 'Bastidor Estratégico (Conexão)',
  FUTURA = 'História Futura (Antecipação)'
}

enum ImageOrigin {
  IA = 'Banco de Imagens IA Elevare',
  PROPRIAS = 'Minhas Próprias Fotos',
  CANVA = 'Galeria do Canva'
}

interface Post {
  id: string;
  data: string;
  mes: string;
  semana: number;
  tipo: PostType;
  arquetipo: Archetype;
  stage: ContentStage;
  storytellingModel: StorytellingModel;
  dominantEmotion: string;
  invisibleEnemy: string;
  uncomfortableTruth: string;
  tema: string;
  subtema: string;
  prompt_ai: string;
  feed_legend: string;
  story_1: string;
  story_2: string;
  story_3: string;
  story_4: string;
  carousel_slides: string[]; 
  hashtags_list: string;
  ctas_list: string;
  status: PostStatus;
  autor: string;
  ai_raw_json: string;
  seals: string[];
  imageOrigin?: ImageOrigin;
  whatsapp_copy?: string;
  email_subject?: string;
  email_body?: string;
  video_script?: string;
  visual_reference_prompt?: string;
  generated_image_url?: string;
}

interface StrategicSelection {
  maturity: string;
  structure: string;
  objective: string;
  axis: string;
  territory: string;
  commercialFunction: string;
  hemisphere?: string;
  defaultImageOrigin?: ImageOrigin;
}

// ============================================
// CONSTANTS
// ============================================

const ELEVARE_SEALS = [
  { id: 'selo-aquecer', name: 'Aquecimento', icon: '🔥' },
  { id: 'selo-converter', name: 'Conversão', icon: '💰' },
  { id: 'selo-plantio', name: 'Plantio', icon: '🌱' },
  { id: 'selo-retencao', name: 'Retenção', icon: '🔁' },
  { id: 'selo-consciencia', name: 'Consciência', icon: '👁️' },
  { id: 'selo-metodo', name: 'Método Elevare', icon: '🧠' },
  { id: 'selo-base-tecnica', name: 'Base Técnica', icon: '🔬' },
  { id: 'selo-anti-promessa', name: 'Anti-Promessa', icon: '🚫' },
  { id: 'selo-energia-alta', name: 'Alto Impacto', icon: '⚡' },
  { id: 'selo-energia-leve', name: 'Conteúdo Leve', icon: '🌊' },
  { id: 'selo-energia-acolhimento', name: 'Acolhedor', icon: '🫂' }
];

const STRATEGIC_OPTIONS = {
  MATURITY: ['Construção', 'Crescimento', 'Estruturada'],
  STRUCTURE: ['Individual', 'Pequena Equipe', 'Equipe Grande'],
  OBJECTIVES: ['Lotar Agenda', 'Aumentar Ticket', 'Construir Autoridade', 'Organizar Processos', 'Escalar Vendas'],
  TERRITORIES: ['Território de Problemas', 'Território de Desejos', 'Território de Técnica', 'Território de Objeções', 'Território de Bastidores'],
  COMMERCIAL_FUNCTIONS: ['Atrair Novos', 'Converter Leads', 'Justificar Valor', 'Reativar Clientes', 'Fortalecer Marca']
};

const MONTH_THEMES = [
  { name: "Janeiro", theme: "Recomeço / Promessas", emotion: "esperança + culpa leve", ctaLevel: "Nenhum ou Leve", contexts: ["Identificação Radical", "O Que Ninguém Te Contou"] },
  { name: "Fevereiro", theme: "Autoimagem / Comparação", emotion: "comparação social silenciosa", ctaLevel: "Moderado", contexts: ["Erro Silencioso", "Tratamento vs Protocolo"] },
  { name: "Março", theme: "Consciência / Decisão Racional", emotion: "lucidez", ctaLevel: "Moderado", contexts: ["Comparação Honestidade", "Quando NÃO Indicar"] },
  { name: "Abril", theme: "Autoridade Técnica", emotion: "confiança racional", ctaLevel: "Leve", contexts: ["Fisiologia Simples", "Rotina de Estudo"] },
  { name: "Maio", theme: "Autocuidado Emocional", emotion: "sensibilidade / acolhimento", ctaLevel: "Leve", contexts: ["Bastidor Real", "História de Paciente"] },
  { name: "Junho", theme: "Corpo em Evidência (Inverno)", emotion: "desconforto + desejo", ctaLevel: "Moderado", contexts: ["Antes/Depois Explicado", "Caso Real"] },
  { name: "Julho", theme: "Baixa Energia / Inverno", emotion: "apatia", ctaLevel: "Nenhum ou Leve", contexts: ["Erros Comuns", "Mitos do Nicho"] },
  { name: "Agosto", theme: "Retomada", emotion: "foco e reorganização", ctaLevel: "Moderado", contexts: ["Tratamento vs Protocolo", "O Que Analiso"] },
  { name: "Setembro", theme: "Preparação", emotion: "antecipação", ctaLevel: "Moderado", contexts: ["Caso Real", "Antes/Depois"] },
  { name: "Outubro", theme: "Desejo / Identidade", emotion: "projeção de imagem", ctaLevel: "Moderado", contexts: ["Identificação Radical", "História de Paciente"] },
  { name: "Novembro", theme: "Decisão", emotion: "urgência consciente", ctaLevel: "Direto", contexts: ["Para Quem É", "Comparação Honestidade"] },
  { name: "Dezembro", theme: "Fechamento de Ciclo", emotion: "balanço emocional", ctaLevel: "Leve ou Nenhum", contexts: ["Bastidor Real", "A Vida Após o Tratamento"] }
];

const WEEKLY_TEMPLATES = [
  { week: 1, cards: [
    { label: "O Início da Jornada", type: Archetype.EDUCACIONAL, seals: ['selo-plantio', 'selo-consciencia'] },
    { label: "Autoridade Técnica", type: Archetype.AUTORIDADE, seals: ['selo-base-tecnica', 'selo-metodo'] },
    { label: "Bastidores do Consultório", type: Archetype.BASTIDORES, seals: ['selo-energia-acolhimento', 'selo-aquecer'] },
    { label: "Prova de Resultado", type: Archetype.PROVA_SOCIAL, seals: ['selo-metodo', 'selo-plantio'] },
    { label: "Oferta Estratégica", type: Archetype.VENDA, seals: ['selo-converter', 'selo-anti-promessa'] }
  ]},
  { week: 2, cards: [
    { label: "Quebra de Objeção", type: Archetype.EDUCACIONAL, seals: ['selo-consciencia', 'selo-base-tecnica'] },
    { label: "Estudo de Caso", type: Archetype.PROVA_SOCIAL, seals: ['selo-metodo', 'selo-energia-alta'] },
    { label: "Minha Filosofia", type: Archetype.AUTORIDADE, seals: ['selo-anti-promessa', 'selo-metodo'] },
    { label: "Rotina de Excelência", type: Archetype.BASTIDORES, seals: ['selo-energia-leve', 'selo-retencao'] },
    { label: "Chamada para Ação", type: Archetype.VENDA, seals: ['selo-converter', 'selo-energia-alta'] }
  ]},
  { week: 3, cards: [
    { label: "Educação Profunda", type: Archetype.EDUCACIONAL, seals: ['selo-base-tecnica', 'selo-plantio'] },
    { label: "Diferencial de Mercado", type: Archetype.AUTORIDADE, seals: ['selo-metodo', 'selo-consciencia'] },
    { label: "Conexão Real", type: Archetype.BASTIDORES, seals: ['selo-energia-acolhimento', 'selo-aquecer'] },
    { label: "Transformação Comprovada", type: Archetype.PROVA_SOCIAL, seals: ['selo-metodo', 'selo-retencao'] },
    { label: "Oportunidade Única", type: Archetype.VENDA, seals: ['selo-converter', 'selo-anti-promessa'] }
  ]},
  { week: 4, cards: [
    { label: "Visão Clínica", type: Archetype.AUTORIDADE, seals: ['selo-base-tecnica', 'selo-metodo'] },
    { label: "Mitos da Estética", type: Archetype.EDUCACIONAL, seals: ['selo-anti-promessa', 'selo-consciencia'] },
    { label: "Equipe e Processos", type: Archetype.BASTIDORES, seals: ['selo-energia-leve', 'selo-plantio'] },
    { label: "Depoimento de Impacto", type: Archetype.PROVA_SOCIAL, seals: ['selo-metodo', 'selo-energia-alta'] },
    { label: "Fechamento de Ciclo", type: Archetype.VENDA, seals: ['selo-converter', 'selo-retencao'] }
  ]}
];

const ARCHETYPE_COLOR: Record<string, string> = {
  [Archetype.VENDA]: "text-rose-500 bg-rose-50",
  [Archetype.EDUCACIONAL]: "text-emerald-500 bg-emerald-50",
  [Archetype.AUTORIDADE]: "text-indigo-500 bg-indigo-50",
  [Archetype.PROVA_SOCIAL]: "text-violet-500 bg-violet-50",
  [Archetype.BASTIDORES]: "text-amber-500 bg-amber-50"
};

// ============================================
// STATUS BADGE COMPONENT
// ============================================

const StatusBadge: React.FC<{ status: PostStatus }> = ({ status }) => {
  const styles = {
    [PostStatus.RASCUNHO]: "bg-slate-50 text-slate-400 border-slate-100",
    [PostStatus.PROCESSANDO]: "bg-indigo-50 text-indigo-500 border-indigo-100",
    [PostStatus.PRONTO]: "bg-emerald-50 text-emerald-500 border-emerald-100",
    [PostStatus.REVISAR]: "bg-rose-50 text-rose-500 border-rose-100"
  };

  const icons = {
    [PostStatus.RASCUNHO]: <Clock size={10} />,
    [PostStatus.PROCESSANDO]: <Loader2 size={10} className="animate-spin" />,
    [PostStatus.PRONTO]: <CheckCircle size={10} />,
    [PostStatus.REVISAR]: <AlertCircle size={10} />
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

// ============================================
// CALENDAR GENERATOR
// ============================================

const STAGE_MAP: Record<number, ContentStage> = {
  0: ContentStage.PLANTIO,     
  1: ContentStage.AQUECIMENTO, 
  2: ContentStage.AQUECIMENTO, 
  3: ContentStage.AQUECIMENTO, 
  4: ContentStage.CONVERSAO,   
  5: ContentStage.CONVERSAO,   
  6: ContentStage.RETENCAO     
};

const generateCalendar = (selection: StrategicSelection): Post[] => {
  const posts: Post[] = [];
  const startDate = new Date(2025, 0, 1);
  
  for (let i = 0; i < 365; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const monthIndex = currentDate.getMonth();
    const monthData = MONTH_THEMES[monthIndex];
    const dayOfMonth = currentDate.getDate();
    const weekOfMonth = Math.ceil(dayOfMonth / 7);
    const dayOfWeek = currentDate.getDay();
    
    const weekTemplate = WEEKLY_TEMPLATES[Math.min(weekOfMonth - 1, 3)];
    const cardIndex = Math.max(0, dayOfWeek - 1) % 5;
    const strategicCard = weekTemplate.cards[cardIndex];

    let tipo = PostType.FEED;
    if (dayOfWeek === 0) tipo = PostType.STORIES;
    else if (dayOfWeek === 2) tipo = PostType.REELS;
    else if (dayOfWeek === 4) tipo = PostType.CARROSSEL;

    const post: Post = {
      id: `L${(i + 1).toString().padStart(3, '0')}`,
      data: currentDate.toISOString().split('T')[0],
      mes: monthData.name,
      semana: weekOfMonth,
      tipo,
      arquetipo: strategicCard.type,
      stage: STAGE_MAP[dayOfWeek],
      storytellingModel: StorytellingModel.ESPELHO,
      dominantEmotion: monthData.emotion,
      invisibleEnemy: "O descaso com a rotina e o imediatismo.",
      uncomfortableTruth: "Aguardando Lucresia...",
      tema: monthData.theme,
      subtema: strategicCard.label,
      prompt_ai: "",
      feed_legend: "",
      story_1: "", story_2: "", story_3: "", story_4: "",
      carousel_slides: [],
      hashtags_list: "", ctas_list: "",
      status: PostStatus.RASCUNHO,
      autor: "Elevare",
      ai_raw_json: "",
      seals: strategicCard.seals,
      imageOrigin: selection.defaultImageOrigin
    };
    
    posts.push(post);
  }
  
  return posts;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Calendario365Pro() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentStep, setCurrentStep] = useState<'landing' | 'diagnostico' | 'curadoria'>('landing');
  const [activeTab, setActiveTab] = useState<'criativa' | 'editorial'>('criativa');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("Janeiro");
  const [modalTab, setModalTab] = useState<'feed' | 'stories' | 'carousel' | 'canais'>('feed');
  const [selection, setSelection] = useState<StrategicSelection>({
    maturity: "", structure: "", objective: "", axis: "", territory: "", commercialFunction: "", hemisphere: "Sul (Brasil)", defaultImageOrigin: ImageOrigin.PROPRIAS
  });

  useEffect(() => {
    const saved = localStorage.getItem('elevare_radar_v36');
    if (saved) {
      setPosts(JSON.parse(saved));
      setCurrentStep('curadoria');
    }
  }, []);

  useEffect(() => {
    if (posts.length > 0) localStorage.setItem('elevare_radar_v36', JSON.stringify(posts));
  }, [posts]);

  const handleGeneratePost = async (post: Post) => {
    const idx = posts.findIndex(p => p.id === post.id);
    const updated = [...posts];
    updated[idx].status = PostStatus.PROCESSANDO;
    setPosts(updated);
    
    // Simulação - em produção conectar à API
    setTimeout(() => {
      const finalPosts = [...posts];
      finalPosts[idx].status = PostStatus.PRONTO;
      finalPosts[idx].feed_legend = `✨ ${post.subtema}\n\nConteúdo estratégico gerado para ${post.mes}.\n\n#elevare #estetica #neurovendas`;
      finalPosts[idx].story_1 = "Você sabia que...";
      finalPosts[idx].story_2 = "O segredo está em...";
      finalPosts[idx].story_3 = "Por isso eu sempre...";
      finalPosts[idx].story_4 = "Quer saber mais? Me chama!";
      finalPosts[idx].uncomfortableTruth = "A verdade que ninguém conta sobre " + post.subtema.toLowerCase();
      setPosts(finalPosts);
      if (selectedPost?.id === post.id) setSelectedPost(finalPosts[idx]);
    }, 2000);
  };

  const filteredPosts = useMemo(() => posts.filter(p => p.mes === selectedMonth), [posts, selectedMonth]);
  const currentMonthTheme = useMemo(() => MONTH_THEMES.find(m => m.name === selectedMonth), [selectedMonth]);
  const months = MONTH_THEMES.map(m => m.name);

  return (
    <NeuroVendasLayout>
      <div className="min-h-screen bg-white text-slate-800">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* HEADER */}
        <header className="bg-white/90 border-b border-slate-100 px-8 py-5 flex items-center justify-between mb-8 rounded-2xl">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => setCurrentStep('landing')}>
            <div className="bg-indigo-600 p-2 rounded-xl shadow-indigo-100 shadow-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-extrabold tracking-tight uppercase">ELEVARE <span className="text-indigo-600">365 PRO</span></h1>
          </div>
          {currentStep === 'curadoria' && (
            <button onClick={() => setCurrentStep('diagnostico')} className="px-5 py-2 bg-slate-50 text-slate-600 rounded-full border border-slate-200 hover:bg-white transition-all text-[10px] font-bold uppercase tracking-wider">
              RECALIBRAR SETUP
            </button>
          )}
        </header>

        <main className="max-w-7xl mx-auto">
          {/* LANDING PAGE */}
          {currentStep === 'landing' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-16 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="space-y-8 max-w-4xl">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                  <ShieldAlert size={12}/> Onde estratégia encontra previsibilidade
                </div>
                
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] uppercase">
                  Seu ano editorial. <br/>
                  <span className="text-indigo-600">Decidido antes do mercado.</span>
                </h2>

                <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed">
                  Conteúdo, campanhas e ofertas orquestradas pelo <span className="text-slate-900 font-bold italic">timing emocional</span> do seu público — mês a mês, com visão estratégica.
                </p>

                <div className="pt-6 text-slate-400 text-sm font-medium tracking-tight">
                  <p>O Elevare 365 PRO transforma sazonalidades em um plano anual inteligente.</p>
                  <p className="opacity-60 italic mt-1">Desenvolvido para profissionais que não improvisam presença digital.</p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button onClick={() => setCurrentStep('diagnostico')} className="group bg-indigo-600 text-white px-12 py-7 rounded-full font-black text-2xl shadow-2xl shadow-indigo-200 hover:bg-slate-900 transition-all flex items-center gap-4">
                  VISUALIZAR MEU ANO ESTRATÉGICO <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                </button>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ative seu pulso editorial de luxo agora</span>
              </div>
            </div>
          )}

          {/* DIAGNOSTICO */}
          {currentStep === 'diagnostico' && (
            <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Centro de Decisão</h2>
                <p className="text-slate-400 font-medium">Sincronizando sua expertise ao Radar Estratégico.</p>
              </div>
              
              <div className="bg-slate-50/50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white text-indigo-600 rounded-2xl border border-slate-100 shadow-sm"><ImageIcon size={20}/></div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Origem das Imagens</h3>
                    <p className="text-xs text-slate-400 font-medium">Como você pretende compor seu visual este ano?</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: ImageOrigin.PROPRIAS, label: "Minhas Fotos", icon: <Camera size={18}/>, desc: "IA adapta o texto ao seu material." },
                    { id: ImageOrigin.CANVA, label: "Galeria Canva", icon: <Layers size={18}/>, desc: "Análise de coerência estratégica." },
                    { id: ImageOrigin.IA, label: "IA Elevare", icon: <Palette size={18}/>, desc: "Geração premium anti-genérica." }
                  ].map((opt) => (
                    <button 
                      key={opt.id}
                      onClick={() => setSelection({...selection, defaultImageOrigin: opt.id})}
                      className={`flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left ${selection.defaultImageOrigin === opt.id ? 'border-indigo-600 bg-white shadow-lg' : 'border-white bg-white/50 hover:border-slate-200'}`}
                    >
                      <div className={`p-2.5 rounded-xl mb-4 ${selection.defaultImageOrigin === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {opt.icon}
                      </div>
                      <span className="font-bold text-slate-800 text-xs uppercase mb-1 tracking-wider">{opt.label}</span>
                      <p className="text-[10px] font-medium text-slate-400 leading-tight">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: "Maturidade", key: "maturity", options: STRATEGIC_OPTIONS.MATURITY, icon: <TrendingUp size={16}/> },
                  { label: "Objetivo", key: "objective", options: STRATEGIC_OPTIONS.OBJECTIVES, icon: <Target size={16}/> },
                  { label: "Território", key: "territory", options: STRATEGIC_OPTIONS.TERRITORIES, icon: <Layout size={16}/> },
                  { label: "Função", key: "commercialFunction", options: STRATEGIC_OPTIONS.COMMERCIAL_FUNCTIONS, icon: <Zap size={16}/> },
                  { label: "Estrutura", key: "structure", options: STRATEGIC_OPTIONS.STRUCTURE, icon: <BarChart3 size={16}/> },
                  { label: "Hemisfério", key: "hemisphere", options: ["Sul (Brasil)", "Norte (Europa/EUA)"], icon: <HeartPulse size={16}/> }
                ].map((field) => (
                  <div key={field.key} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-50 text-indigo-600 rounded-lg">{field.icon}</div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{field.label}</label>
                    </div>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-semibold text-slate-700 outline-none text-sm"
                      value={(selection as any)[field.key]}
                      onChange={(e) => setSelection({...selection, [field.key]: e.target.value})}
                    >
                      <option value="">Selecione...</option>
                      {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => { 
                  const generated = generateCalendar(selection);
                  setPosts(generated); 
                  setCurrentStep('curadoria'); 
                }} 
                className="w-full bg-slate-900 text-white px-10 py-6 rounded-3xl font-bold text-lg hover:bg-indigo-600 transition-all shadow-xl"
              >
                ATIVAR PULSO ESTRATÉGICO
              </button>
            </div>
          )}

          {/* CURADORIA */}
          {currentStep === 'curadoria' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                <div className="flex bg-slate-50 p-1.5 rounded-full border border-slate-100 w-fit">
                  <button 
                    onClick={() => setActiveTab('criativa')} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-[10px] font-bold uppercase tracking-wider ${activeTab === 'criativa' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                  >
                    <Grid size={14} /> Visão Criativa
                  </button>
                  <button 
                    onClick={() => setActiveTab('editorial')} 
                    className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all text-[10px] font-bold uppercase tracking-wider ${activeTab === 'editorial' ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400'}`}
                  >
                    <Table size={14} /> Conteúdos
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-2">
                  {months.map(m => (
                    <button key={m} onClick={() => setSelectedMonth(m)} className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${selectedMonth === m ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200'}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pulso Editorial do Mês */}
              <div className="bg-indigo-50/20 p-8 rounded-[2rem] border border-indigo-50 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div className="bg-white p-7 rounded-3xl border border-indigo-50 shrink-0 shadow-sm">
                  <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400 mb-1">Pulso Editorial {selectedMonth}</h3>
                  <p className="text-2xl font-black text-indigo-900 tracking-tight">{currentMonthTheme?.theme}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 flex-1">
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estado Dominante</h4>
                    <p className="font-semibold text-slate-700 text-sm leading-tight">{currentMonthTheme?.emotion}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estratégia Ideal</h4>
                    <p className="font-semibold text-slate-700 text-sm leading-tight">{currentMonthTheme?.contexts?.slice(0, 2).join(", ")}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Governança CTA</h4>
                    <div className="inline-block px-3 py-1 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[9px] font-bold uppercase">
                      {currentMonthTheme?.ctaLevel}
                    </div>
                  </div>
                </div>
              </div>

              {/* TABELA EDITORIAL */}
              {activeTab === 'editorial' ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                        <th className="px-8 py-6">ID</th>
                        <th className="px-8 py-6">Data</th>
                        <th className="px-8 py-6">Mês</th>
                        <th className="px-8 py-6">Estratégia</th>
                        <th className="px-8 py-6">Visual</th>
                        <th className="px-8 py-6 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPosts.slice(0, 20).map(post => (
                        <tr key={post.id} className="hover:bg-slate-50/50 group transition-colors">
                          <td className="px-8 py-6 font-bold text-slate-400 text-xs italic">#{post.id}</td>
                          <td className="px-8 py-6 font-bold text-slate-800 text-xs">{post.data.split('-').reverse().slice(0,2).join('/')}</td>
                          <td className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{post.mes}</td>
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-700 leading-tight">{post.subtema}</span>
                              <span className={`text-[8px] font-bold uppercase w-fit mt-1 tracking-wider px-2 py-0.5 rounded ${ARCHETYPE_COLOR[post.arquetipo]}`}>{post.arquetipo}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              {post.imageOrigin === ImageOrigin.IA ? <Palette size={12} className="text-indigo-600"/> : <Camera size={12} className="text-slate-300"/>}
                              <span className="text-[10px] font-semibold text-slate-500">{post.imageOrigin?.split(' ').pop()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => handleGeneratePost(post)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Zap size={14}/></button>
                              <button onClick={() => setSelectedPost(post)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100"><ChevronRight size={14}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* VISÃO CRIATIVA - CARDS */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {filteredPosts.slice(0, 16).map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
                      <div onClick={() => setSelectedPost(post)} className="cursor-pointer space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-300 tracking-wider">#{post.id}</span>
                          <div className="flex gap-1 opacity-40 group-hover:opacity-100 transition-all">
                            {post.seals.slice(0, 2).map(s => <span key={s} className="text-sm">{ELEVARE_SEALS.find(sl => sl.id === s)?.icon}</span>)}
                          </div>
                        </div>
                        <h4 className="font-bold text-slate-800 text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">{post.subtema}</h4>
                        
                        {post.generated_image_url ? (
                          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-inner group-hover:scale-[1.01] transition-transform">
                            <img src={post.generated_image_url} alt="Ref" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="aspect-[4/5] bg-slate-50 rounded-2xl flex items-center justify-center border border-dashed border-slate-200">
                            <ImageIcon size={24} className="text-slate-200" />
                          </div>
                        )}
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-50 flex justify-between items-center">
                        <StatusBadge status={post.status}/>
                        <button onClick={(e) => { e.stopPropagation(); handleGeneratePost(post); }} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all">
                          <Zap size={16}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* MODAL DE DETALHES */}
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-6xl h-full md:h-[92vh] bg-white md:rounded-[3rem] md:shadow-2xl md:border md:border-slate-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-6">
                  <button onClick={() => setSelectedPost(null)} className="p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-all"><ChevronLeft size={24}/></button>
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-none mb-1">{selectedPost.subtema}</h2>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedPost.id} • {selectedPost.imageOrigin} • {selectedPost.mes}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleGeneratePost(selectedPost)} 
                    className="px-6 py-3.5 bg-indigo-600 text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-slate-800 transition-all"
                  >
                    <RefreshCcw size={16} className={selectedPost.status === PostStatus.PROCESSANDO ? 'animate-spin' : ''} /> 
                    {selectedPost.status === PostStatus.PROCESSANDO ? 'RECALIBRANDO...' : 'ATIVAR LUCRESIA'}
                  </button>
                  <button onClick={() => setSelectedPost(null)} className="p-3 text-slate-300 hover:text-slate-800 transition-colors"><X size={24}/></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                <div className="flex gap-10 border-b border-slate-50">
                  {['feed', 'stories', 'carousel', 'canais'].map((tab) => (
                    <button 
                      key={tab} 
                      onClick={() => setModalTab(tab as any)} 
                      className={`pb-5 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${modalTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                      {tab === 'feed' ? 'Instagram' : tab === 'stories' ? 'Stories' : tab === 'carousel' ? 'Slides' : 'Venda Direta'}
                    </button>
                  ))}
                </div>

                <div className="animate-in fade-in duration-500">
                  {modalTab === 'feed' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div className="bg-indigo-50/30 p-10 rounded-[2.5rem] border border-indigo-100 relative group overflow-hidden">
                          <h4 className="text-[10px] font-bold text-indigo-400 uppercase mb-4 tracking-widest">Ângulo Límbico ({selectedPost.mes})</h4>
                          <p className="text-2xl font-black italic text-indigo-900 leading-tight">"{selectedPost.uncomfortableTruth || 'Aguardando recalibração...'}"</p>
                        </div>
                        <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 relative group">
                          <button onClick={() => { navigator.clipboard.writeText(selectedPost.feed_legend || ""); }} className="absolute top-6 right-6 p-3 bg-slate-50 text-slate-300 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Copy size={16}/></button>
                          <p className="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">{selectedPost.feed_legend || 'A Lucresia está orquestrando sua narrativa estratégica baseada no Radar Estratégico.'}</p>
                          <div className="mt-8 flex flex-wrap gap-1.5">
                            {selectedPost.hashtags_list.split(' ').map(tag => tag && (
                              <span key={tag} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><ImageIcon size={14}/> Direção Visual Elevare™</h4>
                        <div className="w-full aspect-[4/5] bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-4 text-center p-10">
                          <ImageIcon size={48} className="opacity-20" />
                          <p className="font-bold text-xs uppercase tracking-widest opacity-40">Aguardando IA...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {modalTab === 'canais' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-emerald-50/40 p-10 rounded-[2.5rem] border border-emerald-50 flex flex-col justify-between">
                        <div>
                          <h4 className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase mb-6 tracking-widest"><Send size={16}/> WhatsApp</h4>
                          <p className="text-base font-bold text-emerald-900 leading-snug">{selectedPost.whatsapp_copy || 'Script de vendas será gerado...'}</p>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(selectedPost.whatsapp_copy || ""); }} className="mt-8 bg-white text-emerald-600 px-5 py-2.5 rounded-full font-bold text-[9px] uppercase border border-emerald-100 shadow-sm self-start hover:bg-emerald-600 hover:text-white transition-all">Copiar Script</button>
                      </div>
                      
                      <div className="bg-blue-50/40 p-10 rounded-[2.5rem] border border-blue-50">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase mb-6 tracking-widest"><Mail size={16}/> Newsletter</h4>
                        <div className="space-y-5">
                          <div>
                            <span className="text-[8px] font-bold text-blue-400 uppercase block mb-1">Assunto</span>
                            <p className="font-bold text-blue-900 text-sm">{selectedPost.email_subject || '...'}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-blue-400 uppercase block mb-1">Conteúdo</span>
                            <p className="text-blue-900 whitespace-pre-wrap text-xs leading-relaxed opacity-80">{selectedPost.email_body || '...'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-rose-50/40 p-10 rounded-[2.5rem] border border-rose-50">
                        <h4 className="flex items-center gap-2 text-[10px] font-bold text-rose-600 uppercase mb-6 tracking-widest"><Video size={16}/> Script Reels</h4>
                        <p className="text-rose-900 whitespace-pre-wrap font-mono text-[10px] leading-relaxed bg-white/60 p-6 rounded-2xl">{selectedPost.video_script || '...'}</p>
                      </div>
                    </div>
                  )}

                  {modalTab === 'stories' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[selectedPost.story_1, selectedPost.story_2, selectedPost.story_3, selectedPost.story_4].map((s, i) => (
                        <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Story 0{i+1}</span>
                          <p className="text-base font-bold mt-4 italic leading-snug text-slate-800">"{s || '...'}"</p>
                          <div className="mt-6 w-8 h-1 bg-slate-200 group-hover:w-full group-hover:bg-indigo-600 transition-all duration-700"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {modalTab === 'carousel' && (
                    <div className="max-w-2xl space-y-6">
                      {(selectedPost.carousel_slides.length > 0 ? selectedPost.carousel_slides : ['Slide 1...', 'Slide 2...', 'Slide 3...', 'Slide 4...', 'Slide 5...']).map((slide, i) => (
                        <div key={i} className="flex gap-6 items-start group">
                          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black shrink-0 text-xl border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{i+1}</div>
                          <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex-1 hover:border-indigo-100 transition-all">
                            <p className="text-lg font-bold text-slate-700 leading-tight">{slide}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </NeuroVendasLayout>
  );
}
