import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ExitIntentPopup = ({ onOpenQuiz }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      // Check if mouse is leaving from the top of the page
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    // Add event listener after 5 seconds (give user time to see the page)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleStartQuiz = () => {
    setIsOpen(false);
    onOpenQuiz();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="bg-gradient-to-br from-[#4F46E5] to-[#4338CA] px-12 py-16 text-center text-white">
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            🎁 Antes de sair, leve seu diagnóstico GRATUITO
          </h2>

          <p className="text-lg mb-10 text-white/90 leading-relaxed max-w-xl mx-auto">
            Em apenas 5 minutos você vai descobrir exatamente onde está travando e o que precisa ajustar para crescer com lucro, posicionamento e leveza.
          </p>

          <div className="space-y-4 mb-10 max-w-md mx-auto">
            <div className="flex items-center gap-3 text-left bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="text-base">5 perguntas estratégicas</span>
            </div>
            <div className="flex items-center gap-3 text-left bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="text-base">Resultado personalizado instantâneo</span>
            </div>
            <div className="flex items-center gap-3 text-left bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">✓</span>
              </div>
              <span className="text-base">Sem cadastro de cartão</span>
            </div>
          </div>

          <Button 
            onClick={handleStartQuiz}
            size="lg"
            className="bg-white text-[#4F46E5] hover:bg-accent-gold hover:text-white font-bold px-10 py-7 text-lg rounded-2xl shadow-2xl transition-all"
          >
            Quero Meu Diagnóstico Gratuito
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="mt-8 text-sm text-white/70">
            Mais de 1.300 profissionais de estética já fizeram. Qual será o seu resultado?
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
