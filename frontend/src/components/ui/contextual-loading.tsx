import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextualLoadingProps {
  message: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

export function ContextualLoading({
  message,
  submessage,
  size = "md",
  className,
  fullScreen = false,
}: ContextualLoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const content = (
    <div className={cn("text-center", className)}>
      <div className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent mb-4 shadow-lg">
        <Loader2
          className={cn(
            sizeClasses[size],
            "text-primary animate-spin p-3"
          )}
        />
      </div>
      <p className={cn("font-medium text-foreground", textSizeClasses[size])}>
        {message}
      </p>
      {submessage && (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          {submessage}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {content}
    </div>
  );
}

// Loading states específicos por contexto
export const LoadingStates = {
  diagnosis: {
    message: "Preparando seu diagnóstico...",
    submessage: "Estamos configurando as perguntas personalizadas para você",
  },
  bioAnalysis: {
    message: "Analisando sua bio...",
    submessage: "A LucresIA está avaliando seu perfil com o método OÁSIS",
  },
  contentGeneration: {
    message: "Gerando conteúdo com IA...",
    submessage: "Criando copy estratégica baseada em NeuroVendas",
  },
  carouselGeneration: {
    message: "Criando seu carrossel...",
    submessage: "Estruturando slides com gatilhos de conversão",
  },
  ebookGeneration: {
    message: "Montando seu e-book...",
    submessage: "Isso pode levar alguns segundos. Estamos criando algo incrível para você",
  },
  blogGeneration: {
    message: "Escrevendo artigo SEO...",
    submessage: "Otimizando conteúdo para os motores de busca",
  },
  savingContent: {
    message: "Salvando...",
    submessage: "Seu conteúdo está sendo armazenado",
  },
  loadingDashboard: {
    message: "Carregando dashboard...",
    submessage: "Buscando seus dados e estatísticas",
  },
  processingImage: {
    message: "Processando imagem...",
    submessage: "Gerando visual com IA",
  },
  sendingWhatsApp: {
    message: "Preparando script...",
    submessage: "Criando mensagem estratégica de vendas",
  },
  analyzingInstagram: {
    message: "Analisando presença digital...",
    submessage: "Avaliando perfil e link da bio",
  },
};

// Hook para usar loading contextual
export function useContextualLoading() {
  return {
    LoadingStates,
    ContextualLoading,
  };
}

export default ContextualLoading;
