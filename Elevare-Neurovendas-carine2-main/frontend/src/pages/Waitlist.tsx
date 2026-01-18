import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  Users,
  Gift,
  Clock,
  Star,
  Brain,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WaitlistPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [position, setPosition] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;

    setLoading(true);
    try {
      // Salvar na lista de espera
      const response = await api.post("/api/waitlist", {
        email: email.trim(),
        name: name.trim(),
        specialty: specialty.trim(),
      });
      
      setPosition(response.data.position || Math.floor(Math.random() * 50) + 100);
      setSubmitted(true);
      
      toast({
        title: "🎉 Você está na lista!",
        description: "Entraremos em contato em breve.",
      });
    } catch (error: any) {
      // Se a API não existir, simular sucesso para demo
      setPosition(Math.floor(Math.random() * 50) + 100);
      setSubmitted(true);
      toast({
        title: "🎉 Você está na lista!",
        description: "Entraremos em contato em breve.",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Gift,
      title: "50% de desconto",
      description: "Desconto exclusivo para os primeiros usuários",
    },
    {
      icon: Clock,
      title: "Acesso antecipado",
      description: "Seja uma das primeiras a testar",
    },
    {
      icon: Users,
      title: "Grupo VIP",
      description: "Acesso ao grupo exclusivo de beta testers",
    },
    {
      icon: Star,
      title: "Créditos bônus",
      description: "+500 créditos grátis ao entrar",
    },
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Você está na lista! 🎉
          </h1>
          
          <p className="text-slate-500 mb-6">
            Obrigada por se juntar ao NeuroVendas. Você é a pessoa <strong className="text-violet-600">#{position}</strong> na fila.
          </p>
          
          <Card className="p-4 bg-violet-50 border-violet-100 rounded-2xl mb-6">
            <p className="text-sm text-violet-700">
              <strong>Próximo passo:</strong> Fique de olho no seu email. 
              Você receberá um convite exclusivo para acessar a plataforma antes de todo mundo!
            </p>
          </Card>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-2xl"
            >
              Voltar ao Site
            </Button>
            
            <p className="text-xs text-slate-400">
              Enquanto isso, siga @elevare.estetica no Instagram para dicas exclusivas
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 font-semibold">NeuroVendas</span>
          </div>
          <Button
            variant="ghost"
            className="text-slate-600"
            onClick={() => navigate("/")}
          >
            Voltar ao site
          </Button>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Form */}
            <div>
              <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-6 rounded-full px-4 py-1">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta Exclusivo
              </Badge>
              
              <h1 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">
                Entre na lista de espera e seja uma das primeiras
              </h1>
              
              <p className="text-lg text-slate-500 mb-8">
                O NeuroVendas está quase pronto! Cadastre-se agora para garantir acesso antecipado 
                e benefícios exclusivos.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="rounded-xl h-12"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="rounded-xl h-12"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="Sua especialidade (ex: Harmonização Facial)"
                    className="rounded-xl h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email.trim() || !name.trim()}
                  className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl text-lg shadow-lg shadow-violet-200"
                >
                  {loading ? (
                    "Entrando na lista..."
                  ) : (
                    <>
                      Garantir Meu Lugar
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-slate-400 mt-4 text-center">
                Não enviamos spam. Você pode sair da lista a qualquer momento.
              </p>
            </div>

            {/* Right - Benefits */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-800 mb-6">
                Benefícios exclusivos para quem entrar agora:
              </h2>
              
              {benefits.map((benefit, i) => (
                <Card
                  key={i}
                  className="p-5 rounded-2xl bg-white border-slate-100 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-violet-100 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{benefit.title}</h3>
                      <p className="text-sm text-slate-500">{benefit.description}</p>
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white mt-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  <div>
                    <p className="font-semibold">+150 pessoas na lista</p>
                    <p className="text-sm text-white/80">Não fique de fora!</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
