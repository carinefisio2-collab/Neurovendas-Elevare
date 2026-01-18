#!/usr/bin/env python3
"""
Teste rápido do novo gerador de e-books V2
"""
import asyncio
import sys
sys.path.insert(0, '/app')

from backend.services.ebook_generator_v2 import get_ebook_generator

async def test_ebook_generation():
    print("\n" + "="*60)
    print("🧪 TESTANDO GERADOR DE E-BOOKS V2 (GPT-4o)")
    print("="*60)
    
    try:
        generator = get_ebook_generator()
        print("✅ Gerador inicializado")
        
        print("\n📝 Gerando e-book de teste...")
        print("   Título: 'Guia Rápido de Harmonização Facial'")
        print("   Aguarde 30-60 segundos...")
        
        result = await generator.generate_complete_ebook(
            title="Guia Rápido de Harmonização Facial",
            topic="Técnicas modernas de harmonização facial para profissionais de estética",
            target_audience="Profissionais de estética que querem dominar harmonização",
            tone="profissional e educativo",
            num_chapters=3,  # Apenas 3 capítulos para teste rápido
            output_dir="/tmp"
        )
        
        print("\n✅ E-BOOK GERADO COM SUCESSO!")
        print(f"   📄 Título: {result['title']}")
        print(f"   📚 Capítulos: {result['chapters']}")
        print(f"   📄 Páginas: {result['pages']}")
        print(f"   💾 PDF salvo em: {result['pdf_path']}")
        print(f"   📊 Tamanho: {round(len(open(result['pdf_path'], 'rb').read()) / 1024, 2)} KB")
        
        # Mostrar preview do conteúdo
        print("\n📖 PREVIEW DO CONTEÚDO:")
        print(f"   Subtítulo: {result['ebook_data']['subtitle']}")
        print(f"   Introdução (primeiras 150 chars): {result['ebook_data']['introduction'][:150]}...")
        print(f"\n   Capítulo 1: {result['ebook_data']['chapters'][0]['title']}")
        print(f"   Conteúdo (primeiras 100 chars): {result['ebook_data']['chapters'][0]['content'][:100]}...")
        
        print("\n🎉 TESTE COMPLETO! Sistema de e-books funcionando perfeitamente!")
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO no teste: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    result = asyncio.run(test_ebook_generation())
    sys.exit(0 if result else 1)
