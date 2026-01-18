/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ELEVARE E-BOOK VIEWER - Engine do Flipbook
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo gerencia o efeito de virar página do e-book, incluindo:
 * - Criação e renderização de páginas
 * - Animações de flip
 * - Suporte a touch/swipe
 * - Navegação por teclado
 * 
 * @version 1.0.0
 * @author Elevare NeuroVendas
 */

const FlipbookEngine = (function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════
  const config = {
    animationDuration: 600, // ms
    swipeThreshold: 50,     // px mínimo para trigger swipe
    touchSensitivity: 0.5,  // sensibilidade do drag
    singlePageBreakpoint: 600, // px para modo single page
    lazyLoadThreshold: 3    // páginas para pré-carregar
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTADO
  // ═══════════════════════════════════════════════════════════════════════════
  let state = {
    container: null,
    pages: [],
    currentPage: 0,
    totalPages: 0,
    isAnimating: false,
    isSinglePageMode: false,
    touchStartX: 0,
    touchStartY: 0,
    isDragging: false
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACKS
  // ═══════════════════════════════════════════════════════════════════════════
  let callbacks = {
    onPageChange: null,
    onReady: null,
    onError: null
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // INICIALIZAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicializa o flipbook engine
   * @param {Object} options - Opções de configuração
   * @param {string} options.container - ID do container
   * @param {Array} options.pages - Array de objetos de página
   * @param {Function} options.onPageChange - Callback quando página muda
   * @param {Function} options.onReady - Callback quando pronto
   */
  function init(options) {
    // Validar opções
    if (!options.container) {
      console.error('FlipbookEngine: Container ID é obrigatório');
      return;
    }

    state.container = document.getElementById(options.container);
    if (!state.container) {
      console.error('FlipbookEngine: Container não encontrado');
      return;
    }

    // Registrar callbacks
    callbacks.onPageChange = options.onPageChange || null;
    callbacks.onReady = options.onReady || null;
    callbacks.onError = options.onError || null;

    // Detectar modo single page
    checkSinglePageMode();

    // Configurar event listeners
    setupEventListeners();

    // Se páginas foram fornecidas, renderizar
    if (options.pages && options.pages.length > 0) {
      setPages(options.pages);
    }

    // Callback de ready
    if (callbacks.onReady) {
      callbacks.onReady();
    }

    return {
      setPages,
      nextPage,
      prevPage,
      goToPage,
      getCurrentPage,
      getTotalPages,
      destroy
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GERENCIAMENTO DE PÁGINAS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Define as páginas do flipbook
   * @param {Array} pages - Array de objetos de página
   */
  function setPages(pages) {
    state.pages = pages;
    state.totalPages = pages.length;
    state.currentPage = 0;

    renderPages();
    updateVisibility();
    emitPageChange();
  }

  /**
   * Renderiza todas as páginas no container
   */
  function renderPages() {
    state.container.innerHTML = '';

    if (state.isSinglePageMode) {
      // Modo single page (mobile)
      renderSinglePageMode();
    } else {
      // Modo spread (desktop)
      renderSpreadMode();
    }
  }

  /**
   * Renderiza em modo spread (desktop)
   */
  function renderSpreadMode() {
    state.pages.forEach((pageData, index) => {
      const page = createPageElement(pageData, index);
      state.container.appendChild(page);
    });
  }

  /**
   * Renderiza em modo single page (mobile)
   */
  function renderSinglePageMode() {
    state.container.classList.add('single-page-mode');
    
    state.pages.forEach((pageData, index) => {
      const page = createSinglePageElement(pageData, index);
      state.container.appendChild(page);
    });
  }

  /**
   * Cria elemento de página para modo spread
   */
  function createPageElement(pageData, index) {
    const page = document.createElement('div');
    page.className = `page ${index % 2 === 0 ? 'right' : 'left'}`;
    page.dataset.index = index;

    // Determinar se é capa ou página normal
    if (index === 0 && pageData.isCover) {
      page.classList.add('cover');
    } else if (index === state.pages.length - 1 && pageData.isBackCover) {
      page.classList.add('back-cover');
    }

    // Face frontal
    const front = document.createElement('div');
    front.className = 'page-front';
    front.appendChild(createPageContent(pageData));
    page.appendChild(front);

    // Face traseira (para flip)
    const back = document.createElement('div');
    back.className = 'page-back';
    // A face traseira mostrará a próxima página ou ficará vazia
    if (index + 1 < state.pages.length) {
      back.appendChild(createPageContent(state.pages[index + 1]));
    }
    page.appendChild(back);

    // Número da página
    if (!pageData.isCover && !pageData.isBackCover) {
      const pageNum = document.createElement('span');
      pageNum.className = 'page-number';
      pageNum.textContent = index + 1;
      front.appendChild(pageNum);
    }

    return page;
  }

  /**
   * Cria elemento de página para modo single
   */
  function createSinglePageElement(pageData, index) {
    const page = document.createElement('div');
    page.className = 'page';
    page.dataset.index = index;

    if (index === state.currentPage) {
      page.classList.add('visible');
    }

    const content = createPageContent(pageData);
    page.appendChild(content);

    // Número da página
    if (!pageData.isCover && !pageData.isBackCover) {
      const pageNum = document.createElement('span');
      pageNum.className = 'page-number';
      pageNum.textContent = `${index + 1} / ${state.totalPages}`;
      pageNum.style.cssText = 'position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%);';
      page.appendChild(pageNum);
    }

    return page;
  }

  /**
   * Cria o conteúdo da página baseado no tipo
   */
  function createPageContent(pageData) {
    const content = document.createElement('div');
    content.className = 'page-content';

    if (pageData.type === 'image') {
      // Conteúdo de imagem
      const img = document.createElement('img');
      img.src = pageData.src;
      img.alt = pageData.alt || `Página`;
      img.loading = 'lazy';
      content.appendChild(img);

    } else if (pageData.type === 'canvas') {
      // Conteúdo de canvas (PDF)
      const canvas = pageData.canvas;
      if (canvas) {
        content.appendChild(canvas);
      }

    } else if (pageData.type === 'html') {
      // Conteúdo HTML
      content.classList.add('html-content');
      content.innerHTML = pageData.html;

    } else if (pageData.type === 'cover') {
      // Capa especial
      content.innerHTML = `
        <div class="cover-title">${pageData.title || 'E-book'}</div>
        ${pageData.subtitle ? `<div class="cover-subtitle">${pageData.subtitle}</div>` : ''}
        ${pageData.author ? `<div class="cover-author">Por ${pageData.author}</div>` : ''}
      `;

    } else if (pageData.type === 'placeholder') {
      // Placeholder para lazy loading
      const placeholder = document.createElement('div');
      placeholder.className = 'page-placeholder';
      content.appendChild(placeholder);
    }

    return content;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NAVEGAÇÃO
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Vai para a próxima página
   */
  function nextPage() {
    if (state.isAnimating || state.currentPage >= state.totalPages - 1) {
      return false;
    }

    if (state.isSinglePageMode) {
      navigateSinglePage(1);
    } else {
      flipPage('next');
    }

    return true;
  }

  /**
   * Vai para a página anterior
   */
  function prevPage() {
    if (state.isAnimating || state.currentPage <= 0) {
      return false;
    }

    if (state.isSinglePageMode) {
      navigateSinglePage(-1);
    } else {
      flipPage('prev');
    }

    return true;
  }

  /**
   * Vai para uma página específica
   * @param {number} pageNum - Número da página (1-indexed)
   */
  function goToPage(pageNum) {
    const targetIndex = pageNum - 1;
    
    if (targetIndex < 0 || targetIndex >= state.totalPages || targetIndex === state.currentPage) {
      return false;
    }

    if (state.isSinglePageMode) {
      // Em single page, navegação direta
      state.currentPage = targetIndex;
      updateVisibility();
      emitPageChange();
    } else {
      // Em spread, animar para a página
      const direction = targetIndex > state.currentPage ? 'next' : 'prev';
      state.currentPage = targetIndex;
      updateVisibility();
      emitPageChange();
    }

    return true;
  }

  /**
   * Navega em modo single page
   */
  function navigateSinglePage(direction) {
    state.isAnimating = true;
    state.currentPage += direction;
    
    updateVisibility();
    emitPageChange();

    setTimeout(() => {
      state.isAnimating = false;
    }, 300);
  }

  /**
   * Executa animação de flip
   */
  function flipPage(direction) {
    state.isAnimating = true;

    const pages = state.container.querySelectorAll('.page');
    const currentPageEl = pages[state.currentPage];

    if (direction === 'next') {
      // Flip para frente
      if (currentPageEl) {
        currentPageEl.classList.add('flipping', 'flip-left');
      }
      state.currentPage++;
    } else {
      // Flip para trás
      state.currentPage--;
      const prevPageEl = pages[state.currentPage];
      if (prevPageEl) {
        prevPageEl.classList.add('flipping', 'flip-right');
      }
    }

    // Após animação
    setTimeout(() => {
      updateVisibility();
      state.isAnimating = false;
      emitPageChange();
    }, config.animationDuration);
  }

  /**
   * Atualiza visibilidade das páginas
   */
  function updateVisibility() {
    const pages = state.container.querySelectorAll('.page');

    if (state.isSinglePageMode) {
      // Modo single page
      pages.forEach((page, index) => {
        page.classList.toggle('visible', index === state.currentPage);
      });
    } else {
      // Modo spread
      pages.forEach((page, index) => {
        page.classList.remove('flipping', 'flip-left', 'flip-right');
        
        if (index < state.currentPage) {
          page.classList.add('turned');
        } else {
          page.classList.remove('turned');
        }

        // Z-index baseado na posição
        const distance = Math.abs(index - state.currentPage);
        page.style.zIndex = state.totalPages - distance;
      });
    }
  }

  /**
   * Retorna página atual
   */
  function getCurrentPage() {
    return state.currentPage + 1;
  }

  /**
   * Retorna total de páginas
   */
  function getTotalPages() {
    return state.totalPages;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Configura event listeners
   */
  function setupEventListeners() {
    // Touch events
    state.container.addEventListener('touchstart', handleTouchStart, { passive: true });
    state.container.addEventListener('touchmove', handleTouchMove, { passive: false });
    state.container.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events
    state.container.addEventListener('mousedown', handleMouseDown);
    state.container.addEventListener('mousemove', handleMouseMove);
    state.container.addEventListener('mouseup', handleMouseUp);
    state.container.addEventListener('mouseleave', handleMouseUp);

    // Click em páginas
    state.container.addEventListener('click', handlePageClick);

    // Keyboard
    document.addEventListener('keydown', handleKeydown);

    // Resize
    window.addEventListener('resize', debounce(handleResize, 250));
  }

  /**
   * Touch start
   */
  function handleTouchStart(e) {
    if (e.touches.length !== 1) return;
    
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
    state.isDragging = true;
  }

  /**
   * Touch move
   */
  function handleTouchMove(e) {
    if (!state.isDragging) return;
    
    const deltaX = e.touches[0].clientX - state.touchStartX;
    const deltaY = e.touches[0].clientY - state.touchStartY;

    // Prevenir scroll se swipe horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
  }

  /**
   * Touch end
   */
  function handleTouchEnd(e) {
    if (!state.isDragging) return;
    state.isDragging = false;

    const deltaX = e.changedTouches[0].clientX - state.touchStartX;

    if (Math.abs(deltaX) > config.swipeThreshold) {
      if (deltaX < 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
  }

  /**
   * Mouse down
   */
  function handleMouseDown(e) {
    state.touchStartX = e.clientX;
    state.isDragging = true;
    state.container.classList.add('touch-active');
  }

  /**
   * Mouse move
   */
  function handleMouseMove(e) {
    if (!state.isDragging) return;
    // Poderia adicionar preview do flip aqui
  }

  /**
   * Mouse up
   */
  function handleMouseUp(e) {
    if (!state.isDragging) return;
    state.isDragging = false;
    state.container.classList.remove('touch-active');

    const deltaX = e.clientX - state.touchStartX;

    if (Math.abs(deltaX) > config.swipeThreshold) {
      if (deltaX < 0) {
        nextPage();
      } else {
        prevPage();
      }
    }
  }

  /**
   * Click em página
   */
  function handlePageClick(e) {
    if (state.isAnimating || state.isDragging) return;

    const rect = state.container.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    // Click no lado esquerdo = página anterior
    // Click no lado direito = próxima página
    if (clickX < width * 0.3) {
      prevPage();
    } else if (clickX > width * 0.7) {
      nextPage();
    }
  }

  /**
   * Keyboard navigation
   */
  function handleKeydown(e) {
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
        e.preventDefault();
        nextPage();
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        prevPage();
        break;
      case 'Home':
        e.preventDefault();
        goToPage(1);
        break;
      case 'End':
        e.preventDefault();
        goToPage(state.totalPages);
        break;
    }
  }

  /**
   * Handle resize
   */
  function handleResize() {
    checkSinglePageMode();
    renderPages();
    updateVisibility();
  }

  /**
   * Verifica se deve usar modo single page
   */
  function checkSinglePageMode() {
    const wasSinglePage = state.isSinglePageMode;
    state.isSinglePageMode = window.innerWidth <= config.singlePageBreakpoint;

    if (wasSinglePage !== state.isSinglePageMode && state.pages.length > 0) {
      renderPages();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EMISSÃO DE EVENTOS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Emite evento de mudança de página
   */
  function emitPageChange() {
    if (callbacks.onPageChange) {
      callbacks.onPageChange({
        currentPage: state.currentPage + 1,
        totalPages: state.totalPages,
        progress: ((state.currentPage + 1) / state.totalPages) * 100
      });
    }

    // Enviar mensagem para parent (integração iframe)
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'elevare-ebook-page-change',
        currentPage: state.currentPage + 1,
        totalPages: state.totalPages,
        progress: ((state.currentPage + 1) / state.totalPages) * 100
      }, '*');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILIDADES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Cleanup
   */
  function destroy() {
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('resize', handleResize);
    
    if (state.container) {
      state.container.innerHTML = '';
    }
    
    state = {
      container: null,
      pages: [],
      currentPage: 0,
      totalPages: 0,
      isAnimating: false,
      isSinglePageMode: false,
      touchStartX: 0,
      touchStartY: 0,
      isDragging: false
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API PÚBLICA
  // ═══════════════════════════════════════════════════════════════════════════
  return {
    init,
    setPages,
    nextPage,
    prevPage,
    goToPage,
    getCurrentPage,
    getTotalPages,
    destroy
  };

})();

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.FlipbookEngine = FlipbookEngine;
}
