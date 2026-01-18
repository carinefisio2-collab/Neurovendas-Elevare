/**
 * OnboardingTour - Tour guiado para novos usuários
 * Usa driver.js (leve, ~5KB)
 * Executa apenas no primeiro login
 */
import { useEffect, useState } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const TOUR_COMPLETED_KEY = 'elevare_tour_completed';

export default function OnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Verificar se já completou o tour
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);
    if (!tourCompleted) {
      // Delay para garantir que elementos estão renderizados
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!showTour) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      popoverClass: 'elevare-tour-popover',
      nextBtnText: 'Próximo →',
      prevBtnText: '← Anterior',
      doneBtnText: 'Começar! 🚀',
      progressText: '{{current}} de {{total}}',
      onDestroyStarted: () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        driverObj.destroy();
      },
      steps: [
        {
          element: '[data-tour="menu"]',
          popover: {
            title: '📍 Menu Principal',
            description: 'Aqui você acessa todas as ferramentas do Elevare NeuroVendas.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="diagnostico"]',
          popover: {
            title: '🎯 Diagnóstico Premium',
            description: 'Descubra seu nível de maturidade digital e receba recomendações personalizadas.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="ferramentas-ia"]',
          popover: {
            title: '🤖 Ferramentas IA',
            description: 'LucresIA, Radar Bio, Robô Produtor e muito mais para turbinar seu negócio.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="upgrade"]',
          popover: {
            title: '⭐ Upgrade de Plano',
            description: 'Desbloqueie recursos premium e aumente seus créditos mensais.',
            side: 'left',
            align: 'start'
          }
        }
      ]
    });

    driverObj.drive();

    return () => driverObj.destroy();
  }, [showTour]);

  // Botão para pular tour (aparece só se tour estiver ativo)
  if (!showTour) return null;

  return (
    <button
      onClick={() => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        setShowTour(false);
      }}
      className="fixed bottom-4 right-4 z-[10001] px-4 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
    >
      Pular Tour ✕
    </button>
  );
}

// Hook para gerenciar estado do onboarding
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem(TOUR_COMPLETED_KEY);
  });

  const completeOnboarding = () => {
    localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
    setShowOnboarding(false);
  };

  return { showOnboarding, completeOnboarding };
}

// Componente exportado com nome para compatibilidade
export { OnboardingTour };

// Função para resetar o tour (útil para testes)
export function resetTour() {
  localStorage.removeItem(TOUR_COMPLETED_KEY);
}
