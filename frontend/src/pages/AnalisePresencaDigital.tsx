import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Zap,
  Loader2,
  Instagram,
  CheckCircle,
  AlertTriangle,
  Globe,
  Sparkles,
} from "lucide-react";

// Paleta harmonizada com Landing Page
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#6366F1",
  secondary: "#8B5CF6",
  gold: "#D4AF37",
  text: "#1F2937",
  textLight: "#6B7280",
};

interface AnalysisResult {
  resumoExecutivo?: {
    notaGeral: number;
    pontuacoes: {
      autoridadePercebida: number;
      coerenciaVisual: number;
      conversaoCTAs: number;
      presencaDigitalGlobal: number;
    };
    status: string;
  };
  analiseInstagram?: {
    pontosFortesComImpacto: { item: string; impacto: string }[];
    pontosFracosComImpacto: { item: string; impacto: string; solucao?: string }[];
  };
  analisePagina?: {
    pontosFortesComImpacto: { item: string; impacto: string }[];
    pontosFracosComImpacto: { item: string; impacto: string; solucao?: string }[];
  };
  insightPrincipal?: string;
}

export default function AnalisePresencaDigital() {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [linkBio, setLinkBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const extractInstagramHandle = (input: string): string => {
    if (input.includes("instagram.com/")) {
      const match = input.match(/instagram\.com\/([^/?]+)/);
      return match ? match[1] : input;
    }
    return input.replace("@", "").trim();
  };

  const handleAnalyze = async () => {
    if (!instagramHandle.trim() && !linkBio.trim()) {
      toast({ title: "Campo obrigatório", description: "Informe o perfil do Instagram ou o link do site.", variant: "destructive" });
      return;
    }
    
    setLoading(true);

    try {
      const handle = instagramHandle ? extractInstagramHandle(instagramHandle) : "";
      
      const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || '';
      const response = await fetch(`${API_URL}/api/public/analise-presenca/gerar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagram_url: handle ? `https://instagram.com/${handle}` : null,
          site_url: linkBio || null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const resultado = data.resultado;
        setResult({
          resumoExecutivo: {
            notaGeral: resultado.score_geral * 10,
            pontuacoes: {
              autoridadePercebida: resultado.instagram?.score_conteudo * 10 || 65,
              coerenciaVisual: resultado.instagram?.score_visual * 10 || 70,
              conversaoCTAs: resultado.instagram?.score_conversao * 10 || resultado.site?.score_conversao * 10 || 55,
              presencaDigitalGlobal: resultado.score_geral * 10
            },
            status: resultado.classificacao
          },
          analiseInstagram: resultado.instagram ? {
            pontosFortesComImpacto: resultado.instagram.pontos_fortes.map((p: string) => ({
              item: p,
              impacto: "alto"
            })),
            pontosFracosComImpacto: resultado.instagram.melhorias.map((m: string) => ({
              item: m,
              impacto: "alto",
              solucao: "Implementar melhoria sugerida"
            }))
          } : undefined,
          analisePagina: resultado.site ? {
            pontosFortesComImpacto: resultado.site.pontos_fortes.map((p: string) => ({
              item: p,
              impacto: "alto"
            })),
            pontosFracosComImpacto: resultado.site.melhorias.map((m: string) => ({
              item: m,
              impacto: "alto",
              solucao: "Implementar melhoria sugerida"
            }))
          } : undefined,
          insightPrincipal: `Sua presença digital está ${resultado.classificacao.toLowerCase()}. Continue melhorando!`
        });
        
        toast({
          title: "Análise concluída!",
          description: "Seu relatório está pronto.",
        });
      } else {
        throw new Error(data.detail || "Erro na análise");
      }
    } catch (error: any) {
      console.error("Error analyzing:", error);
      toast({
        title: "Erro na análise",
        description: error.message || "Algo deu errado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════
  // TELA DE INPUT (VERSÃO PÚBLICA)
  // ═══════════════════════════════════════════════════════════════════
  if (!result) {
    // Verificar se diagnóstico já foi feito
    const diagnosticoCompleto = localStorage.getItem('diagnostico_gratuito_respostas');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#F9F9F9] to-white relative overflow-hidden py-12 px-4">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-[#4F46E5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
        
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-1 bg-gradient-to-r from-[#4F46E5]/10 to-[#8B5CF6]/10 text-[#4F46E5] rounded-full text-sm font-medium mb-4 border border-[#4F46E5]/20">
              ✨ 100% Gratuito • 5 minutos • Sem Cadastro
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1F2937] mb-2">
              Análise de Presença Digital
            </h1>
            <p className="text-[#6B7280]">
              Descubra como sua presença online pode atrair mais clientes
            </p>
          </div>

          {/* Badge se já fez diagnóstico */}
          {diagnosticoCompleto && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Diagnóstico Profissional concluído!</p>
                  <p className="text-sm text-green-600">Complete esta análise para desbloquear seus 100 créditos</p>
                </div>
              </div>
            </div>
          )}

          <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
            {/* Instagram */}
            <div className="mb-6">
              <Label className="flex items-center gap-2 text-[#1F2937] font-medium mb-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                Perfil do Instagram
              </Label>
              <Input
                placeholder="@seuperfil ou link do Instagram"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="py-6 rounded-xl border-slate-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              />
            </div>

            {/* Site */}
            <div className="mb-8">
              <Label className="flex items-center gap-2 text-[#1F2937] font-medium mb-2">
                <Globe className="w-4 h-4 text-[#4F46E5]" />
                Link do Site (opcional)
              </Label>
              <Input
                placeholder="https://seusite.com.br"
                value={linkBio}
                onChange={(e) => setLinkBio(e.target.value)}
                className="py-6 rounded-xl border-slate-200 focus:border-[#4F46E5] focus:ring-[#4F46E5]"
              />
            </div>

            {/* CTA */}
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] py-6 rounded-xl font-semibold text-base shadow-lg border-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Analisar Presença Digital Grátis
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-center text-xs text-[#9CA3AF] mt-4">
              Análise gratuita • Sem necessidade de cadastro • Resultado imediato
            </p>
          </Card>

          {/* Voltar */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate("/hub")}
              className="text-[#6B7280] hover:text-[#4F46E5] text-sm underline transition-colors"
            >
              ← Voltar ao Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════
  // TELA DE RESULTADO (VERSÃO PÚBLICA)
  // ═══════════════════════════════════════════════════════════════════
  
  // Verificar se diagnóstico já foi feito
  const diagnosticoCompleto = localStorage.getItem('diagnostico_gratuito_respostas');
  
  // Salvar que análise foi concluída
  useEffect(() => {
    if (result) {
      localStorage.setItem('analise_presenca_completa', 'true');
    }
  }, [result]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F9F9F9] to-white relative overflow-hidden py-12 px-4">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#4F46E5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">📊 Relatório de Análise</h1>
            <p className="text-[#6B7280]">
              {instagramHandle && `@${extractInstagramHandle(instagramHandle)}`}
              {instagramHandle && linkBio && " • "}
              {linkBio}
            </p>
          </div>
          <Button onClick={() => setResult(null)} variant="outline" className="rounded-xl border-[#4F46E5]/20 hover:bg-[#4F46E5]/5">
            Nova Análise
          </Button>
        </div>

        {/* Resumo Executivo */}
        {result.resumoExecutivo && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-[#4F46E5]/5 to-[#8B5CF6]/5 border border-[#4F46E5]/20 rounded-2xl">
            <h2 className="text-lg font-bold text-[#1F2937] mb-4">📋 Resumo Executivo</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-3xl font-bold text-[#4F46E5]">{Math.round(result.resumoExecutivo.notaGeral)}</p>
                <p className="text-xs text-[#6B7280]">Nota Geral</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-[#6366F1]">{Math.round(result.resumoExecutivo.pontuacoes?.autoridadePercebida || 0)}</p>
                <p className="text-xs text-[#6B7280]">Autoridade</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-[#10B981]">{Math.round(result.resumoExecutivo.pontuacoes?.coerenciaVisual || 0)}</p>
                <p className="text-xs text-[#6B7280]">Coerência</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-[#8B5CF6]">{Math.round(result.resumoExecutivo.pontuacoes?.conversaoCTAs || 0)}</p>
                <p className="text-xs text-[#6B7280]">Conversão</p>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <p className="text-xl font-bold text-[#D4AF37]">{Math.round(result.resumoExecutivo.pontuacoes?.presencaDigitalGlobal || 0)}</p>
                <p className="text-xs text-[#6B7280]">Presença</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 bg-white rounded-xl">
              <span className="text-sm font-medium text-[#6B7280]">Classificação:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                (result.resumoExecutivo.notaGeral || 0) >= 75 ? 'bg-green-100 text-green-700' :
                (result.resumoExecutivo.notaGeral || 0) >= 55 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {result.resumoExecutivo.status || 'Analisado'}
              </span>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Análise Instagram */}
          {result.analiseInstagram && (
            <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-pink-100">
                  <Instagram className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="font-bold text-[#1F2937]">Instagram</h3>
              </div>
              
              {result.analiseInstagram.pontosFortesComImpacto?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#10B981] font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Pontos Fortes
                  </p>
                  <div className="space-y-2">
                    {result.analiseInstagram.pontosFortesComImpacto.map((ponto, i) => (
                      <div key={i} className="p-2 bg-green-50 rounded-lg text-sm text-[#1F2937]">
                        {ponto.item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.analiseInstagram.pontosFracosComImpacto?.length > 0 && (
                <div>
                  <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Oportunidades
                  </p>
                  <div className="space-y-2">
                    {result.analiseInstagram.pontosFracosComImpacto.map((ponto, i) => (
                      <div key={i} className="p-2 bg-amber-50 rounded-lg text-sm text-[#1F2937]">
                        {ponto.item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Análise do Site */}
          {result.analisePagina && (
            <Card className="p-6 bg-white border-0 shadow-xl rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-[#4F46E5]/10">
                  <Globe className="w-5 h-5 text-[#4F46E5]" />
                </div>
                <h3 className="font-bold text-[#1F2937]">Site / Página</h3>
              </div>
              
              {result.analisePagina.pontosFortesComImpacto?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-[#10B981] font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Pontos Fortes
                  </p>
                  <div className="space-y-2">
                    {result.analisePagina.pontosFortesComImpacto.map((ponto, i) => (
                      <div key={i} className="p-2 bg-green-50 rounded-lg text-sm text-[#1F2937]">
                        {ponto.item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.analisePagina.pontosFracosComImpacto?.length > 0 && (
                <div>
                  <p className="text-xs text-amber-600 font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Oportunidades
                  </p>
                  <div className="space-y-2">
                    {result.analisePagina.pontosFracosComImpacto.map((ponto, i) => (
                      <div key={i} className="p-2 bg-amber-50 rounded-lg text-sm text-[#1F2937]">
                        {ponto.item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Insight Principal */}
        {result.insightPrincipal && (
          <Card className="p-6 mt-6 bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold">💡 Insight Principal</h3>
            </div>
            <p className="text-white/90">{result.insightPrincipal}</p>
          </Card>
        )}

        {/* 3 OPÇÕES FINAIS (CRÍTICO!) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Opção 1: Gerar PDF */}
          <button
            data-testid="download-pdf-btn"
            className="p-6 bg-white border-2 border-[#4F46E5]/20 rounded-2xl hover:border-[#4F46E5] hover:-translate-y-1 transition-all flex flex-col items-center gap-3 shadow-lg"
            onClick={() => toast({ title: "Em breve!", description: "Funcionalidade de PDF em desenvolvimento" })}
          >
            <span className="text-3xl">📄</span>
            <span className="font-semibold text-[#1F2937]">Gerar PDF</span>
            <span className="text-xs text-[#6B7280] text-center">Salve para comparar evolução</span>
          </button>

          {/* Opção 2: Entrar para Plataforma / Ir para Parabéns */}
          <button
            data-testid="entrar-plataforma-btn"
            className="p-6 bg-gradient-to-br from-[#4F46E5]/10 to-[#8B5CF6]/10 border-2 border-[#4F46E5] rounded-2xl hover:-translate-y-1 hover:shadow-xl transition-all flex flex-col items-center gap-3"
            onClick={() => {
              if (diagnosticoCompleto) {
                // Ambos completos - ir para página de parabéns
                navigate("/diagnostics-complete");
              } else {
                // Só análise feita - ir para cadastro
                navigate("/cadastro-plataforma");
              }
            }}
          >
            <span className="text-3xl">{diagnosticoCompleto ? "🎉" : "🚀"}</span>
            <span className="font-semibold text-[#4F46E5]">
              {diagnosticoCompleto ? "Ver Meus Resultados Completos" : "Entrar para Plataforma Elevare"}
            </span>
            <span className="text-xs text-[#4F46E5]/80 text-center">
              {diagnosticoCompleto ? "Diagnóstico + Análise concluídos!" : "Acesse ferramentas de IA + 100 créditos grátis"}
            </span>
          </button>

          {/* Opção 3: Fazer Diagnóstico ou Sair */}
          <button
            data-testid="exit-btn"
            className="p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-slate-300 hover:-translate-y-1 transition-all flex flex-col items-center gap-3 shadow-lg"
            onClick={() => {
              if (!diagnosticoCompleto) {
                navigate("/diagnostico-gratuito");
              } else {
                navigate("/hub");
              }
            }}
          >
            <span className="text-3xl">{!diagnosticoCompleto ? "🎯" : "👋"}</span>
            <span className="font-semibold text-[#1F2937]">
              {!diagnosticoCompleto ? "Fazer Diagnóstico Gratuito" : "Sair"}
            </span>
            <span className="text-xs text-[#6B7280] text-center">
              {!diagnosticoCompleto ? "Complete sua análise profissional" : "Voltar para página inicial"}
            </span>
          </button>
        </div>

        {/* Botão de Refazer */}
        <div className="mt-6 text-center">
          <button
            data-testid="redo-analysis-btn"
            className="text-[#6B7280] underline text-sm hover:text-[#4F46E5] transition-colors"
            onClick={() => setResult(null)}
          >
            Refazer Análise
          </button>
        </div>
      </div>
    </div>
  );
}
