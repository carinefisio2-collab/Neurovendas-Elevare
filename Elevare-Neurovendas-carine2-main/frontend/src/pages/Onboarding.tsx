import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Palette,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  clinic_name: string;
  specialty: string;
  experience_level: string;
  main_challenge: string;
  goals: string[];
  instagram_handle: string;
}

const SPECIALTIES = [
  { id: "harmonizacao", label: "Harmonização Facial" },
  { id: "corporal", label: "Estética Corporal" },
  { id: "facial", label: "Estética Facial" },
  { id: "criomodelagem", label: "Criomodelagem" },
  { id: "depilacao", label: "Depilação a Laser" },
  { id: "spa", label: "Spa & Bem-estar" },
  { id: "geral", label: "Estética Geral" },
];

const EXPERIENCE_LEVELS = [
  { id: "iniciante", label: "Estou começando (< 1 ano)" },
  { id: "intermediario", label: "Tenho alguma experiência (1-3 anos)" },
  { id: "experiente", label: "Sou experiente (3-5 anos)" },
  { id: "expert", label: "Sou referência no mercado (5+ anos)" },
];

const CHALLENGES = [
  { id: "captacao", label: "Dificuldade em captar novos clientes" },
  { id: "conteudo", label: "Não sei o que postar nas redes sociais" },
  { id: "posicionamento", label: "Minha marca não se destaca" },
  { id: "agenda", label: "Agenda vazia ou irregular" },
  { id: "fidelizacao", label: "Clientes não retornam" },
  { id: "precificacao", label: "Não sei precificar corretamente" },
];

const GOALS = [
  { id: "mais_clientes", label: "Atrair mais clientes" },
  { id: "autoridade", label: "Me tornar autoridade no nicho" },
  { id: "conteudo_pro", label: "Criar conteúdo profissional" },
  { id: "escalar", label: "Escalar meu negócio" },
  { id: "premium", label: "Atrair clientes premium" },
  { id: "tempo", label: "Economizar tempo com marketing" },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    clinic_name: "",
    specialty: "",
    experience_level: "",
    main_challenge: "",
    goals: [],
    instagram_handle: "",
  });

  const totalSteps = 4;

  const toggleGoal = (goalId: string) => {
    setData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter((g) => g !== goalId)
        : [...prev.goals, goalId],
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post("/api/onboarding/save", data);
      toast({
        title: "🎉 Bem-vinda ao NeuroVendas!",
        description: "Seu perfil foi configurado. Vamos começar!",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.clinic_name.trim() && data.specialty;
      case 2:
        return data.experience_level && data.main_challenge;
      case 3:
        return data.goals.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">
              Passo {step} de {totalSteps}
            </span>
            <span className="text-sm font-medium text-violet-600">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Bem-vinda ao NeuroVendas! ✨
              </h1>
              <p className="text-slate-500">
                Vamos personalizar sua experiência em menos de 2 minutos.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">
                  Nome da sua clínica ou marca
                </Label>
                <Input
                  value={data.clinic_name}
                  onChange={(e) =>
                    setData({ ...data, clinic_name: e.target.value })
                  }
                  placeholder="Ex: Clínica Renova Estética"
                  className="mt-2 rounded-xl"
                />
              </div>

              <div>
                <Label className="text-slate-700">Sua especialidade principal</Label>
                <Select
                  value={data.specialty}
                  onValueChange={(v) => setData({ ...data, specialty: v })}
                >
                  <SelectTrigger className="mt-2 rounded-xl">
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Experience & Challenge */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Conte-nos sobre você
              </h1>
              <p className="text-slate-500">
                Isso nos ajuda a personalizar as estratégias para você.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">Seu nível de experiência</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {EXPERIENCE_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() =>
                        setData({ ...data, experience_level: level.id })
                      }
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        data.experience_level === level.id
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <span className="text-slate-700">{level.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-slate-700">
                  Qual seu maior desafio hoje?
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {CHALLENGES.map((challenge) => (
                    <button
                      key={challenge.id}
                      onClick={() =>
                        setData({ ...data, main_challenge: challenge.id })
                      }
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        data.main_challenge === challenge.id
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <span className="text-slate-700">{challenge.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Goals */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Seus objetivos
              </h1>
              <p className="text-slate-500">
                Selecione o que você quer alcançar (pode escolher vários).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    data.goals.includes(goal.id)
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-200 hover:border-violet-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {data.goals.includes(goal.id) ? (
                      <CheckCircle className="w-5 h-5 text-violet-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                    )}
                    <span className="text-sm text-slate-700">{goal.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Instagram & Finish */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Quase pronta!
              </h1>
              <p className="text-slate-500">
                Último passo para personalizar sua experiência.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-700">
                  Seu Instagram profissional (opcional)
                </Label>
                <Input
                  value={data.instagram_handle}
                  onChange={(e) =>
                    setData({ ...data, instagram_handle: e.target.value })
                  }
                  placeholder="@suaclinica"
                  className="mt-2 rounded-xl"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Usaremos para analisar sua bio e dar sugestões personalizadas.
                </p>
              </div>

              {/* Methods Preview */}
              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 mt-6">
                <h3 className="font-semibold text-violet-800 mb-3">
                  O que você vai aprender:
                </h3>
                <div className="space-y-2 text-sm text-violet-700">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>
                      <strong>Ativação Emocional:</strong> Micro-dores geram mais resposta neural
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>
                      <strong>NeuroVendas:</strong> Atenção → Identificação → Solução → Venda
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              className="text-slate-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar a usar
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
