import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Award, ArrowRight, CheckCircle, Target, TrendingUp, Brain, Calendar, Users } from "lucide-react";
import confetti from "canvas-confetti";

// Paleta harmonizada com Landing Page
const COLORS = {
  primary: "#4F46E5",
  primaryLight: "#6366F1",
  secondary: "#8B5CF6",
  gold: "#D4AF37",
  text: "#1F2937",
  textLight: "#6B7280",
};

export default function DiagnosticsComplete() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Disparar confetti na entrada
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4F46E5', '#6366F1', '#D4AF37', '#8B5CF6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4F46E5', '#6366F1', '#D4AF37', '#8B5CF6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Mostrar conteúdo com delay
    setTimeout(() => setShowContent(true), 500);
  }, []);

  const handleEntrarPlataforma = () => {
    navigate("/cadastro-plataforma");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F9F9F9] to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#4F46E5]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#8B5CF6]/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className={`max-w-3xl mx-auto transition-all duration-1000 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          
          {/* Header Celebração */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] text-white rounded-full text-sm font-medium mb-6 shadow-lg">
              <Award className="w-4 h-4" />
              Conquista Desbloqueada!
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-[#1F2937] mb-4">
              🎉 Parabéns!!!
            </h1>
            
            <p className="text-xl text-[#4F46E5] font-semibold">
              Você concluiu seu Diagnóstico Profissional e Análise de Presença Digital.
            </p>
          </div>

          {/* Card Principal */}
          <Card className="p-8 bg-white/90 backdrop-blur-sm border-0 shadow-2xl rounded-3xl mb-8">
            {/* Mensagem Estratégica */}
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] shadow-lg mx-auto">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <div className="space-y-4">
                <p className="text-lg text-[#1F2937] leading-relaxed font-medium">
                  Isso não é só um relatório: é um <span className="text-[#4F46E5] font-bold">espelho estratégico</span> do seu posicionamento hoje e do potencial que você pode destravar a partir daqui!
                </p>
              </div>

              {/* Badge de Créditos */}
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border-2 border-[#D4AF37] rounded-2xl">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <span className="text-2xl">🎁</span>
                </div>
                <div className="text-left">
                  <p className="text-sm text-[#6B7280]">Você conquistou</p>
                  <p className="text-2xl font-bold text-[#D4AF37]">100 créditos mensais gratuitos</p>
                </div>
              </div>

              <div className="space-y-4 text-left bg-[#F9F9F9] rounded-2xl p-6">
                <p className="text-[#1F2937] leading-relaxed">
                  Na prática, isso significa ter acesso a um <span className="font-semibold">ecossistema que te ajuda a pensar, comunicar e vender melhor</span>, mesmo com a rotina cheia da clínica.
                </p>

                <p className="text-[#1F2937] leading-relaxed">
                  Aqui, você transforma <span className="text-[#4F46E5] font-semibold">conhecimento em autoridade</span>, <span className="text-[#4F46E5] font-semibold">autoridade em confiança</span>, e <span className="text-[#4F46E5] font-semibold">confiança em agenda cheia</span> — com estratégia, constância e inteligência artificial trabalhando a seu favor.
                </p>

                <p className="text-[#1F2937] leading-relaxed">
                  Você já deu o passo mais difícil: <span className="font-semibold">enxergar onde está</span>. Agora é sobre evoluir com método.
                </p>
              </div>

              <div className="pt-4">
                <p className="text-xl font-bold text-[#4F46E5]">
                  Seja bem-vinda ao próximo nível da sua presença profissional. ✨
                </p>
              </div>
            </div>
          </Card>

          {/* O que você terá acesso */}
          <Card className="p-6 bg-gradient-to-br from-[#4F46E5]/5 to-[#8B5CF6]/5 border border-[#4F46E5]/20 rounded-2xl mb-8">
            <h3 className="font-bold text-[#1F2937] mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#4F46E5]" />
              Com sua conta gratuita, você terá acesso a:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: Brain, text: "Criação de posts e stories com IA" },
                { icon: TrendingUp, text: "Apresentações de vendas premium" },
                { icon: Calendar, text: "Calendário editorial estratégico" },
                { icon: Users, text: "Scripts de vendas para WhatsApp" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-[#4F46E5]" />
                  </div>
                  <span className="text-sm text-[#1F2937]">{item.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* CTA Final */}
          <div className="text-center space-y-4">
            <Button
              onClick={handleEntrarPlataforma}
              className="bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] text-white font-bold text-lg px-12 py-7 rounded-xl shadow-lg hover:shadow-xl transition-all group"
              size="lg"
            >
              Criar Minha Conta Gratuita
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-sm text-[#6B7280]">
              Sem cartão de crédito • Acesso imediato • 100 créditos grátis
            </p>

            <button
              onClick={() => navigate("/hub")}
              className="text-[#6B7280] hover:text-[#4F46E5] text-sm underline transition-colors"
            >
              Voltar ao Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
