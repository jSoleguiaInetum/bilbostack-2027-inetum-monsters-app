# BilboStack 2027 — Resumen del trabajo realizado

## 1. Prompt de generación de assets SVG

Se creó y refinó iterativamente el prompt `prompt-creature-assets.md` para que Gemini AI generase 152 assets SVG modulares. El prompt incluye:

- **Especificación técnica**: viewBox `0 0 512 512`, colores vía CSS custom properties (`--color-primary`, `--color-secondary`, `--color-accent`), IDs de capa únicos.
- **Sistema de 7 capas**: aura → body → pattern → eyes → mouth → accessory → badge.
- **Zona protegida**: y=170–270, x=200–312 reservada para composición de ojos/boca.
- **Sistema de evolución**: 4 estadios (base + evo-1/2/3) con 60–80% de preservación de identidad.
- **5 niveles de rareza**: Inusual (60%), Singular (22%), Único (11%), Épico (5%), Legendario (2%).
- **8 arquetipos profesionales**: developer, ux, devops, qa, product, management, ia, multiclass.
- **Reglas anti-batch y anti-copia** para evitar que Gemini genere stubs o copie el ejemplo.

## 2. Assets SVG generados y revisados

**152 assets** en `plan/App/monster-assets/`:

| Tipo | Cantidad | Detalles |
|---|---|---|
| Bodies | 64 | 16 bases × 4 estadios (base + evo-1/2/3) |
| Eyes | 16 | Tipos de ojos |
| Mouths | 16 | Tipos de boca |
| Accessories | 16 | Objetos profesionales |
| Patterns | 16 | Patrones decorativos |
| Auras | 16 | Efectos de aura |
| Badges | 8 | Insignias de arquetipo |

**Problemas detectados y corregidos:**
- body-01 era copia literal del ejemplo del prompt → se reformuló el prompt eliminando el código de ejemplo.
- Bodies 04–16 generados en batch eran stubs de 4 elementos → se añadió instrucción anti-batch al prompt.
- body-07-evo-2 tenía caracteres `L` inválidos en `<polygon points>` → eliminados manualmente.
- body-12-evo-3 tenía nodos fuera del viewBox (cx=-10, cx=522) → reposicionados dentro.
- 3 bodies compartían silueta octogonal → se generó prompt específico para diferenciarlos.

## 3. Herramientas de visualización

- **Galería HTML** (`plan/App/monster-assets/gallery.html`): visualización de todos los assets organizados por tipo, con ajustes de tamaño por categoría.
- **Compositor de criaturas**: HTML para generar criaturas completas con las 7 capas superpuestas, con botón de regeneración aleatoria y filtro por arquetipo.

## 4. Aplicación frontend — Fase 1 MVP

Proyecto React + Vite + TypeScript en `plan/App/bilbostack-app/`.

### Stack tecnológico

- **React 19** + React Router v7
- **Tailwind CSS v4** para layout
- **SNES.CSS** para componentes UI (botones, inputs, blockquotes) — estética retro pixel-art
- **html5-qrcode** para escaneo de QR con cámara
- **Fuente**: Press Start 2P (Google Fonts)

### Funcionalidades implementadas

#### Autenticación (mock con localStorage)

- Patrón `AuthAdapter` con interfaz preparada para login con email/password y OAuth (LinkedIn, Gmail).
- Implementación mock con `localStorage` intercambiable por backend real.
- `AuthProvider` (React Context) exponiendo user, loading, signIn, signUp, signOut.
- Páginas de login y registro con selección de arquetipo.

#### Generación de criaturas

- `generator.ts`: SHA-256 del email → `extractParams` (bodyShape, eyesType, mouthType, accessory, pattern, auraEffect, rarity).
- `MonsterCard.tsx`: composición visual con 7 capas `<img>` posicionadas absolutamente.
- `RarityBadge.tsx`: badge con color por nivel de rareza.

#### QR y networking

- `QRDisplay.tsx`: genera QR con payload del usuario (id, nombre, email, arquetipo).
- `QRScanner.tsx`: integración html5-qrcode con `runningRef` para evitar errores de stop prematuro.
- Sistema de contactos en `localStorage` (addContact, getContacts, isContact).

#### Páginas

- `/login` — Inicio de sesión.
- `/register` — Registro con selección de arquetipo (botones con estado visual seleccionado).
- `/my-monster` — Criatura del usuario, nombre, arquetipo, rareza. Botones "Mi QR" (overlay fullscreen) y "Escanear".
- `/scan` — Escáner QR con cámara (visor cuadrado).
- `/user/:id` — Tarjeta del jugador encontrado con botón "Conectar" (funcional) y "Pelear" (deshabilitado, "Próximamente").

### Problemas resueltos

| Problema | Causa | Solución |
|---|---|---|
| "Cannot stop, scanner is not running" | html5-qrcode `.stop()` antes de `.start()` | `runningRef` + flag `cancelled` en unmount |
| QR scanner doble render | React StrictMode doble-mount | Eliminado `<StrictMode>` de main.tsx |
| Scanner demasiado alto | Sin restricción de aspecto | CSS `aspect-ratio: 1/1` + `display: none` en dashboard |
| Input blanco sobre blanco | SNES.CSS `.snes-input` background white | Override CSS: `background-color: #131325 !important` |
| Tailwind margin/padding ignorados | SNES.CSS `* { margin:0; padding:0 }` sin layer vence a Tailwind | `@import "snes.css" layer(snes)` + `@import "tailwindcss" important` |
| Press Start 2P no se aplica | Al poner SNES en layer, su regla `*` de fuente pierde prioridad | `* { font-family: "Press Start 2P" !important }` fuera de layer + `<link>` en index.html |
| `@import url()` mal ubicado | `@import url('fonts.google...')` después de reglas CSS | Eliminado (la fuente carga desde index.html) |
| npm install 403 Forbidden | `.npmrc` corporativo del repo padre | `.npmrc` local apuntando a registry público |
| Botones de arquetipo sin feedback visual | Clase inexistente / inline style sobreescrito por `!important` | Clase `.is-selected` con `!important` en index.css |

### Arquitectura CSS (cascada)

```
layer(snes)          ← menor prioridad (SNES.CSS encapsulado)
@layer utilities     ← Tailwind con !important (vence a SNES)
estilos sin layer    ← overrides globales (fuente, dark theme, QR)
```

### Completado de Story 10 — Polish final

Últimos elementos implementados para cerrar la Fase 1:

- **`Spinner.tsx`** — Componente de loading reutilizable con borde animado (`border-t-secondary`), tamaño configurable por prop.
- **`MonsterSkeleton.tsx`** — Placeholder pulsante (`animate-pulse`) para MonsterCard mientras carga, tamaño configurable.
- **`QRScanner.tsx`** — Añadido callback `onReady` que se dispara cuando la cámara arranca exitosamente.
- **`ScanPage.tsx`** — Muestra Spinner con texto "Iniciando cámara..." hasta que `onReady` se dispara. El texto "Buscando QR..." solo aparece cuando la cámara está activa.
- **`MyMonsterPage.tsx` / `UserCardPage.tsx`** — Reemplazados los divs inline de loading por el componente `MonsterSkeleton`.
- **Responsive** — MonsterCard y MonsterSkeleton adaptan su tamaño con `Math.min(maxSize, window.innerWidth - 80)` para no desbordar en pantallas de 375px.
- **Verificación responsive** — Estructura validada para breakpoints 375px–1024px: formularios con `max-w-sm`/`max-w-lg` + `px-4`, ArchetypeSelector con `grid-cols-2 md:grid-cols-4`, nav bottom con `pb-20` en main para no tapar contenido.
- **ErrorBoundary** — Verificado: class component en `main.tsx` con fallback "Algo salió mal" + botón "Recargar".
- **TypeScript compila limpio** — 0 errores con `tsc --noEmit`.

**Estado: Fase 1 MVP completa.**

## 5. Archivos clave de configuración

- `src/index.css` — Imports de SNES.CSS (layered) + Tailwind (important), overrides globales, tema de colores.
- `index.html` — Carga de Press Start 2P vía Google Fonts `<link>`.
- `.npmrc` — Registry público (evita Artifactory corporativo).
- `prompt-creature-assets.md` — Prompt maestro para Gemini.
