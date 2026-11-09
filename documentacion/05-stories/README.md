# Stories de Desarrollo

19 stories ejecutadas en orden, divididas en dos fases. Cada story es autocontenida con archivos a crear/modificar, codigo de referencia y criterios de aceptacion.

## Fase 1 — MVP Core (10 stories) ✅

| # | Story | Descripcion | Estado |
|---|---|---|---|
| 01 | Setup | Scaffold Vite + React + TS + Tailwind + SNES.CSS | ✅ |
| 02 | Types | Tipos y constantes compartidas (arquetipos, rarezas) | ✅ |
| 03 | Monster Generator | SHA-256 → params visuales, determinismo | ✅ |
| 04 | Monster Card | Componente de 7 capas SVG | ✅ |
| 05 | Auth | Mock auth + AuthProvider + ProtectedRoute | ✅ |
| 06 | Pages Auth | Login, Register, selector de arquetipo | ✅ |
| 07 | My Monster | Pagina Mi Criatura + QR display | ✅ |
| 08 | QR Scanner | Integrar html5-qrcode con camara | ✅ |
| 09 | Post Scan | Pagina post-scan con tarjeta del otro | ✅ |
| 10 | Polish | Layout, navegacion, responsive, loading states | ✅ |

Ver [fase-1/README.md](fase-1/README.md) para instrucciones de ejecucion.

## Fase 2 — Interaccion Social (9 stories) ✅

| # | Story | Descripcion | Estado |
|---|---|---|---|
| 11 | Metricas | Sistema Expertise (⚡) + Aura Tech (✨) | ✅ |
| 12 | Contactos | Pagina de contactos con lista completa | ✅ |
| 13 | Evolucion | Sistema de evolucion visual (4 estadios) | ✅ |
| 14 | Preguntas | Banco de 52 preguntas mock por arquetipo | ✅ |
| 15 | Combate | Sistema de combate completo (3 rondas, 10s) | ✅ |
| 16 | Logros | 12 logros con evaluacion automatica | ✅ |
| 17 | Check-in | QR de charlas + check-in (+5 Aura Tech) | ✅ |
| 18 | Home | Pagina Home con resumen del jugador | ✅ |
| 19 | Polish | Code splitting, animacion evolucion, seed data, responsive | ✅ |

Ver [fase-2/README.md](fase-2/README.md) para dependencias entre stories.

## Fase 3 — Rankings y Dashboards (completada)

Stories 20-28 completadas; el OG dinámico de la story 27 se movió a Fase 4. El CRUD de admin (logros, objetos y QRs) está hecho.

- ✅ Story 20: `RankingsRepository` (4 categorías, local/API, tests)
- ✅ Story 21: página de rankings (4 tabs, top 20, posición propia, refresco cada 30 s)
- ✅ Story 22: dashboard público (4 rankings, estadísticas globales, evoluciones recientes, sin login)
- ✅ Story 23: roles de usuario y guard de administración (`/admin` restringido)
- ✅ Story 24: dashboard privado (estadísticas, usuarios, filtros y cambio de rol)
- ✅ Story 25: inventario de objetos (`InventoryRepository`, página `/inventory`, seed de demo)
- ✅ Story 26: misiones base (`MissionsRepository`, evaluación automática, recompensas y página `/missions`)
- ✅ Feature flags globales con gestión en `/admin`; `inventory` y `missions` apagados por defecto en el MVP.
- ⚠️ Story 27: tarjetas compartibles y OG estáticos; los OG dinámicos se movieron a Fase 4.
- ✅ Story 28: Home real (`/`) con resumen del jugador y accesos de 1 tap; QR personal en `/qr`.
- ✅ CRUD de admin: logros (condición declarativa y objeto de recompensa), objetos y QRs por tipo (generar, descargar, imprimir, eliminar).

Ver [fase-3/README.md](fase-3/README.md) para el orden y las dependencias.
Ver [backlog-estructurado.md](../03-backlog-y-criterios/backlog-estructurado.md) para el detalle de epicas.
