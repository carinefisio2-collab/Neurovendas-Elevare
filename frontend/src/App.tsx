import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import QuickRegisterPresence from './pages/QuickRegisterPresence'
import Dashboard from './pages/Dashboard'
import RadarBio from './pages/RadarBio'
import RoboProdutor from './pages/RoboProdutor'
import EbooksPage from './pages/EbooksPage'
// EbooksList - Removed (integrated into EbooksPage)
// EbookViewer - Removed (integrated into EbooksPage)
import HistoricoDiagnosticos from './pages/HistoricoDiagnosticos'
import BlogElevare from './pages/BlogElevare'
import Biblioteca from './pages/Biblioteca'
import ConstrutorMarca from './pages/ConstrutorMarca'
import CalendarioElevare from './pages/CalendarioElevare'
import Calendario365Pro from './pages/Calendario365Pro'
import Leads from './pages/Leads'
import Plans from './pages/Plans'
import WhatsAppScripts from './pages/WhatsAppScripts'
import StorySequences from './pages/StorySequences'
import Gamification from './pages/Gamification'
import Onboarding from './pages/Onboarding'
import ForgotPassword from './pages/ForgotPassword'
import Waitlist from './pages/Waitlist'
import LandingNew from './pages/LandingNew'
import DiagnosticoPremium from './pages/DiagnosticoPremium'
import AnalysisComplete from './pages/AnalysisComplete'
import NotFound from './pages/NotFound'
import TermsOfService from './pages/TermsOfService'
import PrivacyPolicy from './pages/PrivacyPolicy'
import LucresIAChat from './pages/LucresIAChat'
import Agenda from './pages/Agenda'
import Content from './pages/Content'
import ContentCreator from './pages/ContentCreator'
import ServerError from './pages/ServerError'

// NOVOS FUNIS PÚBLICOS
import HubInicial from './pages/HubInicial'
import DiagnosticoGratuito from './pages/DiagnosticoGratuito'
import AnalisePresencaDigital from './pages/AnalisePresencaDigital'
import CadastroPlataforma from './pages/CadastroPlataforma'
import DiagnosticsComplete from './pages/DiagnosticsComplete'

import { Loader2 } from 'lucide-react'
import { Toaster } from './components/ui/toaster'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Carregando NeuroVendas...</p>
        </div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* NOVOS FUNIS PÚBLICOS - HUB + 2 FUNIS INDEPENDENTES */}
      <Route path="/hub" element={<HubInicial />} />
      <Route path="/diagnostico-gratuito" element={<DiagnosticoGratuito />} />
      <Route path="/analise-presenca-digital" element={<AnalisePresencaDigital />} />
      <Route path="/cadastro-plataforma" element={<CadastroPlataforma />} />
      <Route path="/diagnostics-complete" element={<DiagnosticsComplete />} />
      
      {/* Landing page como rota padrão */}
      <Route path="/" element={<LandingNew />} />
      <Route path="/landing" element={<LandingNew />} />
      <Route path="/landing-new" element={<LandingNew />} />
      <Route path="/waitlist" element={<Waitlist />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quick-register-presence" element={<QuickRegisterPresence />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      
      {/* Páginas públicas - Legal */}
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/diagnostico-premium" element={<ProtectedRoute><DiagnosticoPremium /></ProtectedRoute>} />
      <Route path="/dashboard/radar-bio" element={<ProtectedRoute><RadarBio /></ProtectedRoute>} />
      <Route path="/dashboard/analysis-complete" element={<ProtectedRoute><AnalysisComplete /></ProtectedRoute>} />
      <Route path="/dashboard/robo-produtor" element={<ProtectedRoute><RoboProdutor /></ProtectedRoute>} />
      <Route path="/dashboard/ebooks" element={<ProtectedRoute><EbooksPage /></ProtectedRoute>} />
      <Route path="/dashboard/ebooks/list" element={<Navigate to="/dashboard/ebooks" replace />} />
      <Route path="/dashboard/ebook-viewer/:ebookId" element={<Navigate to="/dashboard/ebooks" replace />} />
      <Route path="/dashboard/historico-diagnosticos" element={<ProtectedRoute><HistoricoDiagnosticos /></ProtectedRoute>} />
      <Route path="/dashboard/blog" element={<ProtectedRoute><BlogElevare /></ProtectedRoute>} />
      <Route path="/dashboard/biblioteca" element={<ProtectedRoute><Biblioteca /></ProtectedRoute>} />
      <Route path="/dashboard/construtor-marca" element={<ProtectedRoute><ConstrutorMarca /></ProtectedRoute>} />
      <Route path="/dashboard/calendario" element={<ProtectedRoute><CalendarioElevare /></ProtectedRoute>} />
      <Route path="/dashboard/calendario-365" element={<ProtectedRoute><Calendario365Pro /></ProtectedRoute>} />
      <Route path="/dashboard/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
      <Route path="/dashboard/planos" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
      <Route path="/dashboard/whatsapp" element={<ProtectedRoute><WhatsAppScripts /></ProtectedRoute>} />
      <Route path="/dashboard/stories" element={<ProtectedRoute><StorySequences /></ProtectedRoute>} />
      <Route path="/dashboard/creditos" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
      <Route path="/dashboard/agenda" element={<ProtectedRoute><Calendario365Pro /></ProtectedRoute>} />
      <Route path="/dashboard/beta" element={<ProtectedRoute><Gamification /></ProtectedRoute>} />
      <Route path="/dashboard/chat" element={<ProtectedRoute><LucresIAChat /></ProtectedRoute>} />
      <Route path="/dashboard/lucresia" element={<ProtectedRoute><LucresIAChat /></ProtectedRoute>} />
      <Route path="/dashboard/conversa" element={<ProtectedRoute><LucresIAChat /></ProtectedRoute>} />
      <Route path="/dashboard/agenda-completa" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
      <Route path="/dashboard/conteudo" element={<ProtectedRoute><Content /></ProtectedRoute>} />
      <Route path="/dashboard/criador-conteudo" element={<ProtectedRoute><ContentCreator /></ProtectedRoute>} />
      <Route path="/error" element={<ServerError />} />
      <Route path="/server-error" element={<ServerError />} />
      
      {/* Redirects de rotas antigas */}
      <Route path="/dashboard/whatsapp-scripts" element={<Navigate to="/dashboard/whatsapp" replace />} />
      <Route path="/dashboard/story-sequences" element={<Navigate to="/dashboard/stories" replace />} />
      <Route path="/dashboard/central" element={<Navigate to="/dashboard/biblioteca" replace />} />
      <Route path="/fabrica-seo" element={<Navigate to="/dashboard/blog" replace />} />
      <Route path="/dashboard/fabrica-seo" element={<Navigate to="/dashboard/blog" replace />} />
      
      {/* Legacy routes - redirect to new paths */}
      <Route path="/diagnostico-bio" element={<Navigate to="/dashboard/diagnostico-premium" replace />} />
      <Route path="/dashboard/diagnostico-bio" element={<Navigate to="/dashboard/diagnostico-premium" replace />} />
      <Route path="/radar-bio" element={<Navigate to="/dashboard/radar-bio" replace />} />
      <Route path="/robo-produtor" element={<Navigate to="/dashboard/robo-produtor" replace />} />
      <Route path="/ebook-generator" element={<Navigate to="/dashboard/ebooks" replace />} />
      <Route path="/plans" element={<Navigate to="/dashboard/planos" replace />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
