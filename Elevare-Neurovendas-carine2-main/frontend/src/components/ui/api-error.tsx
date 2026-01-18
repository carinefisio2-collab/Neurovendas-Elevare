import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";

interface APIErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  retryLabel?: string;
  fullScreen?: boolean;
}

export function APIError({
  title = "Ops! Algo deu errado",
  message,
  onRetry,
  showHomeButton = true,
  retryLabel = "Tentar novamente",
  fullScreen = false,
}: APIErrorProps) {
  const navigate = useNavigate();

  const content = (
    <div className="max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-4">
        <AlertCircle className="w-8 h-8 text-destructive" />
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6">
        {message}
      </p>

      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-primary hover:bg-primary/90"
            data-testid="retry-button"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {retryLabel}
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            data-testid="home-button-error"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir para Início
          </Button>
        )}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12 px-6">
      {content}
    </div>
  );
}

// Toast-style error (não bloqueia tela inteira)
export function APIErrorToast({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Erro na requisição</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Tentar novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Mensagens de erro humanizadas por tipo
export const ErrorMessages = {
  aiOverloaded: "A LucresIA está processando muitas requisições neste momento. Por favor, aguarde alguns segundos e tente novamente.",
  networkError: "Não conseguimos conectar ao servidor. Verifique sua conexão e tente novamente.",
  authError: "Sua sessão expirou. Por favor, faça login novamente para continuar.",
  validationError: "Alguns campos estão inválidos. Revise as informações e tente novamente.",
  insufficientCredits: "Você não tem créditos suficientes para esta ação. Considere fazer upgrade do seu plano.",
  genericError: "Encontramos um problema inesperado. Nossa equipe foi notificada. Por favor, tente novamente em alguns instantes.",
  timeout: "A requisição demorou mais do que o esperado. Tente novamente ou reduza a complexidade da solicitação.",
};

// Helper para identificar tipo de erro e retornar mensagem apropriada
export function getErrorMessage(error: any): string {
  if (!error) return ErrorMessages.genericError;

  // Erro de autenticação
  if (error.response?.status === 401 || error.response?.status === 403) {
    return ErrorMessages.authError;
  }

  // Erro de validação
  if (error.response?.status === 422 || error.response?.status === 400) {
    return error.response?.data?.detail || ErrorMessages.validationError;
  }

  // Erro de créditos
  if (error.response?.status === 402) {
    return error.response?.data?.detail || ErrorMessages.insufficientCredits;
  }

  // Sobrecarga do servidor/IA
  if (error.response?.status === 429 || error.response?.status === 503) {
    return ErrorMessages.aiOverloaded;
  }

  // Timeout
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ErrorMessages.timeout;
  }

  // Erro de rede
  if (!error.response) {
    return ErrorMessages.networkError;
  }

  // Mensagem específica da API ou fallback
  return error.response?.data?.detail || error.message || ErrorMessages.genericError;
}

export default APIError;
