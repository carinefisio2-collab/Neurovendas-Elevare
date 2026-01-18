import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showHome?: boolean;
  backTo?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  showBack = true,
  showHome = true,
  backTo,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleHome = () => {
    navigate("/dashboard");
  };

  return (
    <div className={cn("mb-6", className)}>
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 mb-4">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
        )}
        {showHome && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHome}
            className="text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        )}
      </div>

      {/* Title Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// Compact back button for use anywhere
export function BackButton({ 
  to, 
  label = "Voltar",
  className 
}: { 
  to?: string; 
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      {label}
    </Button>
  );
}

// Home button
export function HomeButton({ className }: { className?: string }) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/dashboard")}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <Home className="w-4 h-4 mr-1" />
      Dashboard
    </Button>
  );
}

// Floating navigation bar (fixed at bottom on mobile)
export function FloatingNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <div className="flex items-center gap-2 bg-card border border-border rounded-full shadow-lg px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard")}
          className="rounded-full"
        >
          <Home className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default PageHeader;
