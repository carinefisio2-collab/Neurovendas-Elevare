import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Building2,
  Palette,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Target,
  Crown,
  MessageSquare,
  Award,
  Loader2,
  X,
  Save,
  ArrowRight,
  Quote,
  Eye,
} from "lucide-react";

// ========== TIPOS ==========
interface BrandIdentity {
  brand_name: string;
  segment: string;
  main_specialty: string;
  target_audience: string;
  brand_archetype: string;
  positioning: string;
  differentiator: string;
  brand_promise: string;
  tone_of_voice: string;
  forbidden_words: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  visual_style: string;
  instagram_handle: string;
  bio_text: string;
}

// ========== OPÇÕES ==========
const SEGMENTS = [
  { id: "estetica_facial", label: "Estética Facial", icon: "✨", desc: "Harmonização, skincare, rejuvenescimento" },
  { id: "estetica_corporal", label: "Estética Corporal", icon: "💫", desc: "Modelagem, tratamentos corporais" },
  { id: "harmonizacao", label: "Harmonização Facial", icon: "💎", desc: "Procedimentos injetáveis, contorno" },
  { id: "skincare", label: "Skincare & Dermatologia", icon: "🌸", desc: "Tratamentos de pele, protocolos" },
  { id: "spa_wellness", label: "SPA & Bem-estar", icon: "🧘", desc: "Relaxamento, terapias holísticas" },
  { id: "clinica_completa", label: "Clínica Completa", icon: "🏛️", desc: "Full service, múltiplas especialidades" },
];

const ARCHETYPES = [
  { id: "sabio", label: "O Sábio", desc: "Autoridade técnica, educação profunda, referência científica", icon: "🎓", color: "#4B0082" },
  { id: "mago", label: "O Mago", desc: "Transformação, resultados surpreendentes, antes e depois", icon: "✨", color: "#6B21A8" },
  { id: "cuidador", label: "O Cuidador", desc: "Acolhimento genuíno, cuidado maternal, confiança", icon: "💝", color: "#EC4899" },
  { id: "criador", label: "O Criador", desc: "Inovação, exclusividade, arte na estética", icon: "🎨", color: "#8B5CF6" },
  { id: "heroi", label: "O Herói", desc: "Superação, empoderamento, coragem para mudar", icon: "⚡", color: "#F59E0B" },
  { id: "amante", label: "O Amante", desc: "Beleza, sensualidade, prazer estético", icon: "💋", color: "#EF4444" },
];

const POSITIONING_OPTIONS = [
  { id: "premium", label: "Premium", desc: "Alto valor percebido, exclusividade, experiência diferenciada", icon: "👑" },
  { id: "especialista", label: "Especialista", desc: "Referência absoluta em um procedimento específico", icon: "🎯" },
  { id: "humanizado", label: "Humanizado", desc: "Acolhimento, relação próxima, jornada personalizada", icon: "💜" },
  { id: "resultado", label: "Resultado", desc: "Foco em transformação visível, comprovada e mensurável", icon: "📈" },
  { id: "inovador", label: "Inovador", desc: "Tecnologia de ponta, novidades antes do mercado", icon: "🚀" },
];

const TONE_OPTIONS = [
  { id: "profissional_acolhedor", label: "Profissional e Acolhedor", desc: "Equilibra autoridade técnica com empatia genuína" },
  { id: "sofisticado_elegante", label: "Sofisticado e Elegante", desc: "Premium, refinado, luxo silencioso" },
  { id: "didatico_educativo", label: "Didático e Educativo", desc: "Explica, ensina, orienta com clareza" },
  { id: "inspirador_motivacional", label: "Inspirador e Motivacional", desc: "Empodera, transforma, motiva a ação" },
  { id: "intimo_pessoal", label: "Íntimo e Pessoal", desc: "Conversa próxima, conexão autêntica" },
];

const VISUAL_STYLES = [
  { id: "clean_minimal", label: "Clean & Minimal", colors: ["#FFFFFF", "#1A1A1A", "#F5F5F5"], desc: "Sofisticação no silêncio" },
  { id: "luxo_dourado", label: "Luxo & Dourado", colors: ["#1A1A1A", "#D4AF37", "#F5F5F5"], desc: "Opulência discreta" },
  { id: "rosa_feminino", label: "Rosa & Feminino", colors: ["#FFE4E6", "#EC4899", "#FFFFFF"], desc: "Delicadeza poderosa" },
  { id: "lavanda_premium", label: "Lavanda Premium", colors: ["#F0E6D2", "#4B0082", "#C5B4F0"], desc: "Elegância atemporal" },
  { id: "natureza_organico", label: "Natureza & Orgânico", colors: ["#F0FDF4", "#10B981", "#064E3B"], desc: "Bem-estar natural" },
  { id: "moderno_bold", label: "Moderno & Bold", colors: ["#18181B", "#7C3AED", "#F4F4F5"], desc: "Impacto contemporâneo" },
];

// ========== STEPS ==========
const STEPS = [
  { id: 1, title: "Identidade", subtitle: "Quem você é", icon: Building2 },
  { id: 2, title: "Posicionamento", subtitle: "O que te diferencia", icon: Target },
  { id: 3, title: "Comunicação", subtitle: "Como você fala", icon: MessageSquare },
  { id: 4, title: "Visual", subtitle: "Como você aparece", icon: Palette },
  { id: 5, title: "Manifesto", subtitle: "Sua identidade completa", icon: Crown },
];

export default function ConstrutorMarca() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const diagnosticoData = location.state?.diagnostico;
  
  const [identity, setIdentity] = useState<BrandIdentity>({
    brand_name: "",
    segment: "",
    main_specialty: "",
    target_audience: "",
    brand_archetype: "",
    positioning: "",
    differentiator: "",
    brand_promise: "",
    tone_of_voice: "",
    forbidden_words: [],
    colors: {
      primary: "#4B0082",
      secondary: "#F0E6D2",
      accent: "#C5B4F0",
    },
    visual_style: "lavanda_premium",
    instagram_handle: "",
    bio_text: "",
  });

  const [forbiddenWord, setForbiddenWord] = useState("");

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const response = await api.get("/api/brand-identity");
      if (response.data.identity) {
        const existing = response.data.identity;
        setIdentity(prev => ({
          ...prev,
          brand_name: existing.brand_name || prev.brand_name,
          segment: existing.segment || prev.segment,
          main_specialty: existing.main_specialty || prev.main_specialty,
          target_audience: existing.target_audience || prev.target_audience,
          brand_archetype: existing.brand_archetype || prev.brand_archetype,
          positioning: existing.positioning || prev.positioning,
          differentiator: existing.differentiator || prev.differentiator,
          brand_promise: existing.brand_promise || prev.brand_promise,
          tone_of_voice: existing.tone_of_voice || prev.tone_of_voice,
          forbidden_words: existing.forbidden_words || prev.forbidden_words,
          colors: existing.colors || prev.colors,
          visual_style: existing.visual_style || prev.visual_style,
          instagram_handle: existing.instagram_handle || prev.instagram_handle,
          bio_text: existing.bio_text || prev.bio_text,
        }));
        
        if (existing.setup_completed) {
          setCurrentStep(5);
        }
      }
    } catch (error) {
      console.log("No existing identity");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (complete = false) => {
    setSaving(true);
    try {
      await api.post("/api/brand-identity", {
        ...identity,
        setup_completed: complete,
      });
      
      toast({
        title: complete ? "Identidade de Marca Criada" : "Progresso Salvo",
        description: complete 
          ? "Sua identidade está pronta para ser usada em todas as ferramentas."
          : "Continue de onde parou a qualquer momento.",
      });
      
      if (complete) {
        setCurrentStep(5);
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addForbiddenWord = () => {
    if (forbiddenWord.trim() && !identity.forbidden_words.includes(forbiddenWord.trim())) {
      setIdentity(prev => ({
        ...prev,
        forbidden_words: [...prev.forbidden_words, forbiddenWord.trim()],
      }));
      setForbiddenWord("");
    }
  };

  const removeForbiddenWord = (word: string) => {
    setIdentity(prev => ({
      ...prev,
      forbidden_words: prev.forbidden_words.filter(w => w !== word),
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return identity.brand_name && identity.segment && identity.target_audience;
      case 2:
        return identity.brand_archetype && identity.positioning;
      case 3:
        return identity.tone_of_voice;
      case 4:
        return identity.visual_style;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B21A8] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-[#6b7280] font-medium">Carregando Construtor de Marca...</p>
        </div>
      </div>
    );
  }

  // ========== STEP 1: IDENTIDADE ==========
  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Header da Etapa */}
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-[#4B0082]/10 text-[#4B0082] text-xs font-semibold rounded-full mb-4 tracking-wide">
          ETAPA 1 DE 4
        </span>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#1a1a1a] mb-3">
          Identidade da Marca
        </h2>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          Os alicerces que definem quem você é no mercado
        </p>
      </div>

      {/* Nome e Instagram */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="group">
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            Nome da Marca / Clínica <span className="text-[#4B0082]">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Clínica Dra. Maria Silva"
            value={identity.brand_name}
            onChange={(e) => setIdentity(prev => ({ ...prev, brand_name: e.target.value }))}
            className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300"
          />
        </div>
        <div className="group">
          <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
            @ do Instagram
          </label>
          <input
            type="text"
            placeholder="@suaclinica"
            value={identity.instagram_handle}
            onChange={(e) => setIdentity(prev => ({ ...prev, instagram_handle: e.target.value }))}
            className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300"
          />
        </div>
      </div>

      {/* Segmento */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-4">
          Segmento Principal <span className="text-[#4B0082]">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SEGMENTS.map((seg) => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setIdentity(prev => ({ ...prev, segment: seg.id }))}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                identity.segment === seg.id
                  ? "border-[#4B0082] bg-[#4B0082]/5 shadow-lg shadow-[#4B0082]/10"
                  : "border-[#e5e7eb] bg-white hover:border-[#C5B4F0] hover:shadow-md"
              }`}
            >
              <span className="text-3xl block mb-3">{seg.icon}</span>
              <span className="font-semibold text-[#1a1a1a] block mb-1">{seg.label}</span>
              <span className="text-xs text-[#6b7280]">{seg.desc}</span>
              {identity.segment === seg.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-[#4B0082]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Especialidade */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Especialidade Principal
        </label>
        <input
          type="text"
          placeholder="Ex: Harmonização Facial, Bioestimuladores, Skincare..."
          value={identity.main_specialty}
          onChange={(e) => setIdentity(prev => ({ ...prev, main_specialty: e.target.value }))}
          className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300"
        />
      </div>

      {/* Público-Alvo */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Público-Alvo Específico <span className="text-[#4B0082]">*</span>
        </label>
        <textarea
          placeholder="Descreva com detalhes: Mulheres de 35-50 anos, classe A/B, que buscam rejuvenescimento natural sem parecer 'feito'..."
          value={identity.target_audience}
          onChange={(e) => setIdentity(prev => ({ ...prev, target_audience: e.target.value }))}
          rows={4}
          className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300 resize-none"
        />
        <div className="mt-4 p-4 bg-gradient-to-r from-[#F0E6D2] to-[#FAF9F7] rounded-xl border border-[#e5e7eb]">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#4B0082] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#4a4a4a]">
              <span className="font-semibold text-[#4B0082]">Dica Elevare:</span> Quanto mais específico, melhor. 
              "Mulheres" é genérico. "Mulheres executivas 40+ que querem resultados discretos" é estratégico.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== STEP 2: POSICIONAMENTO ==========
  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-[#4B0082]/10 text-[#4B0082] text-xs font-semibold rounded-full mb-4 tracking-wide">
          ETAPA 2 DE 4
        </span>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#1a1a1a] mb-3">
          Posicionamento Estratégico
        </h2>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          O que faz você única e memorável no mercado
        </p>
      </div>

      {/* Arquétipo */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Arquétipo da Marca <span className="text-[#4B0082]">*</span>
        </label>
        <p className="text-[#6b7280] text-sm mb-4">
          O arquétipo define a personalidade profunda da sua marca. Como você quer ser percebida?
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHETYPES.map((arch) => (
            <button
              key={arch.id}
              type="button"
              onClick={() => setIdentity(prev => ({ ...prev, brand_archetype: arch.id }))}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                identity.brand_archetype === arch.id
                  ? "border-[#4B0082] bg-gradient-to-br from-[#4B0082]/5 to-[#C5B4F0]/10 shadow-lg"
                  : "border-[#e5e7eb] bg-white hover:border-[#C5B4F0] hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{arch.icon}</span>
                <span className="font-semibold text-[#1a1a1a]">{arch.label}</span>
              </div>
              <p className="text-sm text-[#6b7280] leading-relaxed">{arch.desc}</p>
              {identity.brand_archetype === arch.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="w-5 h-5 text-[#4B0082]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Posicionamento */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-4">
          Posicionamento de Mercado <span className="text-[#4B0082]">*</span>
        </label>
        <div className="space-y-3">
          {POSITIONING_OPTIONS.map((pos) => (
            <button
              key={pos.id}
              type="button"
              onClick={() => setIdentity(prev => ({ ...prev, positioning: pos.id }))}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                identity.positioning === pos.id
                  ? "border-[#4B0082] bg-[#4B0082]/5 shadow-lg shadow-[#4B0082]/10"
                  : "border-[#e5e7eb] bg-white hover:border-[#C5B4F0] hover:shadow-md"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                identity.positioning === pos.id ? "bg-[#4B0082] text-white" : "bg-[#F0E6D2]"
              }`}>
                {identity.positioning === pos.id ? <CheckCircle className="w-6 h-6" /> : pos.icon}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-[#1a1a1a] block">{pos.label}</span>
                <span className="text-sm text-[#6b7280]">{pos.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Diferencial */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Seu Diferencial Único
        </label>
        <textarea
          placeholder="O que você faz diferente de todos os outros? Por que alguém deve escolher VOCÊ?"
          value={identity.differentiator}
          onChange={(e) => setIdentity(prev => ({ ...prev, differentiator: e.target.value }))}
          rows={3}
          className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300 resize-none"
        />
      </div>

      {/* Promessa */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Promessa da Marca
        </label>
        <input
          type="text"
          placeholder="Ex: Resultados naturais que realçam sua beleza única, sem exageros"
          value={identity.brand_promise}
          onChange={(e) => setIdentity(prev => ({ ...prev, brand_promise: e.target.value }))}
          className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300"
        />
        <div className="mt-4 p-4 bg-gradient-to-r from-[#F0E6D2] to-[#FAF9F7] rounded-xl border border-[#e5e7eb]">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-[#4B0082] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#4a4a4a]">
              <span className="font-semibold text-[#4B0082]">Promessa forte:</span> É o que sua cliente vai contar para as amigas. 
              Deve ser específica, desejável e diferente da concorrência.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // ========== STEP 3: COMUNICAÇÃO ==========
  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-[#4B0082]/10 text-[#4B0082] text-xs font-semibold rounded-full mb-4 tracking-wide">
          ETAPA 3 DE 4
        </span>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#1a1a1a] mb-3">
          Tom de Voz & Comunicação
        </h2>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          A personalidade que sua marca expressa em cada palavra
        </p>
      </div>

      {/* Tom de Voz */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-4">
          Tom de Voz Principal <span className="text-[#4B0082]">*</span>
        </label>
        <div className="space-y-3">
          {TONE_OPTIONS.map((tone) => (
            <button
              key={tone.id}
              type="button"
              onClick={() => setIdentity(prev => ({ ...prev, tone_of_voice: tone.id }))}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all duration-300 text-left ${
                identity.tone_of_voice === tone.id
                  ? "border-[#4B0082] bg-[#4B0082]/5 shadow-lg shadow-[#4B0082]/10"
                  : "border-[#e5e7eb] bg-white hover:border-[#C5B4F0] hover:shadow-md"
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                identity.tone_of_voice === tone.id
                  ? "border-[#4B0082] bg-[#4B0082]"
                  : "border-[#d1d5db]"
              }`}>
                {identity.tone_of_voice === tone.id && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-[#1a1a1a] block">{tone.label}</span>
                <span className="text-sm text-[#6b7280]">{tone.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Palavras Proibidas */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Palavras e Termos Proibidos
        </label>
        <p className="text-[#6b7280] text-sm mb-4">
          O que sua marca NUNCA deve dizer? (Ex: "promoção", "baratinho", "milagre")
        </p>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Digite uma palavra proibida..."
            value={forbiddenWord}
            onChange={(e) => setForbiddenWord(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addForbiddenWord())}
            className="flex-1 px-4 py-3 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300"
          />
          <button
            type="button"
            onClick={addForbiddenWord}
            className="px-6 py-3 bg-[#4B0082] text-white font-semibold rounded-xl hover:bg-[#3a0066] transition-all duration-300"
          >
            Adicionar
          </button>
        </div>
        {identity.forbidden_words.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {identity.forbidden_words.map((word) => (
              <span
                key={word}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-medium"
              >
                <span>❌</span> {word}
                <button
                  type="button"
                  onClick={() => removeForbiddenWord(word)}
                  className="hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bio Modelo */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">
          Bio Modelo (opcional)
        </label>
        <textarea
          placeholder="Escreva como seria sua bio ideal ou deixe em branco para a IA criar baseada nas suas escolhas..."
          value={identity.bio_text}
          onChange={(e) => setIdentity(prev => ({ ...prev, bio_text: e.target.value }))}
          rows={4}
          className="w-full px-4 py-4 bg-white border-2 border-[#e5e7eb] rounded-xl text-[#1a1a1a] placeholder:text-[#9ca3af] focus:border-[#4B0082] focus:ring-0 outline-none transition-all duration-300 resize-none"
        />
      </div>
    </div>
  );

  // ========== STEP 4: VISUAL ==========
  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <span className="inline-block px-4 py-1.5 bg-[#4B0082]/10 text-[#4B0082] text-xs font-semibold rounded-full mb-4 tracking-wide">
          ETAPA 4 DE 4
        </span>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#1a1a1a] mb-3">
          Identidade Visual
        </h2>
        <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
          As cores e o estilo que traduzem sua essência
        </p>
      </div>

      {/* Estilo Visual */}
      <div>
        <label className="block text-sm font-semibold text-[#1a1a1a] mb-4">
          Estilo Visual <span className="text-[#4B0082]">*</span>
        </label>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                setIdentity(prev => ({
                  ...prev,
                  visual_style: style.id,
                  colors: {
                    primary: style.colors[1],
                    secondary: style.colors[0],
                    accent: style.colors[2],
                  },
                }));
              }}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                identity.visual_style === style.id
                  ? "border-[#4B0082] shadow-lg shadow-[#4B0082]/10"
                  : "border-[#e5e7eb] bg-white hover:border-[#C5B4F0] hover:shadow-md"
              }`}
            >
              <div className="flex justify-center gap-2 mb-4">
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: color, border: color === "#FFFFFF" ? "1px solid #e5e7eb" : "none" }}
                  />
                ))}
              </div>
              <span className="font-semibold text-[#1a1a1a] block mb-1">{style.label}</span>
              <span className="text-xs text-[#6b7280]">{style.desc}</span>
              {identity.visual_style === style.id && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="w-5 h-5 text-[#4B0082]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Personalizar Cores */}
      <div className="bg-white rounded-2xl border-2 border-[#e5e7eb] p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-5 h-5 text-[#4B0082]" />
          <span className="font-semibold text-[#1a1a1a]">Personalizar Cores</span>
        </div>
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-sm text-[#6b7280] mb-2">Cor Primária</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={identity.colors.primary}
                onChange={(e) => setIdentity(prev => ({
                  ...prev,
                  colors: { ...prev.colors, primary: e.target.value },
                }))}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#e5e7eb]"
              />
              <span className="text-sm font-mono text-[#6b7280]">{identity.colors.primary}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-2">Cor Secundária</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={identity.colors.secondary}
                onChange={(e) => setIdentity(prev => ({
                  ...prev,
                  colors: { ...prev.colors, secondary: e.target.value },
                }))}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#e5e7eb]"
              />
              <span className="text-sm font-mono text-[#6b7280]">{identity.colors.secondary}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-2">Cor de Destaque</p>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={identity.colors.accent}
                onChange={(e) => setIdentity(prev => ({
                  ...prev,
                  colors: { ...prev.colors, accent: e.target.value },
                }))}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#e5e7eb]"
              />
              <span className="text-sm font-mono text-[#6b7280]">{identity.colors.accent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div 
        className="rounded-2xl p-8 transition-all duration-500"
        style={{ 
          background: `linear-gradient(135deg, ${identity.colors.secondary}, ${identity.colors.accent}20)`,
          border: `2px solid ${identity.colors.primary}20`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-5 h-5" style={{ color: identity.colors.primary }} />
          <span className="font-semibold" style={{ color: identity.colors.primary }}>Preview da Identidade</span>
        </div>
        <p className="text-[#4a4a4a] mb-6">
          <span className="font-semibold">{identity.brand_name || "Sua Marca"}</span>
          {identity.main_specialty && <span> • {identity.main_specialty}</span>}
        </p>
        <button
          type="button"
          className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90"
          style={{ backgroundColor: identity.colors.primary }}
        >
          Agendar Avaliação
        </button>
      </div>
    </div>
  );

  // ========== STEP 5: MANIFESTO ==========
  const renderStep5 = () => {
    const archetype = ARCHETYPES.find(a => a.id === identity.brand_archetype);
    const positioning = POSITIONING_OPTIONS.find(p => p.id === identity.positioning);
    const tone = TONE_OPTIONS.find(t => t.id === identity.tone_of_voice);
    const segment = SEGMENTS.find(s => s.id === identity.segment);

    return (
      <div className="space-y-8">
        {/* Header Sucesso */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#1a1a1a] mb-3">
            Manifesto de Marca
          </h2>
          <p className="text-[#6b7280] text-lg max-w-xl mx-auto">
            Sua identidade está completa e pronta para ser usada em todas as ferramentas
          </p>
        </div>

        {/* Card Principal do Manifesto */}
        <div 
          className="rounded-3xl overflow-hidden shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${identity.colors.secondary}, white)`,
          }}
        >
          {/* Header do Card */}
          <div 
            className="px-8 py-6"
            style={{ backgroundColor: identity.colors.primary }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium mb-1">Identidade de Marca</p>
                <h3 className="text-white text-2xl font-['Playfair_Display']">
                  {identity.brand_name || "Sua Marca"}
                </h3>
              </div>
              <div className="text-4xl">{archetype?.icon || "✨"}</div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-8 space-y-6">
            {/* Grid de Informações */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Segmento</p>
                  <p className="text-[#1a1a1a] font-medium">{segment?.label || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Arquétipo</p>
                  <p className="text-[#1a1a1a] font-medium">{archetype?.label || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Posicionamento</p>
                  <p className="text-[#1a1a1a] font-medium">{positioning?.label || "—"}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Tom de Voz</p>
                  <p className="text-[#1a1a1a] font-medium">{tone?.label || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-1">Público-Alvo</p>
                  <p className="text-[#1a1a1a] font-medium text-sm">{identity.target_audience || "—"}</p>
                </div>
              </div>
            </div>

            {/* Promessa */}
            {identity.brand_promise && (
              <div className="pt-6 border-t border-[#e5e7eb]">
                <div className="flex items-start gap-3">
                  <Quote className="w-6 h-6 text-[#4B0082] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Promessa da Marca</p>
                    <p className="text-[#1a1a1a] text-lg font-['Playfair_Display'] italic">
                      "{identity.brand_promise}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Diferencial */}
            {identity.differentiator && (
              <div className="pt-6 border-t border-[#e5e7eb]">
                <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-2">Diferencial Único</p>
                <p className="text-[#4a4a4a]">{identity.differentiator}</p>
              </div>
            )}

            {/* Palavras Proibidas */}
            {identity.forbidden_words.length > 0 && (
              <div className="pt-6 border-t border-[#e5e7eb]">
                <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Palavras Proibidas</p>
                <div className="flex flex-wrap gap-2">
                  {identity.forbidden_words.map((word) => (
                    <span key={word} className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Paleta de Cores */}
            <div className="pt-6 border-t border-[#e5e7eb]">
              <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Paleta de Cores</p>
              <div className="flex gap-4">
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2"
                    style={{ backgroundColor: identity.colors.primary }}
                  />
                  <p className="text-xs text-[#6b7280]">Primária</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2 border border-[#e5e7eb]"
                    style={{ backgroundColor: identity.colors.secondary }}
                  />
                  <p className="text-xs text-[#6b7280]">Secundária</p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-lg mb-2"
                    style={{ backgroundColor: identity.colors.accent }}
                  />
                  <p className="text-xs text-[#6b7280]">Destaque</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="px-8 py-4 bg-[#4B0082] text-white font-semibold rounded-xl hover:bg-[#3a0066] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#4B0082]/20"
          >
            Ir para o Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className="px-8 py-4 bg-white text-[#4B0082] font-semibold rounded-xl border-2 border-[#4B0082] hover:bg-[#4B0082]/5 transition-all duration-300"
          >
            Editar Identidade
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7]">
      {/* Decoração de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-[#4B0082]/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-[#C5B4F0]/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B21A8] mb-6 shadow-xl shadow-[#4B0082]/30">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#1a1a1a] mb-3">
            Construtor de Marca
          </h1>
          <p className="text-[#6b7280] text-lg">
            Crie uma identidade que conecta e converte
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep < 5 && (
          <div className="flex justify-center mb-12">
            <div className="flex items-center gap-2 bg-white rounded-full p-2 shadow-lg">
              {STEPS.slice(0, 4).map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => isCompleted && setCurrentStep(step.id)}
                      disabled={!isCompleted && !isActive}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
                        isCompleted
                          ? "bg-emerald-500 text-white cursor-pointer"
                          : isActive
                          ? "bg-[#4B0082] text-white"
                          : "bg-transparent text-[#9ca3af]"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                    </button>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-1 ${isCompleted ? "bg-emerald-500" : "bg-[#e5e7eb]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Navigation */}
          {currentStep < 5 && (
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#e5e7eb]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="flex items-center gap-2 px-6 py-3 text-[#4B0082] font-semibold rounded-xl hover:bg-[#4B0082]/5 transition-all duration-300"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-3 text-[#6b7280] font-medium rounded-xl hover:bg-[#f3f4f6] transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      canProceed()
                        ? "bg-[#4B0082] text-white hover:bg-[#3a0066] shadow-lg shadow-[#4B0082]/20"
                        : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
                    }`}
                  >
                    Próximo
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving || !canProceed()}
                    className={`flex items-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all duration-300 ${
                      canProceed() && !saving
                        ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
                        : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
                    }`}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        Concluir
                        <CheckCircle className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dica contextual */}
        {currentStep < 5 && diagnosticoData && (
          <div className="mt-8 p-6 bg-gradient-to-r from-[#4B0082]/5 to-[#C5B4F0]/10 rounded-2xl border border-[#4B0082]/10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#4B0082] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1a1a1a] mb-1">Baseado no seu Diagnóstico</h4>
                <p className="text-[#6b7280] text-sm">
                  Suas respostas no Diagnóstico Premium indicam oportunidades de posicionamento. 
                  Use essas informações para construir uma identidade ainda mais estratégica.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
