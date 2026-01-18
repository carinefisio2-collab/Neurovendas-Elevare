/**
 * Blog Elevare - Criador de Artigos Estratégicos
 * 
 * Fluxo:
 * 1. Wizard NeuroVendas (definição de tema, tom, público)
 * 2. Motor de criação via API (invisível para usuário)
 * 3. Geração de imagem de capa (opcional)
 * 
 * Arquitetura: Motor invisível com plano de migração
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  FileText,
  Target,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Flame,
  ThermometerSun,
  Snowflake,
  Crown,
  Heart,
  Zap,
  BookOpen,
  TrendingUp,
  Eye,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Image,
  Download,
} from "lucide-react";

// Tipos de artigo disponíveis
const ARTICLE_TYPES = [
  { 
    id: "educativo", 
    label: "Educativo", 
    icon: BookOpen,
    description: "Ensina conceitos e técnicas",
    example: "5 técnicas de harmonização facial que todo profissional deve conhecer"
  },
  { 
    id: "autoridade", 
    label: "Autoridade", 
    icon: Crown,
    description: "Posiciona como especialista",
    example: "Por que a harmonização facial exige mais do que técnica"
  },
  { 
    id: "conversao", 
    label: "Conversão", 
    icon: Target,
    description: "Direciona para ação",
    example: "Como escolher o profissional certo para seu procedimento"
  },
  { 
    id: "tendencias", 
    label: "Tendências", 
    icon: TrendingUp,
    description: "Novidades do mercado",
    example: "As 3 tendências de estética que dominarão 2026"
  },
];

// Níveis de consciência do público
const AWARENESS_LEVELS = [
  { 
    id: "frio", 
    label: "Frio", 
    icon: Snowflake, 
    color: "bg-blue-100 text-blue-700",
    description: "Não conhece seu trabalho ainda"
  },
  { 
    id: "morno", 
    label: "Morno", 
    icon: ThermometerSun, 
    color: "bg-yellow-100 text-yellow-700",
    description: "Já viu seu conteúdo mas não interagiu"
  },
  { 
    id: "quente", 
    label: "Quente", 
    icon: Flame, 
    color: "bg-red-100 text-red-700",
    description: "Engajado, pronto para converter"
  },
];

// Tom de voz
const TONES = [
  { id: "profissional", label: "Profissional", icon: Crown },
  { id: "acolhedor", label: "Acolhedor", icon: Heart },
  { id: "direto", label: "Direto", icon: Zap },
  { id: "inspirador", label: "Inspirador", icon: Sparkles },
];

interface BlogForm {
  title: string;
  topic: string;
  articleType: string;
  targetAudience: string;
  awarenessLevel: string;
  tone: string;
  keywords: string;
  callToAction: string;
}

const STEPS = [
  { id: 1, label: "Tema", icon: Target },
  { id: 2, label: "Público", icon: Users },
  { id: 3, label: "Estilo", icon: MessageSquare },
  { id: 4, label: "Criar", icon: Sparkles },
];

export default function BlogElevare() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [result, setResult] = useState<{ blogId: string; url: string } | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [form, setForm] = useState<BlogForm>({
    title: "",
    topic: "",
    articleType: "educativo",
    targetAudience: "",
    awarenessLevel: "frio",
    tone: "profissional",
    keywords: "",
    callToAction: "",
  });

  const updateForm = (field: keyof BlogForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return form.topic.trim().length > 0 && form.articleType;
      case 2:
        return form.targetAudience.trim().length > 0 && form.awarenessLevel;
      case 3:
        return form.tone && form.title.trim().length > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (result) {
      setResult(null);
      setCoverImage(null);
    } else if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const response = await api.post("/api/gamma/create-blog", {
        title: form.title,
        topic: form.topic,
        audience: form.targetAudience,
        article_type: form.articleType,
        tone: form.tone,
        keywords: form.keywords || undefined,
        call_to_action: form.callToAction || undefined,
      });

      if (response.data.success) {
        setResult({
          blogId: response.data.blog_id,
          url: response.data.gamma_url,
        });
        toast({
          title: "Artigo criado com sucesso!",
          description: "Seu artigo está pronto para visualização.",
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || "Erro ao criar artigo";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverImage = async () => {
    setLoadingImage(true);
    try {
      const prompt = `Imagem de capa profissional para artigo de blog sobre "${form.title}". 
        Tema: ${form.topic}. 
        Estilo: moderno, clean, profissional, estética premium.
        Cores: tons de lavanda, roxo suave, branco.
        Sem texto na imagem.
        Formato: banner horizontal para blog.`;

      const response = await api.post("/api/ai/generate-image", {
        prompt,
        size: "1792x1024",
        quality: "standard",
      });

      if (response.data.image_url) {
        setCoverImage(response.data.image_url);
        toast({
          title: "Imagem gerada!",
          description: "Sua imagem de capa está pronta.",
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || "Erro ao gerar imagem";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoadingImage(false);
    }
  };

  const selectedArticleType = ARTICLE_TYPES.find(t => t.id === form.articleType);

  // Se temos resultado, mostrar tela de sucesso
  if (result) {
    return (
      <NeuroVendasLayout>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <BackButton />
            <HomeButton />
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Artigo Criado com Sucesso!
                </h2>
                <p className="text-slate-500">
                  Seu artigo "{form.title}" está pronto para visualização e publicação.
                </p>
              </div>

              {/* Ações principais */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                <Button
                  onClick={() => window.open(result.url, '_blank')}
                  className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visualizar Artigo
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setCoverImage(null);
                    setCurrentStep(1);
                    setForm({
                      title: "",
                      topic: "",
                      articleType: "educativo",
                      targetAudience: "",
                      awarenessLevel: "frio",
                      tone: "profissional",
                      keywords: "",
                      callToAction: "",
                    });
                  }}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Criar Novo Artigo
                </Button>
              </div>

              {/* Seção de Imagem de Capa */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-[#4B0082]" />
                  Imagem de Capa
                </h3>

                {coverImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden shadow-lg">
                      <img 
                        src={coverImage} 
                        alt="Capa do artigo"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => window.open(coverImage, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Abrir em Nova Aba
                      </Button>
                      <Button
                        variant="outline"
                        asChild
                      >
                        <a href={coverImage} download={`capa-${form.title.replace(/\s+/g, '-').toLowerCase()}.png`}>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar Imagem
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleGenerateCoverImage}
                        disabled={loadingImage}
                      >
                        {loadingImage ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Gerar Nova
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-8 text-center">
                    <Image className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">
                      Gere uma imagem de capa profissional para seu artigo
                    </p>
                    <Button
                      onClick={handleGenerateCoverImage}
                      disabled={loadingImage}
                      className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
                    >
                      {loadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando Imagem...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Gerar Imagem de Capa
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-slate-400 mt-3">
                      Usa 1 crédito • IA gera imagem personalizada
                    </p>
                  </div>
                )}
              </div>

              {/* Detalhes do artigo */}
              <div className="mt-8 p-4 bg-slate-50 rounded-xl">
                <h4 className="text-sm font-medium text-slate-700 mb-3">Detalhes do Artigo:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Título:</span>
                    <p className="font-medium text-slate-700">{form.title}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tipo:</span>
                    <p className="font-medium text-slate-700">{selectedArticleType?.label}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Público:</span>
                    <p className="font-medium text-slate-700">{form.targetAudience}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tom:</span>
                    <p className="font-medium text-slate-700">{form.tone}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </NeuroVendasLayout>
    );
  }

  return (
    <NeuroVendasLayout>
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#7c3aed] flex items-center justify-center shadow-xl shadow-purple-500/30">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog Elevare</h1>
            <p className="text-slate-500">Crie artigos estratégicos com NeuroVendas</p>
          </div>
        </div>

        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-full transition-all
                    ${currentStep >= step.id 
                      ? 'bg-[#4B0082] text-white' 
                      : 'bg-slate-100 text-slate-400'
                    }
                  `}>
                    <step.icon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-1 mx-2 rounded ${
                      currentStep > step.id ? 'bg-[#4B0082]' : 'bg-slate-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / 4) * 100} className="h-2" />
          </div>

            {/* Step 1: Tema */}
            {currentStep === 1 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#4B0082]" />
                    Defina o Tema do Artigo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Tipo de Artigo */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Tipo de Artigo
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {ARTICLE_TYPES.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => updateForm("articleType", type.id)}
                          className={`
                            p-4 rounded-xl border-2 text-left transition-all
                            ${form.articleType === type.id
                              ? 'border-[#4B0082] bg-purple-50'
                              : 'border-slate-200 hover:border-purple-300'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <type.icon className={`w-5 h-5 ${
                              form.articleType === type.id ? 'text-[#4B0082]' : 'text-slate-400'
                            }`} />
                            <span className="font-medium">{type.label}</span>
                            {form.articleType === type.id && (
                              <Check className="w-4 h-4 text-[#4B0082] ml-auto" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500">{type.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tema/Assunto */}
                  <div>
                    <Label htmlFor="topic" className="text-base font-medium mb-2 block">
                      Tema Principal
                    </Label>
                    <Textarea
                      id="topic"
                      placeholder="Ex: Benefícios do preenchimento labial para autoestima feminina"
                      value={form.topic}
                      onChange={(e) => updateForm("topic", e.target.value)}
                      className="min-h-[100px]"
                    />
                    {selectedArticleType && (
                      <p className="text-sm text-slate-500 mt-2">
                        💡 Exemplo: {selectedArticleType.example}
                      </p>
                    )}
                  </div>

                  {/* Keywords */}
                  <div>
                    <Label htmlFor="keywords" className="text-base font-medium mb-2 block">
                      Palavras-chave (SEO)
                    </Label>
                    <Input
                      id="keywords"
                      placeholder="preenchimento labial, estética facial, autoestima"
                      value={form.keywords}
                      onChange={(e) => updateForm("keywords", e.target.value)}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Separe por vírgulas para melhor ranqueamento
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Público */}
            {currentStep === 2 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#4B0082]" />
                    Defina seu Público
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Público-alvo */}
                  <div>
                    <Label htmlFor="targetAudience" className="text-base font-medium mb-2 block">
                      Público-alvo
                    </Label>
                    <Textarea
                      id="targetAudience"
                      placeholder="Ex: Mulheres de 30-50 anos que buscam rejuvenescimento facial natural"
                      value={form.targetAudience}
                      onChange={(e) => updateForm("targetAudience", e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Nível de consciência */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Nível de Consciência do Leitor
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {AWARENESS_LEVELS.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => updateForm("awarenessLevel", level.id)}
                          className={`
                            p-4 rounded-xl border-2 text-center transition-all
                            ${form.awarenessLevel === level.id
                              ? 'border-[#4B0082] bg-purple-50'
                              : 'border-slate-200 hover:border-purple-300'
                            }
                          `}
                        >
                          <div className={`
                            w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center
                            ${level.color}
                          `}>
                            <level.icon className="w-6 h-6" />
                          </div>
                          <span className="font-medium block mb-1">{level.label}</span>
                          <span className="text-xs text-slate-500">{level.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div>
                    <Label htmlFor="callToAction" className="text-base font-medium mb-2 block">
                      Call to Action (opcional)
                    </Label>
                    <Input
                      id="callToAction"
                      placeholder="Ex: Agende sua avaliação gratuita"
                      value={form.callToAction}
                      onChange={(e) => updateForm("callToAction", e.target.value)}
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      O que você quer que o leitor faça ao final?
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Estilo */}
            {currentStep === 3 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#4B0082]" />
                    Defina o Estilo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Título do Artigo */}
                  <div>
                    <Label htmlFor="title" className="text-base font-medium mb-2 block">
                      Título do Artigo
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ex: 5 Segredos do Preenchimento Labial Natural"
                      value={form.title}
                      onChange={(e) => updateForm("title", e.target.value)}
                      className="text-lg"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Um bom título atrai cliques e comunica valor
                    </p>
                  </div>

                  {/* Tom de voz */}
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Tom de Voz
                    </Label>
                    <div className="grid grid-cols-4 gap-3">
                      {TONES.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => updateForm("tone", tone.id)}
                          className={`
                            p-4 rounded-xl border-2 text-center transition-all
                            ${form.tone === tone.id
                              ? 'border-[#4B0082] bg-purple-50'
                              : 'border-slate-200 hover:border-purple-300'
                            }
                          `}
                        >
                          <tone.icon className={`w-6 h-6 mx-auto mb-2 ${
                            form.tone === tone.id ? 'text-[#4B0082]' : 'text-slate-400'
                          }`} />
                          <span className="text-sm font-medium">{tone.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview do Artigo
                    </h4>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Badge className="mb-2 bg-purple-100 text-purple-700">
                        {ARTICLE_TYPES.find(t => t.id === form.articleType)?.label}
                      </Badge>
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        {form.title || "Título do seu artigo"}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {form.topic || "Descrição do tema aparecerá aqui..."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmação */}
            {currentStep === 4 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#4B0082]" />
                    Pronto para Criar!
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Resumo */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700">Resumo do Artigo</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <FileText className="w-5 h-5 text-[#4B0082] mt-0.5" />
                          <div>
                            <span className="text-xs text-slate-500">Título</span>
                            <p className="font-medium text-slate-800">{form.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Target className="w-5 h-5 text-[#4B0082] mt-0.5" />
                          <div>
                            <span className="text-xs text-slate-500">Tema</span>
                            <p className="text-sm text-slate-700">{form.topic}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Users className="w-5 h-5 text-[#4B0082] mt-0.5" />
                          <div>
                            <span className="text-xs text-slate-500">Público</span>
                            <p className="text-sm text-slate-700">{form.targetAudience}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configurações */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-slate-700">Configurações NeuroVendas</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <span className="text-xs text-slate-500 block mb-1">Tipo</span>
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            {ARTICLE_TYPES.find(t => t.id === form.articleType)?.label}
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <span className="text-xs text-slate-500 block mb-1">Tom</span>
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            {TONES.find(t => t.id === form.tone)?.label}
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <span className="text-xs text-slate-500 block mb-1">Consciência</span>
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            {AWARENESS_LEVELS.find(l => l.id === form.awarenessLevel)?.label}
                          </Badge>
                        </div>
                        
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <span className="text-xs text-slate-500 block mb-1">Motor</span>
                          <Badge variant="outline" className="text-purple-700 border-purple-200">
                            Elevare AI
                          </Badge>
                        </div>
                      </div>

                      {form.keywords && (
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <span className="text-xs text-slate-500 block mb-2">Keywords SEO</span>
                          <div className="flex flex-wrap gap-1">
                            {form.keywords.split(",").map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {kw.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              {currentStep === 4 ? (
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando Artigo...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Criar Artigo
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-[#4B0082] to-[#7c3aed]"
                >
                  Próximo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </>
      </div>
    </NeuroVendasLayout>
  );
}
