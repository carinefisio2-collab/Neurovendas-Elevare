#!/usr/bin/env python3
"""
Script de teste para validar integrações Gamma e Resend
"""
import asyncio
import os
import sys
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('/app/backend/.env')

async def test_gamma():
    """Testa integração com Gamma API"""
    print("\n" + "="*60)
    print("🧪 TESTANDO GAMMA API")
    print("="*60)
    
    try:
        from backend.services.gamma_service import GammaService, build_ebook_config
        
        gamma = GammaService()
        
        # Teste básico de configuração
        print(f"✅ GammaService inicializado")
        print(f"📋 API Key presente: {'Sim' if gamma.api_key else 'Não'}")
        print(f"🔗 Base URL: {gamma.base_url}")
        
        # Criar uma configuração simples de teste
        config = build_ebook_config(
            title="E-book de Teste",
            topic="Procedimentos estéticos modernos",
            audience="Profissionais de estética",
            tone="profissional",
            num_chapters=3
        )
        
        print(f"\n📝 Configuração criada:")
        print(f"   - Título: E-book de Teste")
        print(f"   - Cards: {config.num_cards}")
        print(f"   - Formato: {config.format}")
        print(f"   - Idioma: {config.language}")
        
        # Tentar fazer uma requisição real
        print(f"\n🚀 Iniciando geração no Gamma...")
        result = await gamma.generate(config)
        
        print(f"✅ SUCESSO! Gamma API respondeu:")
        print(f"   - Generation ID: {result.get('generationId')}")
        print(f"   - Status: {result.get('status')}")
        if result.get('gammaUrl'):
            print(f"   - URL: {result.get('gammaUrl')}")
        
        return True
        
    except Exception as e:
        print(f"❌ ERRO no teste Gamma: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_resend():
    """Testa integração com Resend API"""
    print("\n" + "="*60)
    print("📧 TESTANDO RESEND API")
    print("="*60)
    
    try:
        from backend.services.email_service import EmailService
        
        email_service = EmailService()
        
        print(f"✅ EmailService inicializado")
        print(f"📋 API Key presente: {'Sim' if email_service.api_key else 'Não'}")
        print(f"📮 From Email: {email_service.from_email}")
        
        # Enviar email de teste
        print(f"\n🚀 Enviando email de teste...")
        
        result = await email_service.send_email(
            to="teste@elevare.com",  # Email de teste
            subject="🧪 Teste de Integração - Elevare",
            html="""
            <html>
                <body style="font-family: Arial, sans-serif; padding: 20px;">
                    <h1 style="color: #7c3aed;">✅ Integração Resend Funcionando!</h1>
                    <p>Este é um email de teste enviado pela plataforma Elevare NeuroVendas.</p>
                    <p>Se você está vendo isso, significa que a integração com Resend está <strong>100% operacional</strong>!</p>
                </body>
            </html>
            """
        )
        
        if result.get("success"):
            print(f"✅ SUCESSO! Email enviado:")
            print(f"   - Email ID: {result.get('id')}")
            return True
        else:
            print(f"❌ ERRO ao enviar email: {result.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ ERRO no teste Resend: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

async def test_health_endpoint():
    """Testa endpoint de health do backend"""
    print("\n" + "="*60)
    print("🏥 TESTANDO HEALTH ENDPOINT")
    print("="*60)
    
    try:
        import httpx
        
        async with httpx.AsyncClient() as client:
            response = await client.get("http://localhost:8001/api/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Backend respondendo:")
                print(f"   - Status: {data.get('status')}")
                print(f"   - Service: {data.get('service')}")
                print(f"   - Version: {data.get('version')}")
                print(f"   - Integrations:")
                for key, value in data.get('integrations', {}).items():
                    emoji = "✅" if value == "active" else "❌"
                    print(f"     {emoji} {key}: {value}")
                return True
            else:
                print(f"❌ Backend retornou status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ ERRO ao conectar no backend: {str(e)}")
        return False

async def main():
    """Executa todos os testes"""
    print("\n")
    print("╔" + "="*58 + "╗")
    print("║" + " "*15 + "TESTE DE INTEGRAÇÕES" + " "*23 + "║")
    print("║" + " "*12 + "Elevare NeuroVendas Beta" + " "*22 + "║")
    print("╚" + "="*58 + "╝")
    
    # Adicionar path do backend
    sys.path.insert(0, '/app')
    
    results = {}
    
    # Testar Health Endpoint
    results['health'] = await test_health_endpoint()
    await asyncio.sleep(1)
    
    # Testar Resend (mais simples, testar primeiro)
    results['resend'] = await test_resend()
    await asyncio.sleep(1)
    
    # Testar Gamma (pode demorar mais)
    results['gamma'] = await test_gamma()
    
    # Resumo final
    print("\n" + "="*60)
    print("📊 RESUMO DOS TESTES")
    print("="*60)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, passed_test in results.items():
        emoji = "✅" if passed_test else "❌"
        print(f"{emoji} {test_name.upper()}: {'PASSOU' if passed_test else 'FALHOU'}")
    
    print(f"\n🎯 Resultado: {passed}/{total} testes passaram")
    
    if passed == total:
        print("\n🎉 TODAS AS INTEGRAÇÕES ESTÃO FUNCIONANDO!")
        print("✅ Plataforma pronta para BETA!")
    else:
        print(f"\n⚠️  {total - passed} integração(ões) com problema(s)")
        print("🔧 Verifique os erros acima para mais detalhes")
    
    print("\n")

if __name__ == "__main__":
    asyncio.run(main())
