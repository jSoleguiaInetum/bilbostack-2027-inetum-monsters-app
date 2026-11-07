# BilboStack 2027 — Documentacion del Proyecto

## Que es este proyecto

**BilboStack 2027** es una PWA gamificada de networking para conferencias tech (~1000 asistentes). Cada asistente recibe una criatura tecnologica unica generada proceduralmente a partir de su email. La criatura evoluciona visualmente segun la participacion del usuario: combates de preguntas, contactos via QR, check-in de charlas y logros.

**Principio de diseno:**
> "Tu nos dices quien eres al entrar. El juego descubre en que te has convertido al salir."

**Desarrollado por:** Equipo Inetum (proyecto interno para el evento BilboStack 2027)

---

## Estado actual del proyecto

| Fase | Estado | Descripcion |
|---|---|---|
| Fase 0 — Fundacion | ✅ Completada | Stack, setup, assets SVG, prompts de IA |
| Fase 1 — MVP Core | ✅ Completada | Auth, criatura, QR, scan, post-scan |
| Fase 2 — Interaccion Social | ✅ Completada (con polish) | Metricas, combates, contactos, logros, evolucion, check-in charlas |
| Fase 3 — Rankings, Dashboards, Social | 🚧 En curso | Rankings, dashboard publico y guard de roles/admin hechos; faltan dashboard privado, inventario, misiones y tarjetas |
| Fase 4 — Hardening + Evento | ❌ Pendiente | Prueba de carga, ensayo general, deploy produccion |

### Lo que esta construido (codigo en `App/`)

- **React 19 + Vite 8 + TypeScript 7 + Tailwind v4 + SNES.CSS** (estetica retro pixel-art)
- Auth mock con localStorage (interfaz preparada para Supabase/Firebase)
- Generacion procedural de criaturas: SHA-256 del email → 7 capas SVG (aura, body, pattern, eyes, mouth, accessory, badge)
- 4 estadios de evolucion visual (base + evo-1/2/3), umbrales: 0/20/60/120 puntos
- Sistema de metricas: Expertise (⚡) + Aura Tech (✨)
- Combates: mejor de 3 rondas con countdown 10s, preguntas por arquetipo
- Contactos con iconos de origen (🤝/⚔️👑/⚔️💀/⚔️🤗)
- 12 logros con evaluacion automatica y toast animado
- 10 charlas seed con QR escaneables (pagina `/dev-seed`)
- Rankings publicos con 4 categorias y dashboard publico `/dashboard`
- Roles de usuario y guard `/admin` para Administrador/Organizacion (contenido del panel pendiente)
- Code splitting con `React.lazy` (9 chunks)
- 0 errores TypeScript, build limpio

### Lo que falta

- **Backend real** (API generica; no Supabase) — toda la data esta en localStorage
- **Contenido del dashboard privado** (CRUD usuarios, logros, QRs, estadisticas)
- **Tarjetas compartibles** para redes sociales
- **PWA** con service worker y manifest
- **Prueba de carga** y ensayo general
- **Inventario de objetos** y misiones

---

## Indice de documentacion

### 📋 Vision y Contexto
- [Prompt del proyecto](01-vision-y-contexto/prompt-proyecto.md) — Briefing original completo con mecanicas de juego, roles, pantallas, alcance MVP
- [Fase 1 MVP](01-vision-y-contexto/fase-1-mvp.md) — Alcance, decisiones tecnicas, tareas, estructura del proyecto, modelo de datos
- [Prompt de assets SVG](01-vision-y-contexto/prompt-creature-assets.md) — Especificacion para generacion de los 152 assets SVG con Gemini AI

### 🏗️ Arquitectura y Diseno
- [Arquitectura tecnica](02-arquitectura-y-diseno/arquitectura-tecnica.md) — Stack completo (Supabase + Vercel + React), diagramas de componentes, modelo de datos (13 entidades), estrategia de generacion visual, 7 decisiones tecnicas clave

### 📦 Backlog y Criterios
- [Backlog estructurado](03-backlog-y-criterios/backlog-estructurado.md) — 14 epicas, 73 historias de usuario priorizadas con dependencias y estimaciones
- [Criterios de aceptacion MVP](03-backlog-y-criterios/criterios-aceptacion-mvp.md) — 110 criterios verificables (funcional, rendimiento, seguridad, operacional, UX)

### 📅 Plan y Riesgos
- [Plan de ejecucion](04-plan-y-riesgos/plan-ejecucion.md) — 4 fases, 17 semanas, equipo de 4-5 personas, camino critico, hitos go/no-go
- [Riesgos y mitigaciones](04-plan-y-riesgos/riesgos-mitigaciones.md) — 20 riesgos especificos con mitigaciones detalladas y mapa de calor
- [Calidad y operaciones](04-plan-y-riesgos/calidad-operaciones.md) — QA, CI/CD, observabilidad, seguridad, runbooks del dia del evento

### 📝 Stories de Desarrollo
- [Fase 1 stories](05-stories/fase-1/) — 10 stories ejecutadas (setup → types → generator → card → auth → pages → QR → scanner → post-scan → polish)
- [Fase 2 stories](05-stories/fase-2/) — 9 stories (metricas → contactos → evolucion → preguntas → combate → logros → check-in → home → polish)

### 📓 Journals de Desarrollo
- [Journal Fase 1](06-journals/journal-fase-1.md) — Decisiones, problemas, soluciones, arquitectura CSS, patron de auth mock
- [Journal Fase 2](06-journals/journal-fase-2.md) — Sistema de metricas, combates, evolucion, logros, code splitting, responsive

### 🎨 Assets
- [Monster assets](07-assets/monster-assets/) — 154 SVGs (64 bodies con evoluciones, 16 eyes, 16 mouths, 16 accessories, 16 patterns, 16 auras, 8 badges)
- [Prototipos HTML](07-assets/prototipos/) — Prototipo de app y preview de arquetipos

---

## Stack Tecnico Actual

| Capa | Tecnologia | Version |
|---|---|---|
| Framework | React | 19 |
| Build | Vite | 8.3.5 |
| Lenguaje | TypeScript | 7 |
| Routing | React Router | 8 |
| Estilos | Tailwind CSS | v4 |
| UI Components | SNES.CSS | latest |
| QR generacion | qrcode | 1.5 |
| QR escaneo | html5-qrcode | 2.3 |
| Estado | Zustand | 5 (instalado, MetricsProvider usa Context) |
| Fuente | Press Start 2P | Google Fonts |

### Arquitectura CSS

```
@layer(snes)          ← menor prioridad (SNES.CSS encapsulado)
@layer utilities      ← Tailwind con !important (vence a SNES)
unlayered             ← overrides globales (* { font-family })
```

---

## Mecanicas Clave del Juego

### Arquetipos (8)
Developer | UX/Design | Product | DevOps/Platform | QA | Management | IA Engineer | Multiclass

### Metricas
- **Expertise (⚡)** — Sube con respuestas correctas y victorias
- **Aura Tech (✨)** — Sube con contactos, charlas, logros y diversidad de arquetipos

### Tabla de recompensas
| Accion | Expertise | Aura Tech |
|---|---|---|
| Victoria combate | +5 | +3 |
| Derrota combate | +2 | +1 |
| Empate combate | +3 | +2 |
| Respuesta correcta | +3 | +0 |
| Respuesta incorrecta | +1 | +0 |
| Contacto mismo arquetipo | +0 | +2 |
| Contacto diferente arquetipo | +0 | +5 |
| Check-in charla | +0 | +5 |
| Logro desbloqueado | +0 | +2 |

### Evolucion (4 estadios)
| Estadio | Umbral (Expertise + Aura Tech) | Label |
|---|---|---|
| Base (0) | 0 | — |
| Evo 1 | 20 | Despertar |
| Evo 2 | 60 | Ascension |
| Evo 3 | 120 | Trascendencia |

### Generacion de criaturas
```
email → SHA-256 → hex string → extract params:
  chars[0-1]  → bodyShape (1-16)
  chars[2-3]  → eyesType (1-16)
  chars[4-5]  → mouthType (1-16)
  chars[6-7]  → accessory (1-16)
  chars[8-9]  → pattern (1-16)
  chars[10-11] → auraEffect (1-16)
  chars[12-15] → rarity (Inusual 60% / Singular 22% / Unico 11% / Epico 5% / Legendario 2%)
```

7 capas SVG compuestas: aura → body (con evolucion) → pattern → eyes → mouth → accessory → badge

---

## Rutas de la App

| Ruta | Pagina | Auth | Lazy |
|---|---|---|---|
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/my-monster` | MyMonsterPage | Si | No |
| `/scan` | ScanPage | Si | Si |
| `/user/:id` | UserCardPage | Si | No |
| `/contacts` | ContactsPage | Si | Si |
| `/battle/:id` | BattlePage | Si | Si |
| `/achievements` | AchievementsPage | Si | Si |
| `/talk-checkin` | TalkCheckInPage | Si | Si |
| `/dev-seed` | DevSeedPage | No | Si |

---

## Mapa de archivos del proyecto (bilbostack-app/)

```
src/
├── App.tsx                    Routing central + lazy loading
├── main.tsx                   Entry point
├── auth/
│   ├── AuthProvider.tsx       Context de auth (mock localStorage)
│   ├── auth-adapter.ts        Interfaz AuthAdapter + mock
│   └── ProtectedRoute.tsx     Guard de rutas autenticadas
├── monster/
│   ├── generator.ts           SHA-256 → params → asset paths
│   ├── MonsterCard.tsx        Composicion 7 capas SVG + animacion evolucion
│   └── types.ts               MonsterParams, Archetype, Evolution
├── qr/
│   ├── QRDisplay.tsx          Generacion de QR con qrcode
│   ├── QRScanner.tsx          Escaneo con html5-qrcode
│   ├── qr-codec.ts           btoa/atob JSON encoding
│   └── types.ts               PersonPayload | TalkPayload
├── lib/
│   ├── metrics.ts             CRUD metricas en localStorage
│   ├── MetricsProvider.tsx    Context + evaluacion auto de logros
│   ├── evolution.ts           Umbrales y calculo de estadio
│   ├── questions.ts           Banco de 52 preguntas mock
│   ├── battle.ts              Motor de combate (resolveRound, resolveBattle)
│   ├── contacts.ts            CRUD contactos en localStorage
│   ├── achievements.ts        12 logros con condiciones
│   ├── seed-talks.ts          8 charlas de ejemplo
│   ├── constants.ts           Arquetipos, rarezas, config
│   └── crypto.ts              SHA-256 helper
├── components/
│   ├── Layout.tsx             Shell con nav bottom 4 tabs
│   ├── MetricsDisplay.tsx     Badge de metricas
│   ├── EvolutionProgress.tsx  Barra de progreso hacia evolucion
│   ├── Spinner.tsx            Loading spinner
│   └── ArchetypeSelector.tsx  Selector de 8 arquetipos
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── MyMonsterPage.tsx      Criatura + metricas + evolucion + QR
│   ├── ScanPage.tsx           Escaner QR (372KB con html5-qrcode)
│   ├── UserCardPage.tsx       Tarjeta post-scan
│   ├── ContactsPage.tsx       Lista de contactos
│   ├── BattlePage.tsx         Flujo de combate completo
│   ├── AchievementsPage.tsx   12 logros
│   ├── TalkCheckInPage.tsx    Check-in de charla (+5 Aura Tech)
│   └── DevSeedPage.tsx        QR de charlas para testing
└── index.css                  Overrides SNES.CSS + fuente global
```

---

## Como continuar el desarrollo

### Prioridad 1: Backend (Supabase)
El mayor cambio pendiente. Toda la data esta en localStorage. Migrar a:
- Supabase Auth (Magic Link) reemplazando `mock-auth`
- PostgreSQL para usuarios, combates, contactos, logros
- RLS policies para seguridad por usuario

### Prioridad 2: Fase 3 — Rankings y Dashboards
- Rankings publicos (4 categorias: Expertise, Aura Tech, Contactos, Victorias)
- Dashboard admin (CRUD de usuarios, logros, QRs, estadisticas)
- Dashboard publico para pantallas del evento

### Prioridad 3: Experiencia Social
- Tarjetas compartibles para LinkedIn
- OG meta tags
- PWA con service worker

### Referencia completa
Ver [Plan de ejecucion](04-plan-y-riesgos/plan-ejecucion.md) para el cronograma detallado de las fases restantes.

---

## Guia para IA: como usar esta documentacion

Si eres una IA que va a continuar el desarrollo de este proyecto:

1. **Empieza por este README** — te da el contexto completo del estado actual
2. **Lee la arquitectura** (`02-arquitectura-y-diseno/`) para entender el diseno del sistema completo
3. **Consulta el backlog** (`03-backlog-y-criterios/`) para ver que historias quedan por implementar
4. **Revisa los journals** (`06-journals/`) para entender decisiones tomadas y problemas resueltos
5. **El codigo esta en** `plan/App/bilbostack-app/` — ese es el proyecto Vite/React funcionando

### Datos clave que NO debes cambiar sin motivo
- La cascada CSS `@layer(snes)` + Tailwind es critica — cambiarla rompe toda la UI
- `module-alias/register` debe ser el primer import en server.ts (del repo padre, no de la app)
- Los umbrales de evolucion (0/20/60/120) estan calibrados para ~1000 asistentes en 8 horas
- La generacion de criaturas es determinista: mismo email = misma criatura siempre
- Los combates son locales (sin WebSocket) — el oponente responde con logica simulada (pendiente de backend real)
