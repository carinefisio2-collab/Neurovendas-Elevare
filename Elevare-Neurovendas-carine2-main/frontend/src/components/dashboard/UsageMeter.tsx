import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import {
  Zap,
  FileText,
  BookOpen,
  MessageSquare,
  Instagram,
  AlertTriangle,
  Crown,
  TrendingUp,
  Infinity,
} from "lucide-react";

interface UsageItem {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
}

interface UsageData {
  plan: string;
  plan_name: string;
  is_beta: boolean;
  usage: {
    post: UsageItem;
    carousel: UsageItem;
    story: UsageItem;
    ebook: UsageItem;
    blog: UsageItem;
    whatsapp: UsageItem;
  };
}

const USAGE_CONFIG = [
  { key: "post", label: "Posts", icon: FileText, color: "violet" },
  { key: "story", label: "Stories", icon: Instagram, color: "pink" },
  { key: "ebook", label: "E-books", icon: BookOpen, color: "blue" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare, color: "green" },
];

export function UsageMeter({ compact = false }: { compact?: boolean }) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await api.get("/api/ai/usage");
      setUsage(response.data);
    } catch (error) {
      console.error("Error loading usage:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-20 bg-slate-100 rounded"></div>
      </Card>
    );
  }

  if (!usage) return null;

  // Beta users têm tudo ilimitado
  if (usage.is_beta) {
    return (
      <Card className="p-4 border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Infinity className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold text-violet-800">Modo Beta Ativo</p>
              <p className="text-sm text-violet-600">Todos os recursos ilimitados</p>
            </div>
          </div>
          <Badge className="bg-violet-600">BETA</Badge>
        </div>
      </Card>
    );
  }

  // Verificar se algum limite está próximo (> 80%)
  const hasWarning = USAGE_CONFIG.some((item) => {
    const data = usage.usage[item.key as keyof typeof usage.usage];
    return data && data.limit > 0 && data.percentage >= 80;
  });

  // Verificar se algum limite foi atingido (100%)
  const hasReachedLimit = USAGE_CONFIG.some((item) => {
    const data = usage.usage[item.key as keyof typeof usage.usage];
    return data && data.limit > 0 && data.percentage >= 100;
  });

  if (compact) {
    return (
      <Card className={`p-4 ${hasReachedLimit ? 'border-red-300 bg-red-50' : hasWarning ? 'border-amber-300 bg-amber-50' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Uso do Plano</span>
          <Badge variant="outline" className="text-xs">
            {usage.plan_name}
          </Badge>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {USAGE_CONFIG.map((item) => {
            const data = usage.usage[item.key as keyof typeof usage.usage];
            if (!data) return null;
            
            const isUnlimited = data.limit === -1;
            const percentage = isUnlimited ? 0 : data.percentage;
            const isWarning = percentage >= 80 && percentage < 100;
            const isLimit = percentage >= 100;

            return (
              <div key={item.key} className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${
                  isLimit ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <item.icon className={`w-4 h-4 ${
                    isLimit ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-600'
                  }`} />
                </div>
                <p className="text-xs font-medium text-slate-700">
                  {isUnlimited ? '∞' : `${data.used}/${data.limit}`}
                </p>
              </div>
            );
          })}
        </div>
        {hasReachedLimit && (
          <Link to="/dashboard/planos">
            <Button size="sm" className="w-full mt-3 bg-red-600 hover:bg-red-700">
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </Link>
        )}
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${hasReachedLimit ? 'border-red-300' : hasWarning ? 'border-amber-300' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Uso do Plano</h3>
        </div>
        <Badge variant="outline">{usage.plan_name}</Badge>
      </div>

      {hasReachedLimit && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">
            Você atingiu o limite em alguns recursos. Faça upgrade para continuar criando.
          </p>
        </div>
      )}

      {hasWarning && !hasReachedLimit && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Alguns recursos estão próximos do limite. Considere fazer upgrade.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {USAGE_CONFIG.map((item) => {
          const data = usage.usage[item.key as keyof typeof usage.usage];
          if (!data) return null;

          const isUnlimited = data.limit === -1;
          const percentage = isUnlimited ? 0 : Math.min(data.percentage, 100);
          const isWarning = percentage >= 80 && percentage < 100;
          const isLimit = percentage >= 100;

          return (
            <div key={item.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${
                    isLimit ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-500'
                  }`} />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className={`text-sm font-semibold ${
                  isLimit ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-600'
                }`}>
                  {isUnlimited ? (
                    <span className="flex items-center gap-1">
                      <Infinity className="w-4 h-4" /> Ilimitado
                    </span>
                  ) : (
                    `${data.used}/${data.limit}`
                  )}
                </span>
              </div>
              {!isUnlimited && (
                <Progress 
                  value={percentage} 
                  className={`h-2 ${
                    isLimit ? '[&>div]:bg-red-500' : 
                    isWarning ? '[&>div]:bg-amber-500' : 
                    '[&>div]:bg-violet-500'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {(hasReachedLimit || hasWarning) && (
        <Link to="/dashboard/planos">
          <Button className={`w-full mt-4 ${hasReachedLimit ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}`}>
            <Crown className="w-4 h-4 mr-2" />
            {hasReachedLimit ? 'Fazer Upgrade Agora' : 'Ver Planos'}
          </Button>
        </Link>
      )}
    </Card>
  );
}

export function UsageAlert() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await api.get("/api/ai/usage");
      setUsage(response.data);
    } catch (error) {
      console.error("Error loading usage:", error);
    }
  };

  if (!usage || usage.is_beta || dismissed) return null;

  // Verificar se algum limite foi atingido
  const limitReached = USAGE_CONFIG.find((item) => {
    const data = usage.usage[item.key as keyof typeof usage.usage];
    return data && data.limit > 0 && data.percentage >= 100;
  });

  if (!limitReached) return null;

  const data = usage.usage[limitReached.key as keyof typeof usage.usage];

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <Card className="p-4 border-red-300 bg-white shadow-lg max-w-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">Limite Atingido</p>
            <p className="text-sm text-red-600 mt-1">
              Você usou {data.used} de {data.limit} {limitReached.label.toLowerCase()} este mês.
            </p>
            <div className="flex gap-2 mt-3">
              <Link to="/dashboard/planos">
                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                  <Crown className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDismissed(true)}
              >
                Depois
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UsageMeter;
