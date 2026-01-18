import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Instagram,
  BookOpen,
  MessageSquare,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

interface NextStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  xp: number;
  color: string;
}

const NEXT_STEPS: NextStep[] = [
  {
    id: "stories",
    title: "Criar Stories",
    description: "Complemente seu post com uma sequência de stories",
    icon: Instagram,
    href: "/dashboard/stories",
    xp: 15,
    color: "pink",
  },
  {
    id: "ebook",
    title: "Criar E-book",
    description: "Transforme seu conteúdo em um material rico",
    icon: BookOpen,
    href: "/dashboard/ebooks",
    xp: 50,
    color: "blue",
  },
  {
    id: "whatsapp",
    title: "Script WhatsApp",
    description: "Crie um script de vendas para WhatsApp",
    icon: MessageSquare,
    href: "/dashboard/whatsapp",
    xp: 10,
    color: "green",
  },
  {
    id: "calendario",
    title: "Agendar no Calendário",
    description: "Organize suas publicações da semana",
    icon: Calendar,
    href: "/dashboard/calendario",
    xp: 5,
    color: "violet",
  },
];

interface NextStepsProps {
  currentAction?: string; // 'post' | 'carousel' | 'story' | 'ebook'
  onDismiss?: () => void;
}

export function NextSteps({ currentAction = "post", onDismiss }: NextStepsProps) {
  // Filtrar próximos passos baseado na ação atual
  const filteredSteps = NEXT_STEPS.filter((step) => {
    if (currentAction === "post" || currentAction === "carousel") {
      return step.id !== "calendario"; // Mostrar stories, ebook, whatsapp
    }
    if (currentAction === "story") {
      return step.id !== "stories"; // Não sugerir stories se acabou de criar
    }
    return true;
  }).slice(0, 3); // Máximo 3 sugestões

  return (
    <Card className="p-6 border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            🎉 Conteúdo criado com sucesso!
          </h3>
          <p className="text-sm text-slate-500">Continue ganhando XP</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Que tal dar o próximo passo? Aqui estão algumas sugestões:
      </p>

      <div className="space-y-3">
        {filteredSteps.map((step) => (
          <Link key={step.id} to={step.href}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-800 border hover:border-violet-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-lg bg-${step.color}-100 flex items-center justify-center`}>
                <step.icon className={`w-5 h-5 text-${step.color}-600`} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-violet-600 transition-colors">
                  {step.title}
                </p>
                <p className="text-xs text-slate-500">{step.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">
                  +{step.xp} XP
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 text-slate-500"
          onClick={onDismiss}
        >
          Continuar depois
        </Button>
      )}
    </Card>
  );
}

// Componente compacto para mostrar inline
export function NextStepInline({ 
  title, 
  href, 
  xp 
}: { 
  title: string; 
  href: string; 
  xp: number;
}) {
  return (
    <Link to={href}>
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer">
        <span className="text-sm text-violet-700">{title}</span>
        <span className="text-xs font-semibold text-violet-600 bg-white px-2 py-0.5 rounded-full">
          +{xp} XP
        </span>
        <ArrowRight className="w-3 h-3 text-violet-500" />
      </div>
    </Link>
  );
}

// Componente de conquista após criação
export function CreationSuccess({ 
  type,
  xpEarned = 20,
  onClose 
}: { 
  type: string;
  xpEarned?: number;
  onClose?: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in">
      <Card className="max-w-md w-full mx-4 p-6 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          🎉 {type} criado!
        </h2>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-semibold mb-4">
          <Sparkles className="w-4 h-4" />
          +{xpEarned} XP ganhos
        </div>
        
        <p className="text-slate-600 mb-6">
          Seu conteúdo está pronto! Continue criando para subir de nível.
        </p>

        <div className="space-y-2">
          <Link to="/dashboard/stories">
            <Button className="w-full" variant="default">
              <Instagram className="w-4 h-4 mr-2" />
              Criar Stories complementares
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onClose}
          >
            Voltar ao Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default NextSteps;
