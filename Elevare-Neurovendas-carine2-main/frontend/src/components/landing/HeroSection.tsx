import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { heroData } from '@/data/mock';

const HeroSection = ({ onOpenQuiz }) => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-[#F9F9F9] to-white pt-24">
      {/* Decorative Elements - Lilás e Dourado */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#4F46E5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Headline - TEXTO PRETO UNIFICADO */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] leading-tight">
              Pare de se sentir perdida no Instagram. Saiba o que postar, quando postar e como vender seus serviços de estética.
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[#1F2937]/70 leading-relaxed">
              {heroData.subheadline}
            </p>

            {/* CTA Section */}
            <div className="space-y-4 pt-2">
              <Button 
                onClick={onOpenQuiz}
                className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold text-lg px-8 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all group border-0"
                size="lg"
              >
                {heroData.ctaText}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-sm text-[#1F2937]/60">
                {heroData.ctaSubtext}
              </p>
            </div>
          </div>

          {/* Right Image - Platform Screenshot */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#4F46E5]/20 h-[500px] lg:h-[600px]">
              {/* Solid overlay to hide LUCRESIA IA text */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white to-transparent z-10" />
              
              <img 
                src={heroData.heroImage}
                alt={heroData.imageAlt}
                className="w-full h-full object-cover"
                style={{ objectPosition: '50% 65%' }}
              />
              
              {/* Accent decorativo */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F46E5] via-accent-gold to-[#8B5CF6]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
