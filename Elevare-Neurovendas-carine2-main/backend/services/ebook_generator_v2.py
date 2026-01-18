"""
Gerador de E-books Elevare v2.0
Sistema completo de geração de e-books usando GPT-4o + fpdf2
Sem dependência de APIs externas (Gamma)
"""

import os
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime
from fpdf import FPDF
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

class ElevareEbookPDF(FPDF):
    """Classe customizada para criar PDFs premium Elevare"""
    
    def __init__(self, title: str, author: str = "Elevare NeuroVendas"):
        super().__init__()
        self.title_text = title
        self.author_text = author
        self.chapter_title = ""
        # Adicionar fonte Unicode para suportar caracteres especiais
        self.add_font('DejaVu', '', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf')
        self.add_font('DejaVu', 'B', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
        
    def header(self):
        """Header personalizado"""
        if self.page_no() > 1:  # Não mostrar header na capa
            self.set_font('DejaVu', '', 8)
            self.set_text_color(128, 122, 168)  # Lavanda Elevare
            self.cell(0, 10, self.title_text, 0, 0, 'L')
            self.cell(0, 10, f'Pagina {self.page_no()}', 0, 0, 'R')
            self.ln(15)
    
    def footer(self):
        """Footer personalizado"""
        if self.page_no() > 1:  # Não mostrar footer na capa
            self.set_y(-15)
            self.set_font('DejaVu', '', 8)
            self.set_text_color(128, 122, 168)
            self.cell(0, 10, 'Elevare NeuroVendas - www.elevare.com.br', 0, 0, 'C')
    
    def chapter_cover(self, title: str, subtitle: str = ""):
        """Capa do e-book"""
        self.add_page()
        
        # Fundo colorido (simulado com retângulo)
        self.set_fill_color(138, 124, 168)  # Lavanda Elevare
        self.rect(0, 0, 210, 297, 'F')
        
        # Título principal
        self.set_y(100)
        self.set_font('DejaVu', 'B', 32)
        self.set_text_color(255, 255, 255)
        self.multi_cell(0, 15, title, 0, 'C')
        
        # Subtítulo
        if subtitle:
            self.ln(10)
            self.set_font('DejaVu', '', 16)
            self.multi_cell(0, 10, subtitle, 0, 'C')
        
        # Logo/Autor
        self.set_y(250)
        self.set_font('DejaVu', 'B', 14)
        self.cell(0, 10, 'Elevare NeuroVendas', 0, 0, 'C')
        
        self.set_y(265)
        self.set_font('DejaVu', '', 10)
        self.cell(0, 10, 'Inteligencia Artificial para Profissionais de Estetica', 0, 0, 'C')
    
    def add_chapter_title(self, num: int, title: str):
        """Adiciona título de capítulo"""
        self.add_page()
        self.set_font('DejaVu', 'B', 20)
        self.set_text_color(138, 124, 168)  # Lavanda Elevare
        chapter_text = f'Capitulo {num}'
        self.cell(0, 10, chapter_text, 0, 1, 'L')
        
        self.set_font('DejaVu', 'B', 16)
        self.set_text_color(52, 73, 94)  # Petróleo Elevare
        self.multi_cell(0, 10, title)
        self.ln(5)
    
    def add_body_text(self, text: str):
        """Adiciona texto do corpo"""
        self.set_font('DejaVu', '', 11)
        self.set_text_color(52, 73, 94)  # Petróleo Elevare
        
        # Processar parágrafos
        paragraphs = text.split('\n\n')
        for para in paragraphs:
            if para.strip():
                self.multi_cell(0, 6, para.strip())
                self.ln(3)
    
    def add_bullet_list(self, items: List[str]):
        """Adiciona lista com bullets"""
        self.set_font('DejaVu', '', 11)
        self.set_text_color(52, 73, 94)
        
        for item in items:
            self.cell(10, 6, '-', 0, 0)  # Usar traço ao invés de bullet unicode
            self.multi_cell(0, 6, item.strip())
            self.ln(1)
    
    def add_call_to_action(self, cta_text: str):
        """Adiciona CTA destacado"""
        self.ln(10)
        self.set_fill_color(212, 175, 55)  # Dourado Elevare
        self.set_font('DejaVu', 'B', 12)
        self.set_text_color(255, 255, 255)
        
        self.cell(0, 12, cta_text, 0, 1, 'C', True)
        self.ln(5)


class EbookGeneratorV2:
    """Gerador de E-books usando GPT-4o diretamente"""
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY') or os.environ.get('OPENAI_API_KEY')
        if not self.api_key:
            raise ValueError("API key não configurada (EMERGENT_LLM_KEY ou OPENAI_API_KEY)")
    
    async def generate_ebook_content(
        self,
        title: str,
        topic: str,
        target_audience: str,
        tone: str = "profissional",
        num_chapters: int = 5
    ) -> Dict[str, Any]:
        """
        Gera conteúdo estruturado do e-book usando GPT-4o
        
        Retorna:
            {
                "title": str,
                "subtitle": str,
                "introduction": str,
                "chapters": [
                    {
                        "number": 1,
                        "title": str,
                        "content": str,
                        "key_points": [str],
                        "cta": str (opcional)
                    }
                ],
                "conclusion": str,
                "final_cta": str
            }
        """
        
        prompt = f"""Você é um especialista em criar e-books estratégicos para profissionais de estética.

INSTRUÇÕES:
Crie um e-book completo e estruturado sobre o tema abaixo. O e-book deve ter conteúdo de ALTO VALOR, ser persuasivo e educativo.

TEMA: {title}
TÓPICO: {topic}
PÚBLICO-ALVO: {target_audience}
TOM: {tone}
NÚMERO DE CAPÍTULOS: {num_chapters}

ESTRUTURA OBRIGATÓRIA (retorne APENAS um JSON válido):

{{
  "title": "{title}",
  "subtitle": "Subtítulo atrativo e persuasivo (máximo 100 caracteres)",
  "introduction": "Introdução envolvente que conecta com a dor do leitor e apresenta a solução (200-300 palavras)",
  "chapters": [
    {{
      "number": 1,
      "title": "Título do Capítulo 1 (atrativo e específico)",
      "content": "Conteúdo completo do capítulo com informações valiosas, exemplos práticos e insights. Mínimo 400 palavras. Use parágrafos bem estruturados.",
      "key_points": [
        "Ponto-chave 1",
        "Ponto-chave 2",
        "Ponto-chave 3"
      ],
      "cta": "Call to action específico para este capítulo (opcional)"
    }},
    ... (repita para {num_chapters} capítulos)
  ],
  "conclusion": "Conclusão poderosa que recapitula os principais aprendizados e motiva ação (150-200 palavras)",
  "final_cta": "Call to action final persuasivo e claro"
}}

REQUISITOS DE CONTEÚDO:
1. Cada capítulo deve ter MÍNIMO 400 palavras de conteúdo real
2. Use linguagem profissional mas acessível
3. Inclua exemplos práticos e aplicáveis
4. Use gatilhos mentais: autoridade, prova social, urgência
5. Evite jargões técnicos excessivos
6. Foque em soluções e resultados práticos
7. Mantenha tom {tone} durante todo o e-book

IMPORTANTE: Retorne APENAS o JSON, sem texto adicional antes ou depois."""

        # Usar LlmChat com GPT-4o
        session_id = f"ebook_gen_{datetime.now().timestamp()}"
        llm = LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message="Você é um especialista em criar e-books estratégicos premium."
        ).with_model("openai", "gpt-4o")
        
        # Gerar conteúdo
        response = await llm.send_message(UserMessage(text=prompt))
        
        # Extrair JSON da resposta
        import re
        json_match = re.search(r'\{[\s\S]*\}', response)
        if not json_match:
            raise ValueError("Resposta da IA não contém JSON válido")
        
        ebook_data = json.loads(json_match.group())
        
        return ebook_data
    
    def create_pdf(self, ebook_data: Dict[str, Any], output_path: str) -> str:
        """
        Cria PDF do e-book a partir dos dados estruturados
        
        Returns:
            Caminho do arquivo PDF gerado
        """
        pdf = ElevareEbookPDF(
            title=ebook_data["title"],
            author="Elevare NeuroVendas"
        )
        
        # Capa
        pdf.chapter_cover(
            title=ebook_data["title"],
            subtitle=ebook_data.get("subtitle", "")
        )
        
        # Página de introdução
        pdf.add_page()
        pdf.set_font('DejaVu', 'B', 16)
        pdf.set_text_color(138, 124, 168)
        pdf.cell(0, 10, 'Introducao', 0, 1, 'L')
        pdf.ln(5)
        pdf.add_body_text(ebook_data["introduction"])
        
        # Capítulos
        for chapter in ebook_data["chapters"]:
            pdf.add_chapter_title(chapter["number"], chapter["title"])
            pdf.add_body_text(chapter["content"])
            
            # Pontos-chave
            if chapter.get("key_points"):
                pdf.ln(5)
                pdf.set_font('DejaVu', 'B', 12)
                pdf.set_text_color(138, 124, 168)
                pdf.cell(0, 10, 'Pontos-Chave:', 0, 1, 'L')
                pdf.add_bullet_list(chapter["key_points"])
            
            # CTA do capítulo
            if chapter.get("cta"):
                pdf.add_call_to_action(chapter["cta"])
        
        # Conclusão
        pdf.add_page()
        pdf.set_font('DejaVu', 'B', 16)
        pdf.set_text_color(138, 124, 168)
        pdf.cell(0, 10, 'Conclusao', 0, 1, 'L')
        pdf.ln(5)
        pdf.add_body_text(ebook_data["conclusion"])
        
        # CTA Final
        pdf.ln(10)
        pdf.add_call_to_action(ebook_data["final_cta"])
        
        # Página de encerramento
        pdf.add_page()
        pdf.set_y(100)
        pdf.set_font('DejaVu', 'B', 20)
        pdf.set_text_color(138, 124, 168)
        pdf.cell(0, 10, 'Parabens por Concluir Este E-book!', 0, 1, 'C')
        
        pdf.ln(10)
        pdf.set_font('DejaVu', '', 12)
        pdf.set_text_color(52, 73, 94)
        pdf.multi_cell(0, 8, 'Este material foi criado especialmente para voce pela Elevare NeuroVendas, a plataforma de IA para profissionais de estetica que querem atrair mais clientes e vender mais.')
        
        pdf.ln(10)
        pdf.set_font('DejaVu', 'B', 14)
        pdf.set_text_color(138, 124, 168)
        pdf.cell(0, 10, 'Proximos Passos:', 0, 1, 'C')
        
        pdf.ln(5)
        pdf.set_font('DejaVu', '', 11)
        pdf.set_text_color(52, 73, 94)
        next_steps = [
            "Aplique os aprendizados deste e-book no seu negocio",
            "Acesse mais recursos e ferramentas na plataforma Elevare",
            "Crie conteudo estrategico com nossa IA especializada",
            "Junte-se a comunidade de profissionais de sucesso"
        ]
        pdf.add_bullet_list(next_steps)
        
        # Salvar PDF
        pdf.output(output_path)
        
        return output_path
    
    async def generate_complete_ebook(
        self,
        title: str,
        topic: str,
        target_audience: str,
        tone: str = "profissional",
        num_chapters: int = 5,
        output_dir: str = "/tmp"
    ) -> Dict[str, Any]:
        """
        Gera e-book completo (conteúdo + PDF)
        
        Returns:
            {
                "ebook_data": Dict,  # Dados estruturados
                "pdf_path": str,     # Caminho do PDF
                "title": str,
                "pages": int
            }
        """
        # Gerar conteúdo
        ebook_data = await self.generate_ebook_content(
            title=title,
            topic=topic,
            target_audience=target_audience,
            tone=tone,
            num_chapters=num_chapters
        )
        
        # Criar nome de arquivo seguro
        safe_filename = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in title)
        safe_filename = safe_filename[:50]  # Limitar tamanho
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pdf_filename = f"ebook_{safe_filename}_{timestamp}.pdf"
        pdf_path = os.path.join(output_dir, pdf_filename)
        
        # Criar PDF
        self.create_pdf(ebook_data, pdf_path)
        
        # Contar páginas (aproximado)
        num_pages = 1 + 1 + len(ebook_data["chapters"]) * 2 + 1 + 1  # Capa + Intro + Capítulos + Conclusão + Encerramento
        
        return {
            "ebook_data": ebook_data,
            "pdf_path": pdf_path,
            "pdf_filename": pdf_filename,
            "title": title,
            "pages": num_pages,
            "chapters": len(ebook_data["chapters"])
        }


# Instância singleton
_ebook_generator = None

def get_ebook_generator() -> EbookGeneratorV2:
    """Retorna instância singleton do gerador"""
    global _ebook_generator
    if _ebook_generator is None:
        _ebook_generator = EbookGeneratorV2()
    return _ebook_generator
