"""
Serviço de Email - Resend
Gerencia: emails transacionais, boas-vindas, notificações
"""

import os
import logging
from typing import Optional, Dict, List
import httpx

logger = logging.getLogger("elevare.email")

# URL da API
RESEND_API_URL = "https://api.resend.com/emails"

class EmailService:
    """Serviço de envio de emails via Resend"""
    
    def __init__(self):
        # Ler variáveis de ambiente dinamicamente
        self.api_key = os.environ.get("RESEND_API_KEY")
        self.from_email = os.environ.get("RESEND_FROM_EMAIL", "onboarding@resend.dev")
        
    async def send_email(
        self,
        to: str,
        subject: str,
        html: str,
        text: Optional[str] = None
    ) -> Dict:
        """
        Envia um email via Resend API (não-bloqueante)
        Se falhar, apenas loga o erro sem quebrar o fluxo
        """
        if not self.api_key:
            logger.warning("⚠️  RESEND_API_KEY não configurada - email não enviado")
            return {"success": False, "error": "API key not configured", "non_blocking": True}
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": f"Elevare NeuroVendas <{self.from_email}>",
            "to": [to],
            "subject": subject,
            "html": html,
        }
        
        if text:
            payload["text"] = text
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    RESEND_API_URL,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"✅ Email enviado com sucesso para {to}: {data.get('id')}")
                    return {"success": True, "id": data.get("id")}
                else:
                    logger.warning(f"⚠️  Email falhou (não-bloqueante): {response.status_code} - {response.text}")
                    return {"success": False, "error": response.text, "non_blocking": True}
                    
        except Exception as e:
            logger.warning(f"⚠️  Email falhou (não-bloqueante): {str(e)}")
            return {"success": False, "error": str(e), "non_blocking": True}
    
    async def send_welcome_email(self, user_email: str, user_name: str) -> Dict:
        """
        Envia email de boas-vindas para novo usuário
        """
        subject = "🎉 Bem-vinda ao Elevare NeuroVendas!"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .steps {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .step {{ display: flex; align-items: flex-start; margin-bottom: 15px; }}
                .step-number {{ background: #7c3aed; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; flex-shrink: 0; font-weight: 600; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
                .highlight {{ color: #7c3aed; font-weight: 600; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✨ Elevare NeuroVendas</h1>
                </div>
                <div class="content">
                    <h2>Olá, {user_name}! 👋</h2>
                    <p>Seja muito bem-vinda ao <strong>Elevare NeuroVendas</strong>!</p>
                    <p>Você acaba de dar o primeiro passo para transformar sua comunicação e atrair mais clientes para seu negócio de estética.</p>
                    
                    <div class="steps">
                        <h3>🚀 Seus próximos passos:</h3>
                        <div class="step">
                            <span class="step-number">1</span>
                            <div>
                                <strong>Complete o Diagnóstico Premium</strong><br>
                                <span style="color: #6b7280;">Descubra seus pontos fortes e onde melhorar</span>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <div>
                                <strong>Crie seu primeiro post</strong><br>
                                <span style="color: #6b7280;">Use o NeuroPost™ Elevare para criar conteúdo estratégico</span>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <div>
                                <strong>Configure sua marca</strong><br>
                                <span style="color: #6b7280;">Personalize sua identidade para conteúdos únicos</span>
                            </div>
                        </div>
                    </div>
                    
                    <p style="text-align: center;">
                        <a href="https://aivendas-1.preview.emergentagent.com/dashboard" class="button">
                            Acessar meu Dashboard →
                        </a>
                    </p>
                    
                    <p>Você está no programa <span class="highlight">BETA</span> com acesso a todos os recursos!</p>
                    
                    <p>Qualquer dúvida, estou aqui para ajudar.</p>
                    
                    <p>Com carinho,<br>
                    <strong>Carine Marques</strong><br>
                    <span style="color: #6b7280;">Criadora do Elevare NeuroVendas</span></p>
                </div>
                <div class="footer">
                    <p>© 2026 Elevare NeuroVendas. Todos os direitos reservados.</p>
                    <p>Você recebeu este email porque se cadastrou em nossa plataforma.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, html)
    
    async def send_payment_confirmation(
        self, 
        user_email: str, 
        user_name: str,
        plan_name: str,
        amount: float
    ) -> Dict:
        """
        Envia confirmação de pagamento
        """
        subject = f"✅ Pagamento confirmado - Plano {plan_name}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }}
                .receipt {{ background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>✅ Pagamento Confirmado</h1>
                </div>
                <div class="content">
                    <h2>Olá, {user_name}!</h2>
                    <p>Seu pagamento foi processado com sucesso!</p>
                    
                    <div class="receipt">
                        <h3>📋 Detalhes do pedido:</h3>
                        <p><strong>Plano:</strong> {plan_name}</p>
                        <p><strong>Valor:</strong> R$ {amount:.2f}</p>
                        <p><strong>Status:</strong> <span style="color: #059669;">✓ Pago</span></p>
                    </div>
                    
                    <p>Seus créditos já foram adicionados e você pode começar a usar todos os recursos do seu plano.</p>
                    
                    <p style="text-align: center;">
                        <a href="https://aivendas-1.preview.emergentagent.com/dashboard" class="button">
                            Acessar Dashboard →
                        </a>
                    </p>
                    
                    <p>Obrigada por confiar no Elevare!</p>
                </div>
                <div class="footer">
                    <p>© 2026 Elevare NeuroVendas. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, html)
    
    async def send_limit_warning(
        self,
        user_email: str,
        user_name: str,
        resource_name: str,
        used: int,
        limit: int
    ) -> Dict:
        """
        Envia aviso de limite próximo de esgotar
        """
        percentage = int((used / limit) * 100)
        subject = f"⚠️ Você usou {percentage}% do seu limite de {resource_name}"
        
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }}
                .header h1 {{ color: white; margin: 0; font-size: 28px; }}
                .content {{ background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }}
                .usage {{ background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fcd34d; }}
                .button {{ display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }}
                .footer {{ text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⚠️ Limite Próximo</h1>
                </div>
                <div class="content">
                    <h2>Olá, {user_name}!</h2>
                    
                    <div class="usage">
                        <p style="margin: 0; font-size: 18px;">
                            Você já usou <strong>{used}</strong> de <strong>{limit}</strong> {resource_name} este mês.
                        </p>
                        <p style="margin: 10px 0 0 0; color: #92400e;">
                            Restam apenas <strong>{limit - used}</strong> para usar.
                        </p>
                    </div>
                    
                    <p>Para continuar criando conteúdo sem interrupções, considere fazer upgrade do seu plano.</p>
                    
                    <p style="text-align: center;">
                        <a href="https://aivendas-1.preview.emergentagent.com/dashboard/planos" class="button">
                            Ver Planos →
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>© 2026 Elevare NeuroVendas. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, html)


# Singleton
_email_service = None

def get_email_service() -> EmailService:
    global _email_service
    if _email_service is None:
        _email_service = EmailService()
    return _email_service
