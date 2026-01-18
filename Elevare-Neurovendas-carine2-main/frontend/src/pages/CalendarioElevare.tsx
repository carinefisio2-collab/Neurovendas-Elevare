import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Calendar,
  Plus,
  Sparkles,
  Loader2,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Copy,
  Check,
  Brain,
  Heart,
  Zap,
  Target,
  Users,
  Gift,
  Play,
  BarChart3,
  Rocket,
  RefreshCw,
  Image,
  ImagePlus,
  Download,
  ShieldCheck,
  AlertTriangle,
  Palette,
} from "lucide-react";

interface Campanha {
  id: string;
  nome: string;
  objetivo_estrategico: string;
  tom_comunicacao: string;
  emocao_principal: string;
  duracao_dias: number;
  tema_base: string;
  descricao?: string;
  data_inicio: string;
  status: string;
  posts_gerados: number;
  posts_postados: number;
  created_at: string;
}

interface PostCampanha {
  id: string;
  campanha_id: string;
  dia_do_ciclo: number;
  foco_neuro: string;
  cerebro_alvo: string;
  tipo_conteudo: string;
  titulo: string;
  legenda: string;
  cta: string;
  gatilhos: string[];
  dica_visual?: string;
  data_programada: string;
  status: string;
  imagem_base64?: string;
}

interface CicloNeuro {
  dia: number;
  foco_neuro: string;
  cerebro_alvo: string;
  tipo_conteudo: string;
  objetivo: string;
  gatilhos: string[];
  exemplo: string;
}

interface Stats {
  campanhas_total: number;
  em_rascunho: number;
  em_execucao: number;
  concluidas: number;
  posts_total: number;
  posts_postados: number;
  taxa_execucao: number;
}

export default function CalendarioElevare() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [selectedCampanha, setSelectedCampanha] = useState<Campanha | null>(null);
  const [posts, setPosts] = useState<PostCampanha[]>([]);
  const [cicloNeuro, setCicloNeuro] = useState<CicloNeuro[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [brandConfigured, setBrandConfigured] = useState(false);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostCampanha | null>(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingPost, setRegeneratingPost] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [verifyingPost, setVerifyingPost] = useState<string | null>(null);
  const [verifyingCampaign, setVerifyingCampaign] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    objetivo_estrategico: "Vender",
    tom_comunicacao: "acolhedor",
    emocao_principal: "Confiança",
    duracao_dias: 6,
    tema_base: "",
    descricao: "",
    data_inicio: new Date().toISOString().split("T")[0],
  });

  const objetivos = ["Engajar", "Educar", "Vender", "Inspirar", "Fidelizar"];
  const tons = [
    { id: "tecnico", nome: "Técnico", desc: "Objetivo, científico" },
    { id: "acolhedor", nome: "Acolhedor", desc: "Empático, cuidadoso" },
    { id: "provocador", nome: "Provocador", desc: "Desafiador, ousado" },
    { id: "inspirador", nome: "Inspirador", desc: "Motivacional, elevado" },
    { id: "comercial", nome: "Comercial", desc: "Direto, focado em venda" },
  ];
  const emocoes = ["Segurança", "Desejo", "Pertencimento", "Confiança", "Esperança"];

  const focoColors: Record<string, string> = {
    "Impacto": "bg-red-100 text-red-700 border-red-300",
    "Identificação": "bg-pink-100 text-pink-700 border-pink-300",
    "Autoridade": "bg-blue-100 text-blue-700 border-blue-300",
    "Educação": "bg-cyan-100 text-cyan-700 border-cyan-300",
    "Prova+Oferta": "bg-green-100 text-green-700 border-green-300",
    "Encantamento": "bg-purple-100 text-purple-700 border-purple-300",
  };

  const cerebroIcons: Record<string, any> = {
    "Reptiliano": Zap,
    "Límbico": Heart,
    "Neocórtex": Brain,
    "Límbico/Reptiliano": Target,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [campanhasRes, cicloRes, statsRes, brandRes] = await Promise.all([
        api.get("/api/campanhas"),
        api.get("/api/campanhas/ciclo-neuro"),
        api.get("/api/campanhas/stats"),
        api.get("/api/brand-identity"),
      ]);
      setCampanhas(campanhasRes.data.campanhas || []);
      setCicloNeuro(cicloRes.data.ciclo || []);
      setStats(statsRes.data.stats || null);
      setBrandConfigured(brandRes.data.brand_identity?.setup_completed || false);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampanha = async () => {
    if (!formData.nome.trim() || !formData.tema_base.trim()) return;
    
    setGenerating(true);
    try {
      const response = await api.post("/api/campanhas", formData);
      const novaCampanha = response.data.campanha;
      setCampanhas([novaCampanha, ...campanhas]);
      setShowCreateDialog(false);
      setFormData({
        nome: "",
        objetivo_estrategico: "Vender",
        tom_comunicacao: "acolhedor",
        emocao_principal: "Confiança",
        duracao_dias: 6,
        tema_base: "",
        descricao: "",
        data_inicio: new Date().toISOString().split("T")[0],
      });
      
      // Selecionar a nova campanha
      setSelectedCampanha(novaCampanha);
    } catch (error) {
      console.error("Error creating campanha:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateSequence = async (campanhaId: string) => {
    setGenerating(true);
    try {
      const response = await api.post(`/api/campanhas/${campanhaId}/gerar-sequencia`);
      setPosts(response.data.posts || []);
      
      // Atualizar campanha na lista
      const updatedCampanhas = campanhas.map(c => 
        c.id === campanhaId ? { ...c, status: "em_execucao", posts_gerados: response.data.posts?.length || 0 } : c
      );
      setCampanhas(updatedCampanhas);
      
      if (selectedCampanha?.id === campanhaId) {
        setSelectedCampanha({ ...selectedCampanha, status: "em_execucao", posts_gerados: response.data.posts?.length || 0 });
      }
      
      fetchData(); // Refresh stats
    } catch (error) {
      console.error("Error generating sequence:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectCampanha = async (campanha: Campanha) => {
    setSelectedCampanha(campanha);
    try {
      const response = await api.get(`/api/campanhas/${campanha.id}/posts`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    }
  };

  const handleRegenerateCopy = async (postId: string) => {
    setRegeneratingPost(postId);
    try {
      const response = await api.post(`/api/campanhas/posts/${postId}/gerar-copy`);
      setPosts(posts.map(p => p.id === postId ? response.data.post : p));
    } catch (error) {
      console.error("Error regenerating copy:", error);
    } finally {
      setRegeneratingPost(null);
    }
  };

  const handleGenerateImage = async (postId: string) => {
    setGeneratingImage(postId);
    try {
      const response = await api.post(`/api/campanhas/posts/${postId}/gerar-imagem`);
      if (response.data.success) {
        // Atualizar o post com a imagem
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, imagem_base64: response.data.image_base64 } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleVerifyPost = async (postId: string) => {
    setVerifyingPost(postId);
    try {
      const response = await api.post(`/api/verify/post/${postId}`);
      if (response.data.success) {
        setVerificationResult(response.data);
        // Atualizar post com status de verificação
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, verificado: true, score_verificacao: response.data.score_qualidade, aprovado: response.data.aprovado } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error verifying post:", error);
    } finally {
      setVerifyingPost(null);
    }
  };

  const handleVerifyCampaign = async () => {
    if (!selectedCampanha) return;
    setVerifyingCampaign(true);
    try {
      const response = await api.post(`/api/verify/campaign/${selectedCampanha.id}`);
      if (response.data.success) {
        setVerificationResult(response.data);
        // Atualizar campanha
        setSelectedCampanha({
          ...selectedCampanha,
          ...response.data
        });
      }
    } catch (error) {
      console.error("Error verifying campaign:", error);
    } finally {
      setVerifyingCampaign(false);
    }
  };

  const handleViewImage = (imageBase64: string) => {
    setSelectedImage(imageBase64);
    setShowImageDialog(true);
  };

  const handleDownloadImage = (imageBase64: string, postTitle: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = `${postTitle.replace(/\s+/g, '_')}_neurovendas.png`;
    link.click();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCampanha = async (campanhaId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha e todos os seus posts?")) return;
    
    try {
      await api.delete(`/api/campanhas/${campanhaId}`);
      setCampanhas(campanhas.filter(c => c.id !== campanhaId));
      if (selectedCampanha?.id === campanhaId) {
        setSelectedCampanha(null);
        setPosts([]);
      }
      fetchData();
    } catch (error) {
      console.error("Error deleting campanha:", error);
    }
  };

  const statusColors: Record<string, string> = {
    "rascunho": "bg-slate-100 text-slate-700",
    "em_execucao": "bg-blue-100 text-blue-700",
    "concluida": "bg-green-100 text-green-700",
    "planejado": "bg-amber-100 text-amber-700",
    "produzido": "bg-purple-100 text-purple-700",
    "postado": "bg-green-100 text-green-700",
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-800">Campanhas de Tráfego</h1>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                    ADS
                  </Badge>
                  {brandConfigured && (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                      <Palette className="w-3 h-3 mr-1" />
                      Marca Configurada
                    </Badge>
                  )}
                </div>
                <p className="text-slate-500 text-sm">Criação estratégica para anúncios pagos</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nova Campanha ADS
            </Button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-white border-slate-200">
              <p className="text-2xl font-bold text-slate-800">{stats.campanhas_total}</p>
              <p className="text-xs text-slate-500">Campanhas</p>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <p className="text-2xl font-bold text-blue-600">{stats.em_execucao}</p>
              <p className="text-xs text-slate-500">Em Execução</p>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <p className="text-2xl font-bold text-green-600">{stats.posts_postados}</p>
              <p className="text-xs text-slate-500">Posts Publicados</p>
            </Card>
            <Card className="p-4 bg-white border-slate-200">
              <p className="text-2xl font-bold text-purple-600">{stats.taxa_execucao}%</p>
              <p className="text-xs text-slate-500">Taxa de Execução</p>
            </Card>
          </div>
        )}

        <Tabs defaultValue="campanhas" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="campanhas" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Rocket className="w-4 h-4 mr-2" />
              Campanhas
            </TabsTrigger>
            <TabsTrigger value="ciclo" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
              <Brain className="w-4 h-4 mr-2" />
              Ciclo Neurovendedor
            </TabsTrigger>
          </TabsList>

          {/* Campanhas Tab */}
          <TabsContent value="campanhas">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Campanhas */}
              <Card className="lg:col-span-1 p-4 bg-white border-slate-200 max-h-[600px] overflow-y-auto">
                <h3 className="font-semibold text-slate-800 mb-4">Suas Campanhas</h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                  </div>
                ) : campanhas.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Nenhuma campanha criada</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateDialog(true)}
                      className="mt-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Criar primeira campanha
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campanhas.map((campanha) => (
                      <div
                        key={campanha.id}
                        onClick={() => handleSelectCampanha(campanha)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCampanha?.id === campanha.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-slate-800 text-sm">{campanha.nome}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[campanha.status] || statusColors.rascunho}`}>
                            {campanha.status === "em_execucao" ? "Em execução" : campanha.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1 mb-2">{campanha.tema_base}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{campanha.posts_gerados} posts</span>
                          <span className="text-slate-400">{new Date(campanha.data_inicio).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Detalhe da Campanha */}
              <Card className="lg:col-span-2 p-6 bg-white border-slate-200">
                {!selectedCampanha ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Selecione uma campanha</h3>
                    <p className="text-slate-500 text-sm">Escolha uma campanha ao lado para ver os detalhes e posts</p>
                  </div>
                ) : (
                  <>
                    {/* Header da Campanha */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-slate-800">{selectedCampanha.nome}</h2>
                        <p className="text-slate-500 text-sm mt-1">{selectedCampanha.tema_base}</p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                            {selectedCampanha.objetivo_estrategico}
                          </span>
                          <span className="text-xs px-2 py-1 bg-pink-100 text-pink-700 rounded-full">
                            {selectedCampanha.tom_comunicacao}
                          </span>
                          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">
                            {selectedCampanha.emocao_principal}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedCampanha.status === "rascunho" && (
                          <Button
                            onClick={() => handleGenerateSequence(selectedCampanha.id)}
                            disabled={generating}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            {generating ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Gerar Sequência
                          </Button>
                        )}
                        {posts.length > 0 && (
                          <Button
                            onClick={handleVerifyCampaign}
                            disabled={verifyingCampaign}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-50"
                          >
                            {verifyingCampaign ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 mr-2" />
                            )}
                            Verificar Campanha
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteCampanha(selectedCampanha.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Resultado da Verificação da Campanha */}
                    {verificationResult && verificationResult.recomendacao_geral && (
                      <div className={`mb-6 p-4 rounded-xl ${
                        verificationResult.score_medio >= 80 ? "bg-green-50 border border-green-200" :
                        verificationResult.score_medio >= 60 ? "bg-amber-50 border border-amber-200" :
                        "bg-red-50 border border-red-200"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-1">Resultado da Verificação</h4>
                            <p className="text-sm">{verificationResult.recomendacao_geral}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">{verificationResult.score_medio}%</p>
                            <p className="text-xs text-slate-500">{verificationResult.posts_aprovados}/{verificationResult.total_posts} aprovados</p>
                          </div>
                        </div>
                        {verificationResult.alertas_criticos?.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-current/10">
                            <p className="text-sm font-medium text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Alertas Críticos:
                            </p>
                            <ul className="mt-1 space-y-1">
                              {verificationResult.alertas_criticos.slice(0, 3).map((a: any, i: number) => (
                                <li key={i} className="text-xs text-red-600">• {a.mensagem}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Posts da Campanha */}
                    {posts.length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl">
                        <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium mb-1">Nenhum post gerado ainda</p>
                        <p className="text-slate-500 text-sm mb-4">
                          Clique em "Gerar Sequência" para criar 6 posts com o ciclo neurovendedor
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-slate-700">Jornada Neurovendedora ({posts.length} posts)</h3>
                        <div className="space-y-3">
                          {posts.map((post) => {
                            const CerebroIcon = cerebroIcons[post.cerebro_alvo] || Brain;
                            return (
                              <div
                                key={post.id}
                                className={`p-4 rounded-xl border-2 ${focoColors[post.foco_neuro] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                                      <span className="text-lg font-bold">{post.dia_do_ciclo}</span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold">{post.foco_neuro}</span>
                                        <CerebroIcon className="w-4 h-4" />
                                        {(post as any).verificado && (
                                          <span className={`text-xs px-1.5 py-0.5 rounded ${(post as any).aprovado ? 'bg-green-200 text-green-800' : 'bg-amber-200 text-amber-800'}`}>
                                            {(post as any).aprovado ? '✓' : '⚠'}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs opacity-75">{post.cerebro_alvo} • {post.tipo_conteudo}</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    {/* Botão Verificar */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleVerifyPost(post.id)}
                                      disabled={verifyingPost === post.id}
                                      className="h-8 px-2"
                                      title="Verificar conteúdo"
                                    >
                                      {verifyingPost === post.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <ShieldCheck className="w-4 h-4" />
                                      )}
                                    </Button>
                                    {/* Botão Gerar Imagem */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateImage(post.id)}
                                      disabled={generatingImage === post.id}
                                      className="h-8 px-2"
                                      title="Gerar imagem com IA"
                                    >
                                      {generatingImage === post.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <ImagePlus className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRegenerateCopy(post.id)}
                                      disabled={regeneratingPost === post.id}
                                      className="h-8 px-2"
                                      title="Regenerar copy"
                                    >
                                      {regeneratingPost === post.id ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <RefreshCw className="w-4 h-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(post.legenda, post.id)}
                                      className="h-8 px-2"
                                      title="Copiar legenda"
                                    >
                                      {copiedId === post.id ? (
                                        <Check className="w-4 h-4" />
                                      ) : (
                                        <Copy className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Imagem Gerada */}
                                {post.imagem_base64 && (
                                  <div className="mb-3 relative group">
                                    <img
                                      src={`data:image/png;base64,${post.imagem_base64}`}
                                      alt={post.titulo || "Imagem do post"}
                                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                                      onClick={() => handleViewImage(post.imagem_base64!)}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleViewImage(post.imagem_base64!)}
                                      >
                                        <Image className="w-4 h-4 mr-1" />
                                        Ver
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleDownloadImage(post.imagem_base64!, post.titulo || `post_${post.dia_do_ciclo}`)}
                                      >
                                        <Download className="w-4 h-4 mr-1" />
                                        Baixar
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                {post.titulo && (
                                  <h4 className="font-medium mb-2">{post.titulo}</h4>
                                )}
                                
                                {post.legenda && (
                                  <p className="text-sm whitespace-pre-line mb-3 bg-white/30 p-3 rounded-lg">
                                    {post.legenda}
                                  </p>
                                )}
                                
                                {post.cta && (
                                  <div className="text-sm bg-white/40 px-3 py-2 rounded-lg">
                                    <span className="font-medium">CTA:</span> {post.cta}
                                  </div>
                                )}
                                
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/10">
                                  <div className="flex flex-wrap gap-1">
                                    {post.gatilhos?.slice(0, 3).map((g, i) => (
                                      <span key={i} className="text-xs bg-white/30 px-2 py-0.5 rounded-full">
                                        {g}
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs opacity-75">
                                    {new Date(post.data_programada).toLocaleDateString("pt-BR")}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Ciclo Neurovendedor Tab */}
          <TabsContent value="ciclo">
            <Card className="p-6 bg-white border-slate-200">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Ciclo Neurovendedor</h2>
                <p className="text-slate-500">
                  Respeite a ordem biológica da decisão: <strong>Instinto → Emoção → Razão</strong>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cicloNeuro.map((etapa) => {
                  const CerebroIcon = cerebroIcons[etapa.cerebro_alvo] || Brain;
                  return (
                    <Card
                      key={etapa.dia}
                      className={`p-5 border-2 ${focoColors[etapa.foco_neuro] || "bg-slate-50 border-slate-200"}`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center">
                          <span className="text-xl font-bold">{etapa.dia}</span>
                        </div>
                        <div>
                          <h3 className="font-bold">{etapa.foco_neuro}</h3>
                          <div className="flex items-center gap-1 text-xs opacity-75">
                            <CerebroIcon className="w-3 h-3" />
                            {etapa.cerebro_alvo}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium mb-2">{etapa.tipo_conteudo}</p>
                      <p className="text-xs opacity-75 mb-3">{etapa.objetivo}</p>
                      
                      <div className="bg-white/30 p-3 rounded-lg mb-3">
                        <p className="text-sm italic">"{etapa.exemplo}"</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {etapa.gatilhos.map((g, i) => (
                          <span key={i} className="text-xs bg-white/40 px-2 py-0.5 rounded-full">
                            {g}
                          </span>
                        ))}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-500" />
                Nova Campanha Neurovendedora
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-indigo-50 rounded-xl text-sm text-indigo-700">
                <strong>💡 Dica:</strong> Uma campanha de 6 dias segue o ciclo completo do cérebro: 
                Impacto → Identificação → Autoridade → Educação → Prova → Encantamento
              </div>
              
              <div>
                <Label>Nome da Campanha *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Lançamento Criomodelagem Verão"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Tema Base *</Label>
                <Textarea
                  value={formData.tema_base}
                  onChange={(e) => setFormData({ ...formData, tema_base: e.target.value })}
                  placeholder="Ex: Benefícios da criomodelagem para eliminar gordura localizada no verão"
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Objetivo Estratégico</Label>
                  <Select
                    value={formData.objetivo_estrategico}
                    onValueChange={(v) => setFormData({ ...formData, objetivo_estrategico: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {objetivos.map((obj) => (
                        <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Emoção Principal</Label>
                  <Select
                    value={formData.emocao_principal}
                    onValueChange={(v) => setFormData({ ...formData, emocao_principal: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {emocoes.map((em) => (
                        <SelectItem key={em} value={em}>{em}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Tom de Comunicação</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {tons.map((tom) => (
                    <button
                      key={tom.id}
                      onClick={() => setFormData({ ...formData, tom_comunicacao: tom.id })}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.tom_comunicacao === tom.id
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-medium text-sm">{tom.nome}</p>
                      <p className="text-xs text-slate-500">{tom.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label>Data de Início</Label>
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Notas adicionais sobre a campanha..."
                  className="mt-1"
                  rows={2}
                />
              </div>
              
              <Button
                onClick={handleCreateCampanha}
                disabled={generating || !formData.nome.trim() || !formData.tema_base.trim()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Rocket className="w-4 h-4 mr-2" />
                )}
                Criar Campanha
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Viewer Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Image className="w-5 h-5 text-indigo-500" />
                Imagem do Post
              </DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="mt-4">
                <img
                  src={`data:image/png;base64,${selectedImage}`}
                  alt="Imagem gerada"
                  className="w-full rounded-lg"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowImageDialog(false)}
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${selectedImage}`;
                      link.download = `neurovendas_post_${Date.now()}.png`;
                      link.click();
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Imagem
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </NeuroVendasLayout>
  );
}
