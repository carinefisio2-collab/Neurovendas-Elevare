import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  MessageSquare,
  Zap,
  Search,
  Bot,
  Calendar,
  Crown,
  Users,
  TrendingUp,
  Shield,
  Play,
  Star,
  ChevronRight,
  Target,
  BarChart3,
  Palette,
  FileText,
  Clock,
  Award,
} from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: "LucresIA Chat",
      description: "Sua consultora de NeuroVendas 24h, treinada para criar comunicação que converte.",
      badge: "IA",
    },
    {
      icon: Search,
      title: "Radar de Bio",
      description: "Análise completa do seu perfil com sugestões de otimização baseadas em micro-dores.",
      badge: null,
    },
    {
      icon: Bot,
      title: "Robô Produtor",
      description: "Carrosséis NeuroVendas prontos em segundos com a estrutura que vende.",
      badge: "IA",
    },
    {
      icon: Palette,
      title: "Construtor de Marca",
      description: "Defina sua identidade visual e tom de voz para consistência em todo conteúdo.",
      badge: null,
    },
    {
      icon: Calendar,
      title: "Calendário Elevare",
      description: "Planejamento estratégico de conteúdo com datas especiais e sazonalidades.",
      badge: "PRO",
    },
    {
      icon: FileText,
      title: "Fábrica SEO",
      description: "Landing pages e sites otimizados para conversão de pacientes.",
      badge: "PRO",
    },
  ];

  const stats = [
    { value: "87%", label: "Aumento médio em engajamento" },
    { value: "2.4x", label: "Mais agendamentos" },
    { value: "500+", label: "Profissionais ativos" },
    { value: "10k+", label: "Conteúdos gerados" },
  ];

  const steps = [
    {
      number: "01",
      title: "Analise",
      description: "Entenda as micro-dores da sua cliente com nossa metodologia NeuroVendas exclusiva.",
    },
    {
      number: "02",
      title: "Crie",
      description: "Gere conteúdos de alta conversão com IA treinada especificamente para estética.",
    },
    {
      number: "03",
      title: "Converta",
      description: "Transforme seguidores em pacientes fiéis com comunicação que ativa a decisão de compra.",
    },
  ];

  const testimonials = [
    {
      text: "Em 30 dias, dobrei meus agendamentos só mudando a forma de comunicar. A LucresIA entende o que a cliente precisa ouvir.",
      name: "Dra. Mariana Costa",
      role: "Biomédica Esteta",
      result: "+94% leads",
    },
    {
      text: "Finalmente entendi por que meus posts não convertiam. O método NeuroVendas mudou completamente minha estratégia.",
      name: "Ana Beatriz",
      role: "Esteticista",
      result: "+2x clientes",
    },
    {
      text: "Economizo 8 horas por semana com o Robô Produtor. Conteúdo profissional sem depender de agência.",
      name: "Dra. Fernanda Lima",
      role: "Dermatologista",
      result: "8h/semana",
    },
  ];

  const plans = [
    {
      name: "Gratuito",
      price: "0",
      description: "Para começar a transformar",
      features: ["100 créditos/mês", "LucresIA Chat", "Radar de Bio básico", "Biblioteca de prompts"],
      cta: "Começar Grátis",
      highlight: false,
    },
    {
      name: "Pro",
      price: "97",
      description: "Para profissionais em crescimento",
      features: ["500 créditos/mês", "Todas as ferramentas IA", "Calendário Elevare", "Fábrica SEO", "Suporte prioritário"],
      cta: "Assinar Pro",
      highlight: true,
      badge: "Mais Popular",
    },
    {
      name: "Master",
      price: "197",
      description: "Para clínicas e equipes",
      features: ["2000 créditos/mês", "E-books e apresentações", "Múltiplos usuários", "API e integrações", "Consultoria mensal"],
      cta: "Assinar Master",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-brand-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-brand-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-900 flex items-center justify-center shadow-lg shadow-brand-indigo-600/20 group-hover:shadow-xl group-hover:shadow-brand-indigo-600/30 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-brand-slate-900 tracking-tight">Elevare</span>
              <span className="text-xs text-brand-indigo-600 font-semibold block -mt-0.5">NeuroVendas</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-brand-slate-600 hover:text-brand-indigo-600 transition-colors">
              Recursos
            </a>
            <a href="#pricing" className="text-sm font-medium text-brand-slate-600 hover:text-brand-indigo-600 transition-colors">
              Planos
            </a>
            <a href="#testimonials" className="text-sm font-medium text-brand-slate-600 hover:text-brand-indigo-600 transition-colors">
              Depoimentos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/login")}
              className="text-brand-slate-600 hover:text-brand-indigo-600 hover:bg-brand-indigo-600/5 font-medium"
            >
              Entrar
            </Button>
            <Button 
              onClick={() => navigate("/register")}
              className="bg-brand-indigo-600 hover:bg-brand-indigo-700 text-white font-medium px-5 rounded-xl shadow-lg shadow-brand-indigo-600/20 hover:shadow-xl hover:shadow-brand-indigo-600/30 transition-all duration-300"
            >
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section - Tech Sky Gradient */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background - Light Tech Sky with Lavanda */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2e2a5e] via-[#4338a8] to-[#6366f1]" />
        
        {/* Strong lavanda glow from top */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-30%,rgba(196,191,255,0.5),transparent)]" />
        
        {/* Lavanda accent glow at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#C4BFFF]/20 via-[#AFA8FF]/10 to-transparent" />
        
        {/* Side lavanda glows for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_0%_50%,rgba(196,191,255,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_100%_50%,rgba(196,191,255,0.15),transparent)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/10">
              <Sparkles className="w-4 h-4 text-brand-lavanda-DEFAULT" />
              Feita por esteticista para esteticista
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Pare de postar no escuro.
              <br />
              <span className="text-brand-lavanda-light">
                Comunique com estratégia.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Sua cliente não quer apenas um procedimento. Ela quer se sentir segura, desejada e transformada.
              A LucresIA cria conteúdo que ativa essas emoções.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button 
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-brand-indigo-600 hover:bg-brand-indigo-500 text-white font-semibold px-8 py-6 text-base rounded-2xl shadow-2xl shadow-brand-indigo-600/30 hover:shadow-brand-indigo-500/40 transition-all duration-300 group"
              >
                Começar Grátis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/30 font-medium px-8 py-6 text-base rounded-2xl transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver demonstração
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-lavanda-DEFAULT" />
                100 créditos grátis
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-lavanda-DEFAULT" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand-lavanda-DEFAULT" />
                Cancele quando quiser
              </span>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div 
                  key={index}
                  className="text-center p-6 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.12] transition-colors duration-300"
                >
                  <p className="text-3xl lg:text-4xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-brand-indigo-600 font-semibold text-sm tracking-wide uppercase mb-4">
              O Problema Invisível
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
              Quanto custa parecer amadora nas redes?
            </h2>
            <p className="text-lg text-brand-slate-600 leading-relaxed">
              Na estética, sua cliente compra primeiro a sensação de{" "}
              <span className="text-brand-slate-900 font-medium">segurança e autoridade</span>.
              Só depois ela olha o procedimento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "Pacientes que não chegam",
                description: "Perfis sem posicionamento claro perdem 3 a 5 atendimentos por semana.",
                highlight: "Não por preço. Por falta de conexão.",
                colorClass: "from-rose-50 to-rose-100/50 border-rose-100",
                iconClass: "text-rose-500 bg-rose-100",
                textClass: "text-rose-600",
              },
              {
                icon: Clock,
                title: "Tempo desperdiçado",
                description: "Se sua hora vale R$ 150 e você gasta 4h em conteúdo: R$ 600/semana de prejuízo.",
                highlight: "E sem garantia de resultado.",
                colorClass: "from-amber-50 to-amber-100/50 border-amber-100",
                iconClass: "text-amber-500 bg-amber-100",
                textClass: "text-amber-600",
              },
              {
                icon: Target,
                title: "Dinheiro mal investido",
                description: "R$ 2.000+ com agências que não entendem estética nem comportamento feminino.",
                highlight: "Postam bonito. Não convertem.",
                colorClass: "from-blue-50 to-blue-100/50 border-blue-100",
                iconClass: "text-blue-500 bg-blue-100",
                textClass: "text-blue-600",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card 
                  key={index}
                  className={`p-8 bg-gradient-to-br ${item.colorClass} border rounded-3xl hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.iconClass} flex items-center justify-center mb-5`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-slate-900 mb-3">{item.title}</h3>
                  <p className="text-brand-slate-600 mb-4 leading-relaxed">{item.description}</p>
                  <p className={`text-sm font-semibold ${item.textClass}`}>
                    {item.highlight}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-brand-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-brand-indigo-600 font-semibold text-sm tracking-wide uppercase mb-4">
              Como Funciona
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
              Três passos para comunicação que vende
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-indigo-200 to-transparent -translate-x-8" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-900 text-white text-2xl font-bold mb-6 shadow-xl shadow-brand-indigo-600/20">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-brand-slate-900 mb-3">{step.title}</h3>
                  <p className="text-brand-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-white relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(196,191,255,0.08),transparent_60%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-brand-indigo-600 font-semibold text-sm tracking-wide uppercase mb-4">
              Ferramentas
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-lg text-brand-slate-600 leading-relaxed">
              Cada ferramenta foi criada para resolver uma dor específica de profissionais de estética.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index}
                  className="group p-8 bg-white border border-brand-slate-100 rounded-3xl hover:border-brand-lavanda-DEFAULT hover:shadow-2xl hover:shadow-brand-lavanda-DEFAULT/20 hover:-translate-y-1 transition-all duration-300 ease-out"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-brand-slate-50 group-hover:bg-brand-lavanda-soft group-hover:shadow-lg group-hover:shadow-brand-lavanda-DEFAULT/30 flex items-center justify-center transition-all duration-300">
                      <Icon className="w-7 h-7 text-brand-slate-500 group-hover:text-brand-indigo-600 transition-colors duration-300" />
                    </div>
                    {feature.badge && (
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                        feature.badge === "IA" 
                          ? "bg-brand-indigo-600 text-white shadow-brand-indigo-600/20" 
                          : "bg-brand-lavanda-light text-brand-indigo-700"
                      }`}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-brand-slate-900 mb-2 group-hover:text-brand-indigo-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-brand-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-brand-indigo-900 via-brand-indigo-800 to-brand-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,191,255,0.15),transparent_70%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-lavanda-DEFAULT/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-brand-lavanda-DEFAULT" />
              </div>
              <span className="text-brand-lavanda-DEFAULT text-sm font-semibold tracking-wide uppercase">
                Método Exclusivo
              </span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">
              Método NeuroVendas Elevare
            </h2>

            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-2xl">
              Primeiro capturamos a <strong className="text-white">Atenção</strong>, 
              depois criamos <strong className="text-white">Identificação</strong>, 
              apresentamos a <strong className="text-white">Solução</strong> e 
              conduzimos à <strong className="text-white">Venda</strong>.
            </p>

            <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 mb-10">
              <p className="text-xl text-white/90 italic leading-relaxed">
                &ldquo;Ela não quer emagrecer. Ela quer parar de se esconder nas fotos.&rdquo;
              </p>
              <p className="text-brand-lavanda-DEFAULT text-sm mt-4 font-medium">
                — Isso é micro-dor. Isso é o que vende.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                "Venda começa na ativação emocional",
                "Micro-dores geram mais resposta neural",
                "Clareza cognitiva converte mais",
                "Atenção → Identificação → Solução → Venda",
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10"
                >
                  <CheckCircle className="w-5 h-5 text-brand-lavanda-DEFAULT flex-shrink-0" />
                  <span className="text-white/90 text-sm">{item}</span>
                </div>
              ))}
            </div>

            <Button 
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-white text-brand-indigo-600 hover:bg-brand-slate-50 font-semibold px-8 py-6 text-base rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 group"
            >
              Usar o Método NeuroVendas
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-28 bg-brand-slate-50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(196,191,255,0.06),transparent_60%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-brand-indigo-600 font-semibold text-sm tracking-wide uppercase mb-4">
              Resultados Reais
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
              Sem exagero, sem milagre
            </h2>
            <p className="text-lg text-brand-slate-600 leading-relaxed">
              Resultados de quem aplicou o método com consistência.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="group p-8 bg-white border border-brand-slate-100 rounded-3xl hover:border-brand-lavanda-DEFAULT/50 hover:shadow-xl hover:shadow-brand-lavanda-DEFAULT/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-brand-lavanda-dark text-brand-lavanda-dark" />
                  ))}
                </div>
                <p className="text-brand-slate-700 mb-8 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-brand-indigo-600/20">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-brand-slate-900 text-sm">{testimonial.name}</p>
                      <p className="text-xs text-brand-slate-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                    {testimonial.result}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 lg:py-28 bg-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,191,255,0.05),transparent_60%)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <p className="text-brand-indigo-600 font-semibold text-sm tracking-wide uppercase mb-4">
              Planos
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
              Marketing que se paga no primeiro mês
            </h2>
            <p className="text-lg text-brand-slate-600 leading-relaxed">
              Escolha o plano ideal para o momento da sua clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index}
                className={`group relative p-8 rounded-3xl transition-all duration-300 ${
                  plan.highlight 
                    ? "bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-900 text-white border-0 shadow-2xl shadow-brand-indigo-600/30 scale-[1.02] md:scale-105" 
                    : "bg-white border border-brand-slate-200 hover:border-brand-lavanda-DEFAULT hover:shadow-xl hover:shadow-brand-lavanda-DEFAULT/10 hover:-translate-y-1"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-lavanda-DEFAULT text-brand-indigo-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-brand-lavanda-DEFAULT/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? "text-white" : "text-brand-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${plan.highlight ? "text-white/70" : "text-brand-slate-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-brand-slate-500"}`}>R$</span>
                    <span className={`text-5xl font-bold tracking-tight ${plan.highlight ? "text-white" : "text-brand-slate-900"}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-brand-slate-500"}`}>/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${plan.highlight ? "text-white/90" : "text-brand-slate-600"}`}>
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-brand-lavanda-DEFAULT" : "text-brand-indigo-600"}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => navigate("/register")}
                  className={`w-full py-6 rounded-2xl font-semibold transition-all duration-300 ${
                    plan.highlight 
                      ? "bg-white text-brand-indigo-600 hover:bg-brand-slate-50 shadow-lg" 
                      : "bg-brand-slate-50 text-brand-slate-700 hover:bg-brand-indigo-600 hover:text-white group-hover:bg-brand-lavanda-soft group-hover:text-brand-indigo-700"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>

          <p className="text-center text-brand-slate-500 text-sm mt-10">
            Todos os planos incluem <strong className="text-brand-slate-700">7 dias de garantia</strong>. 
            Não gostou? Devolvemos seu dinheiro.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28 bg-brand-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.05),transparent_70%)]" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-brand-slate-900 mb-6 tracking-tight">
            O jeito antigo de fazer marketing na estética morreu.
          </h2>
          <p className="text-lg text-brand-slate-600 mb-10 leading-relaxed">
            Você pode continuar postando e torcendo.
            <br />
            Ou pode começar a comunicar sabendo exatamente por que ela compra.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/register")}
            className="bg-brand-indigo-600 hover:bg-brand-indigo-700 text-white font-semibold px-10 py-7 text-lg rounded-2xl shadow-2xl shadow-brand-indigo-600/30 hover:shadow-brand-indigo-600/40 transition-all duration-300 group"
          >
            Começar Agora — É Grátis
            <Sparkles className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
          </Button>
          <p className="text-sm text-brand-slate-500 mt-6 flex items-center justify-center gap-2">
            <CheckCircle className="w-4 h-4 text-brand-indigo-600" />
            100 créditos grátis • Sem cartão • Setup em 2 minutos
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-indigo-600 to-brand-indigo-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">NeuroVendas</span>
                <span className="text-xs text-brand-slate-400 block -mt-0.5">by Elevare</span>
              </div>
            </div>

            <div className="max-w-md text-center md:text-left">
              <p className="text-brand-slate-300 text-sm leading-relaxed">
                <strong className="text-white">Carine Marques</strong> criou a Elevare a partir de 20 anos de rotina clínica.
                Nasceu da prática real, dos erros caros e da necessidade de transformar estética em negócio previsível.
              </p>
            </div>
          </div>

          <div className="border-t border-brand-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-brand-slate-500 text-sm">
              © 2024 Elevare. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="text-brand-slate-400 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-brand-slate-400 hover:text-white transition-colors">
                Privacidade
              </a>
              <a href="#" className="text-brand-slate-400 hover:text-white transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
