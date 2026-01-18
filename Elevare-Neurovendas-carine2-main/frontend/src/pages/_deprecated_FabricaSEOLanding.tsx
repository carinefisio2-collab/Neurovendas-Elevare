import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Check,
  Search,
  TrendingUp,
  Target,
  Award,
  Brain,
  Sparkles,
  ArrowRight,
  BarChart3,
  Globe,
  Lightbulb,
  Clock,
  Star,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FabricaSEOLanding() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("master");

  const features = [
    {
      icon: Brain,
      title: "IA que Entende Estética",
      description: "Artigos criados especificamente para procedimentos estéticos, com linguagem que conecta com sua cliente.",
    },
    {
      icon: Search,
      title: "SEO Automático",
      description: "Keywords otimizadas para buscas locais como 'Botox em SP' ou 'Criolipólise perto de mim'.",
    },
    {
      icon: BarChart3,
      title: "Score de Performance",
      description: "Avaliação em tempo real do potencial de ranqueamento de cada artigo.",
    },
    {
      icon: Target,
      title: "Nível de Consciência",
      description: "Conteúdo adaptado para cada estágio da jornada da cliente (descoberta até decisão).",
    },
    {
      icon: Lightbulb,
      title: "Gerador de Ideias",
      description: "Nunca mais fique sem ideias. A IA sugere temas baseados na sua especialidade.",
    },
    {
      icon: Globe,
      title: "SEO Local",
      description: "Otimização para aparecer quando clientes da sua região buscarem procedimentos.",
    },
  ];

  const articleTypes = [
    { name: "Guia de Procedimento", words: "1500 palavras", icon: FileText },
    { name: "Comparativo", words: "1200 palavras", icon: Target },
    { name: "Mitos e Verdades", words: "1000 palavras", icon: Brain },
    { name: "Antes e Depois", words: "1000 palavras", icon: TrendingUp },
    { name: "Guia Local (SEO)", words: "800 palavras", icon: Globe },
    { name: "Lista/Listicle", words: "1200 palavras", icon: Lightbulb },
  ];

  const testimonials = [
    {
      name: "Dra. Carla Mendes",
      role: "Clínica Renova - São Paulo",
      text: "Antes eu pagava R$500 por artigo para um redator. Agora gero conteúdo melhor em minutos e já apareço na primeira página do Google para 'harmonização facial zona sul'.",
      avatar: "CM",
    },
    {
      name: "Patricia Santos",
      role: "Espaço Beauty - Rio de Janeiro",
      text: "O SEO automático é incrível. Meus artigos sobre criolipólise já trouxeram 23 agendamentos só de busca orgânica.",
      avatar: "PS",
    },
  ];

  const plans = [
    {
      id: "pro",
      name: "SEO Pro",
      price: "97",
      description: "Para quem quer começar no SEO",
      features: [
        "10 artigos/mês",
        "Score de SEO básico",
        "3 ideias/mês",
        "Suporte por email",
      ],
      notIncluded: [
        "Gerador ilimitado de ideias",
        "Análise de concorrência",
        "Consultoria SEO",
      ],
    },
    {
      id: "master",
      name: "SEO Master",
      price: "197",
      description: "Para quem quer dominar o Google",
      popular: true,
      features: [
        "Artigos ilimitados",
        "Score de SEO completo",
        "Ideias ilimitadas",
        "Análise de keywords",
        "Suporte prioritário",
        "Integração com WordPress",
      ],
      notIncluded: [],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-800 font-semibold">Fábrica de Conteúdo SEO</span>
              <span className="text-slate-400 text-sm ml-2 hidden sm:inline">by NeuroVendas</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-slate-600 hover:text-slate-800" onClick={() => navigate("/login")}>
              Entrar
            </Button>
            <Button 
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl shadow-lg shadow-violet-200" 
              onClick={() => navigate("/register")}
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-6 rounded-full px-4 py-1">
              <Sparkles className="w-3 h-3 mr-1" />
              Powered by IA Avançada
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight tracking-tight">
              Apareça no Google Quando
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
                Sua Cliente Buscar
              </span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 font-light">
              Artigos SEO criados por IA especialmente para clínicas de estética.
              Ranqueie para buscas como "Botox em SP" ou "Harmonização facial zona sul".
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-lg px-8 rounded-2xl shadow-xl shadow-violet-200"
                onClick={() => navigate("/register")}
              >
                Criar Meu Primeiro Artigo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-2xl"
                onClick={() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" })}
              >
                Ver Como Funciona
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16">
            {[
              { value: "3.2k+", label: "Artigos Gerados" },
              { value: "89%", label: "Score SEO Médio" },
              { value: "47%", label: "Taxa de Ranqueamento" },
              { value: "12min", label: "Tempo Médio/Artigo" },
            ].map((stat, i) => (
              <Card key={i} className="p-6 bg-white border-slate-100 text-center rounded-3xl shadow-lg shadow-slate-100">
                <p className="text-3xl font-bold text-violet-600">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            O Problema que Você Conhece Bem
          </h2>
          <p className="text-lg text-slate-500 mb-12 font-light">
            Você sabe que precisa de presença online, mas...
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Sem Tempo", desc: "Atender clientes já consome todo seu dia. Escrever artigos? Impossível." },
              { icon: Users, title: "Redator Caro", desc: "R$300-500 por artigo. E ainda precisa explicar tudo sobre estética." },
              { icon: Search, title: "SEO Complexo", desc: "Keywords, meta tags, headings... Você é esteticista, não especialista em SEO." },
            ].map((item, i) => (
              <Card key={i} className="p-6 bg-white border-slate-100 rounded-3xl shadow-xl shadow-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="como-funciona" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4 rounded-full px-4 py-1">
              <Check className="w-3 h-3 mr-1" />
              A Solução
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
              IA que Cria Conteúdo SEO Para Estética
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-light">
              Artigos otimizados prontos em minutos. Com score de SEO em tempo real.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="p-6 bg-white border-slate-100 hover:border-violet-200 transition-all group rounded-3xl shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-violet-100">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center mb-4 group-hover:bg-violet-100 transition-colors">
                  <feature.icon className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Article Types */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              6 Tipos de Artigo Prontos
            </h2>
            <p className="text-slate-500 font-light">Estruturas testadas e otimizadas para SEO</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {articleTypes.map((type, i) => (
              <Card key={i} className="p-5 bg-white border-slate-100 hover:border-violet-200 transition-all rounded-3xl shadow-lg shadow-slate-100">
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center mb-3">
                  <type.icon className="w-5 h-5 text-violet-600" />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{type.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{type.words}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Quem Já Está Ranqueando
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-6 bg-white border-slate-100 rounded-3xl shadow-xl shadow-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-200">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    <p className="text-sm text-slate-400">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{testimonial.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-violet-400 fill-violet-400" />)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Escolha Seu Plano
            </h2>
            <p className="text-slate-500 font-light">Cancele quando quiser. Sem compromisso.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 border-2 transition-all cursor-pointer rounded-3xl ${
                  selectedPlan === plan.id
                    ? "bg-white border-violet-400 shadow-2xl shadow-violet-100"
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-xl shadow-slate-100"
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="bg-violet-600 text-white mb-4 rounded-full">Mais Popular</Badge>
                )}
                <h3 className="text-2xl font-bold text-slate-800">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold text-slate-800">R${plan.price}</span>
                  <span className="text-slate-400 ml-2">/mês</span>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-600">
                      <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-violet-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className={`w-full rounded-2xl ${
                    selectedPlan === plan.id
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-violet-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  onClick={() => navigate("/register")}
                >
                  Começar Agora
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <Card className="p-10 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100 shadow-2xl shadow-violet-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-200">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Pare de Perder Clientes Para o Google
            </h2>
            <p className="text-slate-600 mb-8 font-light">
              Enquanto você não aparece nas buscas, seus concorrentes estão captando suas clientes.
              Comece a rankear hoje mesmo.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-lg px-8 rounded-2xl shadow-xl shadow-violet-200"
              onClick={() => navigate("/register")}
            >
              Criar Meu Primeiro Artigo Grátis
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-slate-400 mt-4">
              Sem cartão de crédito • Acesso imediato
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-400 text-sm">Fábrica de Conteúdo SEO by NeuroVendas</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 Elevare. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
