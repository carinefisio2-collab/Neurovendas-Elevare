import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showBreadcrumb?: boolean;
  customBackPath?: string;
}

export default function PageHeader({
  title,
  description,
  showBackButton = true,
  showBreadcrumb = true,
  customBackPath,
}: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Gerar breadcrumb baseado na URL
  const generateBreadcrumb = () => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      dashboard: "Início",
      "diagnostico-premium": "Meu Diagnóstico",
      "radar-bio": "Análise do Instagram",
      "robo-produtor": "Criador de Posts",
      ebooks: "E-books",
      blog: "Artigos para Blog",
      whatsapp: "Scripts WhatsApp",
      stories: "Stories Prontos",
      leads: "Meus Leads",
      calendario: "Calendário",
      biblioteca: "Biblioteca",
      "construtor-marca": "Identidade da Marca",
      historico: "Histórico",
      creditos: "Créditos",
      planos: "Planos",
    };

    return pathParts.map((part, index) => ({
      label: breadcrumbMap[part] || part.charAt(0).toUpperCase() + part.slice(1),
      path: `/${pathParts.slice(0, index + 1).join("/")}`,
      isLast: index === pathParts.length - 1,
    }));
  };

  const breadcrumb = generateBreadcrumb();

  const handleBack = () => {
    if (customBackPath) {
      navigate(customBackPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="mb-6" data-testid="page-header">
      {/* Breadcrumb */}
      {showBreadcrumb && breadcrumb.length > 1 && (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <div key={item.path} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4" />}
              {item.isLast ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className="hover:text-foreground transition-colors"
                  data-testid={`breadcrumb-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>
      )}

      {/* Header com botão voltar */}
      <div className="flex items-start gap-4">
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mt-1 -ml-2 hover:bg-secondary"
            data-testid="back-button"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <div className="flex-1">
          {title && (
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {title}
            </h1>
          )}
          {description && (
            <p className="text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
