import React from 'react';
import { Calendar, CheckCircle } from 'lucide-react';

const ResultsTimeline = () => {
  const timeline = [
    {
      period: "7 dias",
      title: "Diagnóstico claro",
      description: "Você entende exatamente onde está travando e o que precisa mudar",
      icon: "🎯"
    },
    {
      period: "30 dias",
      title: "Presença digital organizada",
      description: "Conteúdo estratégico rodando, Stories planejados, comunicação consistente",
      icon: "📱"
    },
    {
      period: "90 dias",
      title: "Primeiros reajustes",
      description: "Preços valorizados, posicionamento claro, scripts de vendas aplicados",
      icon: "💰"
    },
    {
      period: "6 meses",
      title: "Negócio escalável",
      description: "Agenda cheia, lista de espera, processos rodando, você como empresária",
      icon: "🚀"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark mb-6">
            O que esperar nos{' '}
            <span className="text-primary-lavanda">primeiros meses</span>
          </h2>
          <p className="text-lg text-primary-dark/70">
            Resultados reais em um cronograma realista
          </p>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-lavanda via-accent-gold to-primary-lavanda transform -translate-x-1/2" />

            {/* Timeline Items */}
            <div className="space-y-12">
              {timeline.map((item, idx) => (
                <div 
                  key={idx}
                  className={`relative flex items-center ${
                    idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-col md:gap-8`}
                >
                  {/* Content */}
                  <div className={`w-full md:w-5/12 ${idx % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center`}>
                    <div className="bg-gradient-to-br from-neutral-light to-white p-6 rounded-2xl border-2 border-primary-lavanda/20 hover:border-primary-lavanda/40 hover:shadow-xl transition-all duration-300">
                      <div className="text-4xl mb-3">{item.icon}</div>
                      <div className="text-primary-lavanda font-bold text-lg mb-2">
                        {item.period}
                      </div>
                      <h3 className="text-xl font-bold text-primary-dark mb-2">
                        {item.title}
                      </h3>
                      <p className="text-primary-dark/70">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Center Circle */}
                  <div className="relative z-10 flex items-center justify-center my-4 md:my-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-lavanda to-accent-gold rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block w-5/12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="text-center mt-16">
          <p className="text-lg text-primary-dark">
            💡 <span className="font-semibold">Importante:</span> Os resultados dependem da sua aplicação das estratégias.
            <br />
            <span className="text-primary-dark/70">Quanto mais você aplica, mais rápido os resultados aparecem.</span>
          </p>
        </div>
      </div>
    </section>
  );
};

export default ResultsTimeline;
