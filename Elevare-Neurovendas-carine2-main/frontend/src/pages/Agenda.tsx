import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { agendamentosApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  Calendar, Plus, Clock, User, DollarSign,
  X, Loader2, CheckCircle, AlertCircle
} from 'lucide-react'

interface Agendamento {
  id: string
  cliente_nome: string
  procedimento: string
  valor: number
  data: string
  horario: string
  status: string
  observacoes?: string
}

const statusColors = {
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmado: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  realizado: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function Agenda() {
  const { token } = useAuth()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    cliente_nome: '',
    procedimento: '',
    valor: 0,
    data: '',
    horario: '',
    observacoes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAgendamentos()
  }, [token])

  const loadAgendamentos = async () => {
    if (token) {
      try {
        const response = await agendamentosApi.getAll(token)
        setAgendamentos(response.agendamentos)
      } catch (error) {
        console.error('Error loading agendamentos:', error)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await agendamentosApi.create(token!, {
        ...formData,
        valor: formData.valor * 100, // Convert to cents
      })
      await loadAgendamentos()
      setShowModal(false)
      setFormData({
        cliente_nome: '',
        procedimento: '',
        valor: 0,
        data: '',
        horario: '',
        observacoes: '',
      })
    } catch (error) {
      console.error('Error creating agendamento:', error)
    }
    setSaving(false)
  }

  // Calculate totals
  const totalFaturamento = agendamentos
    .filter(a => a.status === 'realizado')
    .reduce((acc, a) => acc + a.valor, 0)
  const totalPendente = agendamentos
    .filter(a => a.status === 'pendente' || a.status === 'confirmado')
    .reduce((acc, a) => acc + a.valor, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Agenda Estratégica</h1>
            <p className="text-slate-400 mt-1">Gerencie seus agendamentos e faturamento</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-premium text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Agendamento
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-sm text-slate-400">Realizado</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalFaturamento)}</p>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm text-slate-400">Pendente</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalPendente)}</p>
          </div>
        </div>

        {/* Agendamentos List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum agendamento</h3>
            <p className="text-slate-400 mb-6">Comece adicionando seu primeiro agendamento</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-premium text-white font-medium px-6 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Agendamento
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {agendamentos.map((ag) => (
              <div key={ag.id} className="glass rounded-xl p-5 card-hover">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{ag.cliente_nome}</h3>
                      <p className="text-sm text-slate-400 mt-1">{ag.procedimento}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {ag.data}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {ag.horario}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          {formatCurrency(ag.valor)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[ag.status as keyof typeof statusColors] || statusColors.pendente}`}>
                    {ag.status.charAt(0).toUpperCase() + ag.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Novo Agendamento</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Cliente *</label>
                <input
                  type="text"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Procedimento *</label>
                <input
                  type="text"
                  value={formData.procedimento}
                  onChange={(e) => setFormData({ ...formData, procedimento: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Valor (R$) *</label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Data *</label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Horário *</label>
                  <input
                    type="time"
                    value={formData.horario}
                    onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium glass glass-hover text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-premium text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
