import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Gift,
  Star,
  Users,
  Share2,
  Instagram,
  Youtube,
  MessageCircle,
  Trophy,
  Coins,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  Crown,
  Zap,
  Heart,
  Award,
  TrendingUp,
  Clock,
  FileText,
  Palette,
  Bot,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Reward {
  type: string;
  credits: number;
  description: string;
  one_time: boolean;
  available: boolean;
  claimed_count: number;
}

interface CreditCost {
  [key: string]: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  credits_earned: number;
  is_you: boolean;
}

interface ReferralStats {
  total_signups: number;
  total_paid: number;
  total_credits_earned: number;
}

const REWARD_ICONS: { [key: string]: any } = {
  app_review: Star,
  leave_testimonial: MessageCircle,
  follow_instagram: Instagram,
  follow_youtube: Youtube,
  share_social: Share2,
  referral_signup: Users,
  referral_paid: Crown,
  first_article: FileText,
  first_carousel: Sparkles,
  complete_brand: Palette,
  daily_login: Clock,
};

const COST_LABELS: { [key: string]: string } = {
  chat: "Chat com LucresIA",
  bio_analysis: "Análise de Bio",
  content_generation: "Geração de Conteúdo",
  carousel: "Carrossel NeuroVendas",
  carousel_sequence: "Sequência de Carrosséis",
  caption: "Legenda",
  multi_caption: "Legendas Multi-plataforma",
  whatsapp_script: "Script WhatsApp",
  story_sequence: "Sequência de Stories",
  seo_article: "Artigo SEO",
  seo_ideas: "Ideias SEO",
  seo_improve: "Melhoria SEO",
  ebook: "E-book",
  campaign_sequence: "Sequência de Campanha",
  brand_analysis: "Análise de Marca",
  gamma_presentation: "Apresentação Gamma",
  gamma_document: "Documento Gamma",
  gamma_website: "Site Gamma",
};

export default function Gamification() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [creditCosts, setCreditCosts] = useState<CreditCost>({});
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [applyCode, setApplyCode] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rewardsRes, costsRes, leaderboardRes, referralRes, balanceRes] = await Promise.all([
        api.get("/api/gamification/rewards"),
        api.get("/api/credits/costs"),
        api.get("/api/gamification/leaderboard"),
        api.get("/api/gamification/referral-code"),
        api.get("/api/credits/balance"),
      ]);
      
      setRewards(rewardsRes.data.rewards || []);
      setCreditCosts(costsRes.data.costs || {});
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      setReferralCode(referralRes.data.referral_code || "");
      setReferralLink(referralRes.data.referral_link || "");
      setReferralStats(referralRes.data.stats || null);
      setBalance(balanceRes.data.credits || 0);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (reward: Reward) => {
    if (reward.type === "app_review" || reward.type === "leave_testimonial" || 
        reward.type.startsWith("follow_") || reward.type === "share_social") {
      setSelectedReward(reward);
      setShowProofDialog(true);
      return;
    }
    
    setClaimingReward(reward.type);
    try {
      const response = await api.post("/api/gamification/claim", {
        reward_type: reward.type,
      });
      
      toast({
        title: "🎉 Parabéns!",
        description: response.data.message,
      });
      
      setBalance(response.data.new_balance);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível resgatar",
        variant: "destructive",
      });
    } finally {
      setClaimingReward(null);
    }
  };

  const handleClaimWithProof = async () => {
    if (!selectedReward) return;
    
    setClaimingReward(selectedReward.type);
    try {
      const response = await api.post("/api/gamification/claim", {
        reward_type: selectedReward.type,
        proof_url: proofUrl,
      });
      
      toast({
        title: "🎉 Parabéns!",
        description: response.data.message,
      });
      
      setBalance(response.data.new_balance);
      setShowProofDialog(false);
      setProofUrl("");
      setSelectedReward(null);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível resgatar",
        variant: "destructive",
      });
    } finally {
      setClaimingReward(null);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast({ title: "Link copiado!" });
  };

  const handleApplyReferralCode = async () => {
    if (!applyCode.trim()) return;
    
    try {
      const response = await api.post("/api/gamification/apply-referral", {
        code: applyCode.trim(),
      });
      
      toast({
        title: "🎉 Código aplicado!",
        description: response.data.message,
      });
      
      setApplyCode("");
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Código inválido",
        variant: "destructive",
      });
    }
  };

  const openSocialLink = (type: string) => {
    const links: { [key: string]: string } = {
      follow_instagram: "https://instagram.com/elevare.estetica",
      follow_youtube: "https://youtube.com/@elevare",
    };
    if (links[type]) {
      window.open(links[type], "_blank");
    }
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-7xl mx-auto">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Central de Créditos</h1>
                <p className="text-slate-500 text-sm">Ganhe créditos e desbloqueie recursos</p>
              </div>
            </div>
            <Card className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-2xl shadow-lg shadow-violet-200">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <span className="text-2xl font-bold">{balance}</span>
                <span className="text-sm opacity-80">créditos</span>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="earn" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-2xl p-1">
            <TabsTrigger value="earn" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-xl">
              <Gift className="w-4 h-4 mr-2" />
              Ganhar Créditos
            </TabsTrigger>
            <TabsTrigger value="costs" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-xl">
              <Zap className="w-4 h-4 mr-2" />
              Tabela de Custos
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-xl">
              <Users className="w-4 h-4 mr-2" />
              Indicar Amigos
            </TabsTrigger>
            <TabsTrigger value="ranking" className="data-[state=active]:bg-violet-500 data-[state=active]:text-white rounded-xl">
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </TabsTrigger>
          </TabsList>

          {/* Earn Credits Tab */}
          <TabsContent value="earn">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => {
                const IconComponent = REWARD_ICONS[reward.type] || Gift;
                return (
                  <Card
                    key={reward.type}
                    className={`p-5 rounded-3xl border-2 transition-all ${
                      reward.available
                        ? "bg-white border-slate-100 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100"
                        : "bg-slate-50 border-slate-100 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        reward.available ? "bg-violet-100" : "bg-slate-200"
                      }`}>
                        <IconComponent className={`w-6 h-6 ${reward.available ? "text-violet-600" : "text-slate-400"}`} />
                      </div>
                      <Badge className={`rounded-full ${
                        reward.available 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        +{reward.credits} créditos
                      </Badge>
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-1">{reward.description}</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      {reward.one_time ? "Uma vez" : `${reward.claimed_count}x resgatado`}
                    </p>
                    
                    <Button
                      onClick={() => {
                        if (reward.type.startsWith("follow_")) {
                          openSocialLink(reward.type);
                        }
                        handleClaimReward(reward);
                      }}
                      disabled={!reward.available || claimingReward === reward.type}
                      className={`w-full rounded-2xl ${
                        reward.available
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {!reward.available ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Resgatado
                        </>
                      ) : claimingReward === reward.type ? (
                        "Resgatando..."
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Resgatar
                        </>
                      )}
                    </Button>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <Card className="p-6 rounded-3xl bg-white border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-500" />
                Custo por Recurso
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(creditCosts).map(([key, cost]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-slate-700 font-medium">{COST_LABELS[key] || key}</span>
                    <Badge className="bg-violet-100 text-violet-700 rounded-full">
                      {cost} créditos
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Referral Tab */}
          <TabsContent value="referral">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Seu código */}
              <Card className="p-6 rounded-3xl bg-white border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-violet-500" />
                  Seu Link de Indicação
                </h2>
                
                <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100 mb-4">
                  <p className="text-sm text-violet-600 mb-2">Seu código:</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xl font-bold text-violet-700">{referralCode}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyReferralCode}
                      className="text-violet-600"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <Button
                  onClick={copyReferralCode}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Link Completo
                </Button>
                
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <p className="text-sm font-medium text-emerald-700 mb-2">Suas recompensas:</p>
                  <ul className="text-sm text-emerald-600 space-y-1">
                    <li>• Amigo se cadastra: <strong>+25 créditos</strong></li>
                    <li>• Amigo assina plano pago: <strong>+100 créditos</strong></li>
                    <li>• Seu amigo também ganha: <strong>+10 créditos</strong></li>
                  </ul>
                </div>
                
                {referralStats && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 text-center">
                      <p className="text-2xl font-bold text-slate-800">{referralStats.total_signups}</p>
                      <p className="text-xs text-slate-500">Cadastros</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-center">
                      <p className="text-2xl font-bold text-violet-600">{referralStats.total_paid}</p>
                      <p className="text-xs text-slate-500">Assinantes</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-center">
                      <p className="text-2xl font-bold text-emerald-600">{referralStats.total_credits_earned}</p>
                      <p className="text-xs text-slate-500">Créditos ganhos</p>
                    </div>
                  </div>
                )}
              </Card>
              
              {/* Aplicar código */}
              <Card className="p-6 rounded-3xl bg-white border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-violet-500" />
                  Tem um Código de Indicação?
                </h2>
                
                <p className="text-slate-500 text-sm mb-4">
                  Se alguém indicou você, insira o código abaixo para ganhar 10 créditos de bônus!
                </p>
                
                <div className="flex gap-2">
                  <Input
                    value={applyCode}
                    onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
                    placeholder="Ex: ELEV123ABC"
                    className="rounded-xl"
                  />
                  <Button
                    onClick={handleApplyReferralCode}
                    disabled={!applyCode.trim()}
                    className="bg-violet-500 hover:bg-violet-600 rounded-xl"
                  >
                    Aplicar
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking">
            <Card className="p-6 rounded-3xl bg-white border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-violet-500" />
                Top 10 Indicadores
              </h2>
              
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-2xl ${
                      entry.is_you
                        ? "bg-violet-50 border-2 border-violet-200"
                        : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        entry.rank === 1 ? "bg-yellow-400 text-white" :
                        entry.rank === 2 ? "bg-slate-300 text-white" :
                        entry.rank === 3 ? "bg-amber-600 text-white" :
                        "bg-slate-200 text-slate-600"
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {entry.name}
                          {entry.is_you && <span className="text-violet-600 ml-2">(você)</span>}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-violet-100 text-violet-700 rounded-full">
                      {entry.credits_earned} créditos
                    </Badge>
                  </div>
                ))}
                
                {leaderboard.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>Seja o primeiro no ranking!</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Proof Dialog */}
        <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Confirmar Resgate</DialogTitle>
              <DialogDescription>
                {selectedReward?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedReward?.type.startsWith("follow_") && (
                <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                  <p className="text-sm text-violet-700 mb-2">
                    1. Clique no botão abaixo para seguir
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => openSocialLink(selectedReward.type)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir {selectedReward.type === "follow_instagram" ? "Instagram" : "YouTube"}
                  </Button>
                </div>
              )}
              
              <div>
                <Label className="text-slate-700">
                  {selectedReward?.type === "app_review" && "Link da sua avaliação (opcional)"}
                  {selectedReward?.type === "leave_testimonial" && "Seu depoimento"}
                  {selectedReward?.type.startsWith("follow_") && "Username/perfil (para verificação)"}
                  {selectedReward?.type === "share_social" && "Link do post compartilhado"}
                </Label>
                <Input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="Cole o link aqui..."
                  className="mt-2 rounded-xl"
                />
              </div>
              
              <Button
                onClick={handleClaimWithProof}
                disabled={claimingReward !== null}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl"
              >
                {claimingReward ? "Resgatando..." : `Resgatar +${selectedReward?.credits} créditos`}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </NeuroVendasLayout>
  );
}
