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
 *   8. Modal de reseña (vista ampliada)
 *   9. Carrusel de marca y ocasiones (hero)
 *  10. Panel de administración
 *  11. Eventos globales
 *  12. Arranque
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
   "Marcas destacadas" (index.html) para que el filtro siempre devuelva algo.
   `notes` y `description` alimentan el modal de reseña. */
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
    notes: {
      salida: 'Pimienta rosa, mandarina y lichi.',
      corazon: 'Rosa de Damasco, peonía y jazmín.',
      fondo: 'Ámbar, almizcle blanco y madera de cedro.',
    },
    description:
      'Un ramo de rosas frescas que se vuelve cálido al caer la noche. ' +
      'Femenina, envolvente y elegante: perfecta para cenas y ocasiones especiales.',
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
    notes: {
      salida: 'Bergamota, pomelo y hojas de laurel.',
      corazon: 'Cedro, salvia y nuez moscada.',
      fondo: 'Vetiver, ámbar y cuero.',
    },
    description:
      'Amaderado seco y seguro, con un fondo de cuero que deja una estela ' +
      'sobria. Pensada para jornadas largas y reuniones donde la presencia importa.',
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
    notes: {
      salida: 'Vainilla de Madagascar y pera madura.',
      corazon: 'Flor de tiaré y heliotropo.',
      fondo: 'Almizcle, sándalo y praliné.',
    },
    description:
      'Dulce sin empalagar: una vainilla luminosa con fondo cremoso que ' +
      'invita a quedarse. Ideal para el día a día y para regalar.',
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
    notes: {
      salida: 'Neroli y bergamota.',
      corazon: 'Jazmín sambac, tuberosa y ylang-ylang.',
      fondo: 'Vainilla, benjuí y almizcle.',
    },
    description:
      'Floral blanco intenso y sensual que se abre con cítricos y termina en ' +
      'un fondo cálido de vainilla. Una fragancia de noche con mucha personalidad.',
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
    notes: {
      salida: 'Limón siciliano y menta.',
      corazon: 'Lavanda, geranio y vetiver.',
      fondo: 'Musgo de roble y ámbar gris.',
    },
    description:
      'Fresco y aromático al inicio, con un vetiver terroso que aporta ' +
      'carácter. Versátil para el trabajo y para después del gimnasio.',
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
    notes: {
      salida: 'Cítricos luminosos y pera.',
      corazon: 'Rosa, jazmín y peonía.',
      fondo: 'Almizcle y vainilla suave.',
    },
    description:
      'Dos fragancias de 50 ml en un estuche listo para regalar: una floral ' +
      'fresca para el día y otra más cálida para la noche.',
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
    notes: {
      salida: 'Bergamota y cardamomo.',
      corazon: 'Cuero, iris y vetiver.',
      fondo: 'Sándalo, ámbar y haba tonka.',
    },
    description:
      'Set de dos colonias amaderadas y especiadas para el hombre que quiere ' +
      'alternar entre una fragancia de oficina y una de noche.',
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
    notes: {
      salida: 'Mandarina y pimienta negra.',
      corazon: 'Ámbar, incienso y lavanda.',
      fondo: 'Vainilla, pachulí y maderas.',
    },
    description:
      'Oriental cálido con un toque de incienso y maderas: un aroma con ' +
      'carácter que funciona igual para él o para ella.',
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
 * Construye el enlace de WhatsApp para un producto con el mensaje ya escrito.
 * Se usa en el modal de reseña (y quedaría lista para cualquier otro CTA).
 * @param {object} product
 * @returns {string}
 */
function whatsappUrl(product) {
  const message = encodeURIComponent(
    `¡Hola Emeraldparfum! Quiero pedir *${product.name}* de ${product.brand} ` +
      `(${product.category} · ${volumeLabel(product)}) — ${formatPrice(product.price)}. ` +
      `¿Está disponible?`
  );
  return CONFIG.whatsappNumber
    ? `https://wa.me/${CONFIG.whatsappNumber}?text=${message}`
    : `https://wa.me/?text=${message}`;
}

/**
 * HTML de una tarjeta de producto (versión compacta para 2 columnas en móvil).
 * La tarjeta completa es clicable y abre el modal de reseña.
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
        <p class="card-brand">${escapeHtml(product.brand)}</p>
        <h3 class="card-title">${escapeHtml(product.name)}</h3>
        <p class="card-volume">${escapeHtml(volume)}</p>
        <p class="price mt-1">${formatPrice(product.price)}</p>

        <!-- Área táctil accesible: abre la reseña ampliada -->
        <button type="button" class="btn btn-secondary card-action mt-auto w-full"
                data-action="open-detail" data-id="${escapeHtml(product.id)}"
                aria-label="Ver reseña de ${escapeHtml(product.name)}">
          Ver reseña
        </button>
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

/* 8. Modal de reseña (vista ampliada) ------------------------------------
   Se construye una sola vez y se rellena con el producto elegido. Mantiene
   el foco atrapado, cierra con Escape/backdrop/✕ y devuelve el foco a la
   tarjeta de origen. */

let detailModal = null;
let lastDetailTrigger = null;

/** Abre la reseña ampliada de un producto. */
function openProductDetail(productId) {
  const product = mockProducts.find((p) => p.id === productId);
  if (!product) return;

  if (!detailModal) {
    detailModal = buildDetailModal();
    document.body.appendChild(detailModal);
  }

  lastDetailTrigger = document.activeElement;

  const content = detailModal.querySelector('#detailContent');
  content.innerHTML = detailTemplate(product);

  // Mismo fallback de imagen que usa el catálogo.
  content.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        img.src = PLACEHOLDER_IMAGE;
        img.removeAttribute('data-fallback');
      },
      { once: true }
    );
  });

  detailModal.hidden = false;
  detailModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  detailModal.querySelector('[data-action="close-detail"]')?.focus();
}

/** Cierra el modal y devuelve el foco al elemento que lo abrió. */
function closeProductDetail() {
  if (!detailModal || detailModal.hidden) return;
  detailModal.hidden = true;
  detailModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lastDetailTrigger?.focus?.();
  lastDetailTrigger = null;
}

/** Estructura fija del modal (se crea una vez). */
function buildDetailModal() {
  const overlay = document.createElement('div');
  overlay.id = 'productDetail';
  overlay.className = 'detail-overlay';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');

  overlay.innerHTML = `
    <div class="detail-dialog" role="dialog" aria-modal="true"
         aria-labelledby="detailTitle" tabindex="-1">
      <button type="button" class="detail-close" data-action="close-detail"
              aria-label="Cerrar reseña">✕</button>
      <div id="detailContent" class="detail-grid"></div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('[data-action="close-detail"]')) {
      closeProductDetail();
    }
  });

  overlay.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeProductDetail();
      return;
    }
    trapFocus(event);
  });

  return overlay;
}

/**
 * Contenido del modal para un producto: foto grande, datos, notas y CTA.
 * @param {object} product
 * @returns {string}
 */
function detailTemplate(product) {
  const available = Boolean(product.is_available);
  const badge = CATEGORY_BADGE[product.category] ?? '';
  const notes = product.notes ?? {};

  const noteRows = [
    ['Salida', notes.salida],
    ['Corazón', notes.corazon],
    ['Fondo', notes.fondo],
  ]
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) => `
        <div class="detail-note">
          <dt>${label}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>`
    )
    .join('');

  const cta = available
    ? `<a class="btn btn-primary detail-cta" href="${whatsappUrl(product)}"
          target="_blank" rel="noopener noreferrer">
         Pedir por WhatsApp
       </a>`
    : `<button type="button" class="btn btn-secondary detail-cta" disabled>
         Agotado por el momento
       </button>`;

  return `
    <div class="detail-media">
      <img src="${escapeHtml(product.image_url || PLACEHOLDER_IMAGE)}"
           alt="Frasco de ${escapeHtml(product.name)} de ${escapeHtml(product.brand)}"
           decoding="async" data-fallback="true">
      <span class="badge ${badge} detail-media__badge">
        ${escapeHtml(product.category)}
      </span>
    </div>

    <div class="detail-body">
      <p class="detail-brand">${escapeHtml(product.brand)}</p>
      <h2 id="detailTitle" class="detail-title">${escapeHtml(product.name)}</h2>

      <div class="detail-meta">
        <span class="price">${formatPrice(product.price)}</span>
        <span class="detail-volume">${escapeHtml(volumeLabel(product))}</span>
        <span class="badge badge-status ${available ? '' : 'badge-status--out'}">
          ${available ? 'Disponible' : 'Agotado'}
        </span>
      </div>

      <p class="detail-description">${escapeHtml(product.description ?? '')}</p>

      ${
        noteRows
          ? `<div class="detail-notes">
               <h3 class="detail-notes__title">Reseña · Notas olfativas</h3>
               <dl>${noteRows}</dl>
             </div>`
          : ''
      }

      ${cta}
    </div>
  `;
}

/* 9. Carrusel de marca y ocasiones (hero) --------------------------------
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

/* 10. Panel de administración --------------------------------------------
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
 * Atrapa el foco dentro de un diálogo modal (Tab / Shift+Tab) para que la
 * navegación por teclado no se escape al fondo de la página.
 */
function trapFocus(event) {
  if (event.key !== 'Tab') return;

  const container = event.currentTarget;
  const focusables = container.querySelectorAll(
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

/**
 * Manejo de teclado dentro del panel de administración: Escape cierra y Tab
 * queda atrapado entre los controles del diálogo (foco accesible).
 */
function handlePanelKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeAdminPanel();
    return;
  }
  trapFocus(event);
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

/* 11. Eventos globales ---------------------------------------------------- */

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

  // --- Acciones dentro de la rejilla ---
  dom.productsGrid?.addEventListener('click', (event) => {
    // Botón del estado vacío: limpia todos los filtros.
    if (event.target.closest('[data-action="clear-filters"]')) {
      resetFilters();
      return;
    }

    // Toda la tarjeta (o su botón "Ver reseña") abre el detalle ampliado.
    const card = event.target.closest('.card[data-id]');
    if (card) openProductDetail(card.dataset.id);
  });
}

/* 12. Arranque ---------------------------------------------------------- */

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
