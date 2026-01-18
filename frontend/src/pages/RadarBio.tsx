import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { useCredits } from "@/hooks/useCredits";
import { AILoading, InsufficientCredits } from "@/components/ui/ai-loading";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Loader2,
  Instagram,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Globe,
  ArrowRight,
  Sparkles,
  Shield,
  Target,
  Eye,
  TrendingUp,
  Upload,
  Image,
  X,
  Camera,
  Palette,
} from "lucide-react";

interface PontoComImpacto {
  item: string;
  impacto: string;
  solucao?: string;
}

interface AnalysisResult {
  resumoExecutivo?: {
    notaGeral: number;
    pontuacoes: {
      autoridadePercebida: number;
      coerenciaVisual: number;
      provaSocial: number;
      conversaoCTAs: number;
      presencaDigitalGlobal: number;
    };
    status: string;
  };
  instagramAnalise: {
    bioIdentificada?: string;
    seguidores?: string;
    posts?: string;
    destaqueIdentificados?: string[];
    paletaCores?: string[];
    pontosFortes: PontoComImpacto[] | string[];
    pontosFracos: PontoComImpacto[] | string[];
    sugestoes?: string[];
    sugestoesCopy?: {
      bioSugerida?: string;
      ctaSugerido?: string;
    };
  };
  paginaAnalise: {
    tituloIdentificado?: string;
    titulo?: string;
    subtituloIdentificado?: string;
    ctaIdentificado?: string;
    cta?: string;
    servicosVisiveis?: string[];
    precosVisiveis?: string[];
    provasSociaisVisiveis?: string[];
    pontosFortes: PontoComImpacto[] | string[];
    pontosFracos: PontoComImpacto[] | string[];
    sugestoes?: string[];
    sugestoesCopy?: {
      tituloSugerido?: string;
      ctaSugerido?: string;
    };
  };
  coerencia: {
    status: "alinhado" | "parcial" | "quebrado";
    analise: string;
    elementosAlinhados?: string[];
    quebraExpectativa?: string[];
  };
  autoridade: {
    percepcao: "especialista" | "generico" | "amador" | "promocional";
    nivel?: string;
    justificativa: string;
    elementosAutoridade?: string[];
    elementosFaltando?: string[];
  };
  melhorias: {
    acao: string;
    impacto: "alto" | "medio" | "baixo" | "ALTO" | "MÉDIO" | "BAIXO";
    justificativa?: string;
    prazo?: string;
    resultadoEsperado?: string;
  }[];
  templateVisual?: {
    paletaSugerida?: {
      primaria: string;
      secundaria: string;
      contraste: string;
    };
    tipografiaSugerida?: {
      titulos: string;
      corpo: string;
    };
  };
  insightPrincipal?: string;
}

export default function RadarBio() {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [linkBio, setLinkBio] = useState("");
  const [instagramImage, setInstagramImage] = useState<File | null>(null);
  const [instagramPreview, setInstagramPreview] = useState<string | null>(null);
  const [paginaImage, setPaginaImage] = useState<File | null>(null);
  const [paginaPreview, setPaginaPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [insufficientCredits, setInsufficientCredits] = useState<{ current: number; required: number } | null>(null);
  
  const instagramInputRef = useRef<HTMLInputElement>(null);
  const paginaInputRef = useRef<HTMLInputElement>(null);
  
  const { checkCredits } = useCredits();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const CREDITS_REQUIRED = 5;

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 5MB", variant: "destructive" });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (
    setImage: (file: File | null) => void,
    setPreview: (url: string | null) => void
  ) => {
    setImage(null);
    setPreview(null);
  };

  const extractInstagramHandle = (input: string): string => {
    if (input.includes("instagram.com/")) {
      const match = input.match(/instagram\.com\/([^/?]+)/);
      return match ? match[1] : input;
    }
    return input.replace("@", "").trim();
  };

  const handleAnalyze = async () => {
    // Validações
    if (!instagramHandle.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o perfil do Instagram.", variant: "destructive" });
      return;
    }
    if (!instagramImage) {
      toast({ title: "Campo obrigatório", description: "Faça upload do print do Instagram.", variant: "destructive" });
      return;
    }
    if (!linkBio.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o link da bio.", variant: "destructive" });
      return;
    }
    if (!paginaImage) {
      toast({ title: "Campo obrigatório", description: "Faça upload do print da página.", variant: "destructive" });
      return;
    }

    if (!linkBio.startsWith("http://") && !linkBio.startsWith("https://")) {
      toast({ title: "Link inválido", description: "O link deve começar com http:// ou https://", variant: "destructive" });
      return;
    }

    // Check credits
    const creditCheck = await checkCredits(CREDITS_REQUIRED);
    if (!creditCheck.hasCredits) {
      setInsufficientCredits({
        current: creditCheck.currentBalance,
        required: CREDITS_REQUIRED
      });
      return;
    }
    
    setInsufficientCredits(null);
    setLoading(true);

    try {
      const handle = extractInstagramHandle(instagramHandle);
      
      // Criar FormData para enviar imagens
      const formData = new FormData();
      formData.append("instagramHandle", handle);
      formData.append("linkBio", linkBio);
      formData.append("instagramImage", instagramImage);
      formData.append("paginaImage", paginaImage);
      
      const response = await api.post("/api/ai/diagnostico-presenca-visual", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000 // 2 minutos para análise de imagem
      });
      
      setResult(response.data.result);
      toast({
        title: "Análise concluída!",
        description: `${CREDITS_REQUIRED} créditos consumidos.`,
      });
    } catch (error: any) {
      console.error("Error analyzing:", error);
      if (error.response?.status === 402) {
        setInsufficientCredits({ current: 0, required: CREDITS_REQUIRED });
      } else {
        toast({
          title: "Erro na análise",
          description: error.response?.data?.detail || "Algo deu errado. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const getCoerenciaColor = (status: string) => {
    if (status === "alinhado") return "text-green-600 bg-green-50 border-green-200";
    if (status === "parcial") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getImpactoColor = (impacto: string) => {
    if (impacto === "alto") return "bg-red-100 text-red-700";
    if (impacto === "medio") return "bg-amber-100 text-amber-700";
    return "bg-blue-100 text-blue-700";
  };

  // ═══════════════════════════════════════════════════════════════════
  // TELA DE INPUT
  // ═══════════════════════════════════════════════════════════════════
  if (!result) {
    return (
      <NeuroVendasLayout>
        <div className="max-w-3xl mx-auto">
          {/* Welcome Banner for new users */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="font-semibold text-green-800">Bem-vinda ao NeuroVendas!</p>
                <p className="text-sm text-green-700">
                  Aqui você pode analisar seu Instagram e descobrir como melhorar sua presença digital. 
                  <strong className="text-green-800"> Não é obrigatório agora</strong> — você pode explorar o app primeiro!
                </p>
                <Button
                  variant="link"
                  className="text-green-700 hover:text-green-900 p-0 h-auto text-sm mt-1"
                  onClick={() => navigate("/dashboard")}
                >
                  → Ir para o Início e explorar
                </Button>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 shadow-xl shadow-purple-500/30 mb-4">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Diagnóstico de Presença Digital
            </h1>
            <p className="text-slate-500">
              Análise visual completa: Instagram + Página de destino
            </p>
          </div>

          {/* Card Principal */}
          <Card className="p-8 bg-white border-0 shadow-2xl rounded-3xl">
            {/* Benefícios */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-3 rounded-xl bg-purple-50">
                <Eye className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Análise Visual</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-50">
                <Shield className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Autoridade</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-green-50">
                <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-xs text-slate-600">Conversão</p>
              </div>
            </div>

            {/* Seção Instagram */}
            <div className="mb-6 p-5 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-100">
              <div className="flex items-center gap-2 mb-4">
                <Instagram className="w-5 h-5 text-pink-600" />
                <h3 className="font-semibold text-slate-800">Instagram</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 text-sm">@ do perfil</Label>
                  <Input
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@seuperfil"
                    className="mt-1 h-11 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 text-sm">Print do perfil</Label>
                  <input
                    type="file"
                    ref={instagramInputRef}
                    onChange={(e) => handleImageUpload(e, setInstagramImage, setInstagramPreview)}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {instagramPreview ? (
                    <div className="mt-2 relative">
                      <img
                        src={instagramPreview}
                        alt="Preview Instagram"
                        className="w-full max-w-[280px] mx-auto aspect-[9/16] object-contain rounded-xl border-2 border-pink-200 bg-slate-50"
                      />
                      <button
                        onClick={() => removeImage(setInstagramImage, setInstagramPreview)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-center text-slate-400 mt-2">Formato ideal: vertical (9:16) ou quadrado</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => instagramInputRef.current?.click()}
                      className="mt-2 w-full max-w-[280px] mx-auto aspect-[9/16] border-2 border-dashed border-pink-200 rounded-xl bg-white hover:bg-pink-50 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Camera className="w-8 h-8 text-pink-400" />
                      <span className="text-sm text-slate-500">Clique para fazer upload</span>
                      <span className="text-xs text-slate-400">PNG, JPG até 5MB</span>
                      <span className="text-xs text-pink-400 font-medium">Formato: vertical ou quadrado</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Seção Página */}
            <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-800">Página do Link</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-700 text-sm">Link do Site / Página Google</Label>
                  <Input
                    value={linkBio}
                    onChange={(e) => setLinkBio(e.target.value)}
                    placeholder="https://seusite.com.br ou link do Google Meu Negócio"
                    className="mt-1 h-11 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 text-sm">Print do Site / Página Google</Label>
                  <input
                    type="file"
                    ref={paginaInputRef}
                    onChange={(e) => handleImageUpload(e, setPaginaImage, setPaginaPreview)}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {paginaPreview ? (
                    <div className="mt-2 relative">
                      <img
                        src={paginaPreview}
                        alt="Preview Página"
                        className="w-full max-w-[280px] mx-auto aspect-[9/16] object-contain rounded-xl border-2 border-blue-200 bg-slate-50"
                      />
                      <button
                        onClick={() => removeImage(setPaginaImage, setPaginaPreview)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-center text-slate-400 mt-2">Formato ideal: vertical (9:16) ou quadrado</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => paginaInputRef.current?.click()}
                      className="mt-2 w-full max-w-[280px] mx-auto aspect-[9/16] border-2 border-dashed border-blue-200 rounded-xl bg-white hover:bg-blue-50 transition-colors flex flex-col items-center justify-center gap-2"
                    >
                      <Camera className="w-8 h-8 text-blue-400" />
                      <span className="text-sm text-slate-500">Clique para fazer upload</span>
                      <span className="text-xs text-slate-400">PNG, JPG até 5MB</span>
                      <span className="text-xs text-blue-400 font-medium">Formato: vertical ou quadrado</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CTA */}
            {insufficientCredits && (
              <div className="mb-6">
                <InsufficientCredits
                  currentBalance={insufficientCredits.current}
                  requiredCredits={insufficientCredits.required}
                  onUpgrade={() => navigate('/dashboard/planos')}
                />
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 py-6 rounded-xl font-semibold text-base shadow-lg shadow-purple-500/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando imagens...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Analisar Presença Digital
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded text-xs">5 créditos</span>
                </>
              )}
            </Button>
          </Card>

          {/* Loading State */}
          {loading && (
            <AILoading
              isLoading={loading}
              message="Analisando suas imagens..."
              subMessage="A IA está avaliando layout, textos e coerência visual"
              timeoutSeconds={120}
              onRetry={handleAnalyze}
            />
          )}
        </div>
      </NeuroVendasLayout>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // TELA DE RESULTADO
  // ═══════════════════════════════════════════════════════════════════
  
  // Helper para extrair texto do ponto (pode ser string ou objeto)
  const getPontoTexto = (ponto: string | PontoComImpacto): string => {
    if (typeof ponto === 'string') return ponto;
    return ponto.item || '';
  };
  
  const getPontoImpacto = (ponto: string | PontoComImpacto): string | null => {
    if (typeof ponto === 'string') return null;
    return ponto.impacto || null;
  };
  
  const getPontoSolucao = (ponto: string | PontoComImpacto): string | null => {
    if (typeof ponto === 'string') return null;
    return ponto.solucao || null;
  };
  
  return (
    <NeuroVendasLayout>
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">📊 Relatório de Análise Visual</h1>
            <p className="text-slate-500">@{extractInstagramHandle(instagramHandle)}</p>
          </div>
          <Button onClick={() => setResult(null)} variant="outline" className="rounded-xl">
            Nova Análise
          </Button>
        </div>

        {/* Resumo Executivo - Se disponível */}
        {result.resumoExecutivo && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 rounded-2xl">
            <h2 className="text-lg font-bold text-slate-800 mb-4">📋 Resumo Executivo</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-3xl font-bold text-purple-600">{result.resumoExecutivo.notaGeral}</p>
                <p className="text-xs text-slate-500">Nota Geral</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-blue-600">{result.resumoExecutivo.pontuacoes.autoridadePercebida}</p>
                <p className="text-xs text-slate-500">Autoridade</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-green-600">{result.resumoExecutivo.pontuacoes.coerenciaVisual}</p>
                <p className="text-xs text-slate-500">Coerência</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-amber-600">{result.resumoExecutivo.pontuacoes.provaSocial}</p>
                <p className="text-xs text-slate-500">Prova Social</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-pink-600">{result.resumoExecutivo.pontuacoes.conversaoCTAs}</p>
                <p className="text-xs text-slate-500">Conversão</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-indigo-600">{result.resumoExecutivo.pontuacoes.presencaDigitalGlobal}</p>
                <p className="text-xs text-slate-500">Presença</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-xl">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                result.resumoExecutivo.notaGeral >= 80 ? 'bg-green-100 text-green-700' :
                result.resumoExecutivo.notaGeral >= 60 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {result.resumoExecutivo.status}
              </span>
            </div>
          </Card>
        )}

        {/* Score Geral - Coerência */}
        <Card className={`p-6 mb-6 border-2 rounded-2xl ${getCoerenciaColor(result.coerencia.status)}`}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white shadow-sm">
              {result.coerencia.status === "alinhado" ? <CheckCircle className="w-6 h-6" /> :
               result.coerencia.status === "parcial" ? <AlertTriangle className="w-6 h-6" /> :
               <XCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg capitalize">
                Coerência Visual: {result.coerencia.status}
              </h2>
              <p className="text-sm opacity-80 mt-1">{result.coerencia.analise}</p>
              {result.coerencia.elementosAlinhados && result.coerencia.elementosAlinhados.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.coerencia.elementosAlinhados.map((el, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/50 rounded text-xs">{el}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60">Autoridade</p>
              <p className="font-bold capitalize">{result.autoridade.percepcao}</p>
              {result.autoridade.nivel && (
                <p className="text-xs opacity-60 capitalize">{result.autoridade.nivel}</p>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Análise Instagram */}
          <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-pink-100">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-bold text-slate-900">Instagram</h3>
            </div>
            
            {/* Bio identificada */}
            {result.instagramAnalise.bioIdentificada && (
              <div className="mb-4 p-3 bg-pink-50 rounded-xl">
                <p className="text-xs text-pink-600 font-medium mb-1">📝 Bio Identificada</p>
                <p className="text-sm text-slate-700 italic">"{result.instagramAnalise.bioIdentificada}"</p>
              </div>
            )}
            
            {/* Métricas */}
            {(result.instagramAnalise.seguidores || result.instagramAnalise.posts) && (
              <div className="flex gap-4 mb-4">
                {result.instagramAnalise.seguidores && (
                  <div className="text-center p-2 bg-slate-50 rounded-lg flex-1">
                    <p className="font-bold text-slate-800">{result.instagramAnalise.seguidores}</p>
                    <p className="text-xs text-slate-500">Seguidores</p>
                  </div>
                )}
                {result.instagramAnalise.posts && (
                  <div className="text-center p-2 bg-slate-50 rounded-lg flex-1">
                    <p className="font-bold text-slate-800">{result.instagramAnalise.posts}</p>
                    <p className="text-xs text-slate-500">Posts</p>
                  </div>
                )}
              </div>
            )}
            
            {result.instagramAnalise.pontosFortes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-green-600 font-medium mb-2">✓ Pontos Fortes</p>
                <ul className="space-y-2">
                  {result.instagramAnalise.pontosFortes.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{getPontoTexto(p)}</span>
                      {getPontoImpacto(p) && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">{getPontoImpacto(p)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.instagramAnalise.pontosFracos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-red-600 font-medium mb-2">✗ Pontos Fracos</p>
                <ul className="space-y-2">
                  {result.instagramAnalise.pontosFracos.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                        <span>{getPontoTexto(p)}</span>
                        {getPontoImpacto(p) && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">{getPontoImpacto(p)}</span>
                        )}
                      </div>
                      {getPontoSolucao(p) && (
                        <p className="ml-5 mt-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          💡 {getPontoSolucao(p)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sugestões de Copy */}
            {result.instagramAnalise.sugestoesCopy?.bioSugerida && (
              <div className="p-3 bg-purple-50 rounded-xl">
                <p className="text-xs text-purple-600 font-medium mb-2">✨ Bio Sugerida</p>
                <p className="text-sm text-slate-700 bg-white p-2 rounded border border-purple-100">
                  {result.instagramAnalise.sugestoesCopy.bioSugerida}
                </p>
              </div>
            )}
          </Card>

          {/* Análise Página */}
          <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-100">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900">Página de Destino</h3>
            </div>

            <div className="mb-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500">Título identificado</p>
              <p className="font-medium text-slate-800">{result.paginaAnalise.tituloIdentificado || result.paginaAnalise.titulo || "Não identificado"}</p>
              {result.paginaAnalise.subtituloIdentificado && (
                <>
                  <p className="text-xs text-slate-500 mt-2">Subtítulo</p>
                  <p className="text-sm text-slate-700">{result.paginaAnalise.subtituloIdentificado}</p>
                </>
              )}
              <p className="text-xs text-slate-500 mt-2">CTA principal</p>
              <p className="font-medium text-slate-800">{result.paginaAnalise.ctaIdentificado || result.paginaAnalise.cta || "Não identificado"}</p>
            </div>
            
            {/* Serviços e Preços */}
            {(result.paginaAnalise.servicosVisiveis?.length || result.paginaAnalise.precosVisiveis?.length) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                {result.paginaAnalise.servicosVisiveis && result.paginaAnalise.servicosVisiveis.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-blue-600 font-medium">Serviços</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.paginaAnalise.servicosVisiveis.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-white rounded text-xs text-slate-600">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.paginaAnalise.precosVisiveis && result.paginaAnalise.precosVisiveis.length > 0 && (
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Preços</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.paginaAnalise.precosVisiveis.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-100 rounded text-xs text-green-700">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {result.paginaAnalise.pontosFortes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-green-600 font-medium mb-2">✓ Pontos Fortes</p>
                <ul className="space-y-2">
                  {result.paginaAnalise.pontosFortes.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                      <span>{getPontoTexto(p)}</span>
                      {getPontoImpacto(p) && (
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">{getPontoImpacto(p)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {result.paginaAnalise.pontosFracos.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-red-600 font-medium mb-2">✗ Pontos Fracos</p>
                <ul className="space-y-2">
                  {result.paginaAnalise.pontosFracos.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <XCircle className="w-3 h-3 text-red-500 mt-1 flex-shrink-0" />
                        <span>{getPontoTexto(p)}</span>
                        {getPontoImpacto(p) && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs">{getPontoImpacto(p)}</span>
                        )}
                      </div>
                      {getPontoSolucao(p) && (
                        <p className="ml-5 mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          💡 {getPontoSolucao(p)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sugestões de Copy */}
            {result.paginaAnalise.sugestoesCopy?.tituloSugerido && (
              <div className="p-3 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 font-medium mb-2">✨ Título Sugerido</p>
                <p className="text-sm text-slate-700 bg-white p-2 rounded border border-blue-100">
                  {result.paginaAnalise.sugestoesCopy.tituloSugerido}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Melhorias Priorizadas */}
        <Card className="p-6 mt-6 bg-white border-0 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-100">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-bold text-slate-900">🎯 Melhorias Priorizadas</h3>
          </div>
          <div className="space-y-3">
            {result.melhorias.map((m, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl ${
                m.impacto.toLowerCase() === 'alto' ? 'bg-red-50 border border-red-100' :
                m.impacto.toLowerCase() === 'médio' || m.impacto.toLowerCase() === 'medio' ? 'bg-amber-50 border border-amber-100' :
                'bg-green-50 border border-green-100'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  m.impacto.toLowerCase() === 'alto' ? 'bg-red-500 text-white' :
                  m.impacto.toLowerCase() === 'médio' || m.impacto.toLowerCase() === 'medio' ? 'bg-amber-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-slate-800">{m.acao}</p>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getImpactoColor(m.impacto)}`}>
                      {m.impacto.toUpperCase()}
                    </span>
                    {m.prazo && (
                      <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-xs">
                        ⏱️ {m.prazo}
                      </span>
                    )}
                  </div>
                  {m.justificativa && <p className="text-sm text-slate-500">{m.justificativa}</p>}
                  {m.resultadoEsperado && (
                    <p className="text-sm text-purple-600 mt-1 font-medium">→ {m.resultadoEsperado}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Insight Principal */}
        {result.insightPrincipal && (
          <Card className="p-6 mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-0 shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-white">💡 Insight Principal</h3>
            </div>
            <p className="text-white/90 text-lg leading-relaxed">{result.insightPrincipal}</p>
          </Card>
        )}

        {/* Autoridade */}
        <Card className="p-6 mt-6 bg-gradient-to-br from-slate-900 to-slate-800 border-0 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="font-bold text-white">🏆 Percepção de Autoridade</h3>
            <span className="ml-auto px-3 py-1 bg-white/10 rounded-full text-white text-sm font-medium capitalize">
              {result.autoridade.percepcao}
            </span>
          </div>
          <p className="text-slate-300 mb-4">{result.autoridade.justificativa}</p>
          
          {result.autoridade.elementosAutoridade && result.autoridade.elementosAutoridade.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-400 font-medium mb-2">✓ Elementos de Autoridade</p>
              <div className="flex flex-wrap gap-2">
                {result.autoridade.elementosAutoridade.map((el, i) => (
                  <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">{el}</span>
                ))}
              </div>
            </div>
          )}
          
          {result.autoridade.elementosFaltando && result.autoridade.elementosFaltando.length > 0 && (
            <div>
              <p className="text-xs text-amber-400 font-medium mb-2">⚠️ O que poderia aumentar autoridade</p>
              <div className="flex flex-wrap gap-2">
                {result.autoridade.elementosFaltando.map((el, i) => (
                  <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-xs">{el}</span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Template Visual Sugerido */}
        {result.templateVisual && (
          <Card className="p-6 mt-6 bg-white border-0 shadow-xl rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-pink-100">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-bold text-slate-900">🎨 Template Visual Sugerido</h3>
            </div>
            
            {result.templateVisual.paletaSugerida && (
              <div className="mb-4">
                <p className="text-xs text-slate-500 mb-2">Paleta de Cores</p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border" 
                      style={{ backgroundColor: result.templateVisual.paletaSugerida.primaria }}
                    />
                    <span className="text-xs text-slate-600">Primária</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border" 
                      style={{ backgroundColor: result.templateVisual.paletaSugerida.secundaria }}
                    />
                    <span className="text-xs text-slate-600">Secundária</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-lg border" 
                      style={{ backgroundColor: result.templateVisual.paletaSugerida.contraste }}
                    />
                    <span className="text-xs text-slate-600">Contraste</span>
                  </div>
                </div>
              </div>
            )}
            
            {result.templateVisual.tipografiaSugerida && (
              <div>
                <p className="text-xs text-slate-500 mb-2">Tipografia</p>
                <div className="flex gap-4">
                  <span className="px-3 py-1 bg-slate-100 rounded text-sm">
                    Títulos: {result.templateVisual.tipografiaSugerida.titulos}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded text-sm">
                    Corpo: {result.templateVisual.tipografiaSugerida.corpo}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </NeuroVendasLayout>
  );
}
