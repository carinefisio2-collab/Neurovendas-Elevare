import { useState } from "react";
import { CheckCircle2, Download, Edit2, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EbookSuccessProps {
  ebookId: string;
  title: string;
  subtitle: string;
  onEdit: () => void;
  onCreateAnother: () => void;
  onGoToLibrary: () => void;
}

export default function EbookSuccess({
  ebookId,
  title,
  subtitle,
  onEdit,
  onCreateAnother,
  onGoToLibrary,
}: EbookSuccessProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await api.post("/api/ebook-new/generate-pdf", {
        ebook_id: ebookId,
      });
      
      if (response.data.success && response.data.pdf_url) {
        setPdfUrl(response.data.pdf_url);
        toast({ title: "Sucesso!", description: "PDF gerado com sucesso!" });
      } else {
        throw new Error("Erro ao gerar PDF");
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.response?.data?.detail || "Erro ao gerar PDF.", variant: "destructive" });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      // Se for base64, criar link de download
      if (pdfUrl.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `${title.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(pdfUrl, "_blank");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-12 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">E-book Criado!</h1>
          <p className="text-green-100">Seu material foi gerado com sucesso</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* E-book Info */}
          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
            <p className="text-slate-600">{subtitle}</p>
          </div>

          {/* PDF Generation Section */}
          {!pdfUrl ? (
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 mb-8 border border-violet-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-violet-900">Finalize seu E-book</h3>
                  <p className="text-sm text-violet-700">
                    Gere o PDF profissional com capa, sumário e capítulos organizados
                  </p>
                </div>
              </div>
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPdf}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
                size="lg"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando PDF...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Gerar PDF Profissional
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 border border-green-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-green-900">Material Finalizado!</h3>
                  <p className="text-sm text-green-700">
                    Seu e-book está pronto para download
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Download className="w-5 h-5 mr-2" />
                Baixar PDF
              </Button>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onEdit}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar Conteúdo
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={onCreateAnother}
                variant="ghost"
                className="flex items-center justify-center gap-2 text-slate-600"
              >
                <Sparkles className="w-4 h-4" />
                Criar Outro
              </Button>
              <Button
                onClick={onGoToLibrary}
                variant="ghost"
                className="flex items-center justify-center gap-2 text-slate-600"
              >
                Ver Biblioteca
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
