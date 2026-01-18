import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <Shield className="w-5 h-5 text-violet-600" />
          <h1 className="text-xl font-semibold text-slate-800">Política de Privacidade</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
          
          <div className="text-center pb-6 border-b">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Política de Privacidade</h1>
            <p className="text-slate-500">Elevare NeuroVendas - Conformidade LGPD</p>
            <p className="text-sm text-slate-400 mt-2">Última atualização: Janeiro de 2026</p>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <p className="text-violet-800 text-sm">
              <strong>🔒 Compromisso com sua privacidade:</strong> Esta política foi elaborada em conformidade 
              com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e descreve como coletamos, 
              usamos e protegemos seus dados pessoais.
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">1. Controlador dos Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              A Elevare NeuroVendas é a controladora dos dados pessoais coletados através desta plataforma. 
              Para exercer seus direitos ou esclarecer dúvidas sobre o tratamento de dados, entre em contato:
            </p>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-600"><strong>Email:</strong> privacidade@esteticalucrativa.com.br</p>
              <p className="text-slate-600"><strong>Encarregado (DPO):</strong> Carine Marques</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">2. Dados que Coletamos</h2>
            <p className="text-slate-600 leading-relaxed">Coletamos os seguintes tipos de dados:</p>
            
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Dados de Cadastro</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Nome completo</li>
                  <li>Endereço de email</li>
                  <li>Senha (armazenada de forma criptografada)</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Dados de Uso</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Conteúdos gerados através da plataforma</li>
                  <li>Respostas ao diagnóstico de estratégia</li>
                  <li>Preferências e configurações de marca</li>
                  <li>Histórico de acesso e navegação</li>
                </ul>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">Dados de Pagamento</h3>
                <ul className="list-disc list-inside text-slate-600 space-y-1">
                  <li>Informações de transação (processadas pelo Stripe)</li>
                  <li>Histórico de assinaturas</li>
                  <li>Não armazenamos dados de cartão de crédito</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">3. Finalidades do Tratamento</h2>
            <p className="text-slate-600 leading-relaxed">Utilizamos seus dados para:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Prestação do serviço:</strong> Gerar conteúdos personalizados com base em suas informações</li>
              <li><strong>Comunicação:</strong> Enviar notificações sobre sua conta, atualizações e novidades</li>
              <li><strong>Melhoria do serviço:</strong> Analisar padrões de uso para aprimorar a plataforma</li>
              <li><strong>Cobrança:</strong> Processar pagamentos e gerenciar assinaturas</li>
              <li><strong>Suporte:</strong> Responder dúvidas e solucionar problemas</li>
              <li><strong>Obrigações legais:</strong> Cumprir requisitos legais e regulatórios</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">4. Base Legal (LGPD Art. 7º)</h2>
            <p className="text-slate-600 leading-relaxed">O tratamento de seus dados é fundamentado em:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Execução de contrato:</strong> Para prestar os serviços contratados</li>
              <li><strong>Consentimento:</strong> Para comunicações de marketing (quando aplicável)</li>
              <li><strong>Legítimo interesse:</strong> Para melhorias na plataforma e segurança</li>
              <li><strong>Cumprimento de obrigação legal:</strong> Quando exigido por lei</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">5. Compartilhamento de Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Seus dados podem ser compartilhados apenas com:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Processadores de pagamento:</strong> Stripe (para transações financeiras)</li>
              <li><strong>Provedores de infraestrutura:</strong> Serviços de hospedagem e banco de dados</li>
              <li><strong>Serviços de IA:</strong> OpenAI (para geração de conteúdo - dados anonimizados)</li>
              <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              <strong>Não vendemos</strong> seus dados pessoais para terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">6. Seus Direitos (LGPD Art. 18)</h2>
            <p className="text-slate-600 leading-relaxed">Você tem direito a:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Confirmação e Acesso</h3>
                <p className="text-sm text-slate-600">Confirmar a existência de tratamento e acessar seus dados</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Correção</h3>
                <p className="text-sm text-slate-600">Corrigir dados incompletos, inexatos ou desatualizados</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Anonimização/Bloqueio</h3>
                <p className="text-sm text-slate-600">Solicitar anonimização ou bloqueio de dados desnecessários</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Portabilidade</h3>
                <p className="text-sm text-slate-600">Receber seus dados em formato estruturado</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Eliminação</h3>
                <p className="text-sm text-slate-600">Solicitar exclusão de dados tratados com consentimento</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-700 mb-2">✓ Revogação</h3>
                <p className="text-sm text-slate-600">Revogar consentimento a qualquer momento</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              Para exercer seus direitos, envie email para:{" "}
              <a href="mailto:privacidade@esteticalucrativa.com.br" className="text-violet-600 hover:underline">
                privacidade@esteticalucrativa.com.br
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">7. Segurança dos Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Criptografia de senhas (bcrypt)</li>
              <li>Conexões seguras (HTTPS/TLS)</li>
              <li>Backups regulares e redundância</li>
              <li>Controle de acesso baseado em funções</li>
              <li>Monitoramento de segurança contínuo</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">8. Retenção de Dados</h2>
            <p className="text-slate-600 leading-relaxed">
              Mantemos seus dados enquanto sua conta estiver ativa. Após exclusão da conta:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Dados de conta: excluídos em até 30 dias</li>
              <li>Dados de transação: mantidos por 5 anos (obrigação fiscal)</li>
              <li>Backups: excluídos em até 90 dias</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">9. Cookies e Tecnologias</h2>
            <p className="text-slate-600 leading-relaxed">
              Utilizamos cookies essenciais para funcionamento da plataforma:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Cookies de sessão (autenticação)</li>
              <li>Cookies de preferências (tema, configurações)</li>
              <li>LocalStorage para dados temporários</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">10. Alterações na Política</h2>
            <p className="text-slate-600 leading-relaxed">
              Esta política pode ser atualizada periodicamente. Alterações significativas serão 
              comunicadas por email com antecedência mínima de 30 dias.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">11. Autoridade Nacional</h2>
            <p className="text-slate-600 leading-relaxed">
              Caso entenda que o tratamento de seus dados viola a LGPD, você pode apresentar 
              reclamação à Autoridade Nacional de Proteção de Dados (ANPD):{" "}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">
                www.gov.br/anpd
              </a>
            </p>
          </section>

          <div className="pt-8 border-t text-center">
            <p className="text-sm text-slate-500">
              © 2026 Elevare NeuroVendas. Todos os direitos reservados.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/terms" className="text-sm text-violet-600 hover:underline">
                Termos de Uso
              </Link>
              <Link to="/" className="text-sm text-violet-600 hover:underline">
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
