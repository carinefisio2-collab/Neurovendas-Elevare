/**
 * Histórico de Diagnósticos Visuais
 * Permite acompanhar a evolução da presença digital ao longo do tempo
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Calendar,
  Target,
  Loader2,
  AlertCircle,
  ChevronRight,
  BarChart3,
  Instagram,
  Globe,
} from "lucide-react";

interface DiagnosisHistory {
  id: string;
  instagram_handle: string;
  link_bio: string;
  result: {
    resumoExecutivo: {
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
    melhorias?: Array<{
      acao: string;
      impacto: string;
    }>;
  };
  created_at: string;
}

export default function HistoricoDiagnosticos() {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState<DiagnosisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/presenca-analyses/history");
      setDiagnostics(response.data.analyses || []);
    } catch (err: any) {
      console.error("Error loading history:", err);
      setError(err.response?.data?.detail || "Erro ao carregar histórico");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    if (score >= 40) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreTrend = (current: number, previous?: number) => {
    if (!previous) return null;
    const diff = current - previous;
    if (diff > 0) return { icon: TrendingUp, color: "text-green-500", value: `+${diff}` };
    if (diff < 0) return { icon: TrendingDown, color: "text-red-500", value: `${diff}` };
    return { icon: Minus, color: "text-slate-400", value: "0" };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <NeuroVendasLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#4B0082] mx-auto mb-4" />
            <p className="text-slate-500">Carregando histórico...</p>
          </div>
        </div>
      </NeuroVendasLayout>
    );
  }

  return (
    <NeuroVendasLayout>
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#7c3aed] flex items-center justify-center shadow-xl shadow-purple-500/30">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Histórico de Diagnósticos</h1>
              <p className="text-slate-500">Acompanhe a evolução da sua presença digital</p>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/dashboard/radar-bio")}
            className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
          >
            <Target className="w-4 h-4 mr-2" />
            Novo Diagnóstico
          </Button>
        </div>

        {error ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Erro ao carregar</h2>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button onClick={loadHistory}>Tentar novamente</Button>
          </Card>
        ) : diagnostics.length === 0 ? (
          <Card className="p-12 text-center">
            <Eye className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Nenhum diagnóstico realizado
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Faça seu primeiro diagnóstico de presença visual para começar a acompanhar sua evolução.
            </p>
            <Button 
              onClick={() => navigate("/dashboard/radar-bio")}
              className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
            >
              <Target className="w-4 h-4 mr-2" />
              Fazer Diagnóstico
            </Button>
          </Card>
        ) : (
          <>
            {/* Summary Card */}
            {diagnostics.length > 1 && diagnostics[0]?.result?.resumoExecutivo && diagnostics[diagnostics.length - 1]?.result?.resumoExecutivo && (
              <Card className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Evolução Geral
                      </h3>
                      <p className="text-sm text-slate-500">
                        Comparando primeiro e último diagnóstico
                      </p>
                    </div>
                    <div className="text-right">
                      {(() => {
                        const first = diagnostics[diagnostics.length - 1];
                        const last = diagnostics[0];
                        const diff = (last.result?.resumoExecutivo?.notaGeral || 0) - (first.result?.resumoExecutivo?.notaGeral || 0);
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-slate-800">
                              {last.result?.resumoExecutivo?.notaGeral || 0}
                            </span>
                            <span className={`text-lg font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {diff >= 0 ? '+' : ''}{diff} pts
                            </span>
                            {diff > 0 ? (
                              <TrendingUp className="w-6 h-6 text-green-500" />
                            ) : diff < 0 ? (
                              <TrendingDown className="w-6 h-6 text-red-500" />
                            ) : (
                              <Minus className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Diagnostics List */}
            <div className="space-y-4">
              {diagnostics.filter(d => d.result?.resumoExecutivo).map((diagnosis, index) => {
                const validDiagnostics = diagnostics.filter(d => d.result?.resumoExecutivo);
                const currentIndex = validDiagnostics.findIndex(d => d.id === diagnosis.id);
                const prevDiagnosis = validDiagnostics[currentIndex + 1];
                const trend = prevDiagnosis?.result?.resumoExecutivo
                  ? getScoreTrend(
                      diagnosis.result.resumoExecutivo.notaGeral, 
                      prevDiagnosis.result.resumoExecutivo.notaGeral
                    )
                  : null;

                return (
                  <Card 
                    key={diagnosis.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => {/* Could navigate to detailed view */}}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Score Badge */}
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getScoreColor(diagnosis.result.resumoExecutivo.notaGeral)}`}>
                            <span className="text-2xl font-bold">
                              {diagnosis.result.resumoExecutivo.notaGeral}
                            </span>
                          </div>

                          {/* Info */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Instagram className="w-4 h-4 text-pink-500" />
                              <span className="font-medium text-slate-800">
                                @{diagnosis.instagram_handle}
                              </span>
                              {trend && (
                                <Badge variant="outline" className={`${trend.color} border-current`}>
                                  <trend.icon className="w-3 h-3 mr-1" />
                                  {trend.value}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {diagnosis.link_bio}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(diagnosis.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={`
                              ${diagnosis.result.resumoExecutivo.status === 'BOM' || diagnosis.result.resumoExecutivo.status === 'EXCELENTE'
                                ? 'bg-green-100 text-green-700' 
                                : diagnosis.result.resumoExecutivo.status === 'REGULAR'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                              }
                            `}
                          >
                            {diagnosis.result.resumoExecutivo.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>
                      </div>

                      {/* Scores Preview */}
                      <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-4">
                        {[
                          { label: "Autoridade", value: diagnosis.result.resumoExecutivo.pontuacoes.autoridadePercebida },
                          { label: "Coerência", value: diagnosis.result.resumoExecutivo.pontuacoes.coerenciaVisual },
                          { label: "Prova Social", value: diagnosis.result.resumoExecutivo.pontuacoes.provaSocial },
                          { label: "CTAs", value: diagnosis.result.resumoExecutivo.pontuacoes.conversaoCTAs },
                          { label: "Presença", value: diagnosis.result.resumoExecutivo.pontuacoes.presencaDigitalGlobal },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div className="text-lg font-semibold text-slate-700">{item.value}</div>
                            <div className="text-xs text-slate-400">{item.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Top Improvement */}
                      {diagnosis.result.melhorias && diagnosis.result.melhorias[0] && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                          <span className="text-xs font-medium text-amber-700">
                            Melhoria prioritária: 
                          </span>
                          <span className="text-xs text-amber-600 ml-1">
                            {diagnosis.result.melhorias[0].acao}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </NeuroVendasLayout>
  );
}
