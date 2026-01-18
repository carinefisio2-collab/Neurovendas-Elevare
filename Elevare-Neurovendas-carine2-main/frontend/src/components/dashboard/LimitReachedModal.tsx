import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Crown,
  Zap,
  X,
  ArrowRight,
  Infinity,
} from "lucide-react";

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: string;
  currentUsage: number;
  limit: number;
  planName?: string;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  resourceType,
  currentUsage,
  limit,
  planName = "atual",
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  const resourceNames: Record<string, string> = {
    post: "posts",
    carousel: "carrosséis",
    story: "stories",
    stories: "stories",
    ebook: "e-books",
    blog: "artigos de blog",
    whatsapp: "scripts de WhatsApp",
  };

  const resourceName = resourceNames[resourceType] || resourceType;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-in fade-in">
      <Card className="max-w-md w-full mx-4 p-0 overflow-hidden animate-in zoom-in-95">
        {/* Header vermelho */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Limite Atingido</h2>
          <p className="text-red-100 text-sm mt-1">
            Você usou todos os {resourceName} do seu plano
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Uso atual */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
            <span className="text-red-700">Uso este mês:</span>
            <span className="font-bold text-red-800">
              {currentUsage} / {limit} {resourceName}
            </span>
          </div>

          <p className="text-slate-600 text-sm mb-6">
            Para continuar criando {resourceName}, você precisa fazer upgrade do seu plano.
          </p>

          {/* Benefícios do upgrade */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Com o upgrade você terá:
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Zap className="w-4 h-4 text-violet-500" />
              <span>Mais criações por mês</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Infinity className="w-4 h-4 text-violet-500" />
              <span>Acesso a recursos premium</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Crown className="w-4 h-4 text-violet-500" />
              <span>Suporte prioritário</span>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-2">
            <Link to="/dashboard/planos" onClick={onClose}>
              <Button className="w-full bg-violet-600 hover:bg-violet-700">
                <Crown className="w-4 h-4 mr-2" />
                Ver Planos e Fazer Upgrade
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full text-slate-500"
              onClick={onClose}
            >
              Continuar depois
            </Button>
          </div>
        </div>

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </Card>
    </div>
  );
}

// Hook para usar o modal de limite
import { useState, useCallback } from "react";

export function useLimitModal() {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    resourceType: string;
    currentUsage: number;
    limit: number;
  }>({
    isOpen: false,
    resourceType: "",
    currentUsage: 0,
    limit: 0,
  });

  const showLimitModal = useCallback((data: {
    resourceType: string;
    currentUsage: number;
    limit: number;
  }) => {
    setModalData({ ...data, isOpen: true });
  }, []);

  const closeLimitModal = useCallback(() => {
    setModalData(prev => ({ ...prev, isOpen: false }));
  }, []);

  return {
    modalData,
    showLimitModal,
    closeLimitModal,
    LimitModal: () => (
      <LimitReachedModal
        isOpen={modalData.isOpen}
        onClose={closeLimitModal}
        resourceType={modalData.resourceType}
        currentUsage={modalData.currentUsage}
        limit={modalData.limit}
      />
    ),
  };
}

export default LimitReachedModal;
