import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';

const BeforeAfter = () => {
  const comparison = {
    before: [
      "Cobrando barato por medo de perder cliente",
      "Agenda vazia ou lotada nos dias errados",
      "Correndo o dia todo, sem tempo de parar",
      "Instagram abandonado, postando quando dá",
      "Sem saber se está tendo lucro ou prejuízo"
    ],
    after: [
      "Cobrando o que seu trabalho realmente vale",
      "Clientes entrando em contato toda semana",
      "Conseguindo organizar a rotina e respirar",
      "Sabendo o que postar sem ficar horas pensando",
      "Entendendo para onde está indo seu dinheiro"
    ]
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-[#F8F7FF] via-white to-[#FDF8E8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-4">
            A transformação que você{' '}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#D4A853] bg-clip-text text-transparent">vai viver</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70">
            Compare onde você está agora com onde pode chegar usando o Elevare
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* BEFORE - Lilás suave */}
          <div className="bg-white p-8 rounded-2xl border border-[#4F46E5]/20 relative shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6B7280] to-[#9CA3AF] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
              ❌ Antes
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-bold text-[#4F46E5] mb-4">
                Você no piloto automático
              </h3>
              {comparison.before.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#4F46E5]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <X className="w-4 h-4 text-[#4F46E5]/60" />
                  </div>
                  <span className="text-[#1F2937]/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AFTER - Dourado elegante */}
          <div className="bg-gradient-to-br from-[#FDF8E8] to-white p-8 rounded-2xl border-2 border-[#D4A853] relative shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#D4A853] to-[#B8860B] text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Depois
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-bold text-[#B8860B] mb-4">
                Você no controle
              </h3>
              {comparison.after.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#D4A853] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#1F2937] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Highlight - Elegante */}
        <div className="text-center mt-10">
          <div className="inline-block bg-gradient-to-r from-[#4F46E5]/10 via-[#D4A853]/20 to-[#4F46E5]/10 px-8 py-4 rounded-full">
            <p className="text-lg font-semibold text-[#1F2937]">
              A diferença entre onde você está e onde quer chegar é{' '}
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#D4A853] bg-clip-text text-transparent font-bold">organização + as ferramentas certas</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;
