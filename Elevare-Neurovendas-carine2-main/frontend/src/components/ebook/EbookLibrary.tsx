import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Download, Edit2, Trash2, Eye, Share2, Loader2, Filter, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface EbookLibraryProps {
  onBack: () => void;
  onEdit: (ebookId: string) => void;
}

type SortOption = "recent" | "objective" | "specialty" | "status";

interface Ebook {
  id: string;
  title: string;
  subtitle?: string;
  professional_name: string;
  specialty: string;
  objective?: string;
  status: string;
  pdf_url?: string;
  views?: number;
  downloads?: number;
  created_at: string;
}

export default function EbookLibrary({ onBack, onEdit }: EbookLibraryProps) {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const { toast } = useToast();

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const response = await api.get("/api/ebook-new/list");
      if (response.data.success) {
        setEbooks(response.data.ebooks || []);
      }
    } catch (error) {
      console.error("Error fetching ebooks:", error);
      toast({ title: "Erro", description: "Erro ao carregar e-books", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar este e-book?")) {
      try {
        await api.delete(`/api/ebook-new/${id}`);
        toast({ title: "Sucesso!", description: "E-book deletado com sucesso!" });
        fetchEbooks();
      } catch (error) {
        toast({ title: "Erro", description: "Erro ao deletar e-book", variant: "destructive" });
      }
    }
  };

  const handleDownload = async (ebook: Ebook) => {
    if (ebook.pdf_url) {
      // Se for base64, criar link de download
      if (ebook.pdf_url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = ebook.pdf_url;
        link.download = `${ebook.title.replace(/\s+/g, "-")}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(ebook.pdf_url, "_blank");
      }
      
      // Registrar download
      try {
        await api.post(`/api/ebook-new/${ebook.id}/download`);
      } catch (e) {}
    }
  };

  // Sort ebooks
  const sortedEbooks = useMemo(() => {
    if (!ebooks) return [];
    
    const sorted = [...ebooks];
    
    switch (sortBy) {
      case "recent":
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "objective":
        return sorted.sort((a, b) => 
          (a.objective || "").localeCompare(b.objective || "")
        );
      case "specialty":
        return sorted.sort((a, b) => 
          (a.specialty || "").localeCompare(b.specialty || "")
        );
      case "status":
        return sorted.sort((a, b) => {
          const aScore = (a.status === "published" ? 2 : 0) + (a.pdf_url ? 1 : 0);
          const bScore = (b.status === "published" ? 2 : 0) + (b.pdf_url ? 1 : 0);
          return bScore - aScore;
        });
      default:
        return sorted;
    }
  }, [ebooks, sortBy]);

  // Group by objective when sorted by objective
  const groupedByObjective = useMemo(() => {
    if (sortBy !== "objective" || !sortedEbooks.length) return null;
    
    const groups: Record<string, typeof sortedEbooks> = {};
    sortedEbooks.forEach((ebook) => {
      const key = ebook.objective || "Sem objetivo definido";
      if (!groups[key]) groups[key] = [];
      groups[key].push(ebook);
    });
    return groups;
  }, [sortedEbooks, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  const renderEbookCard = (ebook: Ebook) => (
    <div
      key={ebook.id}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-slate-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-900">{ebook.title}</h3>
            {ebook.pdf_url && (
              <CheckCircle2 className="w-5 h-5 text-green-500" title="PDF disponível" />
            )}
          </div>
          <p className="text-slate-600 text-sm mt-1">{ebook.subtitle}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
            <span>👤 {ebook.professional_name}</span>
            <span>📂 {ebook.specialty}</span>
            <span>📅 {new Date(ebook.created_at).toLocaleDateString("pt-BR")}</span>
          </div>
          {ebook.objective && (
            <div className="mt-2 text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded inline-block">
              🎯 {ebook.objective.substring(0, 50)}{ebook.objective.length > 50 ? "..." : ""}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              ebook.pdf_url
                ? "bg-green-100 text-green-800"
                : ebook.status === "published"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {ebook.pdf_url ? "Finalizado" : ebook.status === "published" ? "Publicado" : "Rascunho"}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-violet-600">{ebook.views || 0}</div>
          <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
            <Eye className="w-3 h-3" />
            Visualizações
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{ebook.downloads || 0}</div>
          <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
            <Download className="w-3 h-3" />
            Downloads
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-600">-</div>
          <div className="text-xs text-slate-600 flex items-center justify-center gap-1 mt-1">
            <Share2 className="w-3 h-3" />
            Compartilhamentos
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => onEdit(ebook.id)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white flex-1"
        >
          <Edit2 className="w-4 h-4" />
          {ebook.pdf_url ? "Ver/Editar" : "Continuar Edição"}
        </Button>

        {ebook.pdf_url && (
          <Button
            onClick={() => handleDownload(ebook)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
        )}

        <Button
          onClick={() => handleDelete(ebook.id)}
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Minha Biblioteca</h2>
          <p className="text-slate-600 mt-1">
            {ebooks?.length || 0} e-book{(ebooks?.length || 0) !== 1 ? "s" : ""} criado{(ebooks?.length || 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="objective">Por objetivo</SelectItem>
                <SelectItem value="specialty">Por especialidade</SelectItem>
                <SelectItem value="status">Por status</SelectItem>
              </SelectContent>
            </Select>
          </div>
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

      {!ebooks || ebooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="mb-4 text-4xl">📚</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum e-book criado ainda</h3>
          <p className="text-slate-600">
            Comece criando seu primeiro e-book para vê-lo aparecer aqui
          </p>
        </div>
      ) : groupedByObjective ? (
        <div className="space-y-8">
          {Object.entries(groupedByObjective).map(([objective, groupEbooks]) => (
            <div key={objective}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-slate-700">{objective}</h3>
                <span className="text-sm text-slate-500">({groupEbooks.length})</span>
              </div>
              <div className="grid gap-6">
                {groupEbooks.map(renderEbookCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {sortedEbooks.map(renderEbookCard)}
        </div>
      )}
    </div>
  );
}
