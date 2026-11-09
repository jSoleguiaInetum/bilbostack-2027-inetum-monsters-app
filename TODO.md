# TODO — BilboStack 2027 Monsters App

Lista viva de trabajo del proyecto. **Leer al inicio de cada sesión y actualizar al cerrar cada tarea, story o commit.**

- `[ ]` pendiente · `[x]` hecho · `[!]` bloqueado · `[?]` a decidir
- Última verificación: E2E visual en 6 perfiles de dispositivo (90 tests verdes, sin desbordamiento horizontal ni errores de consola), prueba de carga del frontend (200 VUs, 0 errores, p95 199 ms); `lint`, `tsc -b` y 160 tests unitarios OK.
- Detalle de dominio: `documentacion/CONTEXTO-PROYECTO.md`. Estado y reglas: `AGENTS.md`.

## Próximo foco (orden sugerido)

1. Fase 4 — ejecutar el ensayo general con 10–20 personas reales (kit listo en `/rehearsal`) y luego deploy a producción + runbook del día del evento
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
- [x] **Prueba de carga del frontend estático (~200 concurrentes)**
  - [x] Arnés sin dependencias `App/loadtest/loadtest.mjs` (sesiones de navegador concurrentes contra el build) + scripts `loadtest:stress` / `loadtest:realistic`
  - [x] Escenario realista (200 VUs, think time 3 s): 29.204 peticiones, 0 errores, p95 199,49 ms, 885 req/s, 10,6 MB/s — **PASS**
  - [x] Escenario de estrés (200 VUs, sin think time): 53.106 peticiones, 0 errores, p95 268 ms, 1.765 req/s, 21,1 MB/s (servidor y generador comparten CPU; cota inferior)
  - [x] Informes en `App/loadtest/results/local-200vu-realistic.json` y `local-200vu-stress.json`
  - [!] Criterios de API R-02, R-03, R-05, R-07, R-08 y O-04 bloqueados: requieren backend real. El arnés acepta `--url` para apuntarlo a staging/producción cuando exista
  - [ ] Repetir contra staging/producción (CDN real) tras el deploy
- [ ] R-01 (FCP <2 s en 4G) verificable con Lighthouse/WebPageTest. Bundle inicial actual: 320 kB JS (101 kB gzip) + 98 kB CSS (15 kB gzip); `ScanPage` 372 kB se carga lazy
- [x] **E2E visual en matriz de dispositivos (iPhone SE, iPhone 14+, Galaxy A, iPad)**
  - [x] Runner Playwright (`App/playwright.config.ts`, specs en `App/e2e/`) con 6 perfiles: 4 emulados en Chromium (iPhone SE, iPhone 14, Galaxy A, iPad) + 2 con WebKit usando los perfiles iOS reales (iPhone SE, iPhone 14)
  - [x] Siembra del adaptador `local` vía `localStorage` (`App/e2e/seed.ts`): 8 usuarios, métricas, contactos, combates, logros, objetos y flags activos
  - [x] Aserciones: heading visible, cero desbordamiento horizontal, nav inferior contenida, SVG del monstruo sin 404, sin errores de consola ni de página
  - [x] 90 tests verdes en los 6 perfiles (28 s); capturas en `App/e2e/screenshots/<perfil>/<pagina>.png`
  - [x] Detector de desbordamiento validado contra un caso sintético (elemento de 2000 px en 375 px) para descartar falsos verdes
  - [!] Sin baseline de regresión visual: la fuente `Press Start 2P` viene de Google Fonts y hace los píxeles frágiles entre entornos. Las capturas son para revisión humana
  - [!] La emulación no cubre cámara real, PWA install, service worker en Safari, navegadores in-app ni permisos: va al ensayo general
- [ ] Ensayo general con 10–20 usuarios reales
  - [x] Kit de ensayo: página `/rehearsal` con siembra de datos, checklist de 12 flujos y captura de feedback
    - [x] Puerto `RehearsalRepository` + adaptadores `local` y `api` (en `api` la siembra no existe: no se pueden inventar usuarios en un servidor real)
    - [x] Builder puro y determinista (`src/lib/rehearsal-data.ts`): 24 usuarios ficticios, 8 arquetipos, contactos, combates, logros, objetos y misiones
    - [x] `reset()` borra solo los datos de ensayo (prefijo `rehearsal-`) y deja intactos los del usuario real
    - [x] Feedback: puntuación 1–5, flujo, dispositivo, comentario y marca de fallo bloqueante; exportable al portapapeles
    - [x] Tests: 20 unitarios (builder + adaptador local) y 2 E2E que siembran y comprueban que los datos llegan a los rankings
  - [ ] Imprimir los QRs de charla, NPC, misión y objeto desde `/admin` (check-in de charla es el flujo con mas riesgo)
  - [ ] Ejecutar el ensayo con 10–20 personas en el venue, con WiFi institucional y 4G de backup
  - [ ] Recoger el feedback de cada asistente y triagear los fallos bloqueantes
  - [!] Sin backend, el ensayo solo valida UX, flujos y hardware: rankings, dashboard y combates son locales. El multiusuario real (contactos entre dispositivos, posiciones compartidas) no se puede validar hasta que exista el backend
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
- [x] Corregir `AGENTS.md` §10: `@testing-library/react` **sí** está instalado (`^16.3.3`) — ya estaba correcto, ítem obsoleto
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
