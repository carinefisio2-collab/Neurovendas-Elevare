import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Trophy, Zap, ArrowRight, Target, TrendingUp } from "lucide-react";

export default function AnalysisComplete() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <Card className="w-full max-w-3xl relative z-10 p-12 bg-white/95 backdrop-blur-sm border-2 border-purple-200 shadow-2xl">
        {/* Trophy Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl animate-bounce">
            <Trophy className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Parabéns!!! 🎉
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <p className="text-lg text-purple-600 font-semibold">
              Você concluiu o seu Diagnóstico e Análise de Presença Digital
            </p>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-6 mb-10 text-gray-700 leading-relaxed">
          <p className="text-center text-lg">
            <strong>Não é só um relatório</strong>, é um <strong className="text-purple-600">espelho estratégico</strong> do seu posicionamento hoje e do potencial que você pode destravar a partir daqui.
          </p>

          {/* Credits Badge */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Zap className="w-8 h-8 text-yellow-300" />
              <span className="text-3xl font-bold">100 Créditos Mensais Gratuitos</span>
            </div>
            <p className="text-center text-purple-100">
              Conquistados! 🎁
            </p>
          </div>

          {/* Value Proposition */}
          <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
            <p className="text-gray-800 leading-relaxed">
              Na prática, isso significa ter acesso a um <strong>ecossistema que te ajuda a pensar, comunicar e vender melhor</strong>, mesmo com a rotina cheia da clínica.
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <strong>Conhecimento → Autoridade</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <strong>Autoridade → Confiança</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700">
                  <strong>Confiança → Agenda Cheia</strong>
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4 italic">
              Com estratégia, constância e inteligência artificial trabalhando a seu favor.
            </p>
          </div>

          {/* Motivational Close */}
          <div className="text-center space-y-3 pt-4">
            <p className="text-lg text-gray-800">
              Você já deu <strong className="text-purple-600">o passo mais difícil</strong>: <br/>
              <strong>enxergar onde está.</strong>
            </p>
            <p className="text-xl font-semibold text-gray-900">
              Agora é sobre <span className="text-purple-600">evoluir com método</span>, não no achismo.
            </p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-6 mb-8 border border-purple-200">
          <p className="text-center text-xl font-bold text-gray-900">
            Seja bem-vinda ao próximo nível da sua presença profissional! 🚀
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            data-testid="go-to-dashboard-btn"
          >
            Explorar Meu Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
