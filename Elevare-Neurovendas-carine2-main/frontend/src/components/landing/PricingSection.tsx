import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { planos } from '@/data/mock';

const PricingSection = () => {
  return (
    <section id="planos" className="py-20 lg:py-32 bg-gradient-to-b from-[#F9F9F9] to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#4F46E5]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-gold/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6 leading-tight">
            Escolha seu plano e{' '}
            <span className="text-[#4F46E5]">comece agora</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70 leading-relaxed">
            Sem contratos longos. Sem burocracia. Cancele quando quiser.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {planos.map((plano) => (
            <div 
              key={plano.id}
              className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                plano.highlighted 
                  ? 'border-2 border-accent-gold shadow-2xl md:scale-105 order-first md:order-none ring-2 ring-accent-gold/20' 
                  : 'border-2 border-[#4F46E5]/20 shadow-lg hover:shadow-xl hover:border-[#4F46E5]/40'
              }`}
            >
              {/* Badge */}
              {plano.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-accent-gold via-[#FFD700] to-accent-gold text-white px-6 py-2 text-sm font-bold shadow-lg">
                  ✨ {plano.badge}
                </div>
              )}
              
              {/* Accent line dourado para plano destacado */}
              {plano.highlighted && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-gold via-[#FFD700] to-accent-gold" />
              )}

              <div className="p-6 lg:p-8">
                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className={`text-xl lg:text-2xl font-bold mb-2 ${
                    plano.highlighted ? 'text-[#4F46E5]' : 'text-[#1F2937]'
                  }`}>
                    {plano.name}
                  </h3>
                  <p className="text-[#1F2937]/70 text-sm font-semibold mb-2">
                    {plano.description}
                  </p>
                  {plano.subtitle && (
                    <p className="text-[#1F2937]/60 text-xs mb-6 leading-relaxed">
                      {plano.subtitle}
                    </p>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-[#1F2937]/70">R$</span>
                    <span className={`text-4xl lg:text-5xl font-bold ${
                      plano.highlighted ? 'text-[#4F46E5]' : 'text-[#1F2937]'
                    }`}>
                      {plano.price.split(',')[0]}
                    </span>
                    {plano.price.includes(',') && (
                      <span className={`text-2xl font-bold ${
                        plano.highlighted ? 'text-[#4F46E5]' : 'text-[#1F2937]'
                      }`}>
                        ,{plano.price.split(',')[1]}
                      </span>
                    )}
                    <span className="text-[#1F2937]/70">{plano.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  {plano.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        plano.highlighted 
                          ? 'bg-accent-gold' 
                          : 'bg-[#4F46E5]/20'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          plano.highlighted ? 'text-white' : 'text-[#4F46E5]'
                        }`} />
                      </div>
                      <span className="text-sm text-[#1F2937]/80">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  className={
                    plano.highlighted 
                      ? 'btn-premium w-full' 
                      : 'btn-secondary w-full'
                  }
                  size="lg"
                  onClick={() => {
                    // Aqui vai a integração com Hotmart
                    console.log('Redirect to Hotmart:', plano.hotmartLink);
                  }}
                >
                  {plano.ctaText}
                  {plano.highlighted && <Sparkles className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-accent-gold/10 border border-accent-gold/30 px-6 py-4 rounded-full">
            <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-accent-gold" />
            </div>
            <div className="text-left">
              <div className="font-bold text-primary-dark">Garantia de 7 dias</div>
              <div className="text-sm text-primary-dark/70">
                Teste sem riscos. Não gostou? Devolvemos 100% do valor
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
