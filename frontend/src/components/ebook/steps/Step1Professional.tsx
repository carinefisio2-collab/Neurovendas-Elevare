import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const specialties = [
  "Crioterapia",
  "Estética Facial",
  "Estética Corporal",
  "Harmonização Facial",
  "Drenagem Linfática",
  "Massagem Modeladora",
  "Tratamentos para Celulite",
  "Depilação a Laser",
  "Limpeza de Pele",
  "Peeling",
  "Microagulhamento",
  "Outra",
];

interface Step1Props {
  data: {
    professionalName: string;
    specialty: string;
  };
  onChange: (field: string, value: any) => void;
}

export default function Step1Professional({ data, onChange }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-2">
          Vamos começar com você
        </h3>
        <p className="text-slate-600">
          Conte um pouco sobre você para personalizarmos seu e-book
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Seu nome profissional</Label>
          <Input
            id="name"
            placeholder="Ex: Dra. Ana Silva"
            value={data.professionalName}
            onChange={(e) => onChange("professionalName", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="specialty">Sua especialidade principal</Label>
          <Select
            value={data.specialty}
            onValueChange={(value) => onChange("specialty", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua especialidade" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
