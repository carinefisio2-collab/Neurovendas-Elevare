import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WhatsAppFloat = ({ onOpenQuiz }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleClick = () => {
    setIsVisible(false);
    onOpenQuiz();
  };

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn max-w-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 w-8 h-8 bg-[#1F2937] rounded-full flex items-center justify-center hover:bg-[#4F46E5] transition-colors shadow-lg"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Content */}
            <div className="space-y-4">
              {/* Title */}
              <h3 className="font-bold text-[#1F2937] text-lg leading-tight">
                🎁 Antes de sair, leve seu diagnóstico GRATUITO
              </h3>

              <p className="text-sm text-[#1F2937]/70 leading-relaxed">
                Em apenas 5 minutos você vai descobrir exatamente onde está travando e o que precisa ajustar para crescer com lucro, posicionamento e leveza.
              </p>

              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#4F46E5] text-sm font-semibold">✓</span>
                  <span className="text-sm text-[#1F2937]/80">5 perguntas estratégicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4F46E5] text-sm font-semibold">✓</span>
                  <span className="text-sm text-[#1F2937]/80">Resultado personalizado instantâneo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#4F46E5] text-sm font-semibold">✓</span>
                  <span className="text-sm text-[#1F2937]/80">Sem cadastro de cartão</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleClick}
                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-semibold py-3 rounded-xl transition-colors border-0"
              >
                Quero Meu Diagnóstico Gratuito
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>

              {/* Social Proof */}
              <p className="text-xs text-[#1F2937]/60 text-center leading-tight">
                Mais de 1.300 profissionais de estética já fizeram. Qual será o seu resultado?
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppFloat;
