import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  Zap,
  Bot,
  BookOpen,
  Calendar,
  FileText,
  LogOut,
  Menu,
  ChevronDown,
  Sparkles,
  Library,
  Palette,
  Phone,
  Instagram,
  ClipboardCheck,
  Users,
  Sun,
  Moon,
  Target,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface NeuroVendasLayoutProps {
  children: React.ReactNode;
}

// Estrutura de menu por seções (igual ao Dashboard)
interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  icon: any;
  href: string;
  badge?: string | null;
  isPro?: boolean;
}

export default function NeuroVendasLayout({ children }: NeuroVendasLayoutProps) {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] mb-5 shadow-xl shadow-primary/30 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-muted-foreground font-medium">Carregando Elevare NeuroVendas...</p>
        </div>
      </div>
    );
  }

  // Menu completo com todas as funcionalidades
  const menuSections: MenuSection[] = [
    {
      title: "",
      items: [
        { label: "Início", icon: Home, href: "/dashboard" },
      ]
    },
    {
      title: "Assistente IA",
      items: [
        { label: "Chat LucresIA", icon: MessageSquare, href: "/dashboard/chat", badge: "IA" },
      ]
    },
    {
      title: "Diagnóstico & Marca",
      items: [
        { label: "Meu Diagnóstico", icon: ClipboardCheck, href: "/dashboard/diagnostico-premium" },
        { label: "Análise do Instagram", icon: Zap, href: "/dashboard/radar-bio" },
        { label: "Histórico", icon: BarChart3, href: "/dashboard/historico-diagnosticos" },
        { label: "Construtor de Marca", icon: Palette, href: "/dashboard/construtor-marca" },
      ]
    },
    {
      title: "Criar Conteúdo",
      items: [
        { label: "Criador de Posts", icon: Bot, href: "/dashboard/robo-produtor", badge: "IA" },
        { label: "Stories", icon: Instagram, href: "/dashboard/stories" },
        { label: "E-books", icon: BookOpen, href: "/dashboard/ebooks" },
        { label: "Blog & Artigos", icon: FileText, href: "/dashboard/blog" },
      ]
    },
    {
      title: "Vendas & Conversão",
      items: [
        { label: "Scripts WhatsApp", icon: Phone, href: "/dashboard/whatsapp" },
        { label: "Central NeuroVendas", icon: Library, href: "/dashboard/biblioteca" },
        { label: "Campanhas de Tráfego", icon: Target, href: "/dashboard/calendario", badge: "ADS" },
        { label: "ELEVARE 365 PRO", icon: Calendar, href: "/dashboard/calendario-365", badge: "PRO" },
      ]
    },
    {
      title: "Leads",
      items: [
        { label: "Gestão de Leads", icon: Users, href: "/dashboard/leads" },
      ]
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-accent/20 dark:from-background dark:via-background dark:to-accent/5">
      {/* Sidebar - Premium Elevare */}
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } bg-card border-r border-border/50 shadow-sm transition-all duration-500 ease-out flex flex-col`}
      >
        {/* Logo - Elevare NeuroVendas */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-tight">Elevare</h1>
                <p className="text-xs text-primary font-semibold">NeuroVendas</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2.5 hover:bg-accent rounded-xl transition-all duration-300"
            title={sidebarOpen ? "Recolher menu" : "Expandir menu"}
          >
            <Menu className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation - Premium com Seções */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Título da seção */}
              {section.title && sidebarOpen && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
                  {section.title}
                </p>
              )}
              
              {/* Items da seção */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigate(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-accent text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${isActive ? "text-primary" : "group-hover:scale-110"}`} />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm font-medium flex-1 text-left truncate">
                            {item.label}
                          </span>
                      {item.badge && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              item.badge === "IA" 
                                ? "bg-gradient-to-r from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] text-white shadow-sm"
                                : "bg-secondary text-secondary-foreground"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile - Premium */}
        <div className="p-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl hover:bg-accent transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(270,60%,55%)] to-[hsl(270,70%,45%)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-primary/25">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.plan === "pro" ? "Plano Pro" : user?.plan === "master" ? "Plano Master" : "Plano Gratuito"}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Clean & Professional */}
        <div className="bg-card border-b border-border/50 px-10 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              {user?.name?.split(" ")[0] || "Usuário"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Método Elevare NeuroVendas
            </p>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-accent transition-all duration-300 group"
            title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <Sun className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-accent/30 to-background">
          <div className="p-10">{children}</div>
        </div>
      </main>
    </div>
  );
}
