import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles, Check, Clock, Star } from 'lucide-react';

// Paleta harmonizada com Landing Page
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#6366F1", 
  secondary: "#8B5CF6",
  accent: "#F59E0B",
  gold: "#D4AF37",
  text: "#1F2937",
  textLight: "#6B7280",
  background: "#FAFAFA",
  white: "#FFFFFF",
};

const HubInicial: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: `linear-gradient(180deg, ${COLORS.white} 0%, ${COLORS.background} 100%)` }}>
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">Elevare NeuroVendas</span>
        </div>
        <span className="text-sm text-gray-500">IA para Profissionais de Estética</span>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 leading-tight">
            Descubra Como Atrair Mais Clientes
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: COLORS.primary }}>
            Com Inteligência Artificial
          </h2>
          <p className="text-lg text-gray-600 mb-4 max-w-2xl mx-auto">
            Escolha como deseja começar sua transformação digital. Ambas as análises são{' '}
            <span className="font-semibold" style={{ color: COLORS.accent }}>100% gratuitas</span>{' '}
            e sem necessidade de cadastro.
          </p>
          
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border"
            style={{ 
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderColor: '#F59E0B'
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: COLORS.accent }} />
            <span className="text-sm font-medium" style={{ color: '#92400E' }}>
              Nenhuma opção é obrigatória. Você decide seu caminho!
            </span>
          </div>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Card 1 - Diagnóstico Profissional */}
          <div 
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #EDE9FE 0%, #DDD6FE 100%)' }}
            >
              <TrendingUp className="w-8 h-8" style={{ color: COLORS.primary }} />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Diagnóstico Profissional
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Descubra seu perfil de vendas e receba insights personalizados sobre como atrair mais clientes de alto ticket.
            </p>

            {/* Benefits */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-purple-600 mb-3 flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Você vai descobrir:
              </p>
              <ul className="space-y-2">
                {[
                  'Seu perfil de vendas atual',
                  'Pontos fortes e oportunidades',
                  'Estratégias personalizadas para crescer',
                  'Relatório completo em PDF'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/diagnostico-gratuito')}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)` }}
            >
              Começar Diagnóstico Gratuito
            </button>

            {/* Time info */}
            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Leva apenas 3 minutos • Sem cadastro necessário
            </p>
          </div>

          {/* Card 2 - Análise de Presença Digital */}
          <div 
            className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Icon */}
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'linear-gradient(135deg, #FFEDD5 0%, #FED7AA 100%)' }}
            >
              <Sparkles className="w-8 h-8" style={{ color: COLORS.accent }} />
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Análise de Presença Digital
            </h3>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              Nossa IA analisa seu Instagram e site para identificar oportunidades de atração e conversão de clientes.
            </p>

            {/* Benefits */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-3 flex items-center gap-1" style={{ color: COLORS.accent }}>
                <span>🎯</span>
                Análise Completa:
              </p>
              <ul className="space-y-2">
                {[
                  'Visual e identidade da marca',
                  'Qualidade do conteúdo',
                  'Gatilhos de conversão',
                  'Relatório visual detalhado'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <button
              onClick={() => navigate('/analise-presenca-digital')}
              className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: `linear-gradient(135deg, ${COLORS.accent} 0%, #FB923C 100%)` }}
            >
              Analisar Minha Presença Digital
            </button>

            {/* Time info */}
            <p className="text-center text-xs text-gray-500 mt-3 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Resultado em 2 minutos • Sem cadastro necessário
            </p>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Confiado por profissionais de estética em todo Brasil
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">+1.000</p>
              <p className="text-sm text-gray-500">profissionais</p>
            </div>
            <div className="w-px h-12 bg-gray-200"></div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-gray-500">4.9/5 em satisfação</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HubInicial;
