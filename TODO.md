# TODO — BilboStack 2027 Monsters App

Lista viva de trabajo del proyecto. **Leer al inicio de cada sesión y actualizar al cerrar cada tarea, story o commit.**

- `[ ]` pendiente · `[x]` hecho · `[!]` bloqueado · `[?]` a decidir
- Última verificación: detección de navegadores in-app con banner "Abrir en navegador", 27 archivos de test, 160 tests verdes, `lint` y `tsc --noEmit` OK.
- Detalle de dominio: `documentacion/CONTEXTO-PROYECTO.md`. Estado y reglas: `AGENTS.md`.

## Próximo foco (orden sugerido)

1. Fase 4 — Prueba de carga, E2E visual, ensayo general y deploy
2. Backend real — implementar el contrato REST y validar los adaptadores `api`
3. Story 27 — OG dinámicos por tarjeta (movida a Fase 4; requiere backend/prerender)

---

## Fase 0–2 — Base y MVP social

- [x] Fases 0, 1 y 2 completadas (stories 01–19)
- [x] Auth mock, criatura determinista, 7 capas SVG, 4 estadios de evolución
- [x] Métricas, combates, contactos, check-in de charlas, 12 logros
- [x] Capa `src/data/` con puertos + adaptadores `local`/`api` y `VITE_DATA_MODE`
- [x] Runner Vitest + jsdom con tests de dominio, adaptadores y 3 páginas

## Fase 3 — Rankings, dashboards y social

**Completada.** El único remanente (OG dinámicos de la story 27) pasó a Fase 4.

### Hecho

- [x] Story 20 — `RankingsRepository` (4 categorías, `local`/`api`, tests)
- [x] Story 21 — Página `/rankings` (4 tabs, top 20, posición propia, refresco 30 s)
- [x] Story 22 — Dashboard público `/dashboard`
- [x] Story 23 — Roles `participant`/`admin` + `AdminRoute` en `/admin`
- [x] Story 24 — Dashboard privado `/admin` (stats, usuarios, filtros, cambio de rol)
- [x] **Story 25 — Inventario de objetos**
  - [x] Puerto `InventoryRepository` (`listDefinitions`, `listOwned`, `has`, `add` idempotente)
  - [x] Adaptadores `local` y `api` + tests con la misma suite
  - [x] Assets de objetos copiados a `App/public/monster-assets/objects/` (17 SVG)
  - [x] Página `/inventory` con estados loading/vacío/error y acceso desde Mi Criatura
  - [x] Seed de demo en `/dev-seed`
- [x] **Feature flags globales**
  - [x] Dominio `src/lib/feature-flags.ts` con registry, defaults y `resolveFeatureFlags`
  - [x] Puerto `FeatureFlagsRepository` + adaptadores `local`/`api` + tests
  - [x] `FeatureFlagsProvider`/`useFeatureFlags` y guard `FeatureFlagRoute`
  - [x] Sección de feature flags en `/admin` con toggle persistente
  - [x] Flags `inventory` y `missions` apagados por defecto (MVP inicial): ocultan el acceso y bloquean sus rutas
- [x] **Story 26 — Misiones base**
  - [x] Dominio `src/lib/missions.ts` con 7 misiones seed, objetivos, recompensas y evaluación de progreso
  - [x] Puerto `MissionsRepository` (`list`, `checkAndComplete`) + adaptadores `local`/`api` + tests
  - [x] Evaluación automática tras cada recompensa (`MetricsProvider`) con recompensas y entrega de objetos
  - [x] Página `/missions` con progreso, recompensas y acceso desde Mi Criatura (flag `missions`)
  - [x] Toast de misión completada y registro `mission_complete` en el historial de métricas
- [x] **Story 28 — Home real y navegación a 1 tap**
  - [x] Página `/` con resumen del jugador: monstruo, arquetipo, Expertise, Aura Tech y próxima evolución
  - [x] Logros recientes ordenados por fecha con enlace a `/achievements`
  - [x] Acciones directas a Mi Criatura, Mi QR (`/qr`), Escanear QR, Contactos, Logros, Rankings y, con flag activo, Inventario y Misiones
  - [x] Login, registro y guards redirigen a `/`; nav inferior con Inicio, QR, Contactos, Logros y Rankings
  - [x] Resuelta la contradicción de story 18: el Home real ya existe

### Cierre

- [!] `use`/consumo/equipamiento de objetos: diferido hasta que el modelo soporte `consumedAt`/`equipped`
- [x] Entrega automática de objetos por logros (las misiones ya entregan objetos)
  - [x] Mecanismo: `objectId?` en definiciones y desbloqueos, entrega idempotente vía `InventoryRepository` (`source: 'achievement'`)
  - [x] Asignar el objeto de recompensa desde el CRUD de logros en `/admin`
- [x] **Story 27 — Tarjetas compartibles y OG**
  - [x] Generación de tarjeta PNG en cliente (monstruo o logro) con métricas, evolución, logros y branding
  - [x] Descarga PNG y compartir por LinkedIn, X/Twitter y copia de texto desde Mi Criatura y logros desbloqueados
  - [x] Metadatos Open Graph estáticos de la app (`index.html` + `og-image.png`)
  - [~] OG dinámicos por tarjeta/URL pública: movidos a Fase 4 (requieren backend o prerender)
- [x] **CRUD en `/admin`**: logros, objetos y QRs
  - [x] Logros: crear, editar, activar/desactivar, eliminar, condición declarativa y objeto de recompensa
  - [x] Objetos: crear, editar, activar/desactivar, eliminar y asignar icono/beneficio/rareza
  - [x] QRs: generar/descargar/imprimir/eliminar por tipo (charla, NPC, misión, objeto, evento)
  - [x] Escaneo de QRs de NPC, misión, objeto y evento con página informativa; los QR de objeto entregan el objeto
  - [x] Adaptadores `local`/`api` y tests para todo el CRUD

## Fase 4 — Hardening y evento

- [x] **PWA**
  - [x] `public/manifest.webmanifest` (instalable, español, iconos any + maskable, shortcuts a `/qr`, `/scan` y `/rankings`)
  - [x] `public/sw.js` (network-first para navegaciones con fallback `offline.html`, cache-first para assets, stale-while-revalidate para Google Fonts); registro solo en producción desde `main.tsx`
  - [x] Iconos PNG generados por `scripts/generate-pwa-icons.mjs` (192, 512, maskable 512, apple-touch 180) con la paleta del tema
  - [x] `index.html`: manifest, `theme-color`, apple-touch-icon y metas iOS
- [x] Detectar navegadores in-app y ofrecer "Abrir en navegador"
  - [x] Detector puro por user agent (`src/lib/inapp.ts`): Instagram, Facebook, LinkedIn, X/Twitter, TikTok, Snapchat, WhatsApp, Slack, Telegram
  - [x] Banner en `Layout` con intent de Chrome en Android y copia de enlace en iOS; descartable
  - [x] Tests del detector
- [ ] Story 27 (remanente) — OG dinámicos por tarjeta/URL pública (requiere backend o prerender; en modo `local` no hay datos cross-device)
- [ ] Prueba de carga (~1000 asistentes / ~200 concurrentes)
- [ ] E2E visual en matriz de dispositivos (iPhone SE, iPhone 14+, Galaxy A, iPad)
- [ ] Ensayo general con 10–20 usuarios reales
- [ ] Deploy a producción + runbook del día del evento
- [ ] Content freeze y seed final (charlas, QRs, logros, misiones, objetos)

## Backend real (contrato ya definido, servidor no existe)

- [ ] Implementar API REST según el contrato de `AGENTS.md` (§6)
- [ ] Validar `App/src/data/api/` contra el backend real (hoy solo `fetch` mockeado)
- [ ] Decidir estrategia de sesión/token (hoy se asume cookie con `credentials: 'include'`)
- [ ] Valorar `TokenStoragePort` si el backend usa Bearer token
- [ ] Firmar/versionar el payload QR manteniendo retrocompatibilidad de lectura

## Deuda técnica y documentación

- [ ] Activar `strict: true` en TypeScript en un cambio dedicado y corregir errores
- [ ] Corregir `AGENTS.md` §10: `@testing-library/react` **sí** está instalado (`^16.3.3`)
- [ ] Actualizar conteo de SVGs en docs: son 152, no 154
- [ ] Completar stories detalladas faltantes: fase 2 (11–19) solo tiene README; falta story 24 y las 25–28
- [ ] Corregir `CONTEXTO-PROYECTO.md`: los paths `plan/App/...` ya no existen (es `App/`)
- [ ] `CONTEXTO-PROYECTO.md` dice "dashboard privado pendiente"; ya está implementado
- [ ] Paridad de latencia simulada entre adaptadores `local` y `api` (opcional)
- [ ] Revisar si `zustand` se usa o se elimina de dependencias

---

## Reglas de mantenimiento de esta lista

1. **Al empezar una tarea**, marcarla como en curso mentalmente y leer sus sub-ítems.
2. **Al terminarla**, cambiar `[ ]` → `[x]` en el mismo commit o inmediatamente después.
3. **Al descubrir trabajo nuevo**, agregarlo acá antes de improvisar (no dejarlo solo en el chat).
4. **Al bloquear algo**, marcar `[!]` con una línea de motivo y qué lo desbloquea.
5. **Al cerrar una sesión**, dejar el "Próximo foco" actualizado.
6. **No duplicar el backlog completo**: esta lista es operativa; el detalle de épicas vive en `documentacion/03-backlog-y-criterios/backlog-estructurado.md`.
