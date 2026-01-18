import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Download, Loader2, CheckCircle, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface PresentationViewerProps {
  apresentacaoId: string;
  procedimento?: string;
  onClose?: () => void;
}

interface ApresentacaoStatus {
  apresentacao_id: string;
  generation_id: string;
  procedimento: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  embed_url?: string;
  export_url?: string;
  is_ready: boolean;
}

const PresentationViewer: React.FC<PresentationViewerProps> = ({ 
  apresentacaoId, 
  procedimento, 
  onClose 
}) => {
  const [status, setStatus] = useState<ApresentacaoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  // Função para verificar status
  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/gamma/apresentacoes/status/${apresentacaoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const data = await response.json();
      setStatus(data);
      setLoading(false);

      // Parar polling quando completar ou falhar
      if (data.status === 'completed' || data.status === 'failed') {
        setPolling(false);
      }

      return data;
    } catch (err) {
      setError('Erro ao carregar apresentação');
      setLoading(false);
      setPolling(false);
    }
  };

  // Polling automático
  useEffect(() => {
    checkStatus();

    if (polling) {
      const interval = setInterval(() => {
        checkStatus();
      }, 10000); // 10 segundos

      return () => clearInterval(interval);
    }
  }, [apresentacaoId, polling]);

  // Loading state com skeleton premium
  if (loading && !status) {
    return (
      <Card className="w-full h-[80vh] flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-1/4 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Carregando sua apresentação...</h3>
          <p className="text-gray-600">Preparando uma experiência premium</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full h-[80vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Ops! Algo deu errado</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  // Processing state com mensagem motivacional que aumenta valor percebido
  if (status && status.status !== 'completed') {
    return (
      <Card className="w-full h-[80vh] flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="text-center max-w-lg px-6">
          <div className="relative mb-6">
            <Loader2 className="w-20 h-20 animate-spin text-purple-600 mx-auto" />
            <Sparkles className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
            <Sparkles className="w-6 h-6 text-pink-400 absolute -bottom-1 -left-2 animate-pulse delay-300" />
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-gray-900 animate-pulse">
            ✨ Nossa IA está desenhando sua estratégia de ouro...
          </h3>
          
          <div className="space-y-3 mb-6">
            <p className="text-gray-700 leading-relaxed">
              Estamos aplicando <strong className="text-purple-700">gatilhos de Neurovendas</strong> e 
              criando uma apresentação <strong className="text-pink-600">elegante e persuasiva</strong> para seu procedimento de <strong>{status.procedimento || procedimento}</strong>.
            </p>
            
            <p className="text-sm text-gray-600 italic">
              💎 Cada slide está sendo cuidadosamente elaborado com design <strong>Quiet Luxury</strong> e linguagem de alto ticket.
            </p>
          </div>
          
          <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-full shadow-lg mb-6">
            <Loader2 className="w-5 h-5 animate-spin mr-3 text-purple-600" />
            <span className="font-semibold text-purple-700">
              {status.status === 'pending' ? '🎨 Iniciando criação premium...' : '🔮 Aplicando inteligência de vendas...'}
            </span>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800 font-medium mb-2">
              ⏱️ Tempo estimado: 2-5 minutos
            </p>
            <p className="text-xs text-yellow-700">
              Estamos criando 8 slides com autoridade visual. <strong>Vale cada segundo!</strong>
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Failed state com retry
  if (status && status.status === 'failed') {
    const handleRetry = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/gamma/apresentacoes/retry/${apresentacaoId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Erro ao reiniciar geração');
        }

        const data = await response.json();
        
        // Reiniciar polling
        setPolling(true);
        setLoading(false);
        
        // Mostrar feedback
        alert('✅ Nova geração iniciada! Aguardando processamento...');
        
      } catch (err: any) {
        setError(err.message || 'Erro ao tentar novamente');
        setLoading(false);
      }
    };

    return (
      <Card className="w-full h-[80vh] flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md px-6">
          <div className="relative mb-6">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-100 rounded-full p-2">
              <span className="text-2xl">😔</span>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-gray-900">Ops! Algo não saiu como esperado</h3>
          
          <p className="text-gray-700 mb-4 leading-relaxed">
            Não conseguimos gerar sua apresentação desta vez. Isso pode acontecer por instabilidade da API ou limite de créditos.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              💡 <strong>Dica:</strong> Tentar novamente iniciará uma nova geração com cache limpo. 
              Isso consumirá créditos novamente.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="gap-2"
            >
              Voltar ao Dashboard
            </Button>
            
            <Button 
              onClick={handleRetry}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </>
              )}
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Se o problema persistir, entre em contato com o suporte.
          </p>
        </div>
      </Card>
    );
  }

  // Completed state - Container Premium de Visualização
  return (
    <div className="w-full space-y-4">
      {/* Header Premium com Ações */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">Sua Estratégia de Vendas Pronta!</h3>
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <p className="text-purple-100 text-sm">
                Apresentação premium de <strong>{status?.procedimento || procedimento}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Botão para editar no Gamma */}
            {status?.url && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => window.open(status.url, '_blank')}
                className="gap-2 bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Personalizar com IA
              </Button>
            )}

            {/* Botão para download PPTX */}
            {status?.export_url && (
              <Button
                size="lg"
                onClick={() => window.open(status.export_url, '_blank')}
                className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold shadow-lg"
              >
                <Download className="w-5 h-5" />
                Baixar PPTX
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Canvas de Apresentação Premium */}
      <Card 
        className="overflow-hidden border-4 border-purple-200 rounded-2xl shadow-2xl" 
        style={{ height: '75vh' }}
      >
        {status?.embed_url ? (
          <iframe
            src={status.embed_url}
            title="Gamma Presentation - Premium Viewer"
            className="w-full h-full border-none"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">URL de visualização não disponível</p>
          </div>
        )}
      </Card>

      {/* Barra de Dicas e Informações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dica de navegação */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 text-white p-2 rounded-lg">
              <span className="text-sm font-bold">💡</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Navegação</p>
              <p className="text-xs text-blue-700">
                Use as setas do teclado (← →) para navegar entre os slides
              </p>
            </div>
          </div>
        </Card>

        {/* Dica de edição */}
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 text-white p-2 rounded-lg">
              <span className="text-sm font-bold">✨</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-900 mb-1">Edição com IA</p>
              <p className="text-xs text-purple-700">
                Clique em "Personalizar com IA" para editar com ferramentas avançadas do Gamma
              </p>
            </div>
          </div>
        </Card>

        {/* Dica de uso */}
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 text-white p-2 rounded-lg">
              <span className="text-sm font-bold">🎯</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-900 mb-1">Apresentação Premium</p>
              <p className="text-xs text-green-700">
                Feita com gatilhos de Neurovendas para maximizar conversão
                {status?.from_cache && (
                  <span className="block mt-1 text-[10px] text-green-600">
                    ⚡ Carregado do cache (otimizado)
                  </span>
                )}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PresentationViewer;
