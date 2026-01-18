import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function QuickRegisterPresence() {
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Carregar dados do diagnóstico
    const data = localStorage.getItem('elevare_diagnostic_flow');
    if (data) {
      const parsed = JSON.parse(data);
      setDiagnosticData(parsed.step1);
    } else {
      // Se não tem diagnóstico, redireciona para landing
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!diagnosticData) {
      setError("Dados do diagnóstico não encontrados");
      return;
    }

    if (!email || !name || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("🔵 QuickRegister: Iniciando registro para", email);
      
      await register(email, password, name);
      
      console.log("✅ QuickRegister: Registro bem-sucedido!");
      
      // Aguardar um pouco para garantir que o token foi salvo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Salvar dados completos incluindo email/nome agora
      const diagnosticDataComplete = {
        ...diagnosticData,
        contactInfo: { email, name }
      };
      
      // Salvar intent no localStorage para o RadarBio saber que veio do quiz
      localStorage.setItem('radar_bio_from_quiz', 'true');
      localStorage.setItem('radar_bio_diagnostic_data', JSON.stringify(diagnosticDataComplete));
      
      console.log("🚀 QuickRegister: Redirecionando para /dashboard/radar-bio");
      
      // Usar window.location para garantir navegação
      window.location.href = '/dashboard/radar-bio';
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || "Erro ao criar conta";
      
      // Se email já existe, oferecer login
      if (errorMessage.includes("already registered") || errorMessage.includes("já cadastrado")) {
        console.log("⚠️ QuickRegister: Email já existe, salvando intent e redirecionando para login");
        
        // Salvar intent para depois do login ir para RadarBio
        localStorage.setItem('radar_bio_from_quiz', 'true');
        localStorage.setItem('radar_bio_diagnostic_data', JSON.stringify(diagnosticData));
        localStorage.setItem('redirect_after_login', '/dashboard/radar-bio');
        
        setError("Este email já possui uma conta. Redirecionando para login...");
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              email: email,
              message: "Você já tem uma conta! Faça login e iremos direto para análise." 
            } 
          });
        }, 2000);
      } else {
        console.log("❌ QuickRegister: Erro ao registrar:", errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!diagnosticData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  const firstName = name ? name.split(' ')[0] : "Usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F9F9] to-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#4F46E5]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-accent-gold/5 rounded-full blur-3xl" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_cf253d20-308c-4b29-8e54-b2ea7c71ddad/artifacts/n695y4js_Gemini_Generated_Image_9unc209unc209unc.png"
              alt="Elevare Logo"
              className="h-12 w-auto"
            />
            <h1 className="text-3xl font-bold">
              <span className="text-accent-gold">Neuro</span>
              <span className="text-[#4F46E5]">Vendas</span>
            </h1>
          </div>
        </div>

        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-[#4F46E5]/10">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div className="flex-1 h-1 bg-[#4F46E5]"></div>
              <div className="w-8 h-8 rounded-full bg-accent-gold text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
            </div>
            <p className="text-center text-sm text-[#1F2937]/60">
              Passo 2 de 2: Criar sua conta
            </p>
          </div>

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#1F2937] mb-2">
              Quase lá! 🎉
            </h2>
            <p className="text-[#1F2937]/70 mb-4">
              Preencha seus dados e acesse a plataforma com seus <strong className="text-accent-gold">100 créditos grátis</strong>
            </p>
          </div>

          {/* Formulário completo */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Nome completo
              </label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Crie uma senha para acessar
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1F2937]/40 hover:text-[#1F2937]/60"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4F46E5] to-accent-gold hover:from-[#4338CA] hover:to-[#FFD700] text-white font-bold py-6 text-lg rounded-xl shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Criando sua conta...
                </>
              ) : (
                <>
                  Entrar na Plataforma
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* O que vem a seguir */}
          <div className="mt-6 pt-6 border-t border-[#4F46E5]/10">
            <p className="text-xs text-center text-[#1F2937]/60 mb-3">
              🚀 O que você vai fazer agora:
            </p>
            <div className="space-y-2 text-xs text-[#1F2937]/70">
              <div className="flex items-center gap-2">
                <span className="text-[#4F46E5]">1️⃣</span>
                <span>Colocar seu @ do Instagram (opcional)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#4F46E5]">2️⃣</span>
                <span>Ver como está sua presença digital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-accent-gold">🎁</span>
                <span><strong>Usar seus 100 créditos grátis</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[#1F2937]/60 mt-6">
          Ao continuar, você concorda com nossos{' '}
          <a href="/terms" className="text-[#4F46E5] hover:underline">Termos de Uso</a>
          {' '}e{' '}
          <a href="/privacy" className="text-[#4F46E5] hover:underline">Política de Privacidade</a>
        </p>
      </div>
    </div>
  );
}