import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { 
  Sparkles, 
  Copy, 
  Check, 
  Loader2,
  Search,
  Target,
  Users,
  FileText,
  Shield,
  Zap
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function FabricaSEO() {
  const [keyword, setKeyword] = useState("");
  const [tema, setTema] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [dores, setDores] = useState<string[]>([]);
  const [publico, setPublico] = useState<string[]>([]);
  const [enquadramento, setEnquadramento] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const objetivos = [
    "Autoridade clínica",
    "Educativo estratégico",
    "Conversão suave",
    "Quebra de objeções",
    "Posicionamento de marca",
    "Comparativo"
  ];

  const doresOptions = [
    "Achismo nos resultados",
    "Falta de previsibilidade",
    "Baixa retenção de clientes",
    "Dificuldade de explicar valor",
    "Protocolos pouco personalizados",
    "Desconfiança do paciente"
  ];

  const publicoOptions = [
    "Esteticistas",
    "Clientes finais",
    "Profissionais de saúde integrativa",
    "Donas de clínica estética",
    "Estudantes ou aprendizes de estética"
  ];

  const enquadramentoOptions = [
    "Educação do paciente",
    "Explicação técnica",
    "Comparação de tratamentos",
    "Erros comuns e cuidados",
    "Segurança e ética",
    "Tendências e inovações",
    "Protocolos e padronização"
  ];

  const benefits = [
    { icon: Search, title: "SEO real", desc: "Artigos prontos para ranquear" },
    { icon: Target, title: "Estratégico", desc: "NeuroVendas aplicado" },
    { icon: Users, title: "Personalizado", desc: "Público e contexto clínico" },
    { icon: Zap, title: "Prático", desc: "Artigos completos em minutos" },
    { icon: Shield, title: "Ético", desc: "Sem promessas milagrosas" }
  ];

  const toggleArray = (arr: string[], value: string, setter: (v: string[]) => void) => {
    if (arr.includes(value)) {
      setter(arr.filter(v => v !== value));
    } else {
      setter([...arr, value]);
    }
  };

  const handleGenerate = async () => {
    if (!keyword.trim() || !tema.trim()) {
      alert("Preencha a palavra-chave e o tema");
      return;
    }

    setLoading(true);
    setOutput("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/seo/generate-article`,
        {
          keyword,
          tema,
          objetivo,
          dores: dores.join(", "),
          publico: publico.join(", "),
          enquadramento: enquadramento.join(", ")
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setOutput(response.data.article || response.data.content);
      } else {
        setOutput("Erro ao gerar artigo. Tente novamente.");
      }
    } catch (error: any) {
      console.error(error);
      setOutput(error.response?.data?.detail || "Erro ao gerar artigo. Verifique seus créditos.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-5xl mx-auto">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-900 mb-5 shadow-xl shadow-brand-indigo-600/20">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-brand-slate-900 mb-3 tracking-tight">
            Fábrica de Conteúdo SEO para Esteticistas
          </h1>
          <p className="text-brand-slate-600 max-w-2xl mx-auto">
            Crie artigos otimizados que ranqueiam no Google, educam seu público e transformam leads em clientes com o Método NeuroVendas Elevare.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card 
                key={index}
                className="p-5 bg-white border border-brand-slate-100 rounded-2xl text-center hover:border-brand-lavanda-DEFAULT hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-lavanda-soft flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-brand-indigo-600" />
                </div>
                <h3 className="font-bold text-brand-slate-900 text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-brand-slate-500">{benefit.desc}</p>
              </Card>
            );
          })}
        </div>

        {/* Form Steps */}
        <div className="space-y-6">
          {/* Step 1 */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold text-brand-indigo-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</span>
              Sobre o que você quer falar?
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-brand-slate-700 font-medium">Palavra-chave principal</Label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Ex: inteligência artificial na estética clínica"
                  className="mt-2 h-12 rounded-xl border-brand-slate-200 focus:border-brand-indigo-300"
                />
              </div>
              <div>
                <Label className="text-brand-slate-700 font-medium">Tema do artigo</Label>
                <Input
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  placeholder="Ex: Como a IA reduz o achismo nos tratamentos estéticos"
                  className="mt-2 h-12 rounded-xl border-brand-slate-200 focus:border-brand-indigo-300"
                />
              </div>
            </div>
          </Card>

          {/* Step 2 - Objetivo */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold text-brand-indigo-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-indigo-600 text-white flex items-center justify-center text-sm font-bold">2</span>
              Objetivo do conteúdo
            </h2>
            <RadioGroup value={objetivo} onValueChange={setObjetivo} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {objetivos.map((obj) => (
                <Label
                  key={obj}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    objetivo === obj 
                      ? "bg-brand-indigo-50 border-2 border-brand-indigo-600" 
                      : "bg-brand-slate-50 border-2 border-transparent hover:bg-brand-slate-100"
                  }`}
                >
                  <RadioGroupItem value={obj} className="text-brand-indigo-600" />
                  <span className="text-sm font-medium text-brand-slate-700">{obj}</span>
                </Label>
              ))}
            </RadioGroup>
          </Card>

          {/* Step 3 - Dores */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold text-brand-indigo-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-indigo-600 text-white flex items-center justify-center text-sm font-bold">3</span>
              Qual dor esse texto resolve?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {doresOptions.map((dor) => (
                <Label
                  key={dor}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    dores.includes(dor)
                      ? "bg-brand-indigo-50 border-2 border-brand-indigo-600"
                      : "bg-brand-slate-50 border-2 border-transparent hover:bg-brand-slate-100"
                  }`}
                  onClick={() => toggleArray(dores, dor, setDores)}
                >
                  <Checkbox checked={dores.includes(dor)} className="text-brand-indigo-600" />
                  <span className="text-sm font-medium text-brand-slate-700">{dor}</span>
                </Label>
              ))}
            </div>
          </Card>

          {/* Step 4 - Público */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold text-brand-indigo-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-indigo-600 text-white flex items-center justify-center text-sm font-bold">4</span>
              Para quem você está escrevendo?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {publicoOptions.map((pub) => (
                <Label
                  key={pub}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    publico.includes(pub)
                      ? "bg-brand-indigo-50 border-2 border-brand-indigo-600"
                      : "bg-brand-slate-50 border-2 border-transparent hover:bg-brand-slate-100"
                  }`}
                  onClick={() => toggleArray(publico, pub, setPublico)}
                >
                  <Checkbox checked={publico.includes(pub)} className="text-brand-indigo-600" />
                  <span className="text-sm font-medium text-brand-slate-700">{pub}</span>
                </Label>
              ))}
            </div>
          </Card>

          {/* Step 5 - Enquadramento */}
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h2 className="text-lg font-bold text-brand-indigo-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-brand-indigo-600 text-white flex items-center justify-center text-sm font-bold">5</span>
              Qual enquadramento clínico do conteúdo?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {enquadramentoOptions.map((enq) => (
                <Label
                  key={enq}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    enquadramento.includes(enq)
                      ? "bg-brand-indigo-50 border-2 border-brand-indigo-600"
                      : "bg-brand-slate-50 border-2 border-transparent hover:bg-brand-slate-100"
                  }`}
                  onClick={() => toggleArray(enquadramento, enq, setEnquadramento)}
                >
                  <Checkbox checked={enquadramento.includes(enq)} className="text-brand-indigo-600" />
                  <span className="text-sm font-medium text-brand-slate-700">{enq}</span>
                </Label>
              ))}
            </div>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading || !keyword.trim() || !tema.trim()}
            className="w-full bg-gradient-to-r from-brand-indigo-600 to-brand-indigo-900 hover:from-brand-indigo-700 hover:to-brand-indigo-800 text-white py-7 rounded-2xl font-bold text-lg shadow-xl shadow-brand-indigo-600/20 transition-all duration-300"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Gerando artigo com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-3" />
                Gerar Artigo Estratégico
              </>
            )}
          </Button>

          <p className="text-center text-brand-slate-500 text-sm">
            <Zap className="w-4 h-4 inline mr-1" />
            5 créditos por artigo • Método NeuroVendas Elevare
          </p>

          {/* Output */}
          {output && (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-brand-indigo-900 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Artigo Gerado
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="border-brand-indigo-200 text-brand-indigo-700 hover:bg-brand-indigo-50 rounded-xl"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 mr-2" /> Copiado!</>
                  ) : (
                    <><Copy className="w-4 h-4 mr-2" /> Copiar</>
                  )}
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <div className="bg-brand-slate-50 p-6 rounded-xl whitespace-pre-wrap text-brand-slate-700 leading-relaxed max-h-[500px] overflow-y-auto">
                  {output}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-brand-slate-400 text-sm mt-10">
          © Elevare • Conteúdo com estratégia, não com achismo
        </p>
      </div>
    </NeuroVendasLayout>
  );
}
