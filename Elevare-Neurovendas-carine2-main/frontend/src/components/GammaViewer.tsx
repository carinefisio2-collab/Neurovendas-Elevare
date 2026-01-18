import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface GammaViewerProps {
  ebookId: string;
  title?: string;
  onClose?: () => void;
}

interface EbookStatus {
  ebook_id: string;
  generation_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  url?: string;
  embed_url?: string;
  export_url?: string;
  is_ready: boolean;
}

const GammaViewer: React.FC<GammaViewerProps> = ({ ebookId, title, onClose }) => {
  const [status, setStatus] = useState<EbookStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  // Função para verificar status
  const checkStatus = async () => {
    try {
      const response = await fetch(`/api/gamma/ebooks/status/${ebookId}`, {
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
      setError('Erro ao carregar e-book');
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
  }, [ebookId, polling]);

  // Loading state
  if (loading && !status) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando e-book...</p>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </Card>
    );
  }

  // Processing state
  if (status && status.status !== 'completed') {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Gerando seu E-book...</h3>
          <p className="text-gray-600 mb-4">
            Estamos criando um conteúdo incrível para você! Isso pode levar alguns minutos.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Status: {status.status === 'pending' ? 'Aguardando' : 'Processando'}
          </div>
        </div>
      </Card>
    );
  }

  // Failed state
  if (status && status.status === 'failed') {
    return (
      <Card className="w-full h-[600px] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Erro na Geração</h3>
          <p className="text-gray-600 mb-4">
            Não foi possível gerar o e-book. Por favor, tente novamente.
          </p>
          <Button onClick={onClose}>Voltar</Button>
        </div>
      </Card>
    );
  }

  // Completed state - mostrar visualizador
  return (
    <div className="w-full space-y-4">
      {/* Barra de ações */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <div>
            <h3 className="font-bold text-gray-900">{title || 'E-book Gerado'}</h3>
            <p className="text-sm text-gray-500">Pronto para visualizar e editar</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Botão para editar no Gamma */}
          {status?.url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(status.url, '_blank')}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Editar no Gamma
            </Button>
          )}

          {/* Botão para download PPTX */}
          {status?.export_url && (
            <Button
              size="sm"
              onClick={() => window.open(status.export_url, '_blank')}
              className="gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <Download className="w-4 h-4" />
              Baixar PPTX
            </Button>
          )}
        </div>
      </div>

      {/* IFrame de visualização */}
      <Card className="overflow-hidden" style={{ height: '80vh' }}>
        {status?.embed_url ? (
          <iframe
            src={status.embed_url}
            title="Gamma E-book Viewer"
            className="w-full h-full border-none"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500">URL de visualização não disponível</p>
          </div>
        )}
      </Card>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Dica:</strong> Use as setas do teclado para navegar entre os slides. 
          Para edições avançadas com IA, clique em "Editar no Gamma".
        </p>
      </div>
    </div>
  );
};

export default GammaViewer;
