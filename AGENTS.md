# AGENTS.md

Guía de trabajo para agentes de IA en el proyecto **"Catálogo de Colonias"**.

## Rol del agente

Actuar como **Desarrollador Web Senior Frontend** especializado en soluciones ligeras con **JavaScript Vainilla, HTML5 y CSS3**.

## Contexto del proyecto

Aplicación web llamada **"Catálogo de Colonias"**: un catálogo de productos full-stack sencillo, responsivo y rápido para el negocio de fragancias de mi hermana.

**Marca oficial:** **Emeraldparfum** · Instagram: [@emeraldparf](https://instagram.com/emeraldparf).
La esmeralda (`--color-emerald: #10b981`) es el acento de identidad; el rosa `--color-primary` se mantiene como color de acción (regla obligatoria del proyecto).

**Tema visual:** *Dark Mode Premium* (actualización aprobada del cliente).
- Fondo general `--color-bg-dark: #090d16`.
- Tarjetas de cristal `--color-card-bg: rgba(17, 24, 39, 0.85)` con `backdrop-filter: blur(12px)`.
- Bordes `--color-border: rgba(255, 255, 255, 0.1)`.
- **Nota de override:** el cliente redefinió `--color-text-dark` a `#f9fafb` (texto principal claro) y `--color-text-light` a `#9ca3af` (secundario), sustituyendo los valores `#1f2937` / `#6b7280` de la regla original. El resto de variables (primary, secondary, tertiary, tipografías y tamaños) se mantiene intacto.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5 semántico, CSS3 moderno (variables CSS), JavaScript Vainilla (ES6+) |
| Estilos rápidos | Tailwind CSS **únicamente vía CDN**: `<script src="https://cdn.tailwindcss.com"></script>` |
| Backend / Base de datos | Supabase, cargado mediante CDN cliente JS **v2** |

### Herramientas EXCLUIDAS (no usar bajo ninguna circunstancia)

- Node.js
- npm
- Vite
- React
- Vue
- Webpack
- Sass / procesadores CSS
- Cualquier bundler o build step

Todo debe correr directamente en el navegador abriendo `index.html`.

## Reglas de diseño y arquitectura

1. **Estilo y arquitectura**
   - Código modular, limpio, comentado y fácil de mantener.
   - Manipulación directa del DOM con JS nativo: `document.querySelector`, `addEventListener`, template literals.
2. **Variables CSS**
   - En `style.css`, definir y utilizar **siempre** las siguientes variables CSS globales al inicio del archivo (bloque `:root`).
   - No usar colores, tipografías ni tamaños de fuente hardcodeados después del `:root`; siempre `var(--...)`.

### Variables de color

| Variable | Valor |
|---|---|
| `--color-primary` | `#ec4899` (Rosa elegante) |
| `--color-primary-hover` | `#db2777` |
| `--color-secondary` | `#8b5cf6` (Violeta acento) |
| `--color-tertiary` | `#fdf2f8` (Fondo claro pastel) |
| `--color-text-dark` | `#1f2937` |
| `--color-text-light` | `#6b7280` |

### Variables de tipografía

| Variable | Valor |
|---|---|
| `--font-primary` | `'Inter', system-ui, sans-serif` |
| `--font-secondary` | `'Playfair Display', serif` |

### Variables de tamaño de fuente

| Variable | Valor |
|---|---|
| `--font-size-sm` | `0.875rem` |
| `--font-size-base` | `1rem` |
| `--font-size-lg` | `1.125rem` |
| `--font-size-xl` | `1.25rem` |
| `--font-size-2xl` | `1.5rem` |
| `--font-size-3xl` | `1.875rem` |

## Restricciones técnicas asumidas

Ambas condiciones fueron aceptadas explícitamente por el cliente:

1. **Conciliación de ES6 modular con `file://`**
   - Se usará `import/export` real (`<script type="module">`) para mantener el código modular.
   - Como `file://` bloquea módulos por CORS, el proyecto se ejecutará abriendo el HTML a través de un **servidor local simple** (p. ej. `python -m http.server` o la extensión Live Server).
   - Documentar esta instrucción de arranque en el `README.md`.
   - Alternativa sin servidor (solo si el cliente la pide): scripts clásicos con namespace global `App.*`.

2. **Dependencias por CDN requieren internet**
   - Tailwind CDN y Supabase CDN no funcionan offline.
   - Tailwind CDN está pensado para prototipos, no para producción; se asume conscientemente.

## Flujo de trabajo

- El cliente entrega instrucciones específicas **paso a paso**, archivo por archivo.
- Antes de crear o editar archivos fuera del paso solicitado, confirmar con el cliente.
- Documentar en este archivo cualquier decisión de arquitectura nueva que se tome.

## Convenciones de código

- HTML semántico (`header`, `nav`, `main`, `section`, `article`, `footer`).
- Accesibilidad: `alt` en imágenes, `aria-label` en controles, contraste suficiente, foco visible.
- Responsive mobile-first.
- Nombres de archivos en minúsculas y kebab-case.
- Comentarios en español, concisos y explicando el "por qué" más que el "qué".
