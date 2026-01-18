import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import {
  Check,
  Crown,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Loader2,
  CheckCircle,
  XCircle,
  BookOpen,
  Globe,
  Presentation,
  FileText,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlanLimits {
  ebooks: number;
  sites: number;
  slides: number;
  blogs: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  credits: number;
  badge: string | null;
  tagline?: string;
  description: string;
  features: string[];
  limits?: PlanLimits;
  use_case?: string;
  result?: string;
  guarantee: string;
}

export default function Plans() {
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [philosophy, setPhilosophy] = useState<string>("");
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "cancelled" | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadPlans();
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    const sessionId = searchParams.get("session_id");
    const status = searchParams.get("status");

    if (status === "cancelled") {
      setPaymentStatus("cancelled");
      toast({
        title: "Pagamento cancelado",
        description: "Você cancelou o processo de pagamento.",
        variant: "destructive",
      });
      return;
    }

    if (sessionId && status === "success") {
      let attempts = 0;
      const maxAttempts = 10;
      
      const pollStatus = async () => {
        try {
          const response = await api.get(`/api/payments/status/${sessionId}`);
          
          if (response.data.payment_status === "paid") {
            setPaymentStatus("success");
            toast({
              title: "🎉 Pagamento confirmado!",
              description: `Plano ${response.data.plan} ativado. +${response.data.credits_added} créditos adicionados!`,
            });
            loadPlans();
            return;
          }
          
          if (attempts < maxAttempts) {
            attempts++;
            setTimeout(pollStatus, 2000);
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      };
      
      pollStatus();
    }
  };

  const loadPlans = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        api.get("/api/plans"),
        api.get("/api/auth/me"),
      ]);
      setPlans(plansRes.data.plans || []);
      setPhilosophy(plansRes.data.philosophy || "");
      setCurrentPlan(userRes.data.user?.plan || "free");
    } catch (error) {
      console.error("Error loading plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setProcessingPlan(planId);
    
    try {
      const response = await api.post("/api/payments/create-checkout", {
        plan_id: planId,
        origin_url: window.location.origin,
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error: any) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Não foi possível processar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case "essencial":
        return "from-slate-50 to-violet-50/50";
      case "profissional":
        return "from-violet-50 to-indigo-50";
      case "premium":
        return "from-slate-900 to-violet-900";
      default:
        return "from-slate-50 to-slate-100";
    }
  };

  const getPlanAccent = (planId: string) => {
    switch (planId) {
      case "essencial":
        return "text-slate-700";
      case "profissional":
        return "text-violet-700";
      case "premium":
        return "text-white";
      default:
        return "text-slate-700";
    }
  };

  if (loading) {
    return (
      <NeuroVendasLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
        </div>
      </NeuroVendasLayout>
    );
  }

  return (
    <NeuroVendasLayout>
      <div className="max-w-7xl mx-auto px-4">
        {/* NAVEGAÇÃO */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Payment Status Banner */}
        {paymentStatus === "success" && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800">Pagamento confirmado!</p>
                <p className="text-sm text-emerald-600">Seu plano foi ativado com sucesso. Bem-vindo!</p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === "cancelled" && (
          <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Pagamento cancelado</p>
                <p className="text-sm text-red-600">Você pode tentar novamente quando quiser.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100/80 rounded-full mb-6">
            <Shield className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-violet-700">7 dias de garantia incondicional</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Escolha seu plano
          </h1>
          
          {philosophy && (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {philosophy}
            </p>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4 mb-16">
          {plans.map((plan, index) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isPopular = plan.badge === "MAIS POPULAR";
            const isPremium = plan.id === "premium";
            const isProcessing = processingPlan === plan.id;
            
            return (
              <div
                key={plan.id}
                className={`relative ${isPopular ? "lg:-mt-4 lg:mb-4" : ""}`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge 
                      className={`px-4 py-1 text-xs font-semibold tracking-wide ${
                        isPremium 
                          ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 border-0" 
                          : "bg-violet-600 text-white border-0"
                      }`}
                    >
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <Card
                  className={`relative h-full p-8 rounded-3xl border transition-all duration-300 overflow-hidden ${
                    isPremium
                      ? "bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 border-violet-500/30 text-white"
                      : isPopular
                      ? "bg-white border-violet-300 shadow-xl shadow-violet-100/50"
                      : "bg-white border-slate-200 hover:border-violet-200 hover:shadow-lg"
                  }`}
                >
                  {/* Decorative gradient */}
                  {isPremium && (
                    <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  )}

                  {/* Plan Header */}
                  <div className="relative mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isPremium ? "bg-violet-500/20" : "bg-violet-100"
                      }`}>
                        {plan.id === "essencial" && <Zap className={`w-5 h-5 ${isPremium ? "text-violet-300" : "text-violet-600"}`} />}
                        {plan.id === "profissional" && <Sparkles className={`w-5 h-5 ${isPremium ? "text-violet-300" : "text-violet-600"}`} />}
                        {plan.id === "premium" && <Crown className="w-5 h-5 text-amber-400" />}
                      </div>
                      <h3 className={`text-xl font-bold ${isPremium ? "text-white" : "text-slate-900"}`}>
                        {plan.name}
                      </h3>
                    </div>
                    
                    {plan.tagline && (
                      <p className={`text-sm ${isPremium ? "text-violet-200" : "text-violet-600"} font-medium`}>
                        {plan.tagline}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-sm ${isPremium ? "text-slate-400" : "text-slate-500"}`}>R$</span>
                      <span className={`text-5xl font-bold tracking-tight ${isPremium ? "text-white" : "text-slate-900"}`}>
                        {plan.price.toFixed(0)}
                      </span>
                      <span className={`text-sm ${isPremium ? "text-slate-400" : "text-slate-500"}`}>/mês</span>
                    </div>
                    <p className={`text-sm mt-1 ${isPremium ? "text-violet-300" : "text-violet-600"} font-medium`}>
                      {plan.credits} créditos/mês
                    </p>
                  </div>

                  {/* Limits Cards */}
                  {plan.limits && (
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className={`p-3 rounded-xl ${isPremium ? "bg-white/5" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-2">
                          <BookOpen className={`w-4 h-4 ${isPremium ? "text-violet-300" : "text-violet-500"}`} />
                          <span className={`text-xs ${isPremium ? "text-slate-300" : "text-slate-600"}`}>E-books</span>
                        </div>
                        <p className={`text-lg font-bold mt-1 ${isPremium ? "text-white" : "text-slate-900"}`}>
                          {plan.limits.ebooks}/mês
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${isPremium ? "bg-white/5" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-2">
                          <Globe className={`w-4 h-4 ${isPremium ? "text-violet-300" : "text-violet-500"}`} />
                          <span className={`text-xs ${isPremium ? "text-slate-300" : "text-slate-600"}`}>Sites</span>
                        </div>
                        <p className={`text-lg font-bold mt-1 ${isPremium ? "text-white" : "text-slate-900"}`}>
                          {plan.limits.sites}/mês
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${isPremium ? "bg-white/5" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-2">
                          <Presentation className={`w-4 h-4 ${isPremium ? "text-violet-300" : "text-violet-500"}`} />
                          <span className={`text-xs ${isPremium ? "text-slate-300" : "text-slate-600"}`}>Slides</span>
                        </div>
                        <p className={`text-lg font-bold mt-1 ${isPremium ? "text-white" : "text-slate-900"}`}>
                          {plan.limits.slides}/mês
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${isPremium ? "bg-white/5" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-2">
                          <FileText className={`w-4 h-4 ${isPremium ? "text-violet-300" : "text-violet-500"}`} />
                          <span className={`text-xs ${isPremium ? "text-slate-300" : "text-slate-600"}`}>Blogs</span>
                        </div>
                        <p className={`text-lg font-bold mt-1 ${isPremium ? "text-white" : "text-slate-900"}`}>
                          {plan.limits.blogs > 0 ? `${plan.limits.blogs}/mês` : "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isPremium ? "bg-violet-500/20" : "bg-violet-100"
                        }`}>
                          <Check className={`w-3 h-3 ${isPremium ? "text-violet-300" : "text-violet-600"}`} />
                        </div>
                        <span className={`text-sm ${isPremium ? "text-slate-300" : "text-slate-600"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Result */}
                  {plan.result && (
                    <div className={`p-4 rounded-xl mb-6 ${isPremium ? "bg-violet-500/10 border border-violet-500/20" : "bg-violet-50 border border-violet-100"}`}>
                      <p className={`text-sm font-medium ${isPremium ? "text-violet-200" : "text-violet-700"}`}>
                        👉 {plan.result}
                      </p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isCurrentPlan || isProcessing}
                    className={`w-full h-12 rounded-xl font-semibold transition-all duration-300 ${
                      isPremium
                        ? "bg-white text-slate-900 hover:bg-violet-100"
                        : isPopular
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : isCurrentPlan ? (
                      "Plano atual"
                    ) : (
                      <>
                        Começar agora
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className="text-center pb-8">
          <div className="inline-flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Pagamento seguro</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Cancele quando quiser</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Ativação imediata</span>
            </div>
          </div>
        </div>
      </div>
    </NeuroVendasLayout>
  );
}
