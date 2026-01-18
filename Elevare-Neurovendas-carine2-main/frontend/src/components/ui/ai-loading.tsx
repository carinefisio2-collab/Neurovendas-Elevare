/**
 * Componente de Loading com Timeout
 * Mostra mensagem de erro se a operação demorar mais de 30 segundos
 */

import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AILoadingProps {
  isLoading: boolean;
  message?: string;
  subMessage?: string;
  timeoutSeconds?: number;
  onTimeout?: () => void;
  onRetry?: () => void;
}

export function AILoading({
  isLoading,
  message = "Processando com IA...",
  subMessage = "Isso pode levar alguns segundos",
  timeoutSeconds = 30,
  onTimeout,
  onRetry,
}: AILoadingProps) {
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setElapsed(0);
      setTimedOut(false);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 1;
        if (newElapsed >= timeoutSeconds && !timedOut) {
          setTimedOut(true);
          onTimeout?.();
        }
        return newElapsed;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, timeoutSeconds, timedOut, onTimeout]);

  if (!isLoading) return null;

  if (timedOut) {
    return (
      <div className="p-8 bg-white border border-orange-200 rounded-xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-4">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Operação demorada
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          A geração está demorando mais que o esperado. Isso pode acontecer em momentos de alta demanda.
        </p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </Button>
          )}
          <Button onClick={() => setTimedOut(false)} variant="ghost">
            Continuar aguardando
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tempo decorrido: {elapsed}s
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border border-slate-200 rounded-xl text-center">
      {/* Animated Icon */}
      <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-pulse opacity-20" />
        <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-ping opacity-30" style={{ animationDuration: "2s" }} />
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-2">{message}</h3>
      <p className="text-slate-500 text-sm mb-4">{subMessage}</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs mx-auto mb-4">
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${Math.min((elapsed / timeoutSeconds) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2">{elapsed}s / {timeoutSeconds}s</p>
      </div>

      {/* Animated dots */}
      <div className="flex justify-center gap-1">
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}

/**
 * Componente de Créditos Insuficientes
 */

interface InsufficientCreditsProps {
  currentBalance: number;
  requiredCredits: number;
  onUpgrade?: () => void;
}

export function InsufficientCredits({
  currentBalance,
  requiredCredits,
  onUpgrade,
}: InsufficientCreditsProps) {
  return (
    <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-amber-800 mb-1">
            Créditos insuficientes
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            Esta operação requer <strong>{requiredCredits}</strong> créditos, mas você tem apenas <strong>{currentBalance}</strong>.
          </p>
          {onUpgrade && (
            <Button 
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              size="sm"
            >
              Adquirir mais créditos
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
