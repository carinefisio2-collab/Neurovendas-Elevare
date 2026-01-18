import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Instagram,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Play,
  Camera,
  Sun,
  Repeat,
  BookOpen,
  ShoppingBag,
  Music,
  MessageCircle,
  BarChart,
  HelpCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Story {
  order: number;
  phase: string;
  text: string;
  visual: string;
  sticker: string;
  sticker_content?: string;
  music_suggestion?: string;
}

interface StorySequence {
  sequence_title: string;
  theme: string;
  stories: Story[];
  final_cta: string;
  tips?: string[];
}

interface StoryType {
  id: string;
  label: string;
  desc: string;
}

const STORY_TYPE_ICONS: Record<string, any> = {
  dia_a_dia: Sun,
  antes_depois: Repeat,
  bastidores: Camera,
  educativo: BookOpen,
  venda: ShoppingBag,
};

const STORY_TYPE_COLORS: Record<string, string> = {
  dia_a_dia: "from-amber-500 to-orange-500",
  antes_depois: "from-pink-500 to-rose-500",
  bastidores: "from-purple-500 to-violet-500",
  educativo: "from-blue-500 to-cyan-500",
  venda: "from-green-500 to-emerald-500",
};

const PHASE_COLORS: Record<string, string> = {
  GANCHO: "bg-red-100 text-red-700 border-red-200",
  DESENVOLVIMENTO: "bg-blue-100 text-blue-700 border-blue-200",
  CLÍMAX: "bg-purple-100 text-purple-700 border-purple-200",
  CTA: "bg-green-100 text-green-700 border-green-200",
};

const STICKER_ICONS: Record<string, any> = {
  enquete: BarChart,
  pergunta: HelpCircle,
  slider: BarChart,
  nenhum: null,
};

export default function StorySequences() {
  const [loading, setLoading] = useState(false);
  const [storyTypes, setStoryTypes] = useState<StoryType[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [theme, setTheme] = useState("");
  const [numberOfStories, setNumberOfStories] = useState(5);
  const [sequence, setSequence] = useState<StorySequence | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoryTypes();
  }, []);

  const loadStoryTypes = async () => {
    try {
      const response = await api.get("/api/ai/story-types");
      setStoryTypes(response.data.story_types);
    } catch (error) {
      console.error("Error loading story types:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedType || !theme.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um tipo e informe o tema.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSequence(null);

    try {
      const response = await api.post("/api/ai/generate-story-sequence", {
        theme: theme.trim(),
        story_type: selectedType,
        number_of_stories: numberOfStories,
      });

      setSequence(response.data.sequence);
      toast({
        title: "Sequência gerada!",
        description: "Seus stories estão prontos para gravar.",
      });
    } catch (error) {
      console.error("Error generating sequence:", error);
      toast({
        title: "Erro ao gerar",
        description: "Não foi possível gerar a sequência.",
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
  };

  const copyAllStories = () => {
    if (!sequence) return;
    const allText = sequence.stories.map(s => 
      `STORY ${s.order} - ${s.phase}\n${s.text}\n📸 ${s.visual}\n${s.sticker !== 'nenhum' ? `🎯 Sticker: ${s.sticker}` : ''}`
    ).join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
    toast({
      title: "Copiado!",
      description: "Toda a sequência foi copiada.",
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Stories em Sequência</h1>
              <p className="text-slate-500 text-sm">Narrativas prontas para engajar e converter</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuração */}
          <Card className="p-6 bg-white border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Criar Sequência</h2>

            {/* Tipos de Stories */}
            <div className="mb-6">
              <Label className="text-slate-700 mb-3 block">Tipo de Sequência *</Label>
              <div className="space-y-2">
                {storyTypes.map((type) => {
                  const Icon = STORY_TYPE_ICONS[type.id] || Camera;
                  const isSelected = selectedType === type.id;
                  const colorClass = STORY_TYPE_COLORS[type.id] || "from-slate-500 to-slate-600";
                  
                  return (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? "border-pink-500 bg-pink-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${isSelected ? "text-pink-700" : "text-slate-700"}`}>
                          {type.label}
                        </p>
                        <p className="text-xs text-slate-500">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tema */}
            <div className="mb-4">
              <Label className="text-slate-700">Tema da Sequência *</Label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Ex: Rotina de skincare matinal"
                className="mt-1"
              />
            </div>

            {/* Número de Stories */}
            <div className="mb-6">
              <Label className="text-slate-700">Quantidade de Stories</Label>
              <div className="flex items-center gap-2 mt-2">
                {[5, 7, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => setNumberOfStories(num)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      numberOfStories === num
                        ? "bg-pink-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedType || !theme.trim() || loading}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Gerar Sequência
                </>
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-3">
              3 créditos por sequência gerada
            </p>
          </Card>

          {/* Resultado */}
          <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
            {!sequence ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <Instagram className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-700 mb-2">Stories com Narrativa</h3>
                  <p className="text-sm text-slate-500 max-w-md">
                    Sequências estruturadas com gancho, desenvolvimento, clímax e CTA.
                    Inclui sugestões de visual, stickers e música.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{sequence.sequence_title}</h3>
                    <Badge variant="outline" className="mt-1">
                      {storyTypes.find(t => t.id === selectedType)?.label || sequence.theme}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" onClick={copyAllStories}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Tudo
                  </Button>
                </div>

                {/* Stories */}
                <div className="relative">
                  {/* Linha de conexão */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-green-300" />
                  
                  <div className="space-y-4">
                    {sequence.stories.map((story, index) => {
                      const phaseColor = PHASE_COLORS[story.phase] || "bg-slate-100 text-slate-700";
                      const StickerIcon = STICKER_ICONS[story.sticker];
                      
                      return (
                        <div key={index} className="relative pl-14">
                          {/* Número do story */}
                          <div className="absolute left-0 w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold shadow-lg">
                            {story.order}
                          </div>
                          
                          <div className={`p-4 rounded-xl border ${phaseColor}`}>
                            <div className="flex items-start justify-between mb-2">
                              <Badge className={phaseColor}>{story.phase}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(story.text, `story-${index}`)}
                                className="h-7 px-2"
                              >
                                {copiedId === `story-${index}` ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            
                            <p className="font-medium text-slate-800 mb-2">{story.text}</p>
                            
                            <div className="flex flex-wrap gap-2 mt-3">
                              {/* Visual */}
                              <div className="flex items-center gap-1 text-xs text-slate-600 bg-white/50 px-2 py-1 rounded-full">
                                <Camera className="w-3 h-3" />
                                {story.visual}
                              </div>
                              
                              {/* Sticker */}
                              {story.sticker && story.sticker !== "nenhum" && StickerIcon && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 bg-white/50 px-2 py-1 rounded-full">
                                  <StickerIcon className="w-3 h-3" />
                                  {story.sticker}: {story.sticker_content}
                                </div>
                              )}
                              
                              {/* Música */}
                              {story.music_suggestion && (
                                <div className="flex items-center gap-1 text-xs text-slate-600 bg-white/50 px-2 py-1 rounded-full">
                                  <Music className="w-3 h-3" />
                                  {story.music_suggestion}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA Final */}
                {sequence.final_cta && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-600 font-medium mb-1">CTA FINAL</p>
                        <p className="text-sm font-medium text-green-800">{sequence.final_cta}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(sequence.final_cta, "cta")}
                      >
                        {copiedId === "cta" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Dicas */}
                {sequence.tips && sequence.tips.length > 0 && (
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Dicas de Gravação</h4>
                    <ul className="space-y-1">
                      {sequence.tips.map((tip, i) => (
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
