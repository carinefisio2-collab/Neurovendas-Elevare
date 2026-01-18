import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const resetToken = searchParams.get("token");
  
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [reset, setReset] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await api.post("/api/auth/reset-password", {
        token: resetToken,
        new_password: newPassword,
      });
      setReset(true);
      toast({
        title: "Senha alterada!",
        description: "Você já pode fazer login.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.detail || "Token inválido ou expirado.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset password form (with token)
  if (resetToken) {
    if (reset) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Senha Alterada!
            </h1>
            <p className="text-slate-500 mb-6">
              Sua nova senha foi configurada com sucesso.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
            >
              Fazer Login
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Nova Senha
            </h1>
            <p className="text-slate-500">
              Digite sua nova senha abaixo.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <Label className="text-slate-700">Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-2 rounded-xl"
                required
              />
            </div>

            <div>
              <Label className="text-slate-700">Confirmar senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite novamente"
                className="mt-2 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
            >
              {loading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  // Request reset form
  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Email Enviado!
          </h1>
          <p className="text-slate-500 mb-6">
            Se o email existir em nossa base, você receberá um link para redefinir sua senha.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-2xl shadow-violet-100 border-violet-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-200">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Esqueci a Senha
          </h1>
          <p className="text-slate-500">
            Digite seu email para receber um link de recuperação.
          </p>
        </div>

        <form onSubmit={handleRequestReset} className="space-y-4">
          <div>
            <Label className="text-slate-700">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-2 rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 rounded-xl"
          >
            {loading ? "Enviando..." : "Enviar Link de Recuperação"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-slate-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
