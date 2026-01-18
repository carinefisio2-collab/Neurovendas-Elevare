import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Check, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface OnboardingPremiumProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Tipo de Negócio",
    subtitle: "Como você atua hoje?",
    field: "tipo_negocio",
    options: [
      { value: "clinica", label: "🏥 Clínica própria", desc: "Tenho meu espaço físico" },
      { value: "espaco_alugado", label: "🏢 Espaço alugado/compartilhado", desc: "Trabalho em local alugado" },
      { value: "domiciliar", label: "🏠 Atendimento domiciliar", desc: "Vou até o cliente" },
      { value: "home_care", label: "✨ Home care", desc: "Atendo em casa" },
    ],
  },
  {
    id: 2,
    title: "Especialidade Principal",
    subtitle: "Qual seu foco de atuação?",
    field: "especialidade",
    options: [
      { value: "limpeza_pele", label: "🧴 Limpeza de Pele", desc: "Tratamentos faciais" },
      { value: "massagem", label: "💆 Massagem/Drenagem", desc: "Massoterapia e drenagem" },
      { value: "depilacao", label: "✨ Depilação", desc: "Laser, cera, etc." },
      { value: "micropigmentacao", label: "👁️ Micropigmentação", desc: "Sobrancelhas, lábios" },
      { value: "corporal", label: "💪 Estética Corporal", desc: "Criomodelagem, etc." },
      { value: "harmonizacao", label: "💉 Harmonização Facial", desc: "Procedimentos injetáveis" },
    ],
  },
  {
    id: 3,
    title: "Objetivo Principal",
    subtitle: "O que você mais precisa agora?",
    field: "objetivo",
    options: [
      { value: "atrair_clientes", label: "🧲 Atrair novos clientes", desc: "Aumentar minha base" },
      { value: "fidelizar", label: "❤️ Fidelizar clientes", desc: "Criar recorrência" },
      { value: "ticket_medio", label: "💰 Aumentar ticket médio", desc: "Vender mais por cliente" },
      { value: "presenca_digital", label: "📱 Fortalecer presença digital", desc: "Instagram profissional" },
    ],
  },
  {
    id: 4,
    title: "Público-Alvo",
    subtitle: "Quem é sua cliente ideal?",
    field: "publico_alvo",
    options: [
      { value: "mulheres_25_35", label: "👩 Mulheres 25-35", desc: "Jovens adultas" },
      { value: "mulheres_40", label: "👩‍💼 Mulheres 40+", desc: "Mulheres maduras" },
      { value: "noivas", label: "👰 Noivas", desc: "Pacotes de casamento" },
      { value: "gestantes", label: "🤰 Gestantes", desc: "Cuidados na gravidez" },
      { value: "executivas", label: "💼 Executivas", desc: "Profissionais ocupadas" },
    ],
  },
  {
    id: 5,
    title: "Tom de Voz",
    subtitle: "Como você quer se comunicar?",
    field: "tom_voz",
    options: [
      { value: "acolhedor", label: "🤗 Acolhedor", desc: "Caloroso e empático" },
      { value: "profissional", label: "💼 Profissional", desc: "Técnico e confiável" },
      { value: "inspirador", label: "✨ Inspirador", desc: "Motivacional" },
      { value: "descontraido", label: "😊 Descontraído", desc: "Leve e divertido" },
    ],
  },
];

export default function OnboardingPremium({ isOpen, onComplete }: OnboardingPremiumProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentStep = STEPS.find((s) => s.id === step);
  const progress = (step / STEPS.length) * 100;

  const handleSelect = (value: string) => {
    if (currentStep) {
      setData((prev) => ({ ...prev, [currentStep.field]: value }));
    }
  };

  const handleNext = async () => {
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      // Save onboarding data
      setLoading(true);
      try {
        await api.post("/api/onboarding/save", data);
        onComplete();
      } catch (error) {
        console.error("Error saving onboarding:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const canProceed = currentStep && data[currentStep.field];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-purple-600 to-violet-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="fixed top-6 left-8">
        <span className="text-sm text-slate-500 font-medium">
          Etapa {step} de {STEPS.length}
        </span>
      </div>

      {/* XP indicator */}
      <div className="fixed top-6 right-8">
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-semibold text-amber-600">+20 XP ao completar</span>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-2xl animate-fade-in" key={step}>
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 mb-6 shadow-lg shadow-purple-500/30">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {currentStep?.title}
            </h1>
            <p className="text-slate-500">{currentStep?.subtitle}</p>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {currentStep?.options.map((option) => {
              const isSelected = data[currentStep.field] === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-purple-500 bg-purple-50 shadow-lg shadow-purple-500/10"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-800">
                        {option.label}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{option.desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!canProceed || loading}
              className="px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/30 rounded-xl"
            >
              {loading ? (
                "Salvando..."
              ) : step === STEPS.length ? (
                <>
                  Começar a usar NeuroVendas
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
