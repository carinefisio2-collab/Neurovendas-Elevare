import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { contentApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  Sparkles, Plus, FileText, Image, Video, BookOpen,
  X, Loader2, Copy, Check
} from 'lucide-react'

interface Content {
  id: string
  tipo: string
  titulo: string
  conteudo?: string
  created_at: string
}

const tipoIcons = {
  post: FileText,
  ebook: BookOpen,
  ad: Image,
  roteiro: Video,
}

const tipoColors = {
  post: 'from-blue-500 to-cyan-500',
  ebook: 'from-purple-500 to-pink-500',
  ad: 'from-orange-500 to-red-500',
  roteiro: 'from-green-500 to-emerald-500',
}

export default function Content() {
  const { token, user } = useAuth()
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    tipo: 'post',
    titulo: '',
    tema: '',
  })

  useEffect(() => {
    loadContents()
  }, [token])

  const loadContents = async () => {
    if (token) {
      try {
        const response = await contentApi.getAll(token)
        setContents(response.content)
      } catch (error) {
        console.error('Error loading contents:', error)
      }
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    
    // Simulate AI generation (you can integrate with real AI later)
    const generatedContent = generateMockContent(formData.tipo, formData.tema)
    
    try {
      await contentApi.create(token!, {
        tipo: formData.tipo,
        titulo: formData.titulo || `${formData.tipo.charAt(0).toUpperCase() + formData.tipo.slice(1)} - ${formData.tema}`,
        conteudo: generatedContent,
      })
      await loadContents()
      setShowModal(false)
      setFormData({ tipo: 'post', titulo: '', tema: '' })
    } catch (error) {
      console.error('Error creating content:', error)
    }
    setGenerating(false)
  }

  const generateMockContent = (tipo: string, tema: string): string => {
    const templates: Record<string, string> = {
      post: `🌟 ${tema.toUpperCase()}

Você sabia que esse procedimento pode transformar completamente sua autoestima?

✨ Benefícios:
• Resultados naturais e duradouros
• Procedimento seguro e rápido
• Recuperação confortável

📱 Agende sua avaliação gratuita!

#estetica #beleza #${tema.toLowerCase().replace(/\s/g, '')} #harmonizacaofacial #autoestima`,
      ebook: `# Guia Completo: ${tema}

## Introdução
Este guia foi criado especialmente para você que busca entender mais sobre ${tema}.

## Capítulo 1: O que é?
Explicação detalhada sobre o procedimento...

## Capítulo 2: Benefícios
- Benefício 1
- Benefício 2
- Benefício 3

## Capítulo 3: Cuidados
Informações importantes sobre cuidados pré e pós procedimento.

## Conclusão
Agende sua consulta e transforme sua vida!`,
      ad: `🔥 PROMOÇÃO ESPECIAL: ${tema}

✅ Avaliação GRATUITA
✅ Pagamento facilitado
✅ Resultados garantidos

💡 Apenas esta semana!

👉 Clique no link da bio para agendar

#promocao #estetica #${tema.toLowerCase().replace(/\s/g, '')}`,
      roteiro: `[ROTEIRO DE VÍDEO - ${tema}]

[CENA 1 - GANCHO]
Olá! Você já conhece ${tema}?

[CENA 2 - PROBLEMA]
Muitas pessoas sofrem com...

[CENA 3 - SOLUÇÃO]
E é exatamente por isso que ${tema} pode te ajudar!

[CENA 4 - PROVA SOCIAL]
Já ajudamos centenas de pacientes a...

[CENA 5 - CTA]
Agende agora sua avaliação gratuita! Link na bio.`,
    }
    return templates[tipo] || templates.post
  }

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Conteúdo com IA</h1>
            <p className="text-slate-400 mt-1">Gere posts, e-books e anúncios com inteligência artificial</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-premium text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Gerar Conteúdo
          </button>
        </div>

        {/* Content Types */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tipo: 'post', label: 'Posts', icon: FileText, count: contents.filter(c => c.tipo === 'post').length },
            { tipo: 'ebook', label: 'E-books', icon: BookOpen, count: contents.filter(c => c.tipo === 'ebook').length },
            { tipo: 'ad', label: 'Anúncios', icon: Image, count: contents.filter(c => c.tipo === 'ad').length },
            { tipo: 'roteiro', label: 'Roteiros', icon: Video, count: contents.filter(c => c.tipo === 'roteiro').length },
          ].map((item) => (
            <div key={item.tipo} className="glass rounded-xl p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tipoColors[item.tipo as keyof typeof tipoColors]} bg-opacity-20 flex items-center justify-center mx-auto mb-3`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{item.count}</p>
              <p className="text-sm text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Contents List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          </div>
        ) : contents.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Nenhum conteúdo gerado</h3>
            <p className="text-slate-400 mb-6">Use a IA para criar seu primeiro conteúdo</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-premium text-white font-medium px-6 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Gerar Conteúdo
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {contents.map((content) => {
              const Icon = tipoIcons[content.tipo as keyof typeof tipoIcons] || FileText
              const color = tipoColors[content.tipo as keyof typeof tipoColors] || tipoColors.post
              
              return (
                <div key={content.id} className="glass rounded-xl p-5 card-hover">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-white">{content.titulo}</h3>
                          <span className="text-xs text-slate-500 uppercase">{content.tipo}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(content.conteudo || '', content.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === content.id ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {content.conteudo && (
                        <pre className="mt-3 text-sm text-slate-400 whitespace-pre-wrap font-sans bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                          {content.conteudo}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Gerar Conteúdo com IA</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tipo de Conteúdo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500"
                >
                  <option value="post">Post para Redes Sociais</option>
                  <option value="ebook">E-book / Guia</option>
                  <option value="ad">Anúncio / Promoção</option>
                  <option value="roteiro">Roteiro de Vídeo</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Tema / Procedimento *</label>
                <input
                  type="text"
                  value={formData.tema}
                  onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  placeholder="Ex: Botox, Preenchimento Labial, Harmonização..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Título (opcional)</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary-500"
                  placeholder="Título personalizado..."
                />
              </div>
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Sparkles className="w-4 h-4 text-primary-400" />
                  <span>Custo: <strong className="text-white">1 crédito</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>Disponível: <strong className="text-primary-400">{user?.credits_remaining || 0}</strong></span>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium glass glass-hover text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 btn-premium text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Gerar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
