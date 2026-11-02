/**
 * ============================================================================
 * Emeraldparfum — app.js
 * ----------------------------------------------------------------------------
 * Prototipo funcional 100% en memoria (mock data). No hay llamadas a Supabase
 * todavía: este archivo demuestra la UX completa para presentar el proyecto.
 * Cuando se conecte la base de datos se reemplazan únicamente las operaciones
 * de `mockProducts` por consultas `supabase.from('products')...`.
 *
 * Categorías: 'Damas' · 'Caballeros' · 'Unisex' · 'Estuches'
 *
 * Organización:
 *   1. Configuración
 *   2. Datos de prueba (mock)
 *   3. Estado de la aplicación
 *   4. Referencias al DOM
 *   5. Utilidades
 *   6. Renderizado del catálogo público
 *   7. Filtros y búsqueda
 *   8. Carrusel de ocasiones (hero)
 *   9. Panel de administración
 *  10. Eventos globales
 *  11. Arranque
 * ============================================================================
 */

/* 1. Configuración --------------------------------------------------------- */

const CONFIG = {
  /**
   * Número de WhatsApp del negocio en formato internacional, SIN "+" ni
   * espacios. Deja '' para que WhatsApp pida elegir el destinatario.
   * ⚠️ Reemplazar por el número real de tu hermana antes de publicar.
   */
  whatsappNumber: '50688887777',

  /** Símbolo de moneda usado al formatear los precios. */
  currencySymbol: '₡',

  /** Retardo del debounce del buscador (ms). */
  searchDebounceMs: 160,

  /** Intervalo de rotación del carrusel (5 s: logo → ocasiones). */
  heroIntervalMs: 5000,
};

/** Categorías válidas: filtros, insignias y formulario de alta. */
const CATEGORIES = ['Damas', 'Caballeros', 'Unisex', 'Estuches'];

/** Clase de insignia por categoría (definida en style.css). */
const CATEGORY_BADGE = {
  Damas: 'badge--damas',
  Caballeros: 'badge--caballeros',
  Unisex: 'badge--unisex',
  Estuches: 'badge--estuches',
};

/** Valor del filtro "sin categoría". */
const ALL_CATEGORIES = 'Todos';

/** Valor del filtro "todas las marcas". */
const ALL_BRANDS = 'all';

/* 2. Datos de prueba ------------------------------------------------------
   Misma forma que tendrá la tabla `products` en Supabase. Los estuches no
   tienen volumen único: `volume_ml` queda en 0 y la tarjeta muestra
   "Set de regalo". Las marcas coinciden exactamente con los chips de
   "Marcas destacadas" (index.html) para que el filtro siempre devuelva algo. */
const mockProducts = [
  {
    id: 'p-001',
    name: 'Rosa Nocturna',
    brand: 'Carolina Herrera',
    category: 'Damas',
    price: 15000,
    volume_ml: 50,
    image_url:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
  {
    id: 'p-002',
    name: 'Cedro Imperial',
    brand: 'Hugo Boss',
    category: 'Caballeros',
    price: 18500,
    volume_ml: 100,
    image_url:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
  {
    id: 'p-003',
    name: 'Brisa de Vainilla',
    brand: "Victoria's Secret",
    category: 'Unisex',
    price: 12750,
    volume_ml: 30,
    image_url:
      'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=700&q=75',
    is_available: false,
  },
  {
    id: 'p-004',
    name: 'Jazmín de Medianoche',
    brand: 'Dior',
    category: 'Damas',
    price: 22000,
    volume_ml: 100,
    image_url:
      'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
  {
    id: 'p-005',
    name: 'Vetiver Azul',
    brand: 'Paco Rabanne',
    category: 'Caballeros',
    price: 16800,
    volume_ml: 50,
    image_url:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
  {
    id: 'p-006',
    name: 'Estuche Dúo Romance',
    brand: 'Chanel',
    category: 'Estuches',
    price: 29500,
    volume_ml: 0,
    image_url:
      'https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
  {
    id: 'p-007',
    name: 'Estuche Caballero Clásico',
    brand: 'Versace',
    category: 'Estuches',
    price: 34000,
    volume_ml: 0,
    image_url:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=700&q=75',
    is_available: false,
  },
  {
    id: 'p-008',
    name: 'Ámbar Nómada',
    brand: 'Dolce & Gabbana',
    category: 'Unisex',
    price: 14500,
    volume_ml: 75,
    image_url:
      'https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=700&q=75',
    is_available: true,
  },
];

/* 3. Estado de la aplicación --------------------------------------------- */

const filters = {
  search: '',
  category: ALL_CATEGORIES,
  brand: ALL_BRANDS,
};

let searchTimer = null;

/** Elemento que tenía el foco antes de abrir el panel (para restaurarlo). */
let lastFocusedElement = null;

/* 4. Referencias al DOM --------------------------------------------------- */

const dom = {
  searchInput: document.querySelector('#searchInput'),
  categoryFilters: document.querySelector('#categoryFilters'),
  brandFilters: document.querySelector('#brandFilters'),
  productsGrid: document.querySelector('#productsGrid'),
  resultsCount: document.querySelector('#resultsCount'),
  errorMessage: document.querySelector('#errorMessage'),
  currentYear: document.querySelector('#currentYear'),
  adminToggle: document.querySelector('#adminToggle'),
  adminPanel: document.querySelector('#adminPanel'),
};

/* 5. Utilidades ---------------------------------------------------------- */

/**
 * Escapa texto antes de insertarlo con innerHTML (protección XSS).
 * @param {unknown} value
 * @returns {string}
 */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formatea un monto como colón costarricense: 15000 → "₡15,000".
 * @param {number} amount
 * @returns {string}
 */
function formatPrice(amount) {
  const value = Number(amount) || 0;
  return `${CONFIG.currencySymbol}${value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Texto del volumen; los estuches se muestran como "Set de regalo".
 * @param {object} product
 * @returns {string}
 */
function volumeLabel(product) {
  const ml = Number(product.volume_ml) || 0;
  return ml > 0 ? `${ml} ml` : 'Set de regalo';
}

/**
 * Minúsculas y sin diacríticos, para búsquedas tolerantes a tildes
 * ("jazmin" encuentra "Jazmín", "privee" encuentra "Privée").
 * @param {unknown} value
 * @returns {string}
 */
function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Imagen de reemplazo cuando la URL original falla o está vacía. */
const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
       <rect width="100%" height="100%" fill="#fdf2f8"/>
       <text x="50%" y="50%" font-family="serif" font-size="40" fill="#ec4899"
             text-anchor="middle" dominant-baseline="middle">Sin imagen</text>
     </svg>`
  );

/**
 * Productos que cumplen la búsqueda y la categoría activas.
 * @returns {Array<object>}
 */
function getFilteredProducts() {
  const term = normalizeText(filters.search);
  const brand = filters.brand === ALL_BRANDS ? '' : normalizeText(filters.brand);

  return mockProducts.filter((product) => {
    const matchesCategory =
      filters.category === ALL_CATEGORIES || product.category === filters.category;

    const matchesBrand = brand === '' || normalizeText(product.brand) === brand;

    const matchesSearch =
      term === '' ||
      normalizeText(product.name).includes(term) ||
      normalizeText(product.brand).includes(term);

    return matchesCategory && matchesBrand && matchesSearch;
  });
}

/* 6. Renderizado del catálogo público ------------------------------------ */

/**
 * HTML de una tarjeta de producto.
 * @param {object} product
 * @param {number} [index] posición en la rejilla, para escalonar la animación
 * @returns {string}
 */
function productCardTemplate(product, index = 0) {
  const available = Boolean(product.is_available);
  const volume = volumeLabel(product);
  const categoryBadge = CATEGORY_BADGE[product.category] ?? '';
  // Máximo 240 ms de cascada: se nota el efecto sin retrasar la lectura.
  const animationDelay = Math.min(index, 8) * 40;

  // Mensaje preformateado para WhatsApp, con la marca del negocio.
  const message = encodeURIComponent(
    `¡Hola Emeraldparfum! Me interesa *${product.name}* de ${product.brand} ` +
      `(${product.category} · ${volume}) — ${formatPrice(product.price)}. ` +
      `¿Está disponible?`
  );
  const waHref = CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;

  const whatsappButton = available
    ? `<a href="${waHref}" target="_blank" rel="noopener noreferrer"
          class="btn btn-primary mt-auto w-full"
          aria-label="Encargar ${escapeHtml(product.name)} por WhatsApp">
         Encargar por WhatsApp
       </a>`
    : `<button type="button" class="btn btn-secondary mt-auto w-full" disabled
          aria-label="${escapeHtml(product.name)} agotado">
         Agotado
       </button>`;

  return `
    <article class="card fade-in-up" data-id="${escapeHtml(product.id)}"
             style="animation-delay:${animationDelay}ms">
      <div class="card-media">
        <img src="${escapeHtml(product.image_url || PLACEHOLDER_IMAGE)}"
             alt="Frasco de ${escapeHtml(product.name)} de ${escapeHtml(product.brand)}"
             loading="lazy" decoding="async" data-fallback="true">
        <span class="badge badge-status ${available ? '' : 'badge-status--out'} absolute left-3 top-3">
          ${available ? 'Disponible' : 'Agotado'}
        </span>
        <span class="badge ${categoryBadge} absolute right-3 top-3">
          ${escapeHtml(product.category)}
        </span>
      </div>

      <div class="card-body">
        <p class="text-xs uppercase tracking-wide text-text-light">
          ${escapeHtml(product.brand)}
        </p>
        <h3 class="card-title">${escapeHtml(product.name)}</h3>
        <p class="text-sm text-text-light">${escapeHtml(volume)}</p>
        <p class="price mt-1">${formatPrice(product.price)}</p>
        ${whatsappButton}
      </div>
    </article>
  `;
}

/**
 * HTML del estado vacío, insertado dentro de la rejilla (col-span-full).
 * @returns {string}
 */
function emptyStateTemplate() {
  const term = filters.search.trim();
  const category = filters.category;
  const brand = filters.brand;

  // Contexto del filtro para un mensaje útil (marca y/o categoría).
  const where = [];
  if (brand !== ALL_BRANDS) where.push(`de <strong>${escapeHtml(brand)}</strong>`);
  if (category !== ALL_CATEGORIES) where.push(`en <strong>${escapeHtml(category)}</strong>`);
  const suffix = where.length > 0 ? ` ${where.join(' ')}` : '';

  let detail = 'Prueba con otra búsqueda u otra categoría.';
  if (term) {
    detail = `No hay coincidencias para "<strong>${escapeHtml(term)}</strong>"${suffix}.`;
  } else if (where.length > 0) {
    detail = `Todavía no hay fragancias${suffix}.`;
  }

  return `
    <div class="empty-state col-span-full">
      <div class="empty-state__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 2h4"></path>
          <path d="M11 2v4"></path>
          <path d="M9 6h6l1 3H8l1-3Z"></path>
          <rect x="7" y="9" width="10" height="12" rx="2"></rect>
          <path d="M10 13h4"></path>
        </svg>
      </div>
      <p class="empty-state__title">No encontramos esa fragancia</p>
      <p class="empty-state__text">${detail}</p>
      <button type="button" class="btn btn-secondary mt-2" data-action="clear-filters">
        Ver todo el catálogo
      </button>
    </div>
  `;
}

/**
 * Renderiza la rejilla de productos.
 * @param {Array<object>} products lista ya filtrada
 */
function renderProducts(products) {
  const grid = dom.productsGrid;
  if (!grid) return;

  grid.setAttribute('aria-busy', 'false');
  grid.innerHTML =
    products.length > 0
      ? products.map(productCardTemplate).join('')
      : emptyStateTemplate();

  // Fallback de imágenes: si la URL remota falla, se usa el placeholder.
  grid.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        img.src = PLACEHOLDER_IMAGE;
        img.removeAttribute('data-fallback');
      },
      { once: true }
    );
  });

  updateResultsCount(products.length);
}

/** Actualiza el contador de resultados (anunciado a lectores de pantalla). */
function updateResultsCount(count) {
  if (!dom.resultsCount) return;

  // Menciona la casa activa para dar contexto al resultado filtrado.
  const brandSuffix =
    filters.brand === ALL_BRANDS ? '' : ` · ${filters.brand}`;

  if (count === 0) {
    dom.resultsCount.textContent = `Sin resultados${brandSuffix}`;
    return;
  }
  dom.resultsCount.textContent =
    count === 1
      ? `1 fragancia encontrada${brandSuffix}`
      : `${count} fragancias encontradas${brandSuffix}`;
}

/** Aplica los filtros actuales y repinta la rejilla. */
function applyFilters() {
  renderProducts(getFilteredProducts());
}

/* 7. Filtros y búsqueda -------------------------------------------------- */

/** Sincroniza el estado visual de los botones de categoría. */
function syncCategoryButtons() {
  dom.categoryFilters?.querySelectorAll('button[data-category]').forEach((button) => {
    const isActive = button.dataset.category === filters.category;
    button.classList.toggle('btn-primary', isActive);
    button.classList.toggle('btn-secondary', !isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

/** Sincroniza los chips de "Marcas destacadas" con el filtro activo. */
function syncBrandChips() {
  dom.brandFilters?.querySelectorAll('button[data-brand]').forEach((chip) => {
    const isActive = chip.dataset.brand === filters.brand;
    chip.classList.toggle('is-active', isActive);
    chip.setAttribute('aria-pressed', String(isActive));
  });
}

/**
 * Aplica el filtro por casa de perfumería.
 * En móvil desplaza suavemente al catálogo para que se vea el resultado.
 * @param {string} brand
 */
function setBrandFilter(brand) {
  filters.brand = brand;
  syncBrandChips();
  applyFilters();

  if (window.matchMedia('(max-width: 767px)').matches) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('#catalogo')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}

/** Vuelve al estado inicial: sin búsqueda, categoría "Todos" y todas las marcas. */
function resetFilters() {
  clearTimeout(searchTimer);
  filters.search = '';
  filters.category = ALL_CATEGORIES;
  filters.brand = ALL_BRANDS;
  if (dom.searchInput) dom.searchInput.value = '';
  syncCategoryButtons();
  syncBrandChips();
  applyFilters();
  dom.searchInput?.focus();
}

/* 8. Carrusel de marca y ocasiones (hero) --------------------------------
   Arranca en el Slide 1 (logo local) y a los 5 s pasa a las escenas de
   ocasiones. Rotación automática con pausa accesible: se detiene al pasar el
   ratón, al enfocar un control, al ocultar la pestaña, con el botón ⏸ y
   cuando el sistema pide movimiento reducido. El número de slides es
   dinámico: cualquier slide añadido en el HTML entra solo. */

function initHeroCarousel() {
  // Acepta el id nuevo (#heroBanner) y el histórico (#heroCarousel).
  const root = document.querySelector('#heroBanner, #heroCarousel');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('.hero-slide'));
  if (slides.length < 2) return;

  const dotsContainer = root.querySelector('.hero-carousel__dots');
  const prevButton = root.querySelector('[data-carousel="prev"]');
  const nextButton = root.querySelector('[data-carousel="next"]');
  const pauseButton = root.querySelector('[data-carousel="pause"]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let currentIndex = 0;
  let timerId = null;
  let userPaused = false;    // pausa explícita del visitante
  let hoverPaused = false;   // pausa temporal por hover/foco

  /* --- Puntos de navegación --- */
  const dots = slides.map((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.dataset.index = String(index);
    dot.setAttribute('aria-label', `Ver diapositiva: ${slide.dataset.label || index + 1}`);
    dot.addEventListener('click', () => {
      goTo(index);
      resetAutoPlay();
    });
    dotsContainer?.appendChild(dot);
    return dot;
  });

  /** Muestra el slide indicado (índice circular). */
  function goTo(nextIndex) {
    currentIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const active = index === currentIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      // `inert` saca del orden de tabulación los enlaces de slides ocultos.
      slide.inert = !active;
    });

    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function stopAutoPlay() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();
    if (prefersReducedMotion || userPaused || hoverPaused || document.hidden) return;
    timerId = setInterval(() => goTo(currentIndex + 1), CONFIG.heroIntervalMs);
  }

  /** Reinicia el contador tras una acción manual (no se siente "adelantado"). */
  function resetAutoPlay() {
    startAutoPlay();
  }

  /* --- Controles manuales --- */
  prevButton?.addEventListener('click', () => {
    goTo(currentIndex - 1);
    resetAutoPlay();
  });

  nextButton?.addEventListener('click', () => {
    goTo(currentIndex + 1);
    resetAutoPlay();
  });

  pauseButton?.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    pauseButton.setAttribute('aria-label', userPaused ? 'Reanudar carrusel' : 'Pausar carrusel');
    pauseButton.textContent = userPaused ? '▶' : '⏸';
    root.dataset.paused = String(userPaused);

    if (userPaused) stopAutoPlay();
    else startAutoPlay();
  });

  // Con movimiento reducido no hay autoplay, así que el botón no aporta.
  if (prefersReducedMotion && pauseButton) pauseButton.hidden = true;

  /* --- Pausa temporal al interactuar --- */
  root.addEventListener('mouseenter', () => {
    hoverPaused = true;
    stopAutoPlay();
  });
  root.addEventListener('mouseleave', () => {
    hoverPaused = false;
    startAutoPlay();
  });
  root.addEventListener('focusin', () => {
    hoverPaused = true;
    stopAutoPlay();
  });
  root.addEventListener('focusout', (event) => {
    if (!root.contains(event.relatedTarget)) {
      hoverPaused = false;
      startAutoPlay();
    }
  });

  // Al cambiar de pestaña el navegador congela timers; al volver, se reanuda.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoPlay();
    else startAutoPlay();
  });

  /* --- Navegación con teclado --- */
  root.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(currentIndex - 1);
      resetAutoPlay();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(currentIndex + 1);
      resetAutoPlay();
    }
  });

  /* --- Deslizar en móvil (swipe horizontal) --- */
  let touchStartX = 0;
  root.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 40) return; // gesto demasiado corto: se ignora
      goTo(delta < 0 ? currentIndex + 1 : currentIndex - 1);
      resetAutoPlay();
    },
    { passive: true }
  );

  // Estado inicial + arranque del ciclo.
  goTo(0);
  startAutoPlay();
}

/* 9. Panel de administración ---------------------------------------------
   Todo se construye una sola vez y se reutiliza. El panel muestra:
   - Resumen del inventario (total y disponibles).
   - Formulario de alta que inserta en `mockProducts` al instante.
   - Tabla de inventario con cambio de stock y eliminación.
   Es un simulador: no hay autenticación real (eso llegará con Supabase Auth). */

/** Abre el panel, lo construye si hace falta y enfoca el primer campo. */
function openAdminPanel() {
  if (!dom.adminPanel) {
    dom.adminPanel = buildAdminPanel();
    document.body.appendChild(dom.adminPanel);
  }

  lastFocusedElement = document.activeElement;

  renderInventory();
  dom.adminPanel.hidden = false;
  document.body.style.overflow = 'hidden'; // evita scroll del fondo

  dom.adminPanel.querySelector('#field-name')?.focus();
}

/** Cierra el panel y devuelve el foco al botón que lo abrió. */
function closeAdminPanel() {
  if (!dom.adminPanel) return;
  dom.adminPanel.hidden = true;
  document.body.style.overflow = '';
  dom.adminToggle?.focus();
  lastFocusedElement = null;
}

/** Construye el overlay + diálogo con formulario y tabla de inventario. */
function buildAdminPanel() {
  const overlay = document.createElement('div');
  overlay.id = 'adminPanel';
  overlay.className = 'admin-overlay';
  overlay.hidden = true;

  const categoryOptions = CATEGORIES.map(
    (category) => `<option value="${category}">${category}</option>`
  ).join('');

  overlay.innerHTML = `
    <div class="admin-dialog" role="dialog" aria-modal="true"
         aria-labelledby="adminPanelTitle" tabindex="-1">

      <header class="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="adminPanelTitle" class="text-2xl">Panel de administración</h2>
          <p class="mt-1 text-sm text-text-light">
            Emeraldparfum · prototipo local, los cambios se pierden al recargar.
          </p>
        </div>
        <button type="button" class="btn btn-ghost px-2" data-action="close-panel"
                aria-label="Cerrar panel de administración">✕</button>
      </header>

      <!-- ---------- Alta de producto ---------- -->
      <section class="admin-section" aria-labelledby="adminAddTitle">
        <h3 id="adminAddTitle" class="mb-3 text-lg">Agregar nueva colonia</h3>

        <form id="adminForm" class="admin-form" novalidate>
          <div class="admin-form__row">
            <div>
              <label for="field-name" class="admin-label">Nombre *</label>
              <input id="field-name" name="name" type="text" required maxlength="80"
                     class="input-field" placeholder="Ej. Rosa Nocturna">
            </div>
            <div>
              <label for="field-brand" class="admin-label">Marca *</label>
              <input id="field-brand" name="brand" type="text" required maxlength="80"
                     class="input-field" placeholder="Ej. Essence Privée">
            </div>
          </div>

          <div class="admin-form__row admin-form__row--three">
            <div>
              <label for="field-category" class="admin-label">Categoría *</label>
              <select id="field-category" name="category" class="select-field" required>
                ${categoryOptions}
              </select>
            </div>
            <div>
              <label for="field-volume" class="admin-label">Volumen (ml)</label>
              <input id="field-volume" name="volume_ml" type="number" min="0" max="1000"
                     step="1" class="input-field" placeholder="50">
            </div>
            <div>
              <label for="field-price" class="admin-label">Precio (₡) *</label>
              <input id="field-price" name="price" type="number" min="0" step="50"
                     required class="input-field" placeholder="15000">
            </div>
          </div>

          <div>
            <label for="field-image" class="admin-label">URL de la imagen</label>
            <input id="field-image" name="image_url" type="url" class="input-field"
                   placeholder="https://...">
            <p class="mt-1 text-xs text-text-light">
              Opcional: si se deja vacío, se usa una imagen genérica.
            </p>
          </div>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_available" checked
                     class="h-4 w-4 accent-[var(--color-primary)]">
              Disponible para encargar
            </label>
            <button type="submit" class="btn btn-primary">+ Agregar colonia</button>
          </div>

          <p id="adminFormError" class="alert-error mt-3 hidden" role="alert"></p>
        </form>
      </section>

      <!-- ---------- Inventario ---------- -->
      <section class="admin-section" aria-labelledby="adminInventoryTitle">
        <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 id="adminInventoryTitle" class="text-lg">Inventario</h3>
          <p id="inventorySummary" class="text-sm text-text-light"></p>
        </div>

        <div class="inventory-scroll">
          <table class="inventory-table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Categoría</th>
                <th scope="col" class="text-right">Precio</th>
                <th scope="col">Stock</th>
                <th scope="col"><span class="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody id="inventoryBody"><!-- se llena con renderInventory() --></tbody>
          </table>
        </div>

        <p id="adminFeedback" class="mt-3 text-sm text-text-light"
           role="status" aria-live="polite"></p>
      </section>
    </div>
  `;

  // Cierre: clic en el fondo, botón ✕ y tecla Escape.
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeAdminPanel();
  });

  overlay.addEventListener('keydown', handlePanelKeydown);

  // Delegación para los botones de la tabla (sobreviven al re-render).
  overlay.querySelector('#inventoryBody').addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { action, id } = button.dataset;
    if (action === 'close-panel') return closeAdminPanel();
    if (action === 'toggle-stock') toggleStock(id);
    if (action === 'delete-product') deleteProduct(id);
  });

  overlay
    .querySelector('#adminForm')
    .addEventListener('submit', handleAddProduct);

  return overlay;
}

/**
 * Manejo de teclado dentro del panel: Escape cierra y Tab queda atrapado
 * entre los controles del diálogo (foco accesible).
 */
function handlePanelKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAdminPanel();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusables = event.currentTarget.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** Pinta la tabla de inventario y el resumen superior. */
function renderInventory() {
  const body = dom.adminPanel?.querySelector('#inventoryBody');
  const summary = dom.adminPanel?.querySelector('#inventorySummary');
  if (!body) return;

  const availableCount = mockProducts.filter((p) => p.is_available).length;
  summary.textContent = `${mockProducts.length} productos · ${availableCount} disponibles`;

  if (mockProducts.length === 0) {
    body.innerHTML = `
      <tr>
        <td colspan="5" class="py-6 text-center text-text-light">
          No hay productos en el inventario.
        </td>
      </tr>`;
    return;
  }

  body.innerHTML = mockProducts
    .map((product) => {
      const badge = CATEGORY_BADGE[product.category] ?? '';
      return `
        <tr>
          <td>
            <div class="inv-product">
              <img class="inv-thumb" src="${escapeHtml(product.image_url || PLACEHOLDER_IMAGE)}"
                   alt="" loading="lazy" data-fallback="true">
              <div class="min-w-0">
                <p class="inv-name">${escapeHtml(product.name)}</p>
                <p class="inv-brand">${escapeHtml(product.brand)}</p>
              </div>
            </div>
          </td>
          <td><span class="badge ${badge}">${escapeHtml(product.category)}</span></td>
          <td class="text-right whitespace-nowrap">${formatPrice(product.price)}</td>
          <td>
            <button type="button"
                    class="stock-toggle ${product.is_available ? 'is-on' : 'is-off'}"
                    data-action="toggle-stock" data-id="${escapeHtml(product.id)}"
                    aria-pressed="${product.is_available}"
                    aria-label="Cambiar stock de ${escapeHtml(product.name)}">
              ${product.is_available ? 'Disponible' : 'Agotado'}
            </button>
          </td>
          <td class="text-right">
            <button type="button" class="btn btn-ghost px-2 text-xs"
                    data-action="delete-product" data-id="${escapeHtml(product.id)}"
                    aria-label="Eliminar ${escapeHtml(product.name)}">
              Eliminar
            </button>
          </td>
        </tr>`;
    })
    .join('');

  // Miniaturas con el mismo fallback que las tarjetas del catálogo.
  body.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        img.src = PLACEHOLDER_IMAGE;
        img.removeAttribute('data-fallback');
      },
      { once: true }
    );
  });
}

/**
 * Valida el formulario y agrega el producto al arreglo en memoria.
 * @param {SubmitEvent} event
 */
function handleAddProduct(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const errorBox = form.querySelector('#adminFormError');

  const name = String(data.get('name') || '').trim();
  const brand = String(data.get('brand') || '').trim();
  const price = Number(data.get('price'));
  const volume = Number(data.get('volume_ml') || 0);
  const category = String(data.get('category') || '');
  const imageUrl = String(data.get('image_url') || '').trim();

  // Validación mínima del lado del cliente (Supabase repetirá estas reglas).
  const problems = [];
  if (name.length < 2) problems.push('El nombre es obligatorio.');
  if (brand.length < 2) problems.push('La marca es obligatoria.');
  if (!Number.isFinite(price) || price <= 0) problems.push('El precio debe ser mayor que 0.');
  if (!Number.isFinite(volume) || volume < 0) problems.push('El volumen no puede ser negativo.');
  if (!CATEGORIES.includes(category)) problems.push('Categoría inválida.');

  if (problems.length > 0) {
    errorBox.textContent = problems.join(' ');
    errorBox.classList.remove('hidden');
    return;
  }

  const newProduct = {
    // crypto.randomUUID evita colisiones al probar en local.
    id: crypto.randomUUID?.() ?? `p-${Date.now()}`,
    name,
    brand,
    category,
    price,
    volume_ml: volume,
    image_url: imageUrl,
    is_available: data.get('is_available') === 'on',
  };

  mockProducts.unshift(newProduct);
  form.reset();
  errorBox.classList.add('hidden');

  // Refrescar panel y catálogo en el mismo tick: efecto "tiempo real".
  renderInventory();
  applyFilters();
  setAdminFeedback(`"${newProduct.name}" se agregó al catálogo.`);
}

/** Alterna Disponible/Agotado de un producto. */
function toggleStock(productId) {
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) return;

  product.is_available = !product.is_available;
  renderInventory();
  applyFilters();
  setAdminFeedback(
    `"${product.name}" ahora está ${product.is_available ? 'disponible' : 'agotado'}.`
  );
}

/** Elimina un producto tras confirmación. */
function deleteProduct(productId) {
  const index = mockProducts.findIndex((p) => p.id === productId);
  if (index === -1) return;

  const [removed] = mockProducts.splice(index, 1);
  renderInventory();
  applyFilters();
  setAdminFeedback(`"${removed.name}" se eliminó del catálogo.`);
}

/** Mensaje de confirmación dentro del panel (aria-live). */
function setAdminFeedback(text) {
  const feedback = dom.adminPanel?.querySelector('#adminFeedback');
  if (feedback) feedback.textContent = text;
}

/* 10. Eventos globales ---------------------------------------------------- */

function bindEvents() {
  // --- Abrir panel admin desde el footer ---
  dom.adminToggle?.addEventListener('click', openAdminPanel);

  // --- Atajo de teclado: Ctrl + Shift + A ---
  document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
      event.preventDefault();
      if (dom.adminPanel && !dom.adminPanel.hidden) closeAdminPanel();
      else openAdminPanel();
    }
  });

  // --- Buscador con debounce ---
  dom.searchInput?.addEventListener('input', (event) => {
    const value = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      filters.search = value;
      applyFilters();
    }, CONFIG.searchDebounceMs);
  });

  // --- Filtros por categoría (delegación) ---
  dom.categoryFilters?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-category]');
    if (!button) return;
    filters.category = button.dataset.category;
    syncCategoryButtons();
    applyFilters();
  });

  // --- Marcas destacadas (delegación) ---
  dom.brandFilters?.addEventListener('click', (event) => {
    const chip = event.target.closest('button[data-brand]');
    if (!chip) return;
    setBrandFilter(chip.dataset.brand);
  });

  // --- Acciones dentro de la rejilla (botón del estado vacío) ---
  dom.productsGrid?.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="clear-filters"]')) resetFilters();
  });
}

/* 11. Arranque ---------------------------------------------------------- */

function init() {
  if (dom.currentYear) {
    dom.currentYear.textContent = String(new Date().getFullYear());
  }

  dom.errorMessage?.classList.add('hidden');

  initHeroCarousel();
  bindEvents();
  syncCategoryButtons();
  syncBrandChips();
  renderProducts(getFilteredProducts());
}

init();
