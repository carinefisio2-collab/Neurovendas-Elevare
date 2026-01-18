/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELEVARE E-BOOK VIEWER - PDF Renderer
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo gerencia a renderização de PDFs usando PDF.js,
 * convertendo cada página em canvas para o flipbook.
 * 
 * Recursos:
 * - Renderização de PDFs sem servidor externo
 * - Lazy loading de páginas
 * - Cache de páginas renderizadas
 * - Suporte a zoom e qualidade configurável
 * 
 * @version 1.0.0
 * @author Elevare NeuroVendas
 */

const PDFRenderer = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  const config = {
    scale: 1.5,           // Escala de renderização (qualidade)
    maxWidth: 800,        // Largura máxima da página
    cacheEnabled: true,   // Habilitar cache de canvas
    workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════════════════════
  let pdfDocument = null;
  let pageCache = new Map();
  let renderQueue = [];
  let isRendering = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicializa o PDF.js
   */
  function init() {
    // Configurar worker do PDF.js
    if (typeof pdfjsLib !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc = config.workerSrc;
    }
  }

  /**
   * Carrega um documento PDF
   * @param {string|ArrayBuffer} source - URL ou ArrayBuffer do PDF
   * @param {Function} onProgress - Callback de progresso
   * @returns {Promise<Object>} - Informações do documento
   */
  async function loadPDF(source, onProgress) {
    // Limpar cache anterior
    clearCache();

    try {
      // Determinar tipo de fonte
      let loadingTask;
      
      if (typeof source === 'string') {
        // URL ou base64
        if (source.startsWith('data:')) {
          // Base64
          const base64 = source.split(',')[1];
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          // URL
          loadingTask = pdfjsLib.getDocument(source);
        }
      } else if (source instanceof ArrayBuffer) {
        loadingTask = pdfjsLib.getDocument({ data: source });
      } else {
        throw new Error('Fonte de PDF inválida');
      }

      // Progresso de carregamento
      loadingTask.onProgress = function(progress) {
        if (onProgress && progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          onProgress(percent);
        }
      };

      pdfDocument = await loadingTask.promise;

      return {
        numPages: pdfDocument.numPages,
        fingerprint: pdfDocument.fingerprints[0]
      };

    } catch (error) {
      console.error('PDFRenderer: Erro ao carregar PDF', error);
      throw error;
    }
  }

  /**
   * Converte todas as páginas do PDF em objetos de página para o flipbook
   * @param {Function} onPageRendered - Callback quando cada página é renderizada
   * @returns {Promise<Array>} - Array de objetos de página
   */
  async function renderAllPages(onPageRendered) {
    if (!pdfDocument) {
      throw new Error('Nenhum documento PDF carregado');
    }

    const pages = [];
    const numPages = pdfDocument.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const pageData = await renderPage(pageNum);
        pages.push(pageData);

        if (onPageRendered) {
          onPageRendered({
            pageNum,
            totalPages: numPages,
            progress: (pageNum / numPages) * 100
          });
        }
      } catch (error) {
        console.error(`PDFRenderer: Erro ao renderizar página ${pageNum}`, error);
        // Adicionar placeholder em caso de erro
        pages.push({
          type: 'placeholder',
          pageNum
        });
      }
    }

    return pages;
  }

  /**
   * Renderiza uma página específica
   * @param {number} pageNum - Número da página (1-indexed)
   * @returns {Promise<Object>} - Objeto de página com canvas
   */
  async function renderPage(pageNum) {
    // Verificar cache
    if (config.cacheEnabled && pageCache.has(pageNum)) {
      return pageCache.get(pageNum);
    }

    const page = await pdfDocument.getPage(pageNum);
    
    // Calcular escala baseada na largura máxima
    const originalViewport = page.getViewport({ scale: 1 });
    let scale = config.scale;
    
    if (originalViewport.width * scale > config.maxWidth) {
      scale = config.maxWidth / originalViewport.width;
    }

    const viewport = page.getViewport({ scale });

    // Criar canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Renderizar página no canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    const pageData = {
      type: 'canvas',
      canvas: canvas,
      pageNum: pageNum,
      width: canvas.width,
      height: canvas.height
    };

    // Adicionar ao cache
    if (config.cacheEnabled) {
      pageCache.set(pageNum, pageData);
    }

    return pageData;
  }

  /**
   * Pré-carrega páginas próximas (lazy loading)
   * @param {number} currentPage - Página atual
   * @param {number} range - Número de páginas para pré-carregar
   */
  async function preloadPages(currentPage, range = 2) {
    if (!pdfDocument) return;

    const numPages = pdfDocument.numPages;
    const pagesToLoad = [];

    for (let i = currentPage - range; i <= currentPage + range; i++) {
      if (i >= 1 && i <= numPages && !pageCache.has(i)) {
        pagesToLoad.push(i);
      }
    }

    // Renderizar em background
    for (const pageNum of pagesToLoad) {
      try {
        await renderPage(pageNum);
      } catch (error) {
        console.warn(`PDFRenderer: Erro ao pré-carregar página ${pageNum}`);
      }
    }
  }

  /**
   * Obtém metadados do PDF
   * @returns {Promise<Object>} - Metadados do documento
   */
  async function getMetadata() {
    if (!pdfDocument) {
      throw new Error('Nenhum documento PDF carregado');
    }

    try {
      const metadata = await pdfDocument.getMetadata();
      return {
        title: metadata.info?.Title || null,
        author: metadata.info?.Author || null,
        subject: metadata.info?.Subject || null,
        creator: metadata.info?.Creator || null,
        producer: metadata.info?.Producer || null,
        creationDate: metadata.info?.CreationDate || null,
        modificationDate: metadata.info?.ModDate || null
      };
    } catch (error) {
      console.warn('PDFRenderer: Não foi possível obter metadados', error);
      return {};
    }
  }

  /**
   * Obtém outline (índice) do PDF
   * @returns {Promise<Array>} - Array com estrutura do índice
   */
  async function getOutline() {
    if (!pdfDocument) {
      throw new Error('Nenhum documento PDF carregado');
    }

    try {
      const outline = await pdfDocument.getOutline();
      return outline || [];
    } catch (error) {
      console.warn('PDFRenderer: Não foi possível obter outline', error);
      return [];
    }
  }

  /**
   * Limpa o cache de páginas renderizadas
   */
  function clearCache() {
    pageCache.forEach((pageData) => {
      if (pageData.canvas) {
        // Liberar memória do canvas
        pageData.canvas.width = 0;
        pageData.canvas.height = 0;
      }
    });
    pageCache.clear();
  }

  /**
   * Fecha o documento PDF e libera recursos
   */
  function destroy() {
    clearCache();
    if (pdfDocument) {
      pdfDocument.destroy();
      pdfDocument = null;
    }
  }

  /**
   * Configura opções do renderer
   * @param {Object} options - Opções de configuração
   */
  function setConfig(options) {
    Object.assign(config, options);
  }

  /**
   * Retorna número de páginas do documento carregado
   */
  function getNumPages() {
    return pdfDocument ? pdfDocument.numPages : 0;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPORTAR PÁGINA COMO IMAGEM
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Exporta uma página como Data URL
   * @param {number} pageNum - Número da página
   * @param {string} format - Formato ('png' ou 'jpeg')
   * @param {number} quality - Qualidade (0-1, apenas para jpeg)
   * @returns {Promise<string>} - Data URL da imagem
   */
  async function exportPageAsImage(pageNum, format = 'png', quality = 0.92) {
    const pageData = await renderPage(pageNum);
    
    if (format === 'jpeg') {
      return pageData.canvas.toDataURL('image/jpeg', quality);
    }
    return pageData.canvas.toDataURL('image/png');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAR AUTOMATICAMENTE
  // ═══════════════════════════════════════════════════════════════════════════
  init();

  // ═══════════════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    loadPDF,
    renderAllPages,
    renderPage,
    preloadPages,
    getMetadata,
    getOutline,
    getNumPages,
    exportPageAsImage,
    setConfig,
    clearCache,
    destroy
  };

})();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.PDFRenderer = PDFRenderer;
}
