import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Wand2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerateButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
  variant?: "default" | "carousel" | "article" | "content";
  size?: "default" | "lg" | "xl";
  className?: string;
}

const variants = {
  default: "from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] hover:from-[hsl(270,60%,50%)] hover:to-[hsl(270,70%,40%)] shadow-primary/30",
  carousel: "from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/30",
  article: "from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/30",
  content: "from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 shadow-purple-500/30",
};

const sizes = {
  default: "h-12 px-6 text-sm",
  lg: "h-14 px-8 text-base",
  xl: "h-16 px-10 text-lg",
};

export function GenerateButton({
  onClick,
  loading = false,
  disabled = false,
  children,
  variant = "default",
  size = "lg",
  className,
}: GenerateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "w-full bg-gradient-to-r text-white font-bold rounded-xl shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Sparkles className="w-5 h-5 mr-2" />
          {children || "Gerar com IA"}
        </>
      )}
    </Button>
  );
}

// Validation helper for required fields
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRequiredFields(
  fields: { value: string | undefined | null; name: string }[]
): ValidationResult {
  const errors: string[] = [];
  
  fields.forEach(({ value, name }) => {
    if (!value || value.trim() === "") {
      errors.push(name);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Alert component for missing fields
interface MissingFieldsAlertProps {
  fields: string[];
  onDismiss?: () => void;
}

export function MissingFieldsAlert({ fields, onDismiss }: MissingFieldsAlertProps) {
  if (fields.length === 0) return null;
  
  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl animate-fade-up">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-amber-800">Campos obrigatórios</p>
          <p className="text-sm text-amber-700 mt-1">
            Preencha: {fields.join(", ")}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-amber-500 hover:text-amber-700 transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

export default GenerateButton;
