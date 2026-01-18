import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Sparkles, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pegar email e mensagem do state (quando redireciona de QuickRegister)
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.message) {
      setInfo(location.state.message);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      
      // Verificar se há redirecionamento pendente (vindo do QuickRegister)
      const redirectAfterLogin = localStorage.getItem('redirect_after_login');
      
      if (redirectAfterLogin) {
        console.log("🔄 Login: Redirecionando para", redirectAfterLogin);
        localStorage.removeItem('redirect_after_login');
        window.location.href = redirectAfterLogin;
      } else {
        // Sempre redireciona para dashboard após login
        navigate("/dashboard");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erro ao fazer login. Verifique suas credenciais.";
      setError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Bem-vinda de volta!</h2>
            <p className="text-muted-foreground mt-2">Entre para acessar sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {info && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl text-blue-700 dark:text-blue-300 text-sm flex items-start gap-3 animate-fade-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{info}</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive text-sm animate-fade-up">
                {error}
              </div>
            )}

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
                  placeholder="••••••••"
                  className="pr-12 h-12 rounded-xl border-border focus:border-primary/50 focus:ring-primary/20 transition-all duration-300"
                  required
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

            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-300">
                Esqueci minha senha
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,60%,50%)] hover:to-[hsl(270,70%,40%)] text-white py-6 rounded-xl font-semibold text-base shadow-lg shadow-primary/25"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Entrando no dashboard...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors duration-300">
                Criar conta grátis
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-8">
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
        </p>
      </div>
    </div>
  );
}
