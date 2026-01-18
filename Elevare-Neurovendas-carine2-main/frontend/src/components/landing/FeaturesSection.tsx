import React from 'react';
import { 
  Sparkles, MessageSquare, BarChart3, 
  Clock, CheckCircle2, Smartphone
} from 'lucide-react';

const FeaturesSection = () => {
  // 3 GRANDES BENEFÍCIOS em vez de lista de 15 funcionalidades
  const beneficios = [
    {
      icon: Sparkles,
      titulo: "Conteúdo Rápido e Certo",
      subtitulo: "Nunca mais fique horas pensando no que postar",
      descricao: "A IA cria posts, legendas e stories prontos para você em segundos. É só digitar uma ideia e ela faz o resto. Como ter uma assistente de marketing que trabalha 24h.",
      exemplos: [
        "Criar post sobre limpeza de pele em 30 segundos",
        "Stories prontos para copiar e gravar",
        "Ideias de conteúdo para a semana toda"
      ],
      tempo: "~15 min para planejar a semana",
      gradient: "from-[#4F46E5] to-[#7C3AED]"
    },
    {
      icon: MessageSquare,
      titulo: "Vender Sem Medo",
      subtitulo: "Saiba exatamente o que falar para fechar",
      descricao: "Mensagens prontas para WhatsApp que funcionam. Desde a primeira resposta até o fechamento. Você não precisa inventar nada, é só copiar e adaptar.",
      exemplos: [
        "Responder cliente que perguntou preço",
        "Fazer follow-up sem parecer insistente",
        "Oferecer outros serviços após procedimento"
      ],
      tempo: "Mensagens prontas para copiar",
      gradient: "from-[#D4A853] to-[#B8860B]"
    },
    {
      icon: BarChart3,
      titulo: "Entender seu Negócio",
      subtitulo: "Saber onde você está e o que fazer primeiro",
      descricao: "Diagnósticos que mostram claramente o que está funcionando e o que precisa de atenção. Sem termos complicados, direto ao ponto.",
      exemplos: [
        "Ver se seu preço está baixo demais",
        "Entender como seu Instagram está",
        "Saber onde focar sua energia"
      ],
      tempo: "Diagnóstico em 5 minutos",
      gradient: "from-[#7C3AED] to-[#4F46E5]"
    }
  ];

  return (
    <section id="funcionalidades" className="py-14 lg:py-20 bg-gradient-to-b from-[#F8F7FF] to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6">
            3 coisas que você vai{' '}
            <span className="bg-gradient-to-r from-[#4F46E5] to-[#D4A853] bg-clip-text text-transparent">conseguir fazer</span>
          </h2>
          <p className="text-lg text-[#1F2937]/70">
            Sem complicação. Sem precisar estudar marketing. Simples como usar o WhatsApp.
          </p>
        </div>

        {/* 3 Benefícios - COM GRADIENTES LILÁS E DOURADO */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {beneficios.map((beneficio, idx) => {
            const Icon = beneficio.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg border border-[#4F46E5]/10 hover:border-[#4F46E5]/30 hover:shadow-xl transition-all duration-300"
              >
                {/* Icon e Título */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${beneficio.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#1F2937]">
                      {beneficio.titulo}
                    </h3>
                    <p className="text-sm text-[#4F46E5] font-medium">
                      {beneficio.subtitulo}
                    </p>
                  </div>
                </div>

                {/* Descrição */}
                <p className="text-[#1F2937]/70 mb-6 leading-relaxed">
                  {beneficio.descricao}
                </p>

                {/* Exemplos práticos */}
                <div className="space-y-2 mb-6">
                  {beneficio.exemplos.map((exemplo, exIdx) => (
                    <div key={exIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#D4A853] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-[#1F2937]/80">{exemplo}</span>
                    </div>
                  ))}
                </div>

                {/* Tempo - DOURADO */}
                <div className="flex items-center gap-2 pt-4 border-t border-[#4F46E5]/10">
                  <Clock className="w-4 h-4 text-[#D4A853]" />
                  <span className="text-sm font-semibold text-[#D4A853]">{beneficio.tempo}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Prova de simplicidade - ELEGANTE LILÁS E DOURADO */}
        <div className="bg-gradient-to-r from-[#4F46E5]/5 via-[#D4A853]/10 to-[#4F46E5]/5 rounded-2xl p-8 lg:p-12 border border-[#4F46E5]/10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Texto */}
            <div>
              <h3 className="text-2xl font-bold text-[#1F2937] mb-4">
                "Mas será que eu consigo usar sozinha?"
              </h3>
              <p className="text-[#1F2937]/70 mb-6 leading-relaxed">
                Se você consegue usar WhatsApp e Instagram, consegue usar o Elevare. 
                A interface foi feita para ser simples, com botões grandes e textos claros. 
                <strong className="text-[#4F46E5]"> Nada de gráficos complicados ou menus escondidos.</strong>
              </p>
              
              {/* Garantias */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-full flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#1F2937]">Funciona no celular e no computador</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#D4A853] to-[#B8860B] rounded-full flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#1F2937]">Suporte humano por WhatsApp se você travar</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[#1F2937]">Aprende a usar em menos de 10 minutos</span>
                </div>
              </div>
            </div>

            {/* Visual de interface simples */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-[#D4A853]/20">
              <div className="text-center mb-4">
                <p className="text-xs text-[#D4A853] uppercase tracking-wider font-semibold">Interface real do sistema</p>
              </div>
              
              {/* Simulação de interface simples */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-[#F8F7FF] to-white rounded-lg p-4">
                  <p className="text-sm font-medium text-[#1F2937] mb-2">O que você quer criar?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="bg-white border border-[#4F46E5]/20 rounded-lg p-3 text-sm text-[#1F2937] hover:border-[#4F46E5]/50 hover:bg-[#4F46E5]/5 transition-colors">
                      📱 Post para Instagram
                    </button>
                    <button className="bg-white border border-[#D4A853]/30 rounded-lg p-3 text-sm text-[#1F2937] hover:border-[#D4A853]/50 hover:bg-[#D4A853]/5 transition-colors">
                      💬 Mensagem WhatsApp
                    </button>
                    <button className="bg-white border border-[#D4A853]/30 rounded-lg p-3 text-sm text-[#1F2937] hover:border-[#D4A853]/50 hover:bg-[#D4A853]/5 transition-colors">
                      📖 Story pronto
                    </button>
                    <button className="bg-white border border-[#4F46E5]/20 rounded-lg p-3 text-sm text-[#1F2937] hover:border-[#4F46E5]/50 hover:bg-[#4F46E5]/5 transition-colors">
                      📊 Meu diagnóstico
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-[#D4A853] font-medium">
                    ☝️ É assim que você começa. Simples assim.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
