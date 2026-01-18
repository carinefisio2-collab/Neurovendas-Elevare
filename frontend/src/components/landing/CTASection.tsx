import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CTASection = ({ onOpenQuiz }) => {
  return (
    <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-lavanda/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main CTA Card */}
          <div className="bg-gradient-to-br from-primary-lavanda/10 to-accent-gold/10 border-2 border-primary-lavanda/20 rounded-2xl p-8 lg:p-12 text-center shadow-lg">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark mb-4">
              Entenda seu posicionamento real no mercado
            </h2>
            <p className="text-lg sm:text-xl text-primary-dark/80 mb-8 leading-relaxed max-w-2xl mx-auto">
              Em apenas 5 minutos, descubra onde seu negócio está travando — e o que precisa ajustar para crescer com lucro, posicionamento e leveza.
            </p>

            {/* Benefits List */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-left sm:text-center">
              <div className="flex items-center gap-2 text-primary-dark/70">
                <span className="text-primary-lavanda font-bold text-xl">✓</span>
                <span>Análise de posicionamento, comunicação e modelo de negócio</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 text-left sm:text-center">
              <div className="flex items-center gap-2 text-primary-dark/70">
                <span className="text-primary-lavanda font-bold text-xl">✓</span>
                <span>18 perguntas estratégicas com diagnóstico personalizado</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 text-left sm:text-center">
              <div className="flex items-center gap-2 text-primary-dark/70">
                <span className="text-primary-lavanda font-bold text-xl">✓</span>
                <span>Resultado claro e imediato, sem burocracia</span>
              </div>
            </div>

            <Button 
              onClick={onOpenQuiz}
              size="lg"
              className="bg-primary-lavanda hover:bg-accent-gold text-white border-2 border-primary-lavanda hover:border-accent-gold font-bold px-10 py-7 text-lg group shadow-xl rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Fazer Análise Gratuita
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="mt-6 text-sm text-primary-dark/60">
              Sem cadastro de cartão • Resultado em 5 minutos • 100% gratuito
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
