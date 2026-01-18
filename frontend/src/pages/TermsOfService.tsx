import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-semibold text-slate-800">Termos de Uso</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-8">
          
          <div className="text-center pb-6 border-b">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Termos de Uso</h1>
            <p className="text-slate-500">Elevare NeuroVendas</p>
            <p className="text-sm text-slate-400 mt-2">Última atualização: Janeiro de 2026</p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">1. Aceitação dos Termos</h2>
            <p className="text-slate-600 leading-relaxed">
              Ao acessar e utilizar a plataforma Elevare NeuroVendas ("Plataforma"), você concorda com estes 
              Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa Plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">2. Descrição do Serviço</h2>
            <p className="text-slate-600 leading-relaxed">
              O Elevare NeuroVendas é uma plataforma de geração de conteúdo com inteligência artificial 
              voltada para profissionais de estética. Nossos serviços incluem:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Geração de posts e carrosséis para redes sociais</li>
              <li>Criação de e-books e materiais educativos</li>
              <li>Diagnóstico de estratégia de conteúdo</li>
              <li>Scripts para WhatsApp e Stories</li>
              <li>Ferramentas de planejamento de conteúdo</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">3. Cadastro e Conta</h2>
            <p className="text-slate-600 leading-relaxed">
              Para utilizar a Plataforma, você deve criar uma conta fornecendo informações verdadeiras e atualizadas. 
              Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas 
              em sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">4. Planos e Pagamentos</h2>
            <p className="text-slate-600 leading-relaxed">
              A Plataforma oferece diferentes planos de assinatura com diferentes níveis de acesso e limites de uso. 
              Os pagamentos são processados de forma segura através de nossos parceiros de pagamento (Stripe). 
              Ao assinar um plano pago, você concorda com:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Cobrança recorrente mensal conforme o plano escolhido</li>
              <li>Renovação automática até cancelamento</li>
              <li>Garantia de 7 dias para reembolso integral</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">5. Uso Aceitável</h2>
            <p className="text-slate-600 leading-relaxed">Você concorda em não utilizar a Plataforma para:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Criar conteúdo ilegal, difamatório, ou que viole direitos de terceiros</li>
              <li>Enviar spam ou comunicações não solicitadas</li>
              <li>Tentar acessar sistemas ou dados de forma não autorizada</li>
              <li>Revender ou redistribuir nossos serviços sem autorização</li>
              <li>Usar automação para criar contas ou gerar conteúdo em massa</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">6. Propriedade Intelectual</h2>
            <p className="text-slate-600 leading-relaxed">
              O conteúdo gerado através da Plataforma é de sua propriedade para uso comercial. 
              Contudo, a Plataforma, incluindo seu código, design, e metodologias (como o Método NeuroVendas 
              e OÁSIS), são propriedade exclusiva da Elevare e estão protegidos por leis de propriedade intelectual.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">7. Limitação de Responsabilidade</h2>
            <p className="text-slate-600 leading-relaxed">
              A Plataforma é fornecida "como está". Não garantimos que o serviço será ininterrupto ou 
              livre de erros. Nossa responsabilidade máxima está limitada ao valor pago pelo usuário 
              nos últimos 12 meses.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">8. Cancelamento</h2>
            <p className="text-slate-600 leading-relaxed">
              Você pode cancelar sua assinatura a qualquer momento através do painel de controle. 
              O cancelamento será efetivado ao final do período de cobrança atual. 
              Não há reembolso proporcional para períodos não utilizados após os 7 dias de garantia.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">9. Alterações nos Termos</h2>
            <p className="text-slate-600 leading-relaxed">
              Reservamos o direito de modificar estes Termos a qualquer momento. 
              Alterações significativas serão comunicadas por email ou através da Plataforma 
              com antecedência mínima de 30 dias.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">10. Contato</h2>
            <p className="text-slate-600 leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato através do email:{" "}
              <a href="mailto:contato@esteticalucrativa.com.br" className="text-violet-600 hover:underline">
                contato@esteticalucrativa.com.br
              </a>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">11. Foro</h2>
            <p className="text-slate-600 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. 
              Fica eleito o foro da cidade de São Paulo/SP para dirimir quaisquer controvérsias.
            </p>
          </section>

          <div className="pt-8 border-t text-center">
            <p className="text-sm text-slate-500">
              © 2026 Elevare NeuroVendas. Todos os direitos reservados.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Link to="/privacy" className="text-sm text-violet-600 hover:underline">
                Política de Privacidade
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
