import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const structures = [
  {
    id: "educativa-explicativa",
    name: "Educativa e Explicativa",
    description: "Perfeita para ensinar conceitos e benefícios",
    chapters: [
      "O que é e por que funciona",
      "Como age no organismo",
      "Principais benefícios",
      "Dúvidas mais comuns",
    ],
  },
  {
    id: "historia-pratica",
    name: "História + Orientação Prática",
    description: "Ideal para engajar com casos reais",
    chapters: [
      "História real de transformação",
      "O que fez a diferença",
      "Como aplicar na sua rotina",
      "O que você pode esperar",
    ],
  },
  {
    id: "direto-solucao",
    name: "Direto ao Ponto (Solução)",
    description: "Para quem quer resultados rápidos",
    chapters: [
      "O problema que você enfrenta",
      "A solução que funciona",
      "Como ela resolve seu problema",
      "Seu próximo passo",
    ],
  },
];

interface Step3Props {
  data: {
    structureType: string;
    selectedChapters: string[];
    includeSources: boolean;
  };
  onChange: (field: string, value: any) => void;
}

export default function Step3Structure({ data, onChange }: Step3Props) {
  const selectedStructure = structures.find((s) => s.id === data.structureType);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Como você quer organizar?
        </h3>
        <p className="text-slate-600">
          Escolha a estrutura que melhor se adapta ao seu objetivo
        </p>
      </div>

      <div className="grid gap-4">
        {structures.map((structure) => (
          <div
            key={structure.id}
            onClick={() => {
              onChange("structureType", structure.id);
              onChange("selectedChapters", structure.chapters);
            }}
            className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
              data.structureType === structure.id
                ? "border-violet-500 bg-violet-50"
                : "border-slate-200 hover:border-violet-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
                  data.structureType === structure.id
                    ? "border-violet-500 bg-violet-500"
                    : "border-slate-300"
                }`}
              >
                {data.structureType === structure.id && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{structure.name}</h4>
                <p className="text-sm text-slate-600 mb-3">{structure.description}</p>
                <div className="space-y-1">
                  {structure.chapters.map((chapter, idx) => (
                    <div key={idx} className="text-sm text-slate-500 flex items-center gap-2">
                      <span className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-xs">
                        {idx + 1}
                      </span>
                      {chapter}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStructure && (
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sources"
              checked={data.includeSources}
              onCheckedChange={(checked) => onChange("includeSources", checked)}
            />
            <Label htmlFor="sources" className="text-sm text-slate-600">
              Incluir fontes e referências científicas quando disponíveis
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}
