import React from 'react';
import { Target, DollarSign, Briefcase } from 'lucide-react';
import { diagnosticoPillars } from '@/data/mock';

const iconMap = {
  Target: Target,
  DollarSign: DollarSign,
  Briefcase: Briefcase
};

const DiagnosticPillars = () => {
  return (
    <section id="diagnostico" className="py-14 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6">
            O que você descobre na{' '}
            <span className="text-[#4F46E5]">Análise Gratuita</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70">
            Responda perguntas rápidas e veja um diagnóstico completo sobre esses 3 pontos importantes do seu negócio
          </p>
        </div>

        {/* Pillars Grid - SÓ ÍCONES (sem números) */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {diagnosticoPillars.map((pillar) => {
            const Icon = iconMap[pillar.icon];
            return (
              <div 
                key={pillar.id}
                className="group relative bg-[#F8F7FF] p-8 rounded-2xl border border-[#4F46E5]/15 hover:border-[#4F46E5]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-14 h-14 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#1F2937] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[#4F46E5] font-semibold mb-3 text-base">
                  {pillar.question}
                </p>
                <p className="text-[#1F2937]/70 leading-relaxed text-sm">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DiagnosticPillars;
