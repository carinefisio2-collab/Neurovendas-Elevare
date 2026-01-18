import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ 
  message = "Carregando...", 
  subMessage,
  size = "md" 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: { icon: "w-6 h-6", container: "p-4", title: "text-sm", subtitle: "text-xs" },
    md: { icon: "w-10 h-10", container: "p-6", title: "text-base", subtitle: "text-sm" },
    lg: { icon: "w-16 h-16", container: "p-8", title: "text-lg", subtitle: "text-base" },
  };

  const s = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center ${s.container}`}>
      <Loader2 className={`${s.icon} text-purple-500 animate-spin mb-4`} />
      <p className={`${s.title} font-medium text-slate-700`}>{message}</p>
      {subMessage && (
        <p className={`${s.subtitle} text-slate-500 mt-1`}>{subMessage}</p>
      )}
    </div>
  );
}

// AI Generation Loading - with progress indicator
interface AIGenerationLoadingProps {
  title?: string;
  description?: string;
  progress?: number; // 0-100
  estimatedTime?: string;
}

export function AIGenerationLoading({
  title = "Gerando conteúdo com IA...",
  description = "Isso pode levar alguns segundos",
  progress,
  estimatedTime,
}: AIGenerationLoadingProps) {
  return (
    <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
      {/* Animated AI Icon */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse opacity-20" />
        <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-30" style={{ animationDuration: "2s" }} />
        <div className="relative w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-4">{description}</p>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="w-full max-w-xs mx-auto mb-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">{progress}% concluído</p>
        </div>
      )}

      {estimatedTime && (
        <p className="text-xs text-slate-400">
          Tempo estimado: {estimatedTime}
        </p>
      )}

      {/* Animated dots */}
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

// Full page loading overlay
interface FullPageLoadingProps {
  message?: string;
  show: boolean;
}

export function FullPageLoading({ message = "Processando...", show }: FullPageLoadingProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <LoadingSpinner message={message} size="lg" />
      </div>
    </div>
  );
}
