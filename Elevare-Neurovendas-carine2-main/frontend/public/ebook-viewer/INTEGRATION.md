# 📚 Elevare E-book Viewer - Guia de Integração

## Visão Geral

O Elevare E-book Viewer é um microaplicativo independente para visualização de e-books com efeito de virar página. Suporta PDF, HTML e imagens, funcionando totalmente no cliente sem necessidade de servidor externo.

## Estrutura de Arquivos

```
/ebook-viewer/
├── index.html          # Página principal do viewer
├── demo.html           # Página de demonstração
├── css/
│   ├── viewer.css      # Estilos principais
│   └── flipbook.css    # Estilos do efeito de flip
├── js/
│   ├── flipbook-engine.js  # Motor de animação de páginas
│   ├── pdf-renderer.js     # Renderizador de PDFs
│   └── viewer.js           # Controlador principal
├── assets/             # Recursos estáticos (se necessário)
└── INTEGRATION.md      # Este guia
```

## Formas de Integração

### 1. Via iframe com parâmetros de URL

A forma mais simples de integração. Basta adicionar um iframe apontando para o viewer com os parâmetros:

```html
<iframe
  src="/ebook-viewer/?source=URL_DO_EBOOK&type=pdf&title=Meu%20E-book"
  width="100%"
  height="600"
  frameborder="0"
  allow="fullscreen"
></iframe>
```

**Parâmetros:**
| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `source` | string | ✓ | URL do e-book (URL-encoded) |
| `type` | string | ✗ | `pdf`, `html` ou `images` (default: `pdf`) |
| `title` | string | ✗ | Título exibido no header |

### 2. Via postMessage (Recomendado)

Oferece mais controle e permite carregar conteúdo dinâmico:

```html
<iframe id="ebook-viewer" src="/ebook-viewer/" width="100%" height="600"></iframe>

<script>
const viewer = document.getElementById('ebook-viewer');

// Esperar iframe carregar
viewer.onload = function() {
  // Carregar e-book
  viewer.contentWindow.postMessage({
    action: 'loadEbook',
    source: 'https://exemplo.com/meu-ebook.pdf',
    type: 'pdf',
    title: 'Meu E-book de Neurovendas'
  }, '*');
};
</script>
```

### 3. Integração Direta (React/Vue)

Para integração em componentes React ou Vue:

```jsx
// React Component
import { useEffect, useRef } from 'react';

function EbookViewer({ source, type, title }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.postMessage({
        action: 'loadEbook',
        source,
        type,
        title
      }, '*');
    }
  }, [source, type, title]);

  return (
    <iframe
      ref={iframeRef}
      src="/ebook-viewer/"
      width="100%"
      height="600"
      frameBorder="0"
    />
  );
}
```

## Tipos de Conteúdo Suportados

### PDF
```javascript
// URL externa
{
  source: 'https://exemplo.com/ebook.pdf',
  type: 'pdf'
}

// Base64
{
  source: 'data:application/pdf;base64,JVBERi0x...',
  type: 'pdf'
}
```

### HTML
```javascript
// URL
{
  source: 'https://exemplo.com/ebook.html',
  type: 'html'
}

// String HTML
{
  source: '<section><h1>Título</h1><p>Conteúdo...</p></section>',
  type: 'html'
}
```

O HTML é dividido em páginas automaticamente por:
1. Elementos `<section>` ou com classe `.page`
2. Headers `<h1>` e `<h2>`

### Imagens
```javascript
{
  source: [
    'https://exemplo.com/pagina1.jpg',
    'https://exemplo.com/pagina2.jpg',
    'https://exemplo.com/pagina3.jpg'
  ],
  type: 'images'
}
```

## Recebendo Eventos do Viewer

O viewer envia eventos de navegação que podem ser usados para analytics:

```javascript
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'elevare-ebook-page-change') {
    console.log('Página atual:', event.data.currentPage);
    console.log('Total de páginas:', event.data.totalPages);
    console.log('Progresso:', event.data.progress + '%');
    
    // Enviar para analytics
    trackEvent('ebook_page_view', {
      page: event.data.currentPage,
      total: event.data.totalPages,
      progress: event.data.progress
    });
  }
});
```

## Recursos

### Navegação
- **Desktop:** Botões de seta nas laterais ou clique nos lados da página
- **Mobile:** Swipe esquerda/direita ou botões no footer
- **Teclado:** ←/→ ou PageUp/PageDown

### Bookmarks
- Clique no ícone de marcador para salvar/remover
- Long press (500ms) para abrir painel de marcadores
- Marcadores são salvos no localStorage por título do e-book

### Fullscreen
- Clique no ícone de tela cheia
- Pressione Esc para sair

## Personalização

### Cores (CSS Variables)
```css
:root {
  --color-primary: #7c3aed;      /* Cor principal */
  --color-primary-dark: #5b21b6; /* Cor primária escura */
  --color-primary-light: #a78bfa; /* Cor primária clara */
  --color-bg: #f8f7fa;           /* Fundo */
  --color-surface: #ffffff;      /* Superfícies */
  --color-text: #1e293b;         /* Texto */
}
```

### Configurações do Flipbook
```javascript
// Em flipbook-engine.js
const config = {
  animationDuration: 600,     // Duração da animação (ms)
  swipeThreshold: 50,         // Mínimo de px para swipe
  singlePageBreakpoint: 600   // Breakpoint para modo mobile
};
```

### Configurações do PDF
```javascript
// Em pdf-renderer.js
const config = {
  scale: 1.5,        // Qualidade de renderização
  maxWidth: 800,     // Largura máxima da página
  cacheEnabled: true // Cache de páginas
};
```

## Integração com Elevare NeuroVendas

### No backend (server.py)

O e-book gerado já retorna HTML estruturado. Para usar com o viewer:

```python
@app.get("/api/ebook/{ebook_id}/viewer")
async def get_ebook_for_viewer(ebook_id: str, current_user: dict = Depends(get_current_user)):
    ebook = await db.ebooks_structured.find_one({"id": ebook_id})
    
    # Se tem PDF gerado, retornar URL
    if ebook.get("pdf_url"):
        return {
            "source": ebook["pdf_url"],
            "type": "pdf",
            "title": ebook["structured_content"]["meta"]["title"]
        }
    
    # Senão, retornar HTML
    return {
        "source": ebook.get("html_content", ""),
        "type": "html",
        "title": ebook["structured_content"]["meta"]["title"]
    }
```

### No frontend (React)

```jsx
// components/EbookViewerModal.tsx
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { api } from '@/lib/api';

export function EbookViewerModal({ ebookId, open, onClose }) {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && ebookId && iframeRef.current) {
      setLoading(true);
      
      api.get(`/api/ebook/${ebookId}/viewer`).then(response => {
        const { source, type, title } = response.data;
        
        iframeRef.current.contentWindow.postMessage({
          action: 'loadEbook',
          source,
          type,
          title
        }, '*');
        
        setLoading(false);
      });
    }
  }, [open, ebookId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh]">
        {loading && <div className="loading">Carregando...</div>}
        <iframe
          ref={iframeRef}
          src="/ebook-viewer/"
          className="w-full h-full border-0"
        />
      </DialogContent>
    </Dialog>
  );
}
```

## Troubleshooting

### PDF não carrega
- Verifique se a URL é acessível (CORS)
- Tente carregar o PDF via base64
- Verifique o console para erros do PDF.js

### Animação travando
- Reduza a escala do PDF em `pdf-renderer.js`
- Ative lazy loading para e-books grandes
- Teste em modo de produção (sem devtools)

### Swipe não funciona
- Verifique se não há elementos bloqueando o touch
- Ajuste o `swipeThreshold` se necessário

## Dependências Externas

- **PDF.js** (CDN): Renderização de PDFs
  - `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js`
  - `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

Nenhuma outra dependência externa é necessária.

---

**Versão:** 1.0.0  
**Última atualização:** Janeiro 2026  
**Autor:** Elevare NeuroVendas
