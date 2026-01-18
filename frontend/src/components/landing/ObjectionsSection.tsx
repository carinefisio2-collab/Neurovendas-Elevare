import React from 'react';
import { Shield, AlertCircle, HelpCircle } from 'lucide-react';

const ObjectionsSection = () => {
  const objections = [
    {
      icon: HelpCircle,
      objection: "Não tenho tempo para aprender",
      answer: "Em 15 minutos você já está usando. Interface intuitiva como Instagram.",
      color: "from-primary-lavanda to-secondary-lavanda"
    },
    {
      icon: AlertCircle,
      objection: "Não entendo de tecnologia",
      answer: "Não precisa! É tão simples quanto usar WhatsApp. Tutoriais em vídeo guiam você.",
      color: "from-accent-gold to-primary-lavanda"
    },
    {
      icon: Shield,
      objection: "E se não funcionar pra mim?",
      answer: "7 dias de garantia incondicional. Não gostou? Devolvemos 100% do valor.",
      color: "from-secondary-lavanda to-accent-gold"
    },
    {
      icon: HelpCircle,
      objection: "Já tentei outras coisas",
      answer: "Elevare não é genérico. É feito especificamente para esteticistas, com sua linguagem.",
      color: "from-primary-dark to-primary-lavanda"
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-dark mb-6">
            Suas dúvidas,{' '}
            <span className="text-primary-lavanda">respondidas</span>
          </h2>
          <p className="text-lg text-primary-dark/70">
            Sabemos o que você está pensando. Veja as respostas:
          </p>
        </div>

        {/* Objections Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {objections.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group bg-gradient-to-br from-neutral-light to-white p-8 rounded-2xl border-2 border-primary-lavanda/20 hover:border-primary-lavanda/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-6`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-primary-dark/60 mb-2">
                    "{item.objection}"
                  </h3>
                </div>
                <p className="text-lg font-semibold text-primary-dark leading-relaxed">
                  ✓ {item.answer}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ObjectionsSection;
