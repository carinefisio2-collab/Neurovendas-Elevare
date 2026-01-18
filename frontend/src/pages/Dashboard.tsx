/**
 * Dashboard Elevare - Camada Iniciante
 * 
 * Estratégia: Dashboard como ROTEIRO, não menu
 * - Máximo 4 ações visíveis
 * - Quick Win obrigatório
 * - Progresso visual claro
 */

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import OnboardingPremium from "@/components/OnboardingPremium";
import { OnboardingTour, useOnboarding } from "@/components/OnboardingTour";
import { UsageMeter, UsageAlert } from "@/components/dashboard/UsageMeter";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  BookOpen,
  Users,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  PenTool,
  Send,
  MessageSquare,
  CheckCircle,
  Clock,
  ChevronRight,
  Target,
  Zap,
  Crown,
} from "lucide-react";

interface DashboardStats {
  leads_total: number;
  leads_quentes: number;
  leads_mornos: number;
  agendamentos: number;
  faturamento: number;
  conteudos_gerados: number;
  ebooks_gerados: number;
  personas_criadas: number;
  credits_remaining: number;
  xp: number;
  level: number;
}

// Etapas do roteiro
interface Etapa {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  acao: string;
  href: string;
  icon: any;
  completo: boolean;
}

export default function Dashboard() {
  const { user, refetchUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showOnboarding: showTour, completeOnboarding } = useOnboarding();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [previousLevel, setPreviousLevel] = useState(0);

  const diagnosticoCompleto = user?.diagnosis_completed || false;
  const primeiroConteudoCriado = (stats?.conteudos_gerados || 0) > 0;
  const temLeads = (stats?.leads_total || 0) > 0;
  
  // Sistema de XP e Level
  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const xpForNextLevel = currentLevel * 100; // 100 XP por nível
  const xpProgress = (currentXP % 100) / 100 * 100; // Percentual até próximo nível

  useEffect(() => {
    if (user && !user.onboarding_completed) {
      setShowOnboarding(true);
    }

    const fetchStats = async () => {
      try {
        const response = await api.get("/api/dashboard/stats");
        setStats(response.data.stats);
        
        // Detectar level up
        const storedLevel = localStorage.getItem('user_level');
        if (storedLevel && parseInt(storedLevel) < currentLevel) {
          setShowLevelUp(true);
          setPreviousLevel(parseInt(storedLevel));
          setTimeout(() => setShowLevelUp(false), 5000);
        }
        localStorage.setItem('user_level', currentLevel.toString());
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, currentLevel]);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    await refetchUser();
  };

  // Roteiro de 3 etapas (Camada Iniciante)
  const etapas: Etapa[] = [
    {
      id: "primeiro-post",
      numero: 1,
      titulo: "Criar primeiro conteúdo",
      descricao: "Post que converte em 2 minutos",
      acao: "Criar Post Estratégico",
      href: "/dashboard/robo-produtor",
      icon: Bot,
      completo: primeiroConteudoCriado,
    },
    {
      id: "scripts",
      numero: 2,
      titulo: "Organizar vendas",
      descricao: "Scripts de venda prontos",
      acao: "Ver Scripts de Venda",
      href: "/dashboard/whatsapp",
      icon: Send,
      completo: false,
    },
    {
      id: "leads",
      numero: 3,
      titulo: "Acompanhar leads",
      descricao: "Organize suas oportunidades",
      acao: "Gerenciar Leads",
      href: "/dashboard/leads",
      icon: Users,
      completo: temLeads,
    },
  ];

  // Encontrar próxima etapa
  const proximaEtapa = etapas.find(e => !e.completo) || etapas[0];
  const etapasCompletas = etapas.filter(e => e.completo).length;

  // Sistema de Níveis - Ferramentas por nível
  const getFerramentasPorNivel = () => {
    const todasFerramentas = [
      { titulo: "Stories", href: "/dashboard/stories", icon: PenTool, nivelMinimo: 2 },
      { titulo: "Scripts", href: "/dashboard/whatsapp", icon: MessageSquare, nivelMinimo: 2 },
      { titulo: "E-books", href: "/dashboard/ebooks", icon: BookOpen, nivelMinimo: 3 },
      { titulo: "Artigos", href: "/dashboard/blog", icon: FileText, nivelMinimo: 3 },
      { titulo: "Calendário", href: "/dashboard/calendario", icon: Calendar, nivelMinimo: 3 },
    ];

    return {
      liberadas: todasFerramentas.filter(f => currentLevel >= f.nivelMinimo),
      bloqueadas: todasFerramentas.filter(f => currentLevel < f.nivelMinimo),
    };
  };

  const { liberadas: ferramentasLiberadas, bloqueadas: ferramentasBloqueadas } = getFerramentasPorNivel();

  return (
    <>
      <OnboardingPremium
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      {showTour && (
        <OnboardingTour
          onComplete={completeOnboarding}
          onSkip={completeOnboarding}
        />
      )}

      <NeuroVendasLayout>
        <div className="max-w-3xl mx-auto">
          
          {/* Header simples */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground">
              Olá, {user?.name?.split(" ")[0] || "Profissional"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {etapasCompletas} de 3 etapas concluídas
            </p>
          </div>

          {/* Card de XP e Level - ATUALIZADO com lista de ações */}
          <Card className="p-6 mb-6 border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seu Nível</p>
                  <p className="text-2xl font-bold text-foreground">Level {currentLevel}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">XP Total</p>
                <p className="text-xl font-semibold text-primary">{currentXP} XP</p>
              </div>
            </div>
            
            {/* Barra de XP */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progresso para Level {currentLevel + 1}</span>
                <span className="font-medium text-foreground">{Math.round(xpProgress)}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Faltam <span className="font-semibold text-primary">{xpForNextLevel - (currentXP % 100)} XP</span> para o próximo nível
              </p>
            </div>

            {/* Lista de ações que ganham XP */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Como ganhar XP
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Diagnóstico = <span className="text-primary font-semibold">+100 XP</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>E-book = <span className="text-primary font-semibold">+50 XP</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Criar post = <span className="text-primary font-semibold">+20 XP</span></span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Análise Bio = <span className="text-primary font-semibold">+15 XP</span></span>
                </div>
              </div>
            </div>
          </Card>

          {/* Indicador de Uso do Plano */}
          <div className="mb-6">
            <UsageMeter compact />
          </div>

          {/* Notificação de Level Up */}
          {showLevelUp && (
            <Card className="p-6 mb-6 border-2 border-green-500 shadow-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 animate-in slide-in-from-top">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-bounce">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    🎉 Você evoluiu para o Level {currentLevel}!
                  </h3>
                  <p className="text-muted-foreground">
                    Novas ferramentas desbloqueadas. Continue criando conteúdo estratégico!
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Card de Progresso das Etapas */}
          <Card className="p-6 mb-8 border-0 shadow-sm bg-card">
            {/* Barra de progresso */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(etapasCompletas / 4) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                {etapasCompletas}/4
              </span>
            </div>

            {/* Lista de etapas */}
            <div className="space-y-3">
              {etapas.map((etapa) => {
                const Icon = etapa.icon;
                const isAtiva = etapa.id === proximaEtapa.id && !etapa.completo;
                
                return (
                  <div
                    key={etapa.id}
                    onClick={() => navigate(etapa.href)}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200
                      ${etapa.completo 
                        ? "bg-secondary/50 opacity-60" 
                        : isAtiva 
                          ? "bg-primary/5 border-2 border-primary/20 shadow-sm" 
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }
                    `}
                    data-testid={`etapa-${etapa.id}`}
                  >
                    {/* Indicador de status */}
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      ${etapa.completo 
                        ? "bg-emerald-100 text-emerald-600" 
                        : isAtiva 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                      }
                    `}>
                      {etapa.completo ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${etapa.completo ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {etapa.titulo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {etapa.descricao}
                      </p>
                    </div>

                    {/* Ação */}
                    {!etapa.completo && (
                      <ChevronRight className={`w-5 h-5 ${isAtiva ? "text-primary" : "text-muted-foreground"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Win - Criar primeiro conteúdo */}
          {!primeiroConteudoCriado && (
            <Card className="p-6 mb-8 border-0 shadow-sm bg-gradient-to-br from-primary/5 to-accent">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">
                    Sua primeira vitória rápida
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie seu primeiro post estratégico em menos de 2 minutos.
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard/robo-produtor")}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="quick-win-cta"
                  >
                    Criar Post Estratégico
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Ferramentas por Nível */}
          <div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
                Ferramentas (Level {currentLevel})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Ferramentas liberadas */}
                {ferramentasLiberadas.map((ferramenta) => {
                  const Icon = ferramenta.icon;
                  return (
                    <button
                      key={ferramenta.titulo}
                      onClick={() => navigate(ferramenta.href)}
                      className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
                      data-testid={`ferramenta-${ferramenta.titulo.toLowerCase()}`}
                    >
                      <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-foreground">
                        {ferramenta.titulo}
                      </span>
                    </button>
                  );
                })}
                
                {/* Ferramentas bloqueadas */}
                {ferramentasBloqueadas.map((ferramenta) => {
                  const Icon = ferramenta.icon;
                  return (
                    <div
                      key={ferramenta.titulo}
                      className="flex flex-col items-center gap-2 p-4 bg-card/50 rounded-xl border border-border/30 opacity-50 cursor-not-allowed relative"
                      data-testid={`ferramenta-bloqueada-${ferramenta.titulo.toLowerCase()}`}
                      title={`Desbloqueie no Level ${ferramenta.nivelMinimo}`}
                    >
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {ferramenta.nivelMinimo}
                      </div>
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        {ferramenta.titulo}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Level {ferramenta.nivelMinimo}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          {/* Indicador de créditos BETA (informativo apenas) */}
          {stats && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  Modo BETA Ativo
                </span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Ilimitado ∞
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Todos os recursos desbloqueados durante o período beta
              </p>
            </div>
          )}

        </div>
      </NeuroVendasLayout>
      
      {/* Alerta de limite atingido (fixed no canto inferior) */}
      <UsageAlert />
    </>
  );
}
