import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { BackButton, HomeButton } from "@/components/ui/page-header";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CardSkeleton } from "@/components/ui/skeleton";
import {
  Target,
  Plus,
  Search,
  Phone,
  Mail,
  Flame,
  Snowflake,
  Thermometer,
  Trash2,
  Edit,
  Loader2,
} from "lucide-react";

interface Lead {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  procedimento?: string;
  origem: string;
  temperatura: string;
  status: string;
  valor_estimado: number;
  observacoes?: string;
  created_at: string;
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTemp, setFilterTemp] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    procedimento: "",
    origem: "instagram",
    temperatura: "frio",
    valor_estimado: 0,
    observacoes: "",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await api.get("/api/leads");
      setLeads(response.data.leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Erro ao carregar leads",
        description: "Não foi possível carregar a lista de leads. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o nome do lead.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/leads", formData);
      setIsDialogOpen(false);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        procedimento: "",
        origem: "instagram",
        temperatura: "frio",
        valor_estimado: 0,
        observacoes: "",
      });
      toast({
        title: "Lead criado!",
        description: `${formData.nome} foi adicionado à sua lista de leads.`,
      });
      fetchLeads();
    } catch (error) {
      console.error("Error creating lead:", error);
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível criar o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: string) => {
    setLeadToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!leadToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/api/leads/${leadToDelete}`);
      toast({
        title: "Lead excluído",
        description: "O lead foi removido com sucesso.",
      });
      fetchLeads();
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o lead. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    }
  };

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/leads/${id}`, { status });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi alterado com sucesso.",
      });
      fetchLeads();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.nome.toLowerCase().includes(search.toLowerCase());
    const matchesTemp = filterTemp === "all" || lead.temperatura === filterTemp;
    return matchesSearch && matchesTemp;
  });

  const temperatureIcons: Record<string, any> = {
    quente: { icon: Flame, color: "text-red-500", bg: "bg-red-50" },
    morno: { icon: Thermometer, color: "text-amber-500", bg: "bg-amber-50" },
    frio: { icon: Snowflake, color: "text-blue-500", bg: "bg-blue-50" },
  };

  const statusColors: Record<string, string> = {
    novo: "bg-purple-100 text-purple-700",
    em_contato: "bg-blue-100 text-blue-700",
    agendado: "bg-green-100 text-green-700",
    convertido: "bg-emerald-100 text-emerald-700",
    perdido: "bg-slate-100 text-slate-700",
  };

  return (
    <NeuroVendasLayout>
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center gap-2 mb-6">
          <BackButton />
          <HomeButton />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Leads & CRM</h1>
              <p className="text-slate-500 text-sm">Gerencie seus contatos e oportunidades</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                <Plus className="w-5 h-5 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label>Nome *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Nome do lead"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <Label>Procedimento de interesse</Label>
                  <Input
                    value={formData.procedimento}
                    onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                    placeholder="Ex: Limpeza de pele"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Origem</Label>
                    <Select
                      value={formData.origem}
                      onValueChange={(v) => setFormData({ ...formData, origem: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="anuncio">Anúncio</SelectItem>
                        <SelectItem value="manual">Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Temperatura</Label>
                    <Select
                      value={formData.temperatura}
                      onValueChange={(v) => setFormData({ ...formData, temperatura: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quente">🔥 Quente</SelectItem>
                        <SelectItem value="morno">🌡️ Morno</SelectItem>
                        <SelectItem value="frio">❄️ Frio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Valor Estimado (R$)</Label>
                  <Input
                    type="number"
                    value={formData.valor_estimado}
                    onChange={(e) => setFormData({ ...formData, valor_estimado: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Lead
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border-slate-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome..."
                className="pl-10"
              />
            </div>
            <Select value={filterTemp} onValueChange={setFilterTemp}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Temperatura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="quente">🔥 Quentes</SelectItem>
                <SelectItem value="morno">🌡️ Mornos</SelectItem>
                <SelectItem value="frio">❄️ Frios</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-2xl font-bold text-slate-800">{leads.length}</p>
            <p className="text-sm text-slate-500">Total de leads</p>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <p className="text-2xl font-bold text-red-600">
              {leads.filter((l) => l.temperatura === "quente").length}
            </p>
            <p className="text-sm text-red-600">Leads quentes</p>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <p className="text-2xl font-bold text-amber-600">
              {leads.filter((l) => l.temperatura === "morno").length}
            </p>
            <p className="text-sm text-amber-600">Leads mornos</p>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <p className="text-2xl font-bold text-green-600">
              {leads.filter((l) => l.status === "convertido").length}
            </p>
            <p className="text-sm text-green-600">Convertidos</p>
          </Card>
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <Card className="p-12 bg-white border-slate-200 text-center">
            <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Nenhum lead encontrado</h3>
            <p className="text-slate-500 text-sm">Adicione seu primeiro lead clicando no botão acima</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const temp = temperatureIcons[lead.temperatura] || temperatureIcons.frio;
              const TempIcon = temp.icon;
              return (
                <Card key={lead.id} className="p-4 bg-white border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full ${temp.bg} flex items-center justify-center`}>
                        <TempIcon className={`w-5 h-5 ${temp.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{lead.nome}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          {lead.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lead.telefone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {lead.procedimento && (
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {lead.procedimento}
                        </span>
                      )}
                      <Select
                        value={lead.status}
                        onValueChange={(v) => updateLeadStatus(lead.id, v)}
                      >
                        <SelectTrigger className={`w-32 ${statusColors[lead.status] || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo</SelectItem>
                          <SelectItem value="em_contato">Em contato</SelectItem>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="convertido">Convertido</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(lead.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        data-testid={`delete-lead-${lead.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Lead</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  "Excluir"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </NeuroVendasLayout>
  );
}
