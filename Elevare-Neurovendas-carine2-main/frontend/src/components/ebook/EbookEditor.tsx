import { useState, useEffect } from "react";
import { ChevronLeft, Edit2, Save, Loader2, Download, Sparkles, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  content: string;
}

interface Ebook {
  id: string;
  title: string;
  subtitle?: string;
  introduction?: string;
  conclusion?: string;
  next_step?: string;
  chapters?: Chapter[];
  pdf_url?: string;
  created_at: string;
  updated_at?: string;
}

interface EbookEditorProps {
  ebookId: string;
  onBack: () => void;
}

export default function EbookEditor({ ebookId, onBack }: EbookEditorProps) {
  const [ebook, setEbook] = useState<Ebook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedSubtitle, setEditedSubtitle] = useState("");
  const [editedIntroduction, setEditedIntroduction] = useState("");
  const [editedConclusion, setEditedConclusion] = useState("");
  const [editedNextStep, setEditedNextStep] = useState("");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEbook();
  }, [ebookId]);

  const fetchEbook = async () => {
    try {
      const response = await api.get(`/api/ebook-new/${ebookId}`);
      if (response.data.success) {
        setEbook(response.data.ebook);
      }
    } catch (error) {
      console.error("Error fetching ebook:", error);
      toast.error("Erro ao carregar e-book");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put(`/api/ebook-new/${ebookId}`, {
        title: editedTitle,
        subtitle: editedSubtitle,
        introduction: editedIntroduction,
        conclusion: editedConclusion,
        next_step: editedNextStep,
      });
      toast.success("E-book atualizado com sucesso!");
      setIsEditMode(false);
      fetchEbook();
    } catch (error) {
      toast.error("Erro ao atualizar e-book");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await api.post("/api/ebook-new/generate-pdf", {
        ebook_id: ebookId,
      });
      
      if (response.data.success && response.data.pdf_url) {
        setGeneratedPdfUrl(response.data.pdf_url);
        toast.success("PDF gerado com sucesso! Pronto para download.");
        fetchEbook();
      }
    } catch (error) {
      toast.error("Erro ao gerar PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPDF = () => {
    const urlToOpen = generatedPdfUrl || ebook?.pdf_url;
    if (urlToOpen) {
      if (urlToOpen.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = urlToOpen;
        link.download = `${ebook?.title?.replace(/\s+/g, "-") || "ebook"}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(urlToOpen, "_blank");
      }
    }
  };

  const handleRefineChapter = async (chapterId: string, chapterTitle: string) => {
    const refinementPrompt = prompt(
      `Como você gostaria de aperfeiçoar o capítulo "${chapterTitle}"?`
    );
    if (!refinementPrompt) return;

    try {
      await api.post(`/api/ebook-new/refine-chapter`, {
        ebook_id: ebookId,
        chapter_id: chapterId,
        refinement_prompt: refinementPrompt,
      });
      toast.success("Capítulo aperfeiçoado com sucesso!");
      fetchEbook();
    } catch (error) {
      toast.error("Erro ao aperfeiçoar capítulo");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">E-book não encontrado</p>
      </div>
    );
  }

  const hasPdf = ebook.pdf_url || generatedPdfUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">{ebook.title}</h2>
          <p className="text-slate-600 mt-1">
            {hasPdf ? "Material finalizado" : "Editando e-book"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => {
              if (isEditMode) {
                handleSave();
              } else {
                setIsEditMode(true);
                setEditedTitle(ebook.title);
                setEditedSubtitle(ebook.subtitle || "");
                setEditedIntroduction(ebook.introduction || "");
                setEditedConclusion(ebook.conclusion || "");
                setEditedNextStep(ebook.next_step || "");
              }
            }}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isEditMode ? (
              <>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4" />
                Editar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Finalization Banner */}
      {hasPdf && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900">Material Finalizado!</h3>
              <p className="text-green-700 text-sm mt-1">
                Seu e-book está pronto. Clique no botão para baixar o arquivo PDF completo.
              </p>
            </div>
            <Button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Baixar PDF
            </Button>
          </div>
        </div>
      )}

      {/* Main Action - Generate PDF */}
      {!hasPdf && (
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-violet-900">Finalizar E-book</h3>
              <p className="text-violet-700 text-sm mt-1">
                Gere o PDF profissional com capa, sumário e capítulos organizados.
              </p>
            </div>
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white"
              size="lg"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Gerar PDF Final
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* E-book Content */}
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="text-xs font-bold text-violet-600 mb-2 block">TÍTULO</label>
          {isEditMode ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="text-xl font-bold"
            />
          ) : (
            <div className="text-2xl font-bold text-slate-800">{ebook.title}</div>
          )}
        </div>

        {/* Subtitle */}
        <div>
          <label className="text-xs font-bold text-violet-600 mb-2 block">SUBTÍTULO</label>
          {isEditMode ? (
            <Input
              value={editedSubtitle}
              onChange={(e) => setEditedSubtitle(e.target.value)}
            />
          ) : (
            <div className="text-lg text-slate-600">{ebook.subtitle}</div>
          )}
        </div>

        {/* Introduction */}
        <div>
          <label className="text-xs font-bold text-violet-600 mb-2 block">INTRODUÇÃO</label>
          {isEditMode ? (
            <Textarea
              value={editedIntroduction}
              onChange={(e) => setEditedIntroduction(e.target.value)}
              rows={5}
            />
          ) : (
            <div className="text-slate-700 whitespace-pre-wrap">{ebook.introduction}</div>
          )}
        </div>

        {/* Chapters */}
        {ebook.chapters && ebook.chapters.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Capítulos ({ebook.chapters.length})
            </h3>
            <div className="space-y-6">
              {ebook.chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">
                      Capítulo {chapter.chapter_number}: {chapter.title}
                    </h4>
                    {!isEditMode && (
                      <Button
                        onClick={() => handleRefineChapter(chapter.id, chapter.title)}
                        size="sm"
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Sparkles className="w-3 h-3" />
                        Aperfeiçoar
                      </Button>
                    )}
                  </div>
                  <div className="text-slate-700 whitespace-pre-wrap text-sm max-h-40 overflow-y-auto">
                    {chapter.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conclusion */}
        <div className="border-t pt-6">
          <label className="text-xs font-bold text-green-600 mb-2 block">CONCLUSÃO</label>
          {isEditMode ? (
            <Textarea
              value={editedConclusion}
              onChange={(e) => setEditedConclusion(e.target.value)}
              rows={4}
            />
          ) : (
            <div className="text-slate-700 whitespace-pre-wrap">{ebook.conclusion}</div>
          )}
        </div>

        {/* Next Step */}
        <div className="border-t pt-6">
          <label className="text-xs font-bold text-yellow-600 mb-2 block">PRÓXIMO PASSO</label>
          {isEditMode ? (
            <Textarea
              value={editedNextStep}
              onChange={(e) => setEditedNextStep(e.target.value)}
              rows={3}
            />
          ) : (
            <div className="text-slate-700 whitespace-pre-wrap font-semibold">
              {ebook.next_step}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-slate-500">
          Criado em {new Date(ebook.created_at).toLocaleDateString("pt-BR")}
          {ebook.updated_at && ebook.updated_at !== ebook.created_at && (
            <> · Atualizado em {new Date(ebook.updated_at).toLocaleDateString("pt-BR")}</>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasPdf && (
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPdf}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Regenerar PDF
            </Button>
          )}
          {hasPdf && (
            <Button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
