import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw, AlertTriangle } from "lucide-react";

interface ServerErrorProps {
  error?: string;
  onRetry?: () => void;
}

export default function ServerError({ error, onRetry }: ServerErrorProps) {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 500 Visual */}
        <div className="relative mb-8">
          <div className="text-[150px] font-bold text-slate-100 leading-none select-none">
            500
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-xl shadow-red-500/30">
              <AlertTriangle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-slate-800 mb-3">
          Erro no servidor
        </h1>
        <p className="text-slate-500 mb-4">
          Desculpe, algo deu errado do nosso lado. Nossa equipe foi notificada.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
            <p className="text-sm text-red-600 font-mono break-all">
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleRetry}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="gap-2 bg-gradient-to-r from-red-600 to-orange-600"
          >
            <Home className="w-4 h-4" />
            Ir para Dashboard
          </Button>
        </div>

        {/* Help text */}
        <p className="text-xs text-slate-400 mt-8">
          Se o problema persistir, tente limpar o cache do navegador ou entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
