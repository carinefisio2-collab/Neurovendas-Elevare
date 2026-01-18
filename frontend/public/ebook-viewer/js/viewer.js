/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELEVARE E-BOOK VIEWER - Main Controller
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este é o controlador principal do viewer que integra:
 * - FlipbookEngine (efeito de virar página)
 * - PDFRenderer (renderização de PDFs)
 * - UI Controls (navegação, bookmarks, fullscreen)
 * 
 * USO:
 * ElevareEbookViewer.init({
 *   source: 'path/to/ebook.pdf',
 *   type: 'pdf',
 *   title: 'Meu E-book'
 * });
 * 
 * @version 1.0.0
 * @author Elevare NeuroVendas
 */

const ElevareEbookViewer = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  const config = {
    container: 'flipbook',
    defaultTitle: 'E-book',
    bookmarksKey: 'elevare-ebook-bookmarks'
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════════════════════
  let state = {
    isInitialized: false,
    currentSource: null,
    currentType: null,
    title: '',
    currentPage: 1,
    totalPages: 0,
    bookmarks: [],
    isFullscreen: false
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ELEMENTOS DOM
  // ═══════════════════════════════════════════════════════════════════════════
  let elements = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicializa o viewer
   * @param {Object} options - Opções de configuração
   * @param {string} options.source - Fonte do e-book (URL, base64, ou array)
   * @param {string} options.type - Tipo: 'pdf', 'html', 'images'
   * @param {string} options.title - Título do e-book
   */
  async function init(options) {
    if (!options || !options.source) {
      console.error('ElevareEbookViewer: Source é obrigatório');
      return;
    }

    // Cachear elementos DOM
    cacheElements();

    // Configurar estado inicial
    state.currentSource = options.source;
    state.currentType = options.type || detectType(options.source);
    state.title = options.title || config.defaultTitle;

    // Atualizar título na UI
    updateTitle(state.title);

    // Configurar event listeners
    setupUIListeners();

    // Carregar bookmarks salvos
    loadBookmarks();

    // Mostrar loading
    showLoading('Carregando e-book...');

    try {
      // Carregar conteúdo baseado no tipo
      let pages = [];

      switch (state.currentType) {
        case 'pdf':
          pages = await loadPDF(options.source);
          break;
        case 'html':
          pages = await loadHTML(options.source);
          break;
        case 'images':
          pages = loadImages(options.source);
          break;
        default:
          throw new Error(`Tipo não suportado: ${state.currentType}`);
      }

      // Inicializar flipbook engine
      FlipbookEngine.init({
        container: config.container,
        pages: pages,
        onPageChange: handlePageChange,
        onReady: () => {
          state.isInitialized = true;
          hideLoading();
          showSwipeHint();
        }
      });

      state.totalPages = pages.length;
      updatePageIndicator(1, state.totalPages);
      updateProgress(1, state.totalPages);
      updateNavigationButtons(1, state.totalPages);

    } catch (error) {
      console.error('ElevareEbookViewer: Erro ao carregar e-book', error);
      showError('Não foi possível carregar o e-book. Verifique a fonte e tente novamente.');
    }
  }

  /**
   * Cacheia referências aos elementos DOM
   */
  function cacheElements() {
    elements = {
      viewer: document.getElementById('ebook-viewer'),
      title: document.getElementById('ebook-title'),
      pageIndicator: document.getElementById('page-indicator'),
      progressBar: document.getElementById('progress-bar'),
      loadingOverlay: document.getElementById('loading-overlay'),
      loadingText: document.getElementById('loading-text'),
      flipbookContainer: document.getElementById('flipbook-container'),
      flipbook: document.getElementById('flipbook'),
      
      // Botões de navegação
      btnPrev: document.getElementById('btn-prev'),
      btnNext: document.getElementById('btn-next'),
      mobilePrev: document.getElementById('mobile-prev'),
      mobileNext: document.getElementById('mobile-next'),
      
      // Input de página
      pageInput: document.getElementById('page-input'),
      pageTotal: document.getElementById('page-total'),
      
      // Botões de ação
      btnFullscreen: document.getElementById('btn-fullscreen'),
      btnBookmark: document.getElementById('btn-bookmark'),
      
      // Painel de bookmarks
      bookmarksPanel: document.getElementById('bookmarks-panel'),
      bookmarksList: document.getElementById('bookmarks-list'),
      btnCloseBookmarks: document.getElementById('btn-close-bookmarks')
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CARREGADORES DE CONTEÚDO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Carrega e renderiza um PDF
   */
  async function loadPDF(source) {
    updateLoadingText('Carregando PDF...');

    await PDFRenderer.loadPDF(source, (progress) => {
      updateLoadingText(`Carregando PDF... ${Math.round(progress)}%`);
    });

    updateLoadingText('Renderizando páginas...');

    const pages = await PDFRenderer.renderAllPages((info) => {
      updateLoadingText(`Renderizando página ${info.pageNum} de ${info.totalPages}...`);
    });

    // Tentar obter metadados para o título
    try {
      const metadata = await PDFRenderer.getMetadata();
      if (metadata.title && !state.title) {
        state.title = metadata.title;
        updateTitle(state.title);
      }
    } catch (e) {
      // Ignorar erro de metadados
    }

    return pages;
  }

  /**
   * Carrega conteúdo HTML
   */
  async function loadHTML(source) {
    updateLoadingText('Carregando conteúdo...');

    let htmlContent = '';

    if (typeof source === 'string') {
      if (source.startsWith('http') || source.startsWith('/')) {
        // Fetch de URL
        const response = await fetch(source);
        htmlContent = await response.text();
      } else {
        // String HTML direta
        htmlContent = source;
      }
    }

    // Dividir HTML em páginas
    // Estratégia: dividir por elementos de seção ou por tamanho
    const pages = parseHTMLToPages(htmlContent);

    return pages;
  }

  /**
   * Carrega array de imagens
   */
  function loadImages(source) {
    if (!Array.isArray(source)) {
      console.error('Para type=images, source deve ser um array de URLs');
      return [];
    }

    return source.map((src, index) => ({
      type: 'image',
      src: src,
      alt: `Página ${index + 1}`,
      pageNum: index + 1
    }));
  }

  /**
   * Converte HTML em páginas
   */
  function parseHTMLToPages(htmlContent) {
    const pages = [];
    
    // Criar container temporário
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Buscar seções (h1, h2, ou divs com class page)
    const sections = temp.querySelectorAll('section, .page, article');

    if (sections.length > 0) {
      // Usar seções existentes
      sections.forEach((section, index) => {
        pages.push({
          type: 'html',
          html: section.innerHTML,
          pageNum: index + 1
        });
      });
    } else {
      // Dividir por headers ou tamanho
      const headers = temp.querySelectorAll('h1, h2');
      
      if (headers.length > 0) {
        // Dividir por headers
        let currentContent = '';
        
        Array.from(temp.children).forEach((child) => {
          if (child.tagName === 'H1' || child.tagName === 'H2') {
            if (currentContent) {
              pages.push({
                type: 'html',
                html: currentContent,
                pageNum: pages.length + 1
              });
            }
            currentContent = child.outerHTML;
          } else {
            currentContent += child.outerHTML;
          }
        });
        
        if (currentContent) {
          pages.push({
            type: 'html',
            html: currentContent,
            pageNum: pages.length + 1
          });
        }
      } else {
        // Uma única página com todo conteúdo
        pages.push({
          type: 'html',
          html: htmlContent,
          pageNum: 1
        });
      }
    }

    return pages;
  }

  /**
   * Detecta tipo baseado na fonte
   */
  function detectType(source) {
    if (typeof source === 'string') {
      if (source.endsWith('.pdf') || source.includes('data:application/pdf')) {
        return 'pdf';
      }
      if (source.endsWith('.html') || source.startsWith('<')) {
        return 'html';
      }
    }
    if (Array.isArray(source)) {
      return 'images';
    }
    return 'pdf'; // Default
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Configura listeners da UI
   */
  function setupUIListeners() {
    // Navegação desktop
    elements.btnPrev?.addEventListener('click', () => FlipbookEngine.prevPage());
    elements.btnNext?.addEventListener('click', () => FlipbookEngine.nextPage());

    // Navegação mobile
    elements.mobilePrev?.addEventListener('click', () => FlipbookEngine.prevPage());
    elements.mobileNext?.addEventListener('click', () => FlipbookEngine.nextPage());

    // Input de página
    elements.pageInput?.addEventListener('change', handlePageInputChange);
    elements.pageInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handlePageInputChange(e);
      }
    });

    // Fullscreen
    elements.btnFullscreen?.addEventListener('click', toggleFullscreen);

    // Bookmarks
    elements.btnBookmark?.addEventListener('click', toggleBookmark);
    elements.btnCloseBookmarks?.addEventListener('click', closeBookmarksPanel);

    // Long press para abrir painel de bookmarks
    let pressTimer;
    elements.btnBookmark?.addEventListener('mousedown', () => {
      pressTimer = setTimeout(openBookmarksPanel, 500);
    });
    elements.btnBookmark?.addEventListener('mouseup', () => {
      clearTimeout(pressTimer);
    });
    elements.btnBookmark?.addEventListener('mouseleave', () => {
      clearTimeout(pressTimer);
    });

    // Fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  }

  /**
   * Handler de mudança de página
   */
  function handlePageChange(data) {
    state.currentPage = data.currentPage;
    
    updatePageIndicator(data.currentPage, data.totalPages);
    updateProgress(data.currentPage, data.totalPages);
    updateNavigationButtons(data.currentPage, data.totalPages);
    updateBookmarkButton();

    // Atualizar input de página
    if (elements.pageInput) {
      elements.pageInput.value = data.currentPage;
    }
  }

  /**
   * Handler de input de página
   */
  function handlePageInputChange(e) {
    const pageNum = parseInt(e.target.value, 10);
    if (pageNum >= 1 && pageNum <= state.totalPages) {
      FlipbookEngine.goToPage(pageNum);
    } else {
      e.target.value = state.currentPage;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UI UPDATES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Atualiza título
   */
  function updateTitle(title) {
    if (elements.title) {
      elements.title.textContent = title;
    }
    document.title = `${title} | Elevare E-book Viewer`;
  }

  /**
   * Atualiza indicador de página
   */
  function updatePageIndicator(current, total) {
    if (elements.pageIndicator) {
      elements.pageIndicator.textContent = `Página ${current} de ${total}`;
    }
    if (elements.pageTotal) {
      elements.pageTotal.textContent = `/ ${total}`;
    }
    if (elements.pageInput) {
      elements.pageInput.max = total;
    }
  }

  /**
   * Atualiza barra de progresso
   */
  function updateProgress(current, total) {
    if (elements.progressBar) {
      const progress = (current / total) * 100;
      elements.progressBar.style.width = `${progress}%`;
    }
  }

  /**
   * Atualiza estado dos botões de navegação
   */
  function updateNavigationButtons(current, total) {
    const isFirst = current <= 1;
    const isLast = current >= total;

    if (elements.btnPrev) elements.btnPrev.disabled = isFirst;
    if (elements.btnNext) elements.btnNext.disabled = isLast;
    if (elements.mobilePrev) elements.mobilePrev.disabled = isFirst;
    if (elements.mobileNext) elements.mobileNext.disabled = isLast;
  }

  /**
   * Mostra loading
   */
  function showLoading(text) {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.remove('hidden');
    }
    updateLoadingText(text);
  }

  /**
   * Esconde loading
   */
  function hideLoading() {
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Atualiza texto de loading
   */
  function updateLoadingText(text) {
    if (elements.loadingText) {
      elements.loadingText.textContent = text;
    }
  }

  /**
   * Mostra erro
   */
  function showError(message) {
    if (elements.loadingText) {
      elements.loadingText.innerHTML = `
        <span style="color: #ef4444;">⚠️ ${message}</span>
      `;
    }
  }

  /**
   * Mostra hint de swipe (mobile)
   */
  function showSwipeHint() {
    if (window.innerWidth <= 768) {
      const hint = document.createElement('div');
      hint.className = 'swipe-hint';
      hint.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Deslize para navegar
      `;
      elements.flipbookContainer?.appendChild(hint);
      
      setTimeout(() => hint.remove(), 3000);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULLSCREEN
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Alterna fullscreen
   */
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      elements.viewer?.requestFullscreen?.() || 
      elements.viewer?.webkitRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() || 
      document.webkitExitFullscreen?.();
    }
  }

  /**
   * Handler de mudança de fullscreen
   */
  function handleFullscreenChange() {
    state.isFullscreen = !!document.fullscreenElement;
    elements.viewer?.classList.toggle('fullscreen', state.isFullscreen);
    
    // Atualizar ícone
    if (elements.btnFullscreen) {
      const icon = state.isFullscreen
        ? '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>'
        : '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
      elements.btnFullscreen.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          ${icon}
        </svg>
      `;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BOOKMARKS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Carrega bookmarks do localStorage
   */
  function loadBookmarks() {
    try {
      const saved = localStorage.getItem(config.bookmarksKey);
      if (saved) {
        const allBookmarks = JSON.parse(saved);
        // Filtrar por título do ebook atual
        state.bookmarks = allBookmarks[state.title] || [];
      }
    } catch (e) {
      state.bookmarks = [];
    }
  }

  /**
   * Salva bookmarks no localStorage
   */
  function saveBookmarks() {
    try {
      const saved = localStorage.getItem(config.bookmarksKey);
      const allBookmarks = saved ? JSON.parse(saved) : {};
      allBookmarks[state.title] = state.bookmarks;
      localStorage.setItem(config.bookmarksKey, JSON.stringify(allBookmarks));
    } catch (e) {
      console.warn('Não foi possível salvar bookmarks');
    }
  }

  /**
   * Alterna bookmark da página atual
   */
  function toggleBookmark() {
    const pageIndex = state.bookmarks.indexOf(state.currentPage);
    
    if (pageIndex > -1) {
      // Remover bookmark
      state.bookmarks.splice(pageIndex, 1);
    } else {
      // Adicionar bookmark
      state.bookmarks.push(state.currentPage);
      state.bookmarks.sort((a, b) => a - b);
    }
    
    saveBookmarks();
    updateBookmarkButton();
    renderBookmarksList();
  }

  /**
   * Atualiza visual do botão de bookmark
   */
  function updateBookmarkButton() {
    const isBookmarked = state.bookmarks.includes(state.currentPage);
    elements.btnBookmark?.classList.toggle('active', isBookmarked);
    
    if (elements.btnBookmark) {
      const fillColor = isBookmarked ? 'var(--color-primary)' : 'none';
      elements.btnBookmark.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${fillColor}" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      `;
    }
  }

  /**
   * Abre painel de bookmarks
   */
  function openBookmarksPanel() {
    elements.bookmarksPanel?.classList.add('open');
    renderBookmarksList();
  }

  /**
   * Fecha painel de bookmarks
   */
  function closeBookmarksPanel() {
    elements.bookmarksPanel?.classList.remove('open');
  }

  /**
   * Renderiza lista de bookmarks
   */
  function renderBookmarksList() {
    if (!elements.bookmarksList) return;

    if (state.bookmarks.length === 0) {
      elements.bookmarksList.innerHTML = `
        <li class="bookmarks-empty">
          Nenhum marcador ainda.<br>
          Clique no ícone de marcador para adicionar.
        </li>
      `;
      return;
    }

    elements.bookmarksList.innerHTML = state.bookmarks.map(page => `
      <li data-page="${page}">
        <span class="bookmark-page">Página ${page}</span>
        <button class="bookmark-delete" data-page="${page}" title="Remover">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </li>
    `).join('');

    // Event listeners
    elements.bookmarksList.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', (e) => {
        if (!e.target.closest('.bookmark-delete')) {
          const page = parseInt(li.dataset.page, 10);
          FlipbookEngine.goToPage(page);
          closeBookmarksPanel();
        }
      });
    });

    elements.bookmarksList.querySelectorAll('.bookmark-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const page = parseInt(btn.dataset.page, 10);
        const index = state.bookmarks.indexOf(page);
        if (index > -1) {
          state.bookmarks.splice(index, 1);
          saveBookmarks();
          updateBookmarkButton();
          renderBookmarksList();
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Navega para próxima página
   */
  function nextPage() {
    return FlipbookEngine.nextPage();
  }

  /**
   * Navega para página anterior
   */
  function prevPage() {
    return FlipbookEngine.prevPage();
  }

  /**
   * Vai para página específica
   */
  function goToPage(pageNum) {
    return FlipbookEngine.goToPage(pageNum);
  }

  /**
   * Retorna página atual
   */
  function getCurrentPage() {
    return state.currentPage;
  }

  /**
   * Retorna total de páginas
   */
  function getTotalPages() {
    return state.totalPages;
  }

  /**
   * Retorna bookmarks
   */
  function getBookmarks() {
    return [...state.bookmarks];
  }

  /**
   * Destrói o viewer
   */
  function destroy() {
    FlipbookEngine.destroy();
    PDFRenderer.destroy();
    state.isInitialized = false;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RETORNAR API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    init,
    nextPage,
    prevPage,
    goToPage,
    getCurrentPage,
    getTotalPages,
    getBookmarks,
    toggleFullscreen,
    toggleBookmark,
    destroy
  };

})();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.ElevareEbookViewer = ElevareEbookViewer;
}
