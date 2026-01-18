import React from 'react';
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      number: "1",
      title: "Responda 18 perguntas",
      description: "Sobre seu negócio, preços, rotina e Instagram. Leva uns 8 minutos. Não precisa pensar muito, é só ser sincera.",
      oquevocerecebe: "Nada ainda, é só você respondendo",
      tempo: "~8 min"
    },
    {
      number: "2",
      title: "Veja seu resultado na hora",
      description: "Um índice de 0 a 100 que mostra como está seu negócio. Com seu ponto forte e seu maior gargalo identificados.",
      oquevocerecebe: "Relatório que você pode baixar ou só ver na tela",
      tempo: "Instantâneo"
    },
    {
      number: "3",
      title: "Decida o que fazer",
      description: "Você escolhe: baixar seu relatório e sair OU criar conta gratuita para analisar seu Instagram e ganhar 100 créditos mensais.",
      oquevocerecebe: "Acesso gratuito às ferramentas (se quiser)",
      tempo: "Você decide"
    }
  ];

  return (
    <section className="py-14 lg:py-20 bg-gradient-to-b from-white to-[#F8F7FF]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6">
            O que acontece quando eu clicar em{' '}
            <span className="text-[#4F46E5]">"Começar"</span>?
          </h2>
          <p className="text-lg text-[#1F2937]/70">
            Sem surpresas. Sem pegadinhas. Você sempre sabe o próximo passo.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-6 lg:p-8 border border-[#4F46E5]/15 hover:border-[#4F46E5]/30 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Number Badge - MAIOR E MAIS DESTACADO */}
                  <div className="flex items-center gap-4 lg:w-1/4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4F46E5]/30 flex-shrink-0">
                      <span className="text-3xl font-bold text-white">{step.number}</span>
                    </div>
                    <div className="lg:hidden">
                      <h3 className="text-lg font-bold text-[#1F2937]">{step.title}</h3>
                      <span className="text-sm text-[#D4A853] font-semibold">{step.tempo}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 lg:w-2/4">
                    <div className="hidden lg:block">
                      <h3 className="text-xl font-bold text-[#1F2937] mb-1">{step.title}</h3>
                      <span className="text-sm text-[#D4A853] font-semibold">{step.tempo}</span>
                    </div>
                    <p className="text-[#1F2937]/70 leading-relaxed mt-2">
                      {step.description}
                    </p>
                  </div>

                  {/* O que você recebe - DOURADO */}
                  <div className="lg:w-1/4 bg-gradient-to-br from-[#FDF8E8] to-[#FEF3CD] rounded-xl p-4 border border-[#D4A853]/30">
                    <p className="text-xs text-[#B8860B] font-bold uppercase tracking-wider mb-1">
                      O que você recebe:
                    </p>
                    <p className="text-sm text-[#1F2937]">
                      {step.oquevocerecebe}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Garantias de transparência - LILÁS E DOURADO */}
        <div className="mt-10 bg-gradient-to-r from-[#4F46E5]/10 via-[#D4A853]/10 to-[#4F46E5]/10 border border-[#4F46E5]/20 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
          <h3 className="text-lg font-bold text-[#4F46E5] mb-4 text-center">
            🔒 Garantias de Transparência
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D4A853] flex-shrink-0" />
              <span className="text-sm text-[#1F2937]">Ninguém vai te ligar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D4A853] flex-shrink-0" />
              <span className="text-sm text-[#1F2937]">Não pede cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D4A853] flex-shrink-0" />
              <span className="text-sm text-[#1F2937]">Pode sair a qualquer momento</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#D4A853] flex-shrink-0" />
              <span className="text-sm text-[#1F2937]">Resultado na hora, sem espera</span>
            </div>
          </div>
        </div>

        {/* Nota sobre suporte */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4F46E5]/10 to-[#D4A853]/10 px-5 py-3 rounded-full border border-[#4F46E5]/20">
            <MessageCircle className="w-5 h-5 text-[#4F46E5]" />
            <span className="text-sm text-[#1F2937] font-medium">
              Dúvidas? Nosso suporte humano responde pelo WhatsApp
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
