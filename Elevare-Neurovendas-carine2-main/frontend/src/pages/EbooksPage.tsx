/**
 * Elevare E-books - Sistema de Criação de E-books
 * 
 * Fluxo: Criar → Gerar → Baixar PDF
 */

import { useState } from "react";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Library } from "lucide-react";
import { BackButton, HomeButton } from "@/components/ui/page-header";

import CreateEbookFlow from "@/components/ebook/CreateEbookFlow";
import EbookLibrary from "@/components/ebook/EbookLibrary";
import EbookEditor from "@/components/ebook/EbookEditor";
import EbookSuccess from "@/components/ebook/EbookSuccess";

type ViewType = "home" | "create" | "library" | "editor" | "success";

interface EbookInfo {
  id: string;
  title: string;
  subtitle: string;
}

export default function EbooksPage() {
  const [currentView, setCurrentView] = useState<ViewType>("home");
  const [selectedEbookId, setSelectedEbookId] = useState<string | null>(null);
  const [createdEbook, setCreatedEbook] = useState<EbookInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEbookCreated = (ebookId: string, title: string, subtitle: string) => {
    setCreatedEbook({ id: ebookId, title, subtitle });
    setSelectedEbookId(ebookId);
    setCurrentView("success");
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-7xl mx-auto">
        {/* Navegação */}
        <div className="flex items-center gap-2 mb-8">
          <BackButton />
          <HomeButton />
        </div>

        {currentView === "home" && (
          <div className="space-y-12">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                E-books Estratégicos
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Transforme seu conhecimento em materiais educativos que geram confiança, autoridade e decisão.
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Create E-book Card */}
              <div
                onClick={() => setCurrentView("create")}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-violet-200 p-8"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-violet-100 rounded-lg mb-4">
                  <Sparkles className="w-6 h-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Criar Novo E-book</h3>
                <p className="text-slate-600 mb-4">
                  Inicie o fluxo de criação com IA para gerar seu e-book em minutos.
                </p>
                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                  Começar
                </Button>
              </div>

              {/* Library Card */}
              <div
                onClick={() => setCurrentView("library")}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-purple-200 p-8"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                  <Library className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Minha Biblioteca</h3>
                <p className="text-slate-600 mb-4">
                  Acesse, edite e gerencie todos os seus e-books salvos.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Acessar
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentView === "create" && (
          <CreateEbookFlow
            onBack={() => setCurrentView("home")}
            onSuccess={(ebookId: string, content?: { titulo: string; subtitulo: string }) => {
              if (content) {
                handleEbookCreated(ebookId, content.titulo, content.subtitulo);
              } else {
                setSelectedEbookId(ebookId);
                setCurrentView("editor");
              }
            }}
          />
        )}

        {currentView === "success" && createdEbook && (
          <EbookSuccess
            ebookId={createdEbook.id}
            title={createdEbook.title}
            subtitle={createdEbook.subtitle}
            onEdit={() => {
              setSelectedEbookId(createdEbook.id);
              setCurrentView("editor");
            }}
            onCreateAnother={() => {
              setCreatedEbook(null);
              setCurrentView("create");
            }}
            onGoToLibrary={() => setCurrentView("library")}
          />
        )}

        {currentView === "library" && (
          <EbookLibrary
            onBack={() => setCurrentView("home")}
            onEdit={(ebookId: string) => {
              setSelectedEbookId(ebookId);
              setCurrentView("editor");
            }}
          />
        )}

        {currentView === "editor" && selectedEbookId && (
          <EbookEditor
            ebookId={selectedEbookId}
            onBack={() => setCurrentView("library")}
          />
        )}
      </div>
    </NeuroVendasLayout>
  );
}
