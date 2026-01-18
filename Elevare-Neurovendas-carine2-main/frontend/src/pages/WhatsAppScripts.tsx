import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Phone,
  Loader2,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  UserPlus,
  RefreshCcw,
  Calendar,
  Heart,
  RotateCcw,
  Shield,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WhatsAppMessage {
  order: number;
  type: string;
  message: string;
  wait_for?: string;
  variations?: string[];
}

interface WhatsAppScript {
  script_name: string;
  scenario: string;
  messages: WhatsAppMessage[];
  objection_handlers?: Record<string, string>;
  closing_options?: string[];
  tips?: string[];
}

interface Scenario {
  id: string;
  label: string;
  desc: string;
}

const SCENARIO_ICONS: Record<string, any> = {
  primeiro_contato: UserPlus,
  followup: RefreshCcw,
  agendamento: Calendar,
  pos_atendimento: Heart,
  reativacao: RotateCcw,
  objecao: Shield,
};

const SCENARIO_COLORS: Record<string, string> = {
  primeiro_contato: "from-blue-500 to-cyan-500",
  followup: "from-amber-500 to-orange-500",
  agendamento: "from-green-500 to-emerald-500",
  pos_atendimento: "from-pink-500 to-rose-500",
  reativacao: "from-purple-500 to-violet-500",
  objecao: "from-red-500 to-rose-500",
};

export default function WhatsAppScripts() {
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [service, setService] = useState("");
  const [clientName, setClientName] = useState("");
  const [context, setContext] = useState("");
  const [script, setScript] = useState<WhatsAppScript | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const response = await api.get("/api/ai/whatsapp-scenarios");
      setScenarios(response.data.scenarios);
    } catch (error) {
      console.error("Error loading scenarios:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedScenario || !service.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um cenário e informe o serviço.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setScript(null);

    try {
      const response = await api.post("/api/ai/generate-whatsapp-script", {
        scenario: selectedScenario,
        service: service.trim(),
        client_name: clientName.trim() || null,
        context: context.trim() || null,
      });

      setScript(response.data.script);
      toast({
        title: "Script gerado!",
        description: "Seu roteiro de WhatsApp está pronto.",
      });
    } catch (error) {
      console.error("Error generating script:", error);
      toast({
        title: "Erro ao gerar",
        description: "Não foi possível gerar o script.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para área de transferência.",
    });
  };

  const copyAllMessages = () => {
    if (!script) return;
    const allText = script.messages.map(m => m.message).join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    toast({
      title: "Tudo copiado!",
      description: "Todas as mensagens foram copiadas.",
    });
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-6xl mx-auto">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Scripts de WhatsApp</h1>
              <p className="text-slate-500 text-sm">Roteiros prontos para cada momento da jornada</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuração */}
          <Card className="p-6 bg-white border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Configurar Script</h2>

            {/* Cenários */}
            <div className="mb-6">
              <Label className="text-slate-700 mb-3 block">Cenário *</Label>
              <div className="grid grid-cols-2 gap-2">
                {scenarios.map((scenario) => {
                  const Icon = SCENARIO_ICONS[scenario.id] || MessageSquare;
                  const isSelected = selectedScenario === scenario.id;
                  const colorClass = SCENARIO_COLORS[scenario.id] || "from-slate-500 to-slate-600";
                  
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenario(scenario.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-green-500 bg-green-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <p className={`text-sm font-medium ${isSelected ? "text-green-700" : "text-slate-700"}`}>
                        {scenario.label}
                      </p>
                      <p className="text-xs text-slate-500">{scenario.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Serviço */}
            <div className="mb-4">
              <Label className="text-slate-700">Serviço/Procedimento *</Label>
              <Input
                value={service}
                onChange={(e) => setService(e.target.value)}
                placeholder="Ex: Limpeza de pele, Criolipólise..."
                className="mt-1"
              />
            </div>

            {/* Nome do Cliente (opcional) */}
            <div className="mb-4">
              <Label className="text-slate-700">Nome do Cliente (opcional)</Label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ex: Maria"
                className="mt-1"
              />
            </div>

            {/* Contexto (opcional) */}
            <div className="mb-6">
              <Label className="text-slate-700">Contexto Adicional (opcional)</Label>
              <Textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: Cliente que veio pelo Instagram, interessada em harmonização..."
                className="mt-1"
                rows={2}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedScenario || !service.trim() || loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Script
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-3">
              2 créditos por script gerado
            </p>
          </Card>

          {/* Resultado */}
          <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
            {!script ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Scripts de WhatsApp</h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    Roteiros prontos para cada momento: primeiro contato, follow-up, agendamento, 
                    pós-atendimento, reativação e quebra de objeções.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{script.script_name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {scenarios.find(s => s.id === script.scenario)?.label || script.scenario}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyAllMessages}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Tudo
                  </Button>
                </div>

                {/* Mensagens */}
                <div className="space-y-3">
                  {script.messages.map((msg, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-green-50 border border-green-100 relative"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                            {msg.order}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {msg.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(msg.message, `msg-${index}`)}
                          className="h-7 px-2"
                        >
                          {copiedId === `msg-${index}` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      
                      <p className="text-slate-700 whitespace-pre-line">{msg.message}</p>
                      
                      {msg.wait_for && (
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Aguarde: {msg.wait_for}
                        </p>
                      )}

                      {msg.variations && msg.variations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-xs font-medium text-slate-600 mb-2">Variações:</p>
                          {msg.variations.map((v, i) => (
                            <div key={i} className="flex items-start gap-2 mb-1">
                              <ChevronRight className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                              <p className="text-xs text-slate-600">{v}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Quebra de Objeções */}
                {script.objection_handlers && Object.keys(script.objection_handlers).length > 0 && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-3">Quebra de Objeções</h4>
                    <div className="space-y-3">
                      {Object.entries(script.objection_handlers).map(([key, value]) => (
                        <div key={key} className="flex items-start gap-3">
                          <Badge className="bg-amber-200 text-amber-800 capitalize flex-shrink-0">
                            {key}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-slate-700">{value}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(value, `obj-${key}`)}
                              className="h-6 px-2 mt-1"
                            >
                              {copiedId === `obj-${key}` ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opções de Fechamento */}
                {script.closing_options && script.closing_options.length > 0 && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-3">Opções de Fechamento</h4>
                    <div className="space-y-2">
                      {script.closing_options.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg">
                          <p className="text-sm text-slate-700">{opt}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(opt, `close-${i}`)}
                            className="h-6 px-2"
                          >
                            {copiedId === `close-${i}` ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dicas */}
                {script.tips && script.tips.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Dicas</h4>
                    <ul className="space-y-1">
                      {script.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                          <span className="text-blue-500">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </NeuroVendasLayout>
  );
}
