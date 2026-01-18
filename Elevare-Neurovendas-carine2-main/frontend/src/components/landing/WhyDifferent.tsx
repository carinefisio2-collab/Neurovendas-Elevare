import React from 'react';
import { Target, Heart, Sparkles, MessageCircle } from 'lucide-react';

const WhyDifferent = () => {
  const differentials = [
    {
      icon: Heart,
      title: "Feita POR e PARA esteticistas",
      description: "Não é um sistema genérico de marketing. Cada ferramenta foi pensada para a realidade de quem atende em cabine, que não tem tempo e precisa de praticidade.",
      gradient: "from-[#4F46E5] to-[#7C3AED]"
    },
    {
      icon: Target,
      title: "Te diz O QUE fazer primeiro",
      description: "Outras plataformas te dão ferramentas e você se vira. Aqui você faz um diagnóstico e descobre exatamente por onde começar.",
      gradient: "from-[#D4A853] to-[#B8860B]"
    },
    {
      icon: Sparkles,
      title: "IA que entende estética",
      description: "A LucresIA não é um robô genérico. Ela sabe a diferença entre limpeza de pele e peeling, e cria conteúdo que faz sentido pro seu público.",
      gradient: "from-[#7C3AED] to-[#4F46E5]"
    },
    {
      icon: MessageCircle,
      title: "Suporte humano de verdade",
      description: "Se você travar ou não entender algo, tem gente de verdade para te ajudar pelo WhatsApp. Nada de ficar esperando robô responder.",
      gradient: "from-[#B8860B] to-[#D4A853]"
    }
  ];

  return (
    <section className="py-14 lg:py-20 bg-gradient-to-b from-white to-[#F8F7FF] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F46E5]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6 leading-tight">
            Por que isso aqui é{' '}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#D4A853] bg-clip-text text-transparent">diferente?</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70 leading-relaxed">
            A maioria das ferramentas de marketing é feita para quem já entende de marketing. 
            Essa foi feita para quem só quer vender mais e ter tempo de viver.
          </p>
        </div>

        {/* Differentials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {differentials.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#4F46E5]/10 hover:border-[#4F46E5]/30"
              >
                {/* Icon */}
                <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#1F2937] mb-3 leading-tight">
                  {item.title}
                </h3>
                <p className="text-[#1F2937]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom Statement - Elegante */}
        <div className="text-center mt-16">
          <div className="inline-block bg-gradient-to-r from-[#4F46E5]/5 via-[#D4A853]/10 to-[#4F46E5]/5 rounded-2xl shadow-lg border border-[#D4A853]/20 px-8 py-6 max-w-3xl mx-auto">
            <p className="text-[#1F2937] mb-2">
              <span className="text-2xl">👩‍💼</span>
            </p>
            <p className="text-[#1F2937] font-medium text-lg">
              "Eu queria algo que funcionasse mesmo eu não entendendo de marketing. 
              <span className="bg-gradient-to-r from-[#4F46E5] to-[#D4A853] bg-clip-text text-transparent font-bold"> Encontrei no Elevare.</span>"
            </p>
            <p className="text-sm text-[#D4A853] mt-2 font-medium">
              — Como falam as 1.300+ esteticistas que já usam
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
