import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import NeuroVendasLayout from "@/components/dashboard/NeuroVendasLayout";
import { api } from "@/lib/api";
import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  User,
  Copy,
  Check,
  Zap,
  BookOpen,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ContextoPrompt {
  titulo: string;
  categoria: string;
  objetivo: string;
  quandoUsar: string;
  promptOriginal: string;
  mensagemInicial: string;
}

export default function LucresIAChat() {
  const location = useLocation();
  const contextoPrompt = location.state?.contextoPrompt as ContextoPrompt | undefined;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promptContexto, setPromptContexto] = useState<ContextoPrompt | null>(contextoPrompt || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial greeting - contextual ou padrão
  useEffect(() => {
    if (contextoPrompt) {
      // Caminho 2: Abertura contextual do chat LucresIA
      setMessages([
        {
          id: "context-info",
          role: "assistant",
          content: `📚 **Prompt da Biblioteca carregado:**

**${contextoPrompt.titulo}**
*${contextoPrompt.categoria}*

**Objetivo:** ${contextoPrompt.objetivo}
**Quando usar:** ${contextoPrompt.quandoUsar}`,
          timestamp: new Date(),
        },
        {
          id: "welcome-context",
          role: "assistant",
          content: contextoPrompt.mensagemInicial,
          timestamp: new Date(),
        },
      ]);
      setPromptContexto(contextoPrompt);
    } else {
      // Saudação padrão
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `👋 Olá! Eu sou a **LucresIA**, sua estrategista especializada em estética e neurovendas.

Posso te ajudar com:

• 📝 **Criar conteúdos** que ativam micro-dores e convertem
• 🎯 **Analisar seu Instagram** e sugerir melhorias
• 👥 **Criar personas** profundas com dores emocionais
• 💬 **Scripts de WhatsApp** que fecham agenda
• 💡 **Estratégias de vendas** usando NeuroVendas

Como posso te ajudar hoje?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [contextoPrompt]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Monta mensagem com contexto se disponível
      let mensagemParaEnviar = input;
      
      // Se é a primeira mensagem do usuário e temos contexto
      if (promptContexto && messages.length <= 3) {
        mensagemParaEnviar = `[CONTEXTO DO PROMPT DA BIBLIOTECA]
Título: ${promptContexto.titulo}
Categoria: ${promptContexto.categoria}
Objetivo: ${promptContexto.objetivo}
Quando usar: ${promptContexto.quandoUsar}
Prompt original: ${promptContexto.promptOriginal}

[PEDIDO DO USUÁRIO]
${input}`;
      }

      const response = await api.post("/api/ai/chat", {
        message: mensagemParaEnviar,
        session_id: sessionId,
      });

      const assistantMessage: Message = {
        id: Date.now().toString() + "-response",
        role: "assistant",
        content: response.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-error",
          role: "assistant",
          content: "Desculpe, ocorreu um erro. Tente novamente.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActions = [
    "Crie um carrossel sobre limpeza de pele que ative micro-dor",
    "Me ajude a criar uma bio que converte",
    "Quero um script de WhatsApp que fecha agenda",
    "Gere 5 ganchos emocionais para posts de harmonização",
  ];

  return (
    <NeuroVendasLayout>
      <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
        {/* Header - Premium */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">LucresIA Chat</h1>
              <p className="text-slate-500">Sua IA especialista em estética e neurovendas</p>
            </div>
          </div>
        </div>

        {/* Chat Area - Premium */}
        <Card className="flex-1 flex flex-col bg-white border-0 shadow-premium rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-up`}
              >
                {message.role === "assistant" && (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-5 py-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-slate-50 text-slate-800 border border-slate-100"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content.split("**").map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                  {message.role === "assistant" && message.id !== "welcome" && (
                    <button
                      onClick={() => handleCopy(message.content, message.id)}
                      className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors duration-300"
                    >
                      {copiedId === message.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copiar
                        </>
                      )}
                    </button>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 animate-fade-up">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions - Premium */}
          {messages.length <= 1 && (
            <div className="px-8 pb-5">
              <p className="text-xs text-slate-400 mb-3 font-medium">Sugestões rápidas:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(action)}
                    className="text-sm px-4 py-2 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 hover:shadow-sm transition-all duration-300 border border-purple-100"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input - Premium */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex gap-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Digite sua mensagem..."
                className="flex-1 resize-none min-h-[56px] max-h-[150px] rounded-xl border-slate-200 focus:border-purple-300 focus:ring-purple-200 transition-all duration-300"
                rows={1}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="btn-premium bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 px-6 rounded-xl shadow-lg shadow-purple-500/25"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              1 crédito por mensagem
            </p>
          </div>
        </Card>
      </div>
    </NeuroVendasLayout>
  );
}
