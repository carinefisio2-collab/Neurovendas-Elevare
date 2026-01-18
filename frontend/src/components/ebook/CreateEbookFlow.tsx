import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Step1Professional from "./steps/Step1Professional";
import Step2Topic from "./steps/Step2Topic";
import Step3Structure from "./steps/Step3Structure";
import Step4Style from "./steps/Step4Style";

interface CreateEbookFlowProps {
  onBack: () => void;
  onSuccess: (ebookId: string, content?: { titulo: string; subtitulo: string }) => void;
}

export default function CreateEbookFlow({ onBack, onSuccess }: CreateEbookFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    professionalName: "",
    specialty: "",
    mainTopic: "",
    objective: "",
    structureType: "",
    selectedChapters: [] as string[],
    includeSources: false,
    writingTone: "equilibrado",
    visualStyle: "clean-profissional",
    chapterVariations: {} as Record<string, string>,
  });

  const steps = [
    { title: "Você", icon: "👤" },
    { title: "Sobre o que vai falar", icon: "🎯" },
    { title: "Como organizar", icon: "📚" },
    { title: "Estilo do texto", icon: "✍️" },
  ];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.professionalName.trim() !== "" && formData.specialty.trim() !== "";
      case 1:
        return formData.mainTopic.trim() !== "" && formData.objective.trim() !== "";
      case 2:
        return formData.structureType !== "" && formData.selectedChapters.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.post("/api/ebook-new/generate", {
        professional_name: formData.professionalName,
        specialty: formData.specialty,
        main_topic: formData.mainTopic,
        objective: formData.objective,
        structure_type: formData.structureType,
        selected_chapters: formData.selectedChapters,
        include_sources: formData.includeSources,
        writing_tone: formData.writingTone,
        visual_style: formData.visualStyle,
        chapter_variations: formData.chapterVariations,
      });

      if (response.data.success) {
        toast({ title: "Sucesso!", description: "E-book gerado com sucesso!" });
        onSuccess(response.data.ebook_id, {
          titulo: response.data.content.titulo,
          subtitulo: response.data.content.subtitulo,
        });
      } else {
        throw new Error(response.data.detail || "Erro ao gerar e-book");
      }
    } catch (error: any) {
      console.error("Error generating ebook:", error);
      toast({ title: "Erro", description: error.response?.data?.detail || "Erro ao gerar e-book.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg transition-all ${
                  idx <= currentStep
                    ? "bg-violet-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.icon}
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    idx < currentStep ? "bg-violet-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Etapa {currentStep + 1}: {steps[currentStep].title}
          </h2>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        {currentStep === 0 && (
          <Step1Professional
            data={formData}
            onChange={(field: string, value: any) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}

        {currentStep === 1 && (
          <Step2Topic
            data={formData}
            onChange={(field: string, value: any) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}

        {currentStep === 2 && (
          <Step3Structure
            data={formData}
            onChange={(field: string, value: any) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}

        {currentStep === 3 && (
          <Step4Style
            data={formData}
            onChange={(field: string, value: any) =>
              setFormData((prev) => ({ ...prev, [field]: value }))
            }
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao Início
        </Button>

        <div className="flex gap-4">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
          )}

          {currentStep < steps.length - 1 && (
            <Button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-50"
            >
              Próximo
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {currentStep === steps.length - 1 && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg text-white disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Criar E-book
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
