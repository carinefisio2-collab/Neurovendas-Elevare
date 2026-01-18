"""
Motor de Layout para E-books

Converte documento estruturado (JSON) em HTML estilizado
Suporta 3 templates: Educational, Marketing, Storytelling
"""

from typing import Literal
import html

TemplateType = Literal["educational", "marketing", "storytelling"]

# ============================================================================
# TEMPLATES (Tipografia, Margens, Cores)
# ============================================================================

TEMPLATES = {
    "educational": {
        "name": "Educacional",
        "description": "Didático, claro, ideal para cursos e tutoriais",
        "css": """
            :root {
                --primary-color: #4B0082;
                --secondary-color: #64748b;
                --accent-color: #9333ea;
                --bg-color: #ffffff;
                --text-color: #1e293b;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 11pt;
                line-height: 1.6;
                color: var(--text-color);
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
            }
            
            h1 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 28pt;
                font-weight: 700;
                color: var(--primary-color);
                margin: 0 0 10mm 0;
                line-height: 1.2;
            }
            
            h2 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 20pt;
                font-weight: 600;
                color: var(--primary-color);
                margin: 12mm 0 6mm 0;
                page-break-after: avoid;
            }
            
            h3 {
                font-size: 14pt;
                font-weight: 600;
                color: var(--secondary-color);
                margin: 8mm 0 4mm 0;
            }
            
            p {
                margin: 0 0 5mm 0;
                text-align: justify;
            }
            
            ul {
                margin: 5mm 0;
                padding-left: 8mm;
            }
            
            li {
                margin-bottom: 3mm;
            }
            
            .callout {
                padding: 5mm;
                margin: 6mm 0;
                border-left: 4px solid var(--accent-color);
                background: #f5f3ff;
                page-break-inside: avoid;
            }
            
            .callout-highlight {
                border-left-color: #9333ea;
                background: #f5f3ff;
            }
            
            .callout-tip {
                border-left-color: #10b981;
                background: #d1fae5;
            }
            
            .callout-warning {
                border-left-color: #f59e0b;
                background: #fef3c7;
            }
            
            .hero {
                text-align: center;
                padding: 15mm 0;
                page-break-after: always;
            }
            
            .hero-subtitle {
                font-size: 16pt;
                color: var(--secondary-color);
                margin-top: 5mm;
            }
            
            .image-container {
                margin: 8mm 0;
                text-align: center;
                page-break-inside: avoid;
            }
            
            .image-full {
                width: 100%;
                max-height: 150mm;
                object-fit: contain;
            }
            
            .image-inline {
                width: 80%;
                max-height: 100mm;
                object-fit: contain;
            }
        """
    },
    
    "marketing": {
        "name": "Marketing",
        "description": "Persuasivo, orientado a ação, com gatilhos visuais",
        "css": """
            :root {
                --primary-color: #4B0082;
                --secondary-color: #7c3aed;
                --accent-color: #d4af37;
                --bg-color: #ffffff;
                --text-color: #18181b;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 11pt;
                line-height: 1.7;
                color: var(--text-color);
                max-width: 210mm;
                margin: 0 auto;
                padding: 20mm;
            }
            
            h1 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 32pt;
                font-weight: 800;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin: 0 0 8mm 0;
                line-height: 1.1;
            }
            
            h2 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 22pt;
                font-weight: 700;
                color: var(--primary-color);
                margin: 12mm 0 6mm 0;
                page-break-after: avoid;
            }
            
            h3 {
                font-size: 16pt;
                font-weight: 600;
                color: var(--secondary-color);
                margin: 8mm 0 4mm 0;
            }
            
            p {
                margin: 0 0 5mm 0;
                text-align: left;
            }
            
            ul {
                margin: 5mm 0;
                padding-left: 8mm;
            }
            
            li {
                margin-bottom: 3mm;
                position: relative;
                padding-left: 3mm;
            }
            
            li::marker {
                color: var(--accent-color);
                font-weight: 700;
            }
            
            .callout {
                padding: 6mm;
                margin: 8mm 0;
                border-radius: 3mm;
                box-shadow: 0 2mm 8mm rgba(0,0,0,0.1);
                page-break-inside: avoid;
            }
            
            .callout-highlight {
                background: linear-gradient(135deg, #f5f3ff, #ede9fe);
                border: 2px solid var(--primary-color);
            }
            
            .callout-tip {
                background: linear-gradient(135deg, #f0fdf4, #dcfce7);
                border: 2px solid #10b981;
            }
            
            .callout-warning {
                background: linear-gradient(135deg, #fffbeb, #fef3c7);
                border: 2px solid #f59e0b;
            }
            
            .hero {
                text-align: center;
                padding: 20mm 0;
                background: linear-gradient(135deg, #f5f3ff, #ede9fe);
                margin: -20mm -20mm 15mm -20mm;
                padding: 30mm 20mm;
                page-break-after: always;
            }
            
            .hero-subtitle {
                font-size: 18pt;
                color: var(--secondary-color);
                margin-top: 6mm;
                font-weight: 500;
            }
            
            .image-container {
                margin: 10mm 0;
                text-align: center;
                page-break-inside: avoid;
            }
            
            .image-full {
                width: 100%;
                max-height: 150mm;
                object-fit: cover;
                border-radius: 3mm;
            }
            
            .image-inline {
                width: 85%;
                max-height: 100mm;
                object-fit: cover;
                border-radius: 3mm;
            }
        """
    },
    
    "storytelling": {
        "name": "Storytelling",
        "description": "Narrativo, envolvente, com foco em experiência de leitura",
        "css": """
            :root {
                --primary-color: #4B0082;
                --secondary-color: #475569;
                --accent-color: #d4af37;
                --bg-color: #fefce8;
                --text-color: #1e293b;
            }
            
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                font-size: 11.5pt;
                line-height: 1.8;
                color: var(--text-color);
                max-width: 210mm;
                margin: 0 auto;
                padding: 25mm;
                background: var(--bg-color);
            }
            
            h1 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 36pt;
                font-weight: 700;
                color: var(--primary-color);
                margin: 0 0 12mm 0;
                line-height: 1.2;
                font-style: italic;
            }
            
            h2 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 24pt;
                font-weight: 600;
                color: var(--primary-color);
                margin: 15mm 0 8mm 0;
                page-break-after: avoid;
            }
            
            h3 {
                font-family: 'Playfair Display', Georgia, serif;
                font-size: 18pt;
                font-weight: 600;
                color: var(--secondary-color);
                margin: 10mm 0 5mm 0;
            }
            
            p {
                margin: 0 0 6mm 0;
                text-align: justify;
                text-indent: 8mm;
            }
            
            p:first-of-type {
                text-indent: 0;
            }
            
            ul {
                margin: 6mm 0;
                padding-left: 10mm;
            }
            
            li {
                margin-bottom: 4mm;
            }
            
            .callout {
                padding: 8mm;
                margin: 10mm 0;
                border-left: 5mm solid var(--accent-color);
                background: #fffbeb;
                font-style: italic;
                page-break-inside: avoid;
            }
            
            .callout-highlight {
                border-left-color: #d4af37;
                background: #fffbeb;
            }
            
            .callout-tip {
                border-left-color: #14b8a6;
                background: #ccfbf1;
            }
            
            .callout-warning {
                border-left-color: #ef4444;
                background: #fee2e2;
            }
            
            .hero {
                text-align: center;
                padding: 25mm 0;
                border-top: 2px solid var(--primary-color);
                border-bottom: 2px solid var(--primary-color);
                margin: 10mm 0 20mm 0;
                page-break-after: always;
            }
            
            .hero-subtitle {
                font-size: 18pt;
                color: var(--secondary-color);
                margin-top: 8mm;
                font-style: italic;
            }
            
            .image-container {
                margin: 12mm 0;
                text-align: center;
                page-break-inside: avoid;
            }
            
            .image-full {
                width: 100%;
                max-height: 160mm;
                object-fit: contain;
            }
            
            .image-inline {
                width: 75%;
                max-height: 110mm;
                object-fit: contain;
            }
        """
    }
}

# ============================================================================
# HELPERS
# ============================================================================

def escape_html(text: str) -> str:
    """Escapa HTML para prevenir XSS"""
    if not text:
        return ""
    return html.escape(text)


def render_block(block: dict) -> str:
    """Renderiza um bloco de conteúdo"""
    block_type = block.get("type")
    
    if block_type == "paragraph":
        return f'<p>{escape_html(block.get("text", ""))}</p>'
    
    if block_type == "bullet_list":
        items_html = "\n".join([f'  <li>{escape_html(item)}</li>' for item in block.get("items", [])])
        return f'<ul>\n{items_html}\n</ul>'
    
    if block_type == "callout":
        style = block.get("style", "highlight")
        return f'''<div class="callout callout-{style}">
  <p style="margin: 0;">{escape_html(block.get("text", ""))}</p>
</div>'''
    
    return ""


def render_section(section: dict) -> str:
    """Renderiza uma seção"""
    section_type = section.get("type")
    
    if section_type == "hero":
        subtitle = f'<div class="hero-subtitle">{escape_html(section.get("subtitle", ""))}</div>' if section.get("subtitle") else ""
        return f'''
<div class="hero">
  <h1>{escape_html(section.get("title", ""))}</h1>
  {subtitle}
</div>'''
    
    if section_type == "section":
        blocks_html = "\n".join([render_block(block) for block in section.get("blocks", [])])
        return f'''
<section>
  <h2>{escape_html(section.get("title", ""))}</h2>
  {blocks_html}
</section>'''
    
    if section_type == "image":
        style_class = "image-full" if section.get("style") == "full" else "image-inline"
        if section.get("url"):
            return f'''
<div class="image-container">
  <img src="{escape_html(section.get('url', ''))}" alt="{escape_html(section.get('prompt', ''))}" class="{style_class}" />
</div>'''
        else:
            return f'''
<div class="image-container">
  <div style="padding: 20mm; background: #f1f5f9; border: 2px dashed #cbd5e1; text-align: center; color: #64748b;">
    <p>Imagem: {escape_html(section.get("prompt", ""))}</p>
    <p style="font-size: 9pt; margin-top: 5mm;">(Será gerada automaticamente)</p>
  </div>
</div>'''
    
    return ""


# ============================================================================
# RENDERER
# ============================================================================

def render_structured_ebook(ebook: dict, template: TemplateType) -> str:
    """Converte documento estruturado em HTML estilizado"""
    template_config = TEMPLATES.get(template, TEMPLATES["educational"])
    
    html_parts = []
    
    meta = ebook.get("meta", {})
    title = escape_html(meta.get("title", "E-book"))
    
    # HTML Header
    html_parts.append(f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    {template_config["css"]}
  </style>
</head>
<body>''')
    
    # Render sections
    for section in ebook.get("sections", []):
        html_parts.append(render_section(section))
    
    # HTML Footer
    html_parts.append('''</body>
</html>''')
    
    return "\n".join(html_parts)


def get_available_templates() -> list:
    """Retorna lista de templates disponíveis"""
    return [
        {"type": key, "name": config["name"], "description": config["description"]}
        for key, config in TEMPLATES.items()
    ]
