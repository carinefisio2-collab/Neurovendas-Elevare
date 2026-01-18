import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { 
  FileText, Sparkles, Loader2, Copy, Check,
  Instagram, Video, BookText
} from 'lucide-react'

interface GeneratedContent {
  type: string
  content: string
  hashtags?: string[]
}

export default function ContentCreator() {
  const { token } = useAuth()
  const [contentType, setContentType] = useState('post')
  const [theme, setTheme] = useState('')
  const [tone, setTone] = useState('professional')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!theme.trim()) return
    setLoading(true)
    
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: contentType,
          theme,
          tone,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setGeneratedContent(data.content)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const contentTypes = [
    { id: 'post', label: 'Post para Feed', icon: Instagram },
    { id: 'reels', label: 'Roteiro para Reels', icon: Video },
    { id: 'stories', label: 'Sequência de Stories', icon: BookText },
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto animate-fadeIn">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Criar Conteúdo</h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">
            Gere posts, legendas e roteiros de vídeo com inteligência artificial
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Gerador de Conteúdo</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-3">
                  Tipo de Conteúdo
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setContentType(type.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        contentType === type.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                      }`}
                    >
                      <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                        contentType === type.id ? 'text-primary-500' : 'text-gray-400'
                      }`} />
                      <span className={`text-xs font-medium ${
                        contentType === type.id ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-slate-400'
                      }`}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Tema *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 5 benefícios do peeling de diamante"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full input-light rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                  Tom de Voz
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full input-light rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  disabled={loading}
                >
                  <option value="professional">Profissional</option>
                  <option value="friendly">Acolhedor</option>
                  <option value="luxury">Luxo</option>
                  <option value="direct">Direto</option>
                  <option value="fun">Divertido</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !theme.trim()}
                className="w-full btn-primary py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Gerar Conteúdo
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div>
            {generatedContent ? (
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Conteúdo Gerado</h3>
                  <button
                    onClick={() => copyToClipboard(generatedContent.content)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                  </button>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 mb-4">
                  <p className="text-gray-700 dark:text-slate-200 whitespace-pre-wrap">{generatedContent.content}</p>
                </div>

                {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-2 block">Hashtags</label>
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30">
                      <p className="text-blue-600 dark:text-blue-400 text-sm">
                        {generatedContent.hashtags.map(h => `#${h}`).join(' ')}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button className="flex-1 btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                    Publicar Agora
                  </button>
                  <button className="flex-1 btn-secondary py-3 rounded-xl font-semibold">
                    Agendar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-gray-200 dark:border-slate-700 h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">Seu conteúdo gerado aparecerá aqui</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
