import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Loader2, CheckCircle, Gift } from 'lucide-react';

const CadastroPlataforma: React.FC = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<'form' | 'loading' | 'parabens'>('form');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [erro, setErro] = useState('');

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validação básica
    if (!nome || !email || !whatsapp) {
      setErro('Por favor, preencha todos os campos');
      return;
    }

    if (!email.includes('@')) {
      setErro('Por favor, insira um email válido');
      return;
    }

    setEtapa('loading');

    try {
      // Chamar API de cadastro
      const response = await fetch('/api/cadastro-gratuito', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, whatsapp })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erro ao criar conta');
      }

      const data = await response.json();
      
      // Salvar token
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Mostrar parabéns
      setEtapa('parabens');

      // Redirecionar para dashboard após 3 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (error: any) {
      setErro(error.message || 'Erro ao criar conta');
      setEtapa('form');
    }
  };

  if (etapa === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="p-12 max-w-md text-center">
          <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Criando sua conta...
          </h3>
          <p className="text-gray-600">
            Estamos configurando sua plataforma e liberando 100 créditos gratuitos!
          </p>
        </Card>
      </div>
    );
  }

  if (etapa === 'parabens') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <Card className="p-12 max-w-xl text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <Sparkles className="w-8 h-8 text-yellow-500 absolute top-0 right-1/3 animate-pulse" />
            <Sparkles className="w-6 h-6 text-pink-400 absolute bottom-0 left-1/3 animate-pulse delay-300" />
          </div>

          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Parabéns, {nome.split(' ')[0]}!
          </h2>

          <p className="text-xl text-gray-700 mb-8">
            Sua conta foi criada com sucesso!
          </p>

          <Card className="p-6 bg-gradient-to-r from-purple-100 to-pink-100 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-8 h-8 text-purple-600" />
              <h3 className="text-2xl font-bold text-purple-900">100 Créditos Grátis</h3>
            </div>
            <p className="text-purple-800">
              Seus créditos mensais foram liberados! Use para criar conteúdo, 
              apresentações e muito mais.
            </p>
          </Card>

          <div className="space-y-3 text-left bg-white rounded-lg p-6 mb-8">
            <h4 className="font-bold text-gray-900 mb-3">✨ O que você pode fazer agora:</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Criar posts e stories com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Gerar apresentações premium de vendas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Criar e-books educativos profissionais</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">✓</span>
                <span>Analisar presença digital ilimitadamente</span>
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={() => navigate('/dashboard')}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Ir para o Dashboard
            <Sparkles className="w-5 h-5" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Redirecionando automaticamente em 3 segundos...
          </p>
        </Card>
      </div>
    );
  }

  // FORMULÁRIO DE CADASTRO
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-12">
      <div className="container mx-auto px-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Bem-vinda à Plataforma Elevare!
          </h1>
          <p className="text-gray-700">
            Preencha seus dados para começar a usar todas as ferramentas de IA
          </p>
        </div>

        {/* Benefícios */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-purple-100 to-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
            <h3 className="text-xl font-bold text-purple-900">Ganhe 100 Créditos Grátis</h3>
          </div>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>Renovados mensalmente</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>Acesso a todas ferramentas de IA</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>Suporte prioritário</span>
            </li>
          </ul>
        </Card>

        {/* Formulário */}
        <Card className="p-6">
          <form onSubmit={handleCadastro} className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nome Completo *
              </label>
              <Input
                type="text"
                placeholder="Maria Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="maria@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                WhatsApp *
              </label>
              <Input
                type="tel"
                placeholder="(11) 99999-9999"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Para receber suporte e atualizações importantes
              </p>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-semibold"
            >
              Criar Minha Conta Gratuita
              <Sparkles className="w-5 h-5" />
            </Button>

            {/* Termos */}
            <p className="text-xs text-gray-500 text-center">
              Ao criar sua conta, você concorda com nossos{' '}
              <a href="/termos" className="text-purple-600 underline">Termos de Uso</a>
              {' '}e{' '}
              <a href="/privacidade" className="text-purple-600 underline">Política de Privacidade</a>
            </p>
          </form>
        </Card>

        {/* Voltar */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            ← Voltar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CadastroPlataforma;
