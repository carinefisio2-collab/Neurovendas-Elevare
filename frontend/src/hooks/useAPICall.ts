import { useState } from "react";
import { getErrorMessage } from "@/components/ui/api-error";
import { useToast } from "@/hooks/use-toast";

interface UseAPICallOptions {
  showSuccessToast?: boolean;
  successMessage?: string;
  showErrorToast?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function useAPICall<T = any>(options: UseAPICallOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { toast } = useToast();

  const execute = async (apiCall: () => Promise<T>) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      setData(result);

      if (options.showSuccessToast && options.successMessage) {
        toast({
          title: "Sucesso!",
          description: options.successMessage,
          variant: "default",
        });
      }

      if (options.onSuccess) {
        options.onSuccess(result);
      }

      return result;
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      if (options.showErrorToast !== false) {
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
        });
      }

      if (options.onError) {
        options.onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

export default useAPICall;
