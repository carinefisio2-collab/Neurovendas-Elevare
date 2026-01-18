import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextareaWithCounter } from "@/components/ui/textarea-with-counter";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { LabelWithTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { GenerateButton, MissingFieldsAlert, validateRequiredFields } from "@/components/ui/generate-button";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { AIProgress } from "@/components/ui/ai-progress";
import { useAutoSave, AutoSaveIndicator } from "@/components/ui/auto-save";
import { RecentItems, useRecentItems } from "@/components/ui/recent-items";
import { NextSteps } from "@/components/dashboard/NextSteps";
import { LimitReachedModal, useLimitModal } from "@/components/dashboard/LimitReachedModal";
import { api } from "@/lib/api";
import {
  Bot,
  Loader2,
  Sparkles,
  Copy,
  Check,
  FileText,
  Video,
  Image,
  MessageSquare,
  Target,
  Users,
  Megaphone,
  Flame,
  ThermometerSun,
  Snowflake,
  Zap,
  Crown,
  Heart,
  Eye,
  Palette,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CarouselSlide {
  slide: number;
  phase: string;
  headline: string;
  text: string;
  visual_suggestion: string;
}

interface CarouselResult {
  carousel_title: string;
  carousel_objective: string;
  target_audience: string;
  slides: CarouselSlide[];
  final_cta: string;
  caption: string;
  hashtags: string[];
  raw_response?: string;
}

interface ContentResult {
  titulo: string;
  tipo: string;
  slides?: Array<{
    numero: number;
    fase: string;
    texto: string;
    dica_visual: string;
  }>;
  legenda_completa: string;
  hashtags: string[];
  melhor_horario: string;
  cta: string;
  raw_response?: string;
}

interface CarouselOptions {
  objectives: { id: string; label: string; desc: string }[];
  audiences: { id: string; label: string; desc: string }[];
  tones: { id: string; label: string; desc: string }[];
  awareness_levels: { id: string; label: string; desc: string }[];
}

export default function RoboProdutor() {
  const [activeTab, setActiveTab] = useState("carousel");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [options, setOptions] = useState<CarouselOptions | null>(null);
  const [hasBrandIdentity, setHasBrandIdentity] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const { toast } = useToast();
  
  // Modal de limite atingido
  const { modalData, showLimitModal, closeLimitModal, LimitModal } = useLimitModal();

  // Carousel state
  const [carouselForm, setCarouselForm] = useState({
    niche: "",
    carousel_objective: "atracao",
    target_audience: "cliente_final",
    tone_of_voice: "profissional",
    offer_or_theme: "",
    audience_awareness: "frio",
    number_of_slides: 8,
  });
  const [carouselResult, setCarouselResult] = useState<CarouselResult | null>(null);

  // Content state
  const [tema, setTema] = useState("");
  const [tipo, setTipo] = useState("post");
  const [tom, setTom] = useState("profissional");
  const [contentResult, setContentResult] = useState<ContentResult | null>(null);

  // Auto-save para formulário do carrossel
  const { status: autoSaveStatus, loadSaved: loadSavedCarousel, clearSaved: clearSavedCarousel } = useAutoSave({
    key: "carousel_form",
    data: carouselForm,
    debounceMs: 1500,
    enabled: true,
  });

  // Recent items para conteúdos gerados
  const { items: recentCarousels, addItem: addRecentCarousel } = useRecentItems("carousels", 5);
  const { items: recentContents, addItem: addRecentContent } = useRecentItems("contents", 5);

  // Load saved form on mount
  useEffect(() => {
    const savedForm = loadSavedCarousel();
    if (savedForm) {
      setCarouselForm(savedForm);
      toast({
        title: "Rascunho restaurado",
        description: "Seu trabalho anterior foi recuperado.",
      });
    }
    loadOptions();
    checkBrandIdentity();
  }, []);

  const loadOptions = async () => {
    try {
      const response = await api.get("/api/ai/carousel-options");
      setOptions(response.data.options);
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const checkBrandIdentity = async () => {
    try {
      const response = await api.get("/api/brand-identity");
      setHasBrandIdentity(response.data.identity?.setup_completed || false);
      
      // Auto-fill niche from brand identity
      if (response.data.identity?.segment) {
        setCarouselForm(prev => ({ ...prev, niche: response.data.identity.segment }));
      }
    } catch (error) {
      console.error("Error checking brand identity:", error);
    }
  };

  const handleGenerateCarousel = async () => {
    if (!carouselForm.offer_or_theme.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o tema ou oferta do carrossel.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setCarouselResult(null);

    try {
      const response = await api.post("/api/ai/generate-carousel", carouselForm);
      setCarouselResult(response.data.carousel);
      
      // Adicionar aos itens recentes
      addRecentCarousel({
        title: response.data.carousel.carousel_title || carouselForm.offer_or_theme,
        type: "Carrossel",
        preview: response.data.carousel.caption?.substring(0, 100) + "..." || "",
        data: response.data.carousel,
      });
      
      // Limpar auto-save após sucesso
      clearSavedCarousel();
      
      // Toast de reforço para primeira criação
      const isFirstCreation = !localStorage.getItem('first_content_created');
      if (isFirstCreation) {
        localStorage.setItem('first_content_created', 'true');
        toast({
          title: "🎉 Parabéns! +20 XP ganhos!",
          description: "Primeiro passo dado! Que tal agora criar Stories para complementar seu post?",
          duration: 6000,
        });
      } else if (response.data.brand_identity_applied) {
        toast({
          title: "Carrossel criado com sucesso! +20 XP",
          description: "Sua identidade de marca foi aplicada. Continue criando para subir de nível!",
        });
      }
      
      // Mostrar próximos passos após criação
      setShowNextSteps(true);
      
    } catch (error: any) {
      console.error("Error generating carousel:", error);
      
      // Verificar se é erro de limite atingido
      if (error.response?.status === 403 && error.response?.data?.error === "limit_exceeded") {
        const { current, max_allowed, limit_type } = error.response.data;
        showLimitModal({
          resourceType: limit_type || "carousel",
          currentUsage: current || 0,
          limit: max_allowed || 0,
        });
      } else {
        toast({
          title: "Erro ao gerar",
          description: error.response?.data?.message || "Não foi possível gerar o carrossel.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!tema.trim()) return;

    setLoading(true);
    setContentResult(null);

    try {
      const response = await api.post("/api/ai/generate-content", { tema, tipo, tom });
      setContentResult(response.data.content);
      
      // Adicionar aos itens recentes
      addRecentContent({
        title: response.data.content.titulo || tema,
        type: tipo === "post" ? "Post" : tipo === "reels" ? "Reels" : "Stories",
        preview: response.data.content.legenda_completa?.substring(0, 100) + "..." || "",
        data: response.data.content,
      });
      
      // Toast de reforço para primeira criação
      const isFirstCreation = !localStorage.getItem('first_content_created');
      if (isFirstCreation) {
        localStorage.setItem('first_content_created', 'true');
        toast({
          title: "🎉 Parabéns! +20 XP ganhos!",
          description: "Primeiro passo dado! Que tal agora criar Stories para complementar seu post?",
          duration: 6000,
        });
      } else {
        toast({
          title: "Conteúdo criado com sucesso! +20 XP",
          description: "Seu post estratégico está pronto. Continue para subir de nível!",
        });
      }
      
      // Mostrar próximos passos
      setShowNextSteps(true);
      
    } catch (error: any) {
      console.error("Error generating content:", error);
      
      // Verificar se é erro de limite atingido
      if (error.response?.status === 403 && error.response?.data?.error === "limit_exceeded") {
        const { current, max_allowed, limit_type } = error.response.data;
        showLimitModal({
          resourceType: limit_type || tipo,
          currentUsage: current || 0,
          limit: max_allowed || 0,
        });
      } else {
        toast({
          title: "Erro ao gerar",
          description: error.response?.data?.message || "Não foi possível gerar o conteúdo.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const phaseColors: Record<string, string> = {
    "hook": "bg-red-100 text-red-700 border-red-200",
    "dor": "bg-orange-100 text-orange-700 border-orange-200",
    "custo": "bg-amber-100 text-amber-700 border-amber-200",
    "perspectiva": "bg-blue-100 text-blue-700 border-blue-200",
    "cta": "bg-green-100 text-green-700 border-green-200",
    "HOOK": "bg-red-100 text-red-700 border-red-200",
    "DOR": "bg-orange-100 text-orange-700 border-orange-200",
    "CUSTO": "bg-amber-100 text-amber-700 border-amber-200",
    "PERSPECTIVA": "bg-blue-100 text-blue-700 border-blue-200",
    "CTA": "bg-green-100 text-green-700 border-green-200",
    "GANCHO": "bg-red-100 text-red-700 border-red-200",
  };

  const getPhaseLabel = (phase: string, slideNum: number) => {
    if (slideNum === 1) return "HOOK";
    if (slideNum <= 3) return "DOR";
    if (slideNum <= 5) return "CUSTO";
    if (slideNum <= 7) return "PERSPECTIVA";
    return "CTA";
  };

  return (
    <>
      {/* AI Progress Overlay */}
      <AIProgress
        isLoading={loading}
        title={activeTab === "carousel" ? "Criando Carrossel..." : "Gerando Conteúdo..."}
        subtitle="LucresIA está aplicando o método NeuroVendas"
        steps={[
          { id: 'analyzing', label: 'Analisando contexto', description: 'Entendendo seu público e objetivo...' },
          { id: 'structuring', label: 'Estruturando conteúdo', description: 'Criando framework persuasivo...' },
          { id: 'generating', label: 'Gerando textos', description: 'Aplicando gatilhos mentais...' },
          { id: 'finalizing', label: 'Finalizando', description: 'Preparando resultado otimizado...' },
        ]}
        estimatedTime={15}
      />
      
      <NeuroVendasLayout>
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header - Premium */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-500/30">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">NeuroPost™ Elevare</h1>
                <p className="text-slate-500">Criação de conteúdo guiada por neurociência e conversão</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Auto-save indicator */}
              <AutoSaveIndicator status={autoSaveStatus} />
              
              {hasBrandIdentity && (
                <Badge className="bg-purple-100 text-purple-700 border-purple-200 px-4 py-2 rounded-full">
                  <Palette className="w-4 h-4 mr-2" />
                  Marca Configurada
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Recent Items */}
        {(recentCarousels.length > 0 || recentContents.length > 0) && (
          <div className="mb-6">
            <RecentItems 
              items={activeTab === "carousel" ? recentCarousels : recentContents}
              onReuse={(item) => {
                if (item.data) {
                  if (activeTab === "carousel") {
                    setCarouselResult(item.data);
                  } else {
                    setContentResult(item.data);
                  }
                  toast({
                    title: "Conteúdo restaurado",
                    description: `"${item.title}" foi carregado.`,
                  });
                }
              }}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-100 p-1.5 rounded-2xl">
            <TabsTrigger value="carousel" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Image className="w-4 h-4" />
              Carrossel NeuroVendas
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-4 h-4" />
              Outros Conteúdos
            </TabsTrigger>
          </TabsList>

          {/* Carousel Tab */}
          <TabsContent value="carousel">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section - Premium */}
              <Card className="p-8 bg-white border-0 shadow-premium rounded-2xl">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Configurar Carrossel</h2>

                <div className="space-y-5">
                  {/* Tema/Oferta - CAMPO OBRIGATÓRIO */}
                  <div>
                    <LabelWithTooltip 
                      label="Tema ou Oferta" 
                      tooltip="Sobre o que é seu carrossel? Ex: Limpeza de pele, Harmonização facial, Promoção de Natal, etc."
                      required
                    />
                    <TextareaWithCounter
                      value={carouselForm.offer_or_theme}
                      onChange={(e) => setCarouselForm(prev => ({ ...prev, offer_or_theme: e.target.value }))}
                      placeholder="Ex: Limpeza de pele com tecnologia LED"
                      className={`mt-2 rounded-xl pb-6 transition-all ${
                        carouselForm.offer_or_theme.trim() 
                          ? "border-green-300 focus:border-green-400 focus:ring-green-200" 
                          : "border-amber-300 focus:border-amber-400 focus:ring-amber-200"
                      }`}
                      maxLength={300}
                      rows={2}
                    />
                    {!carouselForm.offer_or_theme.trim() && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Campo obrigatório para gerar o carrossel
                      </p>
                    )}
                  </div>

                  {/* Nicho */}
                  <div>
                    <LabelWithTooltip 
                      label="Nicho" 
                      tooltip="Área de atuação do seu negócio. Ex: estética facial, corporal, capilar, etc."
                    />
                    <Input
                      value={carouselForm.niche}
                      onChange={(e) => setCarouselForm(prev => ({ ...prev, niche: e.target.value }))}
                      placeholder="Ex: estética facial"
                      className="mt-2 h-12 rounded-xl border-slate-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>

                  {/* Objetivo */}
                  <div>
                    <LabelWithTooltip 
                      label="Objetivo" 
                      tooltip="O que você quer alcançar: Atração (novos seguidores), Autoridade (mostrar expertise), Prova Social (depoimentos), Venda Direta (converter agora)"
                    />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {options?.objectives.map((obj) => {
                        const isSelected = carouselForm.carousel_objective === obj.id;
                        const icons: Record<string, any> = {
                          atracao: Megaphone,
                          autoridade: Crown,
                          prova_social: Users,
                          venda_direta: Target,
                        };
                        const tooltips: Record<string, string> = {
                          atracao: "Atrair novos seguidores com conteúdo viral",
                          autoridade: "Mostrar expertise e conhecimento técnico",
                          prova_social: "Usar depoimentos e resultados reais",
                          venda_direta: "Converter seguidores em clientes agora",
                        };
                        const Icon = icons[obj.id] || Target;
                        return (
                          <button
                            key={obj.id}
                            onClick={() => setCarouselForm(prev => ({ ...prev, carousel_objective: obj.id }))}
                            className={`p-3 rounded-xl border text-left text-xs transition-all group relative ${
                              isSelected
                                ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                                : "border-slate-200 hover:border-green-300 hover:bg-green-50/50"
                            }`}
                            title={tooltips[obj.id]}
                          >
                            <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-green-600" : "text-slate-400 group-hover:text-green-500"}`} />
                            <p className="font-semibold">{obj.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{tooltips[obj.id]}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nível de consciência */}
                  <div>
                    <LabelWithTooltip 
                      label="Consciência do Público" 
                      tooltip="Frio = não conhece você. Morno = já te segue mas não comprou. Quente = pronto para comprar."
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { id: "frio", label: "Frio", icon: Snowflake, color: "blue", desc: "Não me conhece" },
                        { id: "morno", label: "Morno", icon: ThermometerSun, color: "amber", desc: "Já me segue" },
                        { id: "quente", label: "Quente", icon: Flame, color: "red", desc: "Pronto p/ comprar" },
                      ].map((level) => {
                        const isSelected = carouselForm.audience_awareness === level.id;
                        const Icon = level.icon;
                        const colorClasses: Record<string, { selected: string; icon: string }> = {
                          blue: { selected: "border-blue-500 bg-blue-50 text-blue-700", icon: "text-blue-600" },
                          amber: { selected: "border-amber-500 bg-amber-50 text-amber-700", icon: "text-amber-600" },
                          red: { selected: "border-red-500 bg-red-50 text-red-700", icon: "text-red-600" },
                        };
                        return (
                          <button
                            key={level.id}
                            onClick={() => setCarouselForm(prev => ({ ...prev, audience_awareness: level.id }))}
                            className={`p-3 rounded-xl border text-center text-xs transition-all ${
                              isSelected
                                ? colorClasses[level.color].selected
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isSelected ? colorClasses[level.color].icon : "text-slate-400"}`} />
                            <p className="font-semibold">{level.label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{level.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tom de Voz */}
                  <div>
                    <LabelWithTooltip 
                      label="Tom de Voz" 
                      tooltip="Como você quer que o texto soe: Profissional (sério), Acolhedor (carinhoso), Direto (objetivo), Premium (sofisticado)"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {options?.tones.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setCarouselForm(prev => ({ ...prev, tone_of_voice: tone.id }))}
                          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                            carouselForm.tone_of_voice === tone.id
                              ? "bg-green-500 text-white shadow-sm"
                              : "bg-slate-100 text-slate-600 hover:bg-green-50 hover:text-green-700"
                          }`}
                        >
                          {tone.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Geração DESTACADO */}
                  <div className="pt-4">
                    <GenerateButton
                      onClick={handleGenerateCarousel}
                      loading={loading}
                      disabled={!carouselForm.offer_or_theme.trim()}
                      variant="carousel"
                      size="xl"
                    >
                      Criar Carrossel que Converte
                    </GenerateButton>
                  </div>

                  <p className="text-sm text-slate-400 text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    3 créditos • Estrutura NeuroVendas Elevare
                  </p>
                </div>
              </Card>

              {/* Result Section - Premium */}
              <Card className="lg:col-span-2 p-8 bg-white border-0 shadow-premium rounded-2xl">
                {!carouselResult ? (
                  <div className="h-full flex items-center justify-center text-center p-12">
                    <div>
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <Image className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Carrossel NeuroVendas</h3>
                      <p className="text-slate-500 max-w-md leading-relaxed">
                        Estrutura otimizada: Hook → Dor Real → Custo Invisível → Nova Perspectiva → CTA
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {carouselResult.carousel_title || "Carrossel Gerado"}
                      </h3>
                      <Badge variant="outline">{carouselResult.slides?.length || 0} slides</Badge>
                    </div>

                    {/* Slides */}
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {carouselResult.slides?.map((slide, index) => {
                        const phase = getPhaseLabel(slide.phase, slide.slide);
                        const colorClass = phaseColors[phase] || "bg-slate-100 text-slate-700";
                        
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-xl border ${colorClass}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-white/50 flex items-center justify-center text-xs font-bold">
                                  {slide.slide}
                                </span>
                                <Badge variant="outline" className={colorClass}>
                                  {phase}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`${slide.headline}\n\n${slide.text}`, `slide-${index}`)}
                                className="h-7 px-2"
                              >
                                {copiedId === `slide-${index}` ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <p className="font-bold text-sm mb-1">{slide.headline}</p>
                            <p className="text-sm">{slide.text}</p>
                            {slide.visual_suggestion && (
                              <p className="text-xs mt-2 opacity-70">
                                <Eye className="w-3 h-3 inline mr-1" />
                                {slide.visual_suggestion}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* CTA */}
                    {carouselResult.final_cta && (
                      <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-green-600 font-medium mb-1">CTA FINAL</p>
                            <p className="text-sm font-medium text-green-800">{carouselResult.final_cta}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(carouselResult.final_cta, "cta")}
                          >
                            {copiedId === "cta" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Caption */}
                    {carouselResult.caption && (
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-600 font-medium">LEGENDA</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(carouselResult.caption, "caption")}
                          >
                            {copiedId === "caption" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700">{carouselResult.caption}</p>
                        {carouselResult.hashtags && (
                          <p className="text-xs text-blue-600 mt-2">
                            {carouselResult.hashtags.map(h => `#${h.replace('#', '')}`).join(' ')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form - Premium */}
              <Card className="p-8 bg-white border-0 shadow-premium rounded-2xl">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Outros Conteúdos</h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-700">Tipo</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {[
                        { value: "post", label: "Post", icon: FileText },
                        { value: "reels", label: "Reels", icon: Video },
                        { value: "stories", label: "Stories", icon: MessageSquare },
                      ].map((option) => {
                        const Icon = option.icon;
                        const isSelected = tipo === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setTipo(option.value)}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              isSelected
                                ? "border-green-500 bg-green-50"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? "text-green-600" : "text-slate-400"}`} />
                            <p className={`text-xs font-medium ${isSelected ? "text-green-700" : "text-slate-600"}`}>
                              {option.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-700 font-medium">Tema *</Label>
                    <TextareaWithCounter
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      placeholder="Ex: Benefícios da limpeza de pele"
                      className="mt-2 rounded-xl border-slate-200 focus:border-green-300 focus:ring-green-200 pb-6"
                      maxLength={500}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label className="text-slate-700 font-medium">Tom de Voz</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {["profissional", "acolhedor", "inspirador", "direto"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTom(t)}
                          className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all duration-300 ${
                            tom === t
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateContent}
                    disabled={!tema.trim() || loading}
                    className="btn-premium w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-6 rounded-xl font-semibold shadow-lg shadow-green-500/25"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5 mr-2" />
                    )}
                    Criar Post Estratégico
                  </Button>
                </div>
              </Card>

              {/* Result - Premium */}
              <Card className="lg:col-span-2 p-8 bg-white border-0 shadow-premium rounded-2xl">
                {!contentResult ? (
                  <div className="h-full flex items-center justify-center text-center p-12">
                    <div>
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">Conteúdo NeuroVendas</h3>
                      <p className="text-slate-500">Posts, Reels e Stories otimizados</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">{contentResult.titulo}</h3>

                    {contentResult.slides && (
                      <div className="space-y-2">
                        {contentResult.slides.map((slide, i) => (
                          <div key={i} className="p-3 rounded-lg bg-slate-50 border">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className={phaseColors[slide.fase] || ""}>{slide.fase}</Badge>
                              <Button variant="ghost" size="sm" onClick={() => handleCopy(slide.texto, `content-${i}`)}>
                                {copiedId === `content-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              </Button>
                            </div>
                            <p className="text-sm">{slide.texto}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {contentResult.legenda_completa && (
                      <div className="p-4 rounded-xl bg-slate-50 border">
                        <div className="flex justify-between mb-2">
                          <p className="text-xs font-medium text-slate-600">LEGENDA</p>
                          <Button variant="ghost" size="sm" onClick={() => handleCopy(contentResult.legenda_completa, "legenda")}>
                            {copiedId === "legenda" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                        <p className="text-sm text-slate-700">{contentResult.legenda_completa}</p>
                      </div>
                    )}

                    {contentResult.cta && (
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                        <p className="text-xs text-green-600 font-medium mb-1">CTA</p>
                        <p className="text-sm text-green-800">{contentResult.cta}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Card de próximos passos após criação */}
      {showNextSteps && (carouselResult || contentResult) && (
        <div className="fixed bottom-4 right-4 z-40 w-96 animate-in slide-in-from-right">
          <NextSteps 
            currentAction={activeTab === "carousel" ? "carousel" : tipo}
            onDismiss={() => setShowNextSteps(false)}
          />
        </div>
      )}
      
      {/* Modal de limite atingido */}
      <LimitModal />
    </NeuroVendasLayout>
    </>
  );
}
