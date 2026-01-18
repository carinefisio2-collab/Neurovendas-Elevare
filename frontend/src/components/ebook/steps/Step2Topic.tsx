import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Step2Props {
  data: {
    mainTopic: string;
    objective: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function Step2Topic({ data, onChange }: Step2Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Sobre o que você quer falar?
        </h3>
        <p className="text-slate-600">
          Defina o tema principal e o objetivo do seu e-book
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="topic">Tema principal do e-book</Label>
          <Input
            id="topic"
            placeholder="Ex: Crioterapia para Emagrecimento"
            value={data.mainTopic}
            onChange={(e) => onChange("mainTopic", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="objective">Objetivo do material</Label>
          <Textarea
            id="objective"
            placeholder="Ex: Educar clientes sobre os benefícios da crioterapia e preparar para a primeira sessão"
            value={data.objective}
            onChange={(e) => onChange("objective", e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
