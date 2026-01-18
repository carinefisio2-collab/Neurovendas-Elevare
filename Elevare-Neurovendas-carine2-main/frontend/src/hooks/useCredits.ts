/**
 * Hook de verificação de créditos
 * Impede uso de ferramentas com saldo insuficiente
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface CreditCheck {
  hasCredits: boolean;
  currentBalance: number;
  requiredCredits: number;
}

export function useCredits() {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);

  const checkCredits = useCallback(async (requiredAmount: number): Promise<CreditCheck> => {
    setChecking(true);
    try {
      const response = await api.get('/api/auth/me');
      const currentBalance = response.data.user?.credits_remaining || 0;
      
      if (currentBalance < requiredAmount) {
        toast({
          title: "Créditos insuficientes",
          description: `Você precisa de ${requiredAmount} créditos, mas tem apenas ${currentBalance}. Adquira mais créditos para continuar.`,
          variant: "destructive",
        });
        return {
          hasCredits: false,
          currentBalance,
          requiredCredits: requiredAmount
        };
      }

      return {
        hasCredits: true,
        currentBalance,
        requiredCredits: requiredAmount
      };
    } catch (error) {
      toast({
        title: "Erro ao verificar créditos",
        description: "Não foi possível verificar seu saldo. Tente novamente.",
        variant: "destructive",
      });
      return {
        hasCredits: false,
        currentBalance: 0,
        requiredCredits: requiredAmount
      };
    } finally {
      setChecking(false);
    }
  }, [toast]);

  const consumeWithCheck = useCallback(async <T>(
    requiredAmount: number,
    operation: () => Promise<T>,
    operationName: string = "operação"
  ): Promise<T | null> => {
    const check = await checkCredits(requiredAmount);
    
    if (!check.hasCredits) {
      return null;
    }

    try {
      const result = await operation();
      toast({
        title: "Sucesso!",
        description: `${operationName} concluída. ${requiredAmount} crédito(s) consumido(s).`,
      });
      return result;
    } catch (error: any) {
      // Check if it's a credit error from backend
      if (error.response?.status === 402 || error.response?.data?.detail?.includes('crédito')) {
        toast({
          title: "Créditos insuficientes",
          description: "Seu saldo foi atualizado. Adquira mais créditos para continuar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro na operação",
          description: error.response?.data?.detail || "Algo deu errado. Tente novamente.",
          variant: "destructive",
        });
      }
      return null;
    }
  }, [checkCredits, toast]);

  return {
    checkCredits,
    consumeWithCheck,
    checking
  };
}
