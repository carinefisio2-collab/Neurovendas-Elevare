import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { Sparkles, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, name);
      toast({
        title: "🎉 Conta criada com sucesso!",
        description: "Bem-vinda ao Elevare NeuroVendas! Você ganhou 100 créditos grátis.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "100 créditos grátis todo mês",
    "Acesso à LucresIA Chat",
    "Radar de Bio e Robô Produtor",
    "Biblioteca de prompts",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/30 dark:from-background dark:via-background dark:to-accent/10 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background decorations - warm lilac */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo - Elevare NeuroVendas */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] flex items-center justify-center shadow-xl shadow-primary/30 group-hover:shadow-2xl group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-500">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Elevare</h1>
              <p className="text-sm text-primary font-semibold">NeuroVendas</p>
            </div>
          </Link>
        </div>

        <Card className="p-10 bg-card/90 backdrop-blur-sm border border-border/50 shadow-2xl shadow-primary/5 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Crie sua conta grátis</h2>
            <p className="text-muted-foreground mt-2">Comece a transformar seu negócio</p>
          </div>

          {/* Benefits */}
          <div className="mb-8 p-5 bg-gradient-to-br from-accent to-accent/50 rounded-2xl border border-primary/10">
            <p className="text-sm font-semibold text-primary mb-3">Você terá acesso a:</p>
            <ul className="space-y-2.5">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-foreground/80">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm animate-fade-up">
                {error}
              </div>
            )}

            <div>
              <Label className="text-foreground font-medium">Seu nome</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Como quer ser chamada?"
                className="mt-2 h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                required
              />
            </div>

            <div>
              <Label className="text-foreground font-medium">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-2 h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                required
              />
            </div>

            <div>
              <Label className="text-foreground font-medium">Senha</Label>
              <div className="relative mt-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-12 h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,60%,50%)] hover:to-[hsl(270,70%,40%)] text-white py-6 rounded-xl font-semibold text-base shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  Criar minha conta
                  <Sparkles className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300">
                Fazer login
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Ao criar sua conta, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
