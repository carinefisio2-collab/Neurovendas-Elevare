import { useState, useEffect } from 'react';
import { Sparkles, Brain, Wand2, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIProgressStep {
  id: string;
  label: string;
  description?: string;
}

interface AIProgressProps {
  isLoading: boolean;
  steps?: AIProgressStep[];
  currentStep?: number;
  estimatedTime?: number; // in seconds
  title?: string;
  subtitle?: string;
  className?: string;
}

const DEFAULT_STEPS: AIProgressStep[] = [
  { id: 'analyzing', label: 'Analisando contexto', description: 'Entendendo seu pedido...' },
  { id: 'generating', label: 'Gerando conteúdo', description: 'Criando com IA Elevare...' },
  { id: 'optimizing', label: 'Otimizando resultado', description: 'Aplicando método NeuroVendas...' },
  { id: 'finalizing', label: 'Finalizando', description: 'Preparando entrega...' },
];

export function AIProgress({
  isLoading,
  steps = DEFAULT_STEPS,
  currentStep: externalCurrentStep,
  estimatedTime = 15,
  title = 'Gerando conteúdo...',
  subtitle = 'LucresIA está trabalhando no seu pedido',
  className,
}: AIProgressProps) {
  const [internalStep, setInternalStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalStep;

  useEffect(() => {
    if (!isLoading) {
      setInternalStep(0);
      setProgress(0);
      setElapsedTime(0);
      return;
    }

    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        const increment = Math.random() * 3 + 1;
        return Math.min(prev + increment, 95);
      });
    }, 500);

    // Step advancement
    const stepInterval = setInterval(() => {
      setInternalStep((prev) => {
        if (prev >= steps.length - 1) return prev;
        return prev + 1;
      });
    }, (estimatedTime * 1000) / steps.length);

    // Elapsed time counter
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearInterval(timeInterval);
    };
  }, [isLoading, steps.length, estimatedTime]);

  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
      data-testid="ai-progress-overlay"
    >
      <div className="w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl p-8 animate-scale-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] mb-4 shadow-lg shadow-primary/30">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{Math.round(progress)}%</span>
            <span>{elapsedTime}s</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isPending = index > currentStep;

            return (
              <div
                key={step.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                  isCompleted && 'bg-primary/5',
                  isCurrent && 'bg-primary/10 border border-primary/20',
                  isPending && 'opacity-50'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                    isCompleted && 'bg-primary/20 text-primary',
                    isCurrent && 'bg-primary text-white',
                    isPending && 'bg-secondary text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      !isCurrent && 'text-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && isCurrent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer tip */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Método Elevare NeuroVendas aplicado automaticamente</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple inline progress for smaller areas
export function AIProgressInline({
  isLoading,
  message = 'Gerando...',
}: {
  isLoading: boolean;
  message?: string;
}) {
  if (!isLoading) return null;

  return (
    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl animate-fade-up">
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] flex items-center justify-center">
        <Wand2 className="w-5 h-5 text-white animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] animate-progress-indeterminate" />
        </div>
      </div>
    </div>
  );
}

export default AIProgress;
