import { Label } from "@/components/ui/label";

const tones = [
  {
    id: "equilibrado",
    name: "Equilibrado",
    description: "Profissional mas acessível",
    example: "A crioterapia ativa o metabolismo através do frio controlado...",
  },
  {
    id: "mais-tecnico",
    name: "Mais técnico",
    description: "Com termos da área",
    example: "A crioterapia promove vasoconstrição seguida de vasodilatação...",
  },
  {
    id: "mais-simples",
    name: "Mais simples",
    description: "Linguagem do dia a dia",
    example: "O frio da crioterapia acelera o metabolismo e ajuda o corpo...",
  },
];

const visualStyles = [
  {
    id: "clean-profissional",
    name: "Clean Profissional",
    colors: ["#4F46E5", "#7C3AED", "#D4A853"],
  },
  {
    id: "acolhedor-feminino",
    name: "Acolhedor Feminino",
    colors: ["#EC4899", "#A855F7", "#D4A853"],
  },
  {
    id: "moderno-impactante",
    name: "Moderno Impactante",
    colors: ["#06B6D4", "#F59E0B", "#EC4899"],
  },
];

interface Step4Props {
  data: {
    writingTone: string;
    visualStyle: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function Step4Style({ data, onChange }: Step4Props) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Qual estilo você prefere?
        </h3>
        <p className="text-slate-600">
          Defina o tom da escrita e o visual do seu e-book
        </p>
      </div>

      {/* Writing Tone */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 mb-4 block">
          Tom de escrita
        </Label>
        <div className="grid gap-3">
          {tones.map((tone) => (
            <div
              key={tone.id}
              onClick={() => onChange("writingTone", tone.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                data.writingTone === tone.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 hover:border-violet-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                    data.writingTone === tone.id
                      ? "border-violet-500 bg-violet-500"
                      : "border-slate-300"
                  }`}
                />
                <div>
                  <h4 className="font-semibold text-slate-900">{tone.name}</h4>
                  <p className="text-sm text-slate-500">{tone.description}</p>
                  <p className="text-xs text-slate-400 mt-2 italic">"{tone.example}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Style */}
      <div>
        <Label className="text-sm font-semibold text-slate-700 mb-4 block">
          Estilo visual
        </Label>
        <div className="grid grid-cols-3 gap-4">
          {visualStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => onChange("visualStyle", style.id)}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${
                data.visualStyle === style.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 hover:border-violet-200"
              }`}
            >
              <div className="flex justify-center gap-1 mb-3">
                {style.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-slate-900">{style.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
