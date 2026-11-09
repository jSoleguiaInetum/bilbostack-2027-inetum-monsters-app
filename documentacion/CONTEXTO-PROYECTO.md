# BilboStack 2027 — Contexto del Proyecto (documento compacto)

Este documento es un resumen autocontenido del proyecto. Puede usarse como contexto inicial para cualquier IA que vaya a continuar el desarrollo.

---

## Que es

PWA gamificada de networking para BilboStack 2027, conferencia tech de un dia (~1000 asistentes) en Bilbao. Cada asistente recibe una criatura tecnologica unica que evoluciona con su participacion.

**Objetivo:** Fomentar networking entre perfiles distintos, incentivar participacion activa, generar contenido compartible.

**Restriccion clave:** Los combates son vehiculo de networking, no competicion pura.

## Estado actual: Fases 0-2 completadas, Fase 3 en curso

### Implementado (Fases 1-3 parcial)
- Auth mock (localStorage) y capa `src/data` backend-agnostica (modos `local`/`api`)
- Generacion procedural de criaturas (SHA-256 email → 7 capas SVG, 16 variantes por capa)
- 4 estadios de evolucion visual con animacion (ping + bounce)
- Metricas: Expertise (⚡) + Aura Tech (✨) con tabla de recompensas
- Combates: mejor de 3, countdown 10s, preguntas por arquetipo, oponente simulado
- Contactos con iconos de origen (contacto directo vs combate con resultado)
- 12 logros con evaluacion automatica
- Check-in de charlas via QR (+5 Aura Tech)
- 10 charlas seed con QR escaneables (/dev-seed)
- Rankings publicos con 4 categorias y dashboard publico `/dashboard`
- Roles de usuario y guard `/admin` (Administrador/Organizacion)
- Inventario de objetos, misiones base y feature flags globales gestionables desde `/admin` (`inventory` y `missions` apagados por defecto)
- Tarjetas compartibles PNG para Mi Criatura y logros, con OG estaticos
- Home real `/` con resumen del jugador y accesos de 1 tap; QR personal en `/qr`
- Code splitting con React.lazy (10 chunks)
- Build limpio: 0 errores TS

- CRUD de logros, objetos y QRs en `/admin`

### Pendiente (Fases 3+4)
- Backend real (API generica; no Supabase)
- OG dinamicos de tarjetas compartibles (requieren backend o prerender)
- PWA con service worker
- Prueba de carga y ensayo general

## Stack

| Capa | Tecnologia | Version |
|---|---|---|
| Framework | React | 19 |
| Build | Vite | 8.3.5 |
| Lenguaje | TypeScript | 7 |
| Routing | React Router | 8 |
| Estilos | Tailwind CSS v4 + SNES.CSS (layer) |
| QR | qrcode (gen) + html5-qrcode (scan) |
| Fuente | Press Start 2P (Google Fonts) |

**Cascada CSS:** `@layer(snes)` < `@layer utilities (Tailwind !important)` < unlayered overrides

## Mecanicas del juego

**8 Arquetipos:** Developer, UX/Design, Product, DevOps/Platform, QA, Management, IA Engineer, Multiclass

**Metricas:**
- Expertise (⚡): sube con respuestas correctas (+3) y victorias (+5)
- Aura Tech (✨): sube con contactos (+2/+5 si distinto arquetipo), charlas (+5), logros (+2)

**Evolucion:** 4 estadios basados en suma Expertise + Aura Tech → umbrales 0/20/60/120

**Combates:** Scan QR → intro monstruos → 3 rondas (pregunta por arquetipo, 10s) → resultado → recompensas. Un solo combate por par de usuarios.

**Criaturas:** SHA-256(email) → parametros visuales → 7 capas SVG (aura, body, pattern, eyes, mouth, accessory, badge). 152 assets SVG pre-diseñados. Determinista: mismo email = misma criatura.

## Estructura de archivos clave (plan/App/bilbostack-app/)

```
src/App.tsx              → Routing + Suspense + lazy loading
src/auth/AuthProvider.tsx → Context auth (mock localStorage)
src/monster/generator.ts  → SHA-256 → params → asset paths
src/monster/MonsterCard.tsx → 7 capas SVG + animacion evolucion
src/lib/metrics.ts        → CRUD metricas localStorage
src/lib/MetricsProvider.tsx → Context metricas + auto-check logros
src/lib/evolution.ts      → Umbrales de evolucion
src/lib/battle.ts         → Motor de combate local
src/lib/questions.ts      → 52 preguntas mock por arquetipo
src/lib/achievements.ts   → 12 logros con condiciones
src/lib/contacts.ts       → CRUD contactos localStorage
src/pages/BattlePage.tsx  → Flujo completo (intro→preguntas→resultado)
src/pages/MyMonsterPage.tsx → Criatura + metricas + banner evolucion
```

## Decisiones tecnicas importantes

1. **Todo en localStorage** — mock reemplazable por Supabase cuando se integre backend
2. **Combates locales** — oponente simulado con logica probabilistica, sin WebSocket
3. **SNES.CSS en @layer** — resuelve conflictos con Tailwind sin !important wars
4. **Code splitting** — ScanPage (372KB con html5-qrcode) lazy-loaded
5. **QR codec** — btoa(JSON.stringify(payload)) con discriminated union PersonPayload | TalkPayload
6. **Evolucion por useRef** — prevEvolution ref detecta cambios evitando falsos triggers en re-renders

## Documentacion disponible

| Documento | Contenido |
|---|---|
| README.md (este directorio) | Indice completo con links |
| 01-vision-y-contexto/ | Prompt original, alcance MVP, prompt de assets |
| 02-arquitectura-y-diseno/ | Stack, diagramas, modelo de datos (13 entidades), decisiones |
| 03-backlog-y-criterios/ | 14 epicas, 73 historias, 110 criterios de aceptacion |
| 04-plan-y-riesgos/ | Cronograma 17 semanas, 20 riesgos, QA, CI/CD, runbooks |
| 05-stories/ | 19 stories detalladas (10 fase 1 + 9 fase 2) |
| 06-journals/ | Diarios de desarrollo con decisiones y problemas resueltos |
| 07-assets/ | 154 SVGs + prototipos HTML |

## Para continuar: que hacer primero

1. Leer este documento para tener contexto
2. Explorar el codigo en `App/`
3. Para Fase 3: continuar por las misiones (el inventario y los feature flags ya existen)
4. Para backend: seguir arquitectura en `02-arquitectura-y-diseno/arquitectura-tecnica.md`
5. Consultar `03-backlog-y-criterios/backlog-estructurado.md` para historias pendientes (epicas 11-14)
