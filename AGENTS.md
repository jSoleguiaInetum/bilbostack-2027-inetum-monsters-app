# AGENTS.md — BilboStack 2027 Monsters App

Guía operativa para agentes de IA y desarrolladores. Leer antes de tocar código.

## 0. To-do viva (obligatorio)

- **Al inicio de cada sesión:** leer `TODO.md` en la raíz del repo para conocer el estado real y el próximo foco.
- **Al completar, agregar, bloquear o descartar una tarea:** actualizar `TODO.md` en el mismo cambio (marcar `[x]`, `[!]` o `[?]`).
- **Al cerrar una sesión:** dejar actualizado el bloque "Próximo foco" de `TODO.md`.
- `TODO.md` es la fuente operativa de verdad; no crear listas paralelas en el chat ni en otros archivos.

## 1. Qué es el proyecto

PWA gamificada de networking para BilboStack 2027 (evento tech de un día, ~1000 asistentes). Cada asistente recibe una criatura única generada proceduralmente desde su email y evoluciona según su participación: combates de preguntas, contactos por QR, check-in de charlas y logros.

- **Repo:** `bilbostack-2027-inetum-monsters-app`
- **Código:** `App/` (no existe `plan/App/...`, aunque la documentación vieja lo mencione)
- **Documentación:** `documentacion/`
- **Idioma:** UI y docs en español; identificadores de código en inglés.
- **Estado:** Fases 0, 1 y 2 completadas. Fase 3 en curso (stories 20–25 + feature flags hechas; 26–28 pendientes). Fase 4 pendiente. Ver `TODO.md`.
- **Backend:** NO hay backend todavía. Todo funciona con mock local (`localStorage`).

## 2. Stack

| Capa | Tecnología |
|---|---|
| Framework | React 19 |
| Build | Vite 8 |
| Lenguaje | TypeScript 7 |
| Routing | React Router 8 |
| Estilos | Tailwind CSS v4 + SNES.CSS |
| QR | `qrcode` (generar) + `html5-qrcode` (escanear) |
| Estado | React Context (Zustand instalado pero sin uso) |
| Fuente | Press Start 2P (Google Fonts, cargada en `index.html`) |

## 3. Comandos

Todos se ejecutan desde `App/`:

```bash
npm install       # instalar dependencias
npm run dev        # servidor de desarrollo Vite
npm run build      # tsc -b && vite build
npm run lint       # oxlint
npm test           # suite Vitest (run)
npm run test:watch # Vitest en modo watch
npm run preview    # preview del build
```

No ejecutar `npm run build` como verificación automática después de cada cambio si no se pidió; usar `npm run lint`, `npm test` y `npx tsc -p tsconfig.app.json --noEmit`.

## 4. Estructura

```
App/
├── public/monster-assets/     152 SVGs (cuerpos con evoluciones, ojos, bocas, accesorios, patrones, auras, badges)
├── src/
│   ├── App.tsx                Router + lazy loading + providers
│   ├── main.tsx               Entry point (SIN StrictMode a propósito)
│   ├── index.css              Cascada SNES/Tailwind + tema + overrides QR
│   ├── auth/                  AuthProvider, ProtectedRoute, AdminRoute, roles, types
│   ├── data/                  ports/, local/, api/, talks.json, DataProvider, types, errors, config
│   ├── monster/               generator.ts, MonsterCard, RarityBadge, types
│   ├── qr/                    QRDisplay, QRScanner, qr-codec, types
│   ├── lib/                   metrics, battle, achievements, evolution, questions, rankings, seed-talks, constants, crypto, MetricsProvider
│   ├── components/            Layout, MetricsDisplay, EvolutionProgress, Spinner, MonsterSkeleton, AchievementToast, ArchetypeSelector, ErrorBoundary
│   └── pages/                 Login, Register, MyMonster, UserCard, Scan, Contacts, Battle, Achievements, TalkCheckIn, Rankings, PublicDashboard, Admin, DevSeed
```

Rutas: `/login`, `/register`, `/dashboard` (pública), `/my-monster`, `/scan`, `/user/:id`, `/contacts`, `/battle/:id`, `/achievements`, `/rankings`, `/talk-checkin`, `/admin` (admin), `/dev-seed`.

## 5. Estado actual

### Implementado

- Auth mock (localStorage) detrás de `AuthRepository`.
- Capa `src/data/` con puertos, `DataProvider`, errores normalizados y adaptadores `local` asíncronos.
- UI y providers consumen repositorios; `localStorage` solo vive en `src/data/local/`.
- Generación determinista: `SHA-256(email)` → `bodyShape`, `eyesType`, `mouthType`, `accessory`, `pattern`, `auraEffect`, `rarity`.
- 7 capas SVG: aura → body (con evolución) → pattern → eyes → mouth → accessory → badge.
- 4 estadios de evolución (umbrales 0/20/60/120) con animación.
- Métricas Expertise (⚡) y Aura Tech (✨), tabla de recompensas e historial.
- Combates mejor de 3, timer 10s, preguntas por arquetipo, oponente simulado, 1 combate por par.
- Contactos con iconos de origen (🤝 / ⚔️👑 / ⚔️💀 / ⚔️🤗).
- 12 logros con evaluación automática y toast.
- QR personal, escáner, check-in de charlas (+5 Aura Tech), 10 charlas reales de BilboStack 2027 en `/dev-seed` (datos en `src/data/talks.json`).
- `RankingsRepository` con 4 categorías, adaptadores `local`/`api` y tests.
- Página `/rankings` con 4 tabs, top 20, posición propia y refresco cada 30 s.
- Dashboard público `/dashboard`: 4 rankings, estadísticas globales y evoluciones recientes, sin autenticación.
- Roles de usuario (`participant`, `admin`) con guard `/admin` (`AdminRoute`) y enlace condicional en Mi Criatura. En modo `local`, el primer usuario registrado es admin.
- Dashboard privado `/admin`: estadísticas (totales + medias de Expertise/Aura), listado de usuarios con búsqueda y filtros por rol/arquetipo, y cambio de rol participante ↔ admin. Refresco cada 30 s.
- Inventario: 16 objetos seed (`src/lib/objects.ts`), `InventoryRepository` con adaptadores `local`/`api`, página `/inventory` y seed de demo en `/dev-seed`. Detrás del flag `inventory`, apagado por defecto.
- Feature flags globales: `src/lib/feature-flags.ts`, `FeatureFlagsRepository`, `FeatureFlagsProvider`/`useFeatureFlags`, guard `FeatureFlagRoute` y gestión en `/admin`. Persisten en `bilbostack_feature_flags` (local) o `/feature-flags` (api).
- Code splitting con `React.lazy` (10 chunks).

### Pendiente

- **Fase 3:** CRUD de logros/objetos y QRs, tarjetas compartibles + OG, misiones y entrega automática de objetos.
- **Home real** (story 18): resumen del jugador y navegación a 1 tap. Hoy `/` redirige a `/my-monster`.
- **Fase 4:** PWA (manifest + service worker), prueba de carga, E2E visual, ensayo general y deploy.
- Backend real: los adaptadores `api` existen, pero falta un servidor que cumpla el contrato.
- Documentación: `documentacion/05-stories/fase-2/` solo tiene `README.md`; faltan las stories 11-19 detalladas.

## 6. Regla central: frontend backend-agnóstico

El backend **no será Supabase**. El frontend debe poder funcionar en dos modos sin cambiar la UI:

- `local` (actual): persistencia en `localStorage`.
- `api` (futuro): llamadas HTTP a un backend genérico.

### Contrato de diseño

Configurar por variables de entorno de Vite:

```
VITE_DATA_MODE=local | api
VITE_API_BASE_URL=https://api.example.com
```

### Puertos por dominio

Crear interfaces (puertos) y dos implementaciones por dominio. La UI/providers solo conocen la interfaz, nunca `localStorage` ni `fetch` directo.

| Puerto | Operaciones mínimas |
|---|---|
| `AuthRepository` | register, login, oauth, logout, getSession, getUserById |
| `UserRepository` | getUserById, list, updateRole |
| `MetricsRepository` | get, init, addReward |
| `ContactsRepository` | list, add, isContact |
| `BattlesRepository` | list, save, hasFought, getFoughtOpponents |
| `AchievementsRepository` | listDefinitions, listUnlocked, checkAndUnlock |
| `CheckInsRepository` | list, hasCheckedIn, add |
| `TalksRepository` | listTalks |
| `RankingsRepository` | getByCategory |
| `DashboardRepository` | getOverview (stats + rankings + evoluciones recientes), getAdminOverview (stats + medias) |
| `FeatureFlagsRepository` | list, set (flags globales; `inventory` apagado por defecto) |

### Reglas obligatorias

1. **Todo asíncrono**, incluso el adaptador local (devuelve `Promise`; la latencia simulada es opcional). Así el cambio a API no altera call sites.
2. **Nada de `localStorage` fuera de `src/data/local/`**. Nada de `fetch`/`axios` fuera de `src/data/api/`.
3. **Nada de tipos/DTOs del backend en componentes**. Mapear DTO → modelo de dominio en el adaptador.
4. **Errores normalizados**: un tipo común (ej. `DataError` con `code` y `message`) para que la UI no dependa del formato del backend.
5. **Selección por composición**, no por `if` dispersos: un `DataProvider`/composition root elige la implementación según `VITE_DATA_MODE`.
6. **Sin conceptos de Supabase** en el dominio (nada de `auth.uid`, RLS, Realtime channels, Edge Functions). Si se necesita tiempo real, definir un puerto `RealtimePort` y una implementación concreta.
7. **QR estable**: el payload actual es `btoa(JSON.stringify({ type: 'person' | 'talk', ... }))`. Si en modo API se firma o cambia el formato, versionar el contrato y mantener retrocompatibilidad de lectura.

### Estado de la migración

Hecho:

1. `src/data/` creado con `ports/`, `local/`, `api/`, `types.ts`, `errors.ts`, `config.ts` y `DataProvider`.
2. Persistencia movida desde `lib/*` a `data/local/*` detrás de puertos.
3. `AuthProvider`/`MetricsProvider` y páginas consumen repositorios vía `useRepositories()`.
4. `RegisterPage` ya no lee `localStorage`; usa el usuario devuelto por `signUpWithEmail`.
5. Firmas convertidas a `Promise` en todos los dominios.
6. Adaptadores `api` con cliente HTTP común, DTOs mapeados y errores normalizados.
7. Runner Vitest + jsdom con tests de lógica pura y adaptadores `local`/`api`.
8. Roles en `User` (`UserRole`) con normalización defensiva a `participant` en los adaptadores.
9. Inventario: definiciones y objetos obtenidos detrás de `InventoryRepository` (`listDefinitions`, `listOwned`, `has`, `add` idempotente) con adaptadores `local`/`api` y tests.
10. Feature flags globales detrás de `FeatureFlagsRepository` (`list`, `set`) con adaptadores `local`/`api`, provider y guard de ruta; `inventory` apagado por defecto y gestionable desde `/admin`.

Pendiente:

1. Implementar el backend real que cumpla el contrato REST.
2. Validar los adaptadores `api` contra ese backend (hoy se prueban con `fetch` mockeado).
3. Implementar los puertos de misiones y administración cuando lleguen sus stories.
4. Definir la estrategia de sesión/token definitiva si el backend no usa cookie (`credentials: 'include'` es el supuesto actual).

### Contrato REST sugerido (orientativo)

```
POST   /auth/register
POST   /auth/login
POST   /auth/oauth/:provider
POST   /auth/logout
GET    /auth/session
GET    /users/:id
GET    /users
PATCH  /users/:id/role
GET    /users/:id/metrics
POST   /users/:id/metrics
POST   /users/:id/metrics/rewards
GET    /users/:id/contacts
POST   /users/:id/contacts
GET    /users/:id/battles
POST   /users/:id/battles
GET    /achievements/definitions
GET    /users/:id/achievements
PUT    /users/:id/achievements
POST   /users/:id/achievements/check
GET    /users/:id/checkins
POST   /users/:id/checkins
GET    /talks
GET    /objects
GET    /users/:id/inventory
POST   /users/:id/inventory
GET    /rankings?category=expertise|aura|contacts|wins
GET    /dashboard/public?rankingsLimit=5&evolutionsLimit=10
GET    /dashboard/admin
GET    /feature-flags
PATCH  /feature-flags/:key
POST   /qr/resolve
```

### Deuda restante

- Implementar el backend real y validar `src/data/api/` contra él.
- Mantener la suite `local`/`api` con la misma semántica de comportamiento.
- Los adaptadores `local` resuelven sin latencia simulada (salvo auth); si se quiere paridad con API, añadir delay configurable.
- La sesión API asume cookie (`credentials: 'include'`); si el backend usa Bearer token, añadir un `TokenStoragePort` y ajustar el cliente HTTP.

## 7. Reglas del juego que NO se cambian sin motivo

- **8 arquetipos:** developer, ux, devops, qa, product, management, ia, multiclass.
- **Umbrales de evolución:** 0 / 20 / 60 / 120 (suma Expertise + Aura Tech).
- **Generación determinista:** mismo email = misma criatura, siempre.
- **7 capas SVG** con 16 variantes por capa (152 assets totales).
- **Un solo combate por par de usuarios.**
- Tabla de recompensas actual (`src/lib/metrics.ts`): victoria +5/+3, derrota +2/+1, empate +3/+2, respuesta correcta +3/+0, incorrecta +1/+0, contacto +0/+2 (+3 extra si arquetipo distinto), charla +0/+5, logro +0/+2.
- **Rarezas:** Inusual 60%, Singular 22%, Único 11%, Épico 5%, Legendario 2%.

## 8. Reglas de UI/CSS

La cascada es crítica. No reordenar imports de `src/index.css`:

```
@layer(snes)      ← menor prioridad (SNES.CSS)
@layer utilities  ← Tailwind con !important (vence a SNES)
unlayered         ← overrides globales
```

- No añadir `!important` nuevos sin justificar; ya hay overrides necesarios para SNES.CSS.
- `* { font-family: "Press Start 2P" !important }` es intencional.
- No re-añadir `<StrictMode>` en `main.tsx`: el escáner QR hace doble montaje y rompe `html5-qrcode`. Si se quiere reactivar, primero corregir el ciclo de vida del scanner.
- Mobile-first, verificar a 375px. El nav inferior tiene 4 tabs; no agregar tabs sin revisar el fit.
- No hardcodear colores nuevos: usar el `@theme` de `index.css` (`primary`, `secondary`, `accent`, `tech`, `surface`, `background`, etc.).

## 9. Convenciones de código

- Componentes funcionales + hooks. Export nombrado (excepto `App` default).
- TypeScript: `verbatimModuleSyntax` activo → usar `import type` para tipos.
- `tsconfig` NO tiene `strict: true`. No asumir strict mode; si se activa, hacerlo en un cambio dedicado y corregir los errores.
- `noUnusedLocals` y `noUnusedParameters` activos.
- No añadir librerías sin comprobar que ya están en `package.json`.
- No crear archivos de documentación nuevos sin pedirlo.
- No commitear sin autorización explícita del usuario.
- Commits en formato conventional commits, sin atribución a IA.

## 10. Testing

- Runner: Vitest + jsdom (`npm test`, `npm run test:watch`).
- Tests actuales: generación determinista, evolución, resolución de combates, recompensas, logros, adaptadores `local` y `api` con `fetch` mockeado.
- Si se añade UI con comportamiento propio, usar `@testing-library/react` (ya instalado, `^16.3.3`).
- Zona prioritaria de tests: `generator.ts`, `evolution.ts`, `battle.ts`, `achievements.ts` y los adaptadores de datos (misma suite para `local` y `api`).

## 11. Gotchas conocidos

- `.git/config` tenía `core.worktree` apuntando a `C:\Users\Aussar\...` (inexistente). Ya se eliminó esa clave; el repo vive en `C:\Program Files\Ampps\www\...`.
- `App/node_modules` puede no existir: ejecutar `npm install` antes de nada.
- La documentación referencia `plan/App/bilbostack-app/` y `plan/Claude-plan/...`; esos paths ya no existen. El código real está en `App/`.
- El README de `documentacion/` dice 154 SVGs; hay 152.
- `documentacion/README.md` menciona 19 stories; faltan las detalladas de fase 2 (11–19) y varias de fase 3 (24–28).
- El combate es 100% local y simulado; no hay sincronización entre dispositivos.
- El QR actual no está firmado (solo base64 de JSON). No asumir seguridad anti-falsificación.
- No hay PWA, manifest ni service worker.
- El inventario está apagado por defecto (MVP inicial). Se habilita desde `/admin` → Feature flags; en modo `local` persiste en `bilbostack_feature_flags`.

## 12. Roadmap inmediato

1. `npm install` y verificación base (`npm run lint`).
2. ~~Introducir `src/data/` con puertos + adaptadores `local`~~ (hecho).
3. ~~Rankings UI (story 21), dashboard público (story 22), roles/admin (story 23), dashboard privado (story 24), inventario (story 25) y feature flags~~ (hecho). Falta el resto de Fase 3 con datos mock: misiones (26), tarjetas compartibles (27) y Home real (28).
4. ~~Añadir adaptadores `api` y selector `VITE_DATA_MODE`~~ (hecho).
5. ~~Añadir tests y runner~~ (hecho).
6. PWA, endurecimiento, prueba de carga y deploy.

## 13. Definition of Done para cambios

- `npm run lint` sin errores nuevos.
- Build de TypeScript sin errores (`tsc -b`).
- Ningún componente/página importa `localStorage` ni `fetch` directo; solo la capa `src/data/`.
- UI responsive a 375px.
- Sin secretos ni claves en el repo.
- Documentación actualizada solo si cambia el contrato o el estado del proyecto.
- `TODO.md` actualizado con las tareas completadas y el próximo foco.

## 14. Documentación de referencia

- `TODO.md` — to-do viva y próximo foco (leer primero).
- `documentacion/CONTEXTO-PROYECTO.md` — resumen compacto.
- `documentacion/02-arquitectura-y-diseno/arquitectura-tecnica.md` — arquitectura original (basada en Supabase; usar solo como referencia de dominio, NO como decisión de backend).
- `documentacion/03-backlog-y-criterios/backlog-estructurado.md` — 14 épicas / 73 historias.
- `documentacion/03-backlog-y-criterios/criterios-aceptacion-mvp.md` — criterios verificables.
- `documentacion/04-plan-y-riesgos/` — cronograma, riesgos, calidad y operaciones.
- `documentacion/06-journals/` — decisiones y problemas resueltos de fases 1 y 2.
