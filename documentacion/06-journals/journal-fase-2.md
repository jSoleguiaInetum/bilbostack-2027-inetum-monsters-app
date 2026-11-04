# BilboStack 2027 — Fase 2: Interacción Social

Continuación del desarrollo documentado en `Bilbostack-development-journal.md` (Fase 1 MVP).

---

## 1. Alcance de la Fase 2

Según el plan de ejecución (`plan/Claude-plan/C-plan-ejecucion.md`), la Fase 2 cubre **Interacción Social**: los usuarios pueden combatir, añadir contactos con métricas, desbloquear logros, hacer check-in de charlas y ver evolucionar a su criatura.

### Stories implementadas

| # | Story | Estado |
|---|---|---|
| 11 | Sistema de métricas (Expertise + Aura Tech) | ✅ |
| 12 | Página de contactos con lista completa | ✅ |
| 13 | Sistema de evolución visual del monstruo | ✅ |
| 14 | Banco de preguntas mock (~52 preguntas) | ✅ |
| 15 | Sistema de combate completo | ✅ |
| 16 | Sistema de logros (12 logros) | ✅ |
| 17 | QR de charlas + check-in | ✅ |

---

## 2. Sistema de métricas

**Archivos:** `src/lib/metrics.ts`, `src/lib/MetricsProvider.tsx`, `src/components/MetricsDisplay.tsx`

### Diseño

Dos métricas principales persisten en localStorage por usuario:

- **Expertise (⚡)** — Sube con respuestas correctas y victorias en combate.
- **Aura Tech (✨)** — Sube con contactos, diversidad de arquetipos, check-ins de charlas y logros.

### Tabla de recompensas

| Acción | Expertise | Aura Tech |
|---|---|---|
| Registro | +1 | +1 (+ bonus por rareza) |
| Añadir contacto | +0 | +2 |
| Contacto de arquetipo distinto | +0 | +3 (adicional) |
| Victoria en combate | +5 | +3 |
| Derrota en combate | +2 | +1 |
| Empate en combate | +3 | +2 |
| Check-in de charla | +0 | +5 |
| Logro desbloqueado | +0 | +2 |
| Respuesta correcta (combate) | +3 | +0 |
| Respuesta incorrecta (combate) | +1 | +0 |

### Bonus de rareza inicial (Aura Tech)

| Rareza | Bonus |
|---|---|
| Inusual | +0 |
| Singular | +1 |
| Único | +2 |
| Épico | +4 |
| Legendario | +8 |

### MetricsProvider

Contexto React (`MetricsProvider`) envuelve toda la app dentro de `AuthProvider`. Expone:

- `metrics` — Estado reactivo de las métricas del usuario actual.
- `addMetricsReward(action, contactArchetype?)` — Añade recompensa y actualiza estado.
- `refreshMetrics()` — Recarga desde localStorage.

El provider también integra el **chequeo automático de logros**: tras cada cambio de métricas, evalúa si se han desbloqueado nuevos logros y muestra un toast animado.

### Inicialización

Al registrarse (`RegisterPage.tsx`), se llama a `initPlayerMetrics(userId, rarityName)` que crea las métricas iniciales con bonus de rareza.

---

## 3. Página de contactos

**Archivo:** `src/pages/ContactsPage.tsx`

- Lista de contactos con monstruo miniatura (48px `MonsterCard`), nombre, arquetipo e icono de origen.
- Iconos de origen: 🤝 contacto directo, ⚔️👑 combate ganado, ⚔️💀 perdido, ⚔️🤗 empate.
- Estado vacío con CTA para escanear QR.
- Click en un contacto navega a `/user/:id`.
- Tab de contactos habilitado en el nav bottom (antes estaba deshabilitado con badge "pronto").

### Cambios en Layout

- Nav bottom ampliado a 4 tabs: Criatura, Escanear, Contactos, Logros.
- Eliminado el sistema de tabs `disabled` — todos los tabs son funcionales.

---

## 4. Sistema de evolución

**Archivos:** `src/lib/evolution.ts`, `src/components/EvolutionProgress.tsx`

### Umbrales

La evolución del monstruo (0→3) se determina por la suma de Expertise + Aura Tech:

| Estadio | Total requerido | Label |
|---|---|---|
| 0 (Base) | 0 | Base |
| 1 | 20 | Evolución I |
| 2 | 60 | Evolución II |
| 3 | 120 | Evolución III |

### Integración visual

- `MyMonsterPage` usa `getEvolutionStage(metrics)` para determinar la evolución actual.
- `MonsterCard` recibe la evolución y carga el body SVG correspondiente (`body-XX-evo-N.svg`).
- `EvolutionProgress` muestra una barra de progreso gradient (secondary → accent) con los puntos actuales vs el siguiente umbral.
- Al alcanzar la evolución máxima, muestra "🏆 Evolución III — Evolución máxima alcanzada".

---

## 5. Banco de preguntas

**Archivo:** `src/lib/questions.ts`

~52 preguntas de opción múltiple organizadas por categoría:

| Categoría | Cantidad | Ejemplo |
|---|---|---|
| Developer | 6 | "¿Qué patrón de diseño usa un objeto para crear otros?" |
| UX | 6 | "¿Qué ley de UX dice que los usuarios pasan más tiempo en otros sitios?" |
| DevOps | 6 | "¿Qué orquestador de contenedores es el estándar de facto?" |
| QA | 6 | "¿Qué tipo de testing verifica que funcionalidad antigua sigue funcionando?" |
| Product | 6 | "¿Qué framework prioriza features por valor vs esfuerzo?" |
| Management | 6 | "¿Qué ceremonia Scrum revisa cómo mejorar el proceso?" |
| IA | 6 | "¿Qué arquitectura de red neuronal revolucionó el NLP en 2017?" |
| Universal | 6 | Preguntas de cultura tech general |
| Crossover | 4 | Preguntas interdisciplinares |

### Selección para combate

`selectBattleQuestions(playerArchetype, opponentArchetype)` selecciona 3 rondas:
- Si ambos jugadores comparten arquetipo → preguntas universales (misma pregunta para ambos).
- Si son de distinto arquetipo → cada jugador recibe una pregunta de su propio arquetipo.
- Se evitan repeticiones usando un set de IDs ya usados.

---

## 6. Sistema de combate

**Archivos:** `src/lib/battle.ts`, `src/pages/BattlePage.tsx`

### Motor de combate (`battle.ts`)

- **Rondas**: Mejor de 3. Cada ronda compara acierto (acierto > fallo) y velocidad (a igualdad).
- **Simulación de oponente**: El oponente "responde" con lógica simulada basada en la dificultad de la pregunta (75% acierto en fácil, 55% media, 35% difícil) y tiempo aleatorio (2-8s).
- **Restricción**: Solo se puede combatir una vez contra cada jugador (`hasAlreadyFought`).
- **Historial**: Los combates se guardan en localStorage con resultado, rondas y timestamps.
- **Auto-contacto**: Al combatir, el oponente se añade automáticamente como contacto.

### Flujo UI (`BattlePage.tsx`)

4 fases:

1. **Intro** — Pantalla "VS" con ambos monstruos, nombres y arquetipos. Botón "Empezar".
2. **Pregunta** — Timer de 10s con cuenta atrás visual (se pone rojo y pulsa bajo 3s). 4 opciones de respuesta. Feedback visual al seleccionar (verde correcto, rojo incorrecto). Timeout = respuesta incorrecta.
3. **Resultado de ronda** — Muestra quién ganó la ronda con tiempos de ambos.
4. **Final** — Resultado global (🏆 Victoria / 💀 Derrota / 🤝 Empate), resumen de rondas y recompensas obtenidas.

### Integración

- **UserCardPage**: El botón "Pelear" (antes deshabilitado con "Próximamente") ahora navega a `/battle/:id` con los datos del oponente.
- **Métricas**: Se otorgan recompensas por cada respuesta (correcta/incorrecta) y por el resultado del combate.

---

## 7. Sistema de logros

**Archivos:** `src/lib/achievements.ts`, `src/pages/AchievementsPage.tsx`, `src/components/AchievementToast.tsx`

### 12 logros definidos

| ID | Nombre | Condición | Oculto |
|---|---|---|---|
| first-contact | Primer contacto | 1 contacto | No |
| networker | Networker | 5 contactos | No |
| social-butterfly | Social Butterfly | 15 contactos | No |
| first-blood | First Blood | 1 victoria | No |
| gladiator | Gladiador | 5 victorias | No |
| battle-veteran | Veterano | 10 combates | No |
| diverse-network | Red Diversa | 4 arquetipos distintos | No |
| all-archetypes | Coleccionista | 8 arquetipos | Sí |
| expert | Experto | 50 Expertise | No |
| aura-master | Maestro del Aura | 50 Aura Tech | No |
| evolved | Evolución | Total ≥ 20 | No |
| max-evolution | Forma Final | Total ≥ 120 | Sí |

### Evaluación automática

`checkAchievements(userId, metrics)` se invoca automáticamente desde `MetricsProvider` tras cada cambio de métricas. Construye un contexto (`AchievementContext`) con:
- Métricas actuales
- Número de contactos
- Número de combates y victorias
- Arquetipos únicos contactados

Los logros recién desbloqueados se encolan y se muestran como toasts animados (`AchievementToast`) con slide-in/out de 3s.

### Pantalla de logros

- Logros visibles: desbloqueados (con detalle completo + ✓) y pendientes (con icono 🔒 y descripción).
- Logros ocultos: solo aparecen al desbloquearse.
- Contador de progreso (X/12).
- Resumen de stats: contactos, combates, victorias.

---

## 8. QR de charlas + check-in

**Archivos:** `src/qr/types.ts`, `src/qr/qr-codec.ts`, `src/lib/checkins.ts`, `src/pages/TalkCheckInPage.tsx`

### Tipos de QR

Se extendió `QRPayload` a un union type discriminado:

```typescript
type QRPayload = PersonPayload | TalkPayload

interface TalkPayload {
  type: 'talk'
  talkId: string
  title: string
  speaker: string
}
```

### Flujo

1. Escanear QR → `ScanPage` discrimina por `payload.type`.
2. Si es `'person'` → flujo existente (UserCardPage).
3. Si es `'talk'` → navega a `/talk-checkin` con los datos de la charla.
4. `TalkCheckInPage` muestra título y speaker. Botón "Hacer check-in" otorga +5 Aura Tech.
5. Si ya tiene check-in, muestra "Ya tienes check-in" (no se puede repetir).

---

## 9. Cambios en archivos existentes

| Archivo | Cambios |
|---|---|
| `App.tsx` | +MetricsProvider wrapper, +4 rutas (contacts, battle, achievements, talk-checkin), +imports |
| `MyMonsterPage.tsx` | +MetricsDisplay, +EvolutionProgress, evolución dinámica del MonsterCard |
| `UserCardPage.tsx` | Botón "Pelear" funcional → navega a BattlePage. +recompensa de métricas al conectar |
| `ScanPage.tsx` | Discrimina QR person vs talk, redirige al flujo correcto |
| `RegisterPage.tsx` | Inicializa métricas al registrarse (initPlayerMetrics) |
| `Layout.tsx` | Nav 4 tabs, eliminado sistema disabled |
| `qr/types.ts` | Union type PersonPayload + TalkPayload |
| `qr/qr-codec.ts` | Decode soporta ambos tipos de QR |

---

## 10. Archivos nuevos creados

```
src/
├── lib/
│   ├── metrics.ts              Store de métricas (localStorage)
│   ├── MetricsProvider.tsx     Context + chequeo automático de logros + toast
│   ├── evolution.ts            Umbrales y cálculo de evolución
│   ├── questions.ts            Banco de ~52 preguntas por arquetipo
│   ├── battle.ts               Motor de combate + historial
│   ├── achievements.ts         12 logros con condiciones automáticas
│   └── checkins.ts             Store de check-ins de charlas
├── components/
│   ├── MetricsDisplay.tsx      Expertise + Aura Tech (normal y compact)
│   ├── EvolutionProgress.tsx   Barra de progreso hacia siguiente evolución
│   └── AchievementToast.tsx    Notificación animada de logro desbloqueado
└── pages/
    ├── ContactsPage.tsx        Lista de contactos con monstruo mini
    ├── BattlePage.tsx           Flujo de combate completo (4 fases)
    ├── AchievementsPage.tsx     Pantalla de logros
    └── TalkCheckInPage.tsx      Check-in de charla
```

---

## 11. Rutas de la aplicación

| Ruta | Página | Auth | Layout |
|---|---|---|---|
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/my-monster` | MyMonsterPage | Sí | Sí |
| `/scan` | ScanPage | Sí | Sí |
| `/user/:id` | UserCardPage | Sí | Sí |
| `/contacts` | ContactsPage | Sí | Sí |
| `/achievements` | AchievementsPage | Sí | Sí |
| `/battle/:id` | BattlePage | Sí | No |
| `/talk-checkin` | TalkCheckInPage | Sí | No |

---

## 12. Verificación técnica

- **TypeScript**: Compila limpio con `tsc --noEmit` — 0 errores.
- **Build de producción**: `vite build` exitoso (181 módulos, 704KB JS + 92KB CSS).
- **Warning**: Chunk size >500KB (incluye html5-qrcode ~200KB) — aceptable, optimizable con code splitting si se requiere.

---

## 13. Pendiente para Fase 2 polish (Story 19)

- [x] Code splitting para BattlePage, ScanPage y páginas secundarias (lazy loading)
- [x] Animación de evolución cuando el monstruo cambia de estadio
- [x] Seed de datos de ejemplo (charlas para QR de tipo talk)
- [x] Responsive check en 375px para las nuevas páginas
- [ ] Verificación visual en navegador (flujo completo E2E)

---

## 14. Ajustes de UI — Menú inferior

Cambios en `src/components/Layout.tsx` para mejorar la legibilidad del nav bottom con 4 tabs:

- **Iconos**: Aumentados a `text-xl` para mayor visibilidad táctil.
- **Labels**: Reducidos a `text-[7px]` para que los 4 tabs quepan sin overflow en pantallas de 375px.
- **Espaciado**: `gap-4` entre icono y label para separación visual clara.
- **Renombrado**: Tab "Escanear" → "QR" (más corto, mejor fit en el nav).

---

## 15. Polish — Code splitting (React.lazy)

**Archivo:** `src/App.tsx`

5 páginas convertidas a lazy loading con `React.lazy` + `Suspense`:

| Chunk | Tamaño | Contenido |
|---|---|---|
| `index` (main) | 304 KB | Core app, auth, MyMonsterPage, UserCardPage |
| `ScanPage` | 372 KB | html5-qrcode + escáner |
| `BattlePage` | 18 KB | Motor de combate + UI |
| `ContactsPage` | 2.6 KB | Lista de contactos |
| `TalkCheckInPage` | 2.1 KB | Check-in de charlas |
| `AchievementsPage` | 2.0 KB | Pantalla de logros |
| `DevSeedPage` | 1.8 KB | QR seed para testing |

**Resultado**: Chunk principal reducido de 704 KB → 304 KB (**57% de reducción**). La librería html5-qrcode (~200KB) solo se carga al entrar en la pestaña QR.

Componente `LazyFallback` con `Spinner` centralizado como fallback de Suspense.

---

## 16. Polish — Animación de evolución

**Archivos:** `src/monster/MonsterCard.tsx`, `src/pages/MyMonsterPage.tsx`

### MonsterCard

Detecta cambios en la prop `evolution` usando un `useRef` para trackear el valor previo. Cuando la evolución sube:

- **Ping radial**: Gradient animado (amarillo → rosa → transparente) con `animate-ping` durante 1.2s.
- **Bounce**: Las capas del monstruo hacen `animate-bounce` simultáneamente.

### MyMonsterPage

Banner de celebración que aparece 4s al evolucionar:

- Estilo SNES blockquote seleccionado con `animate-bounce`.
- Muestra "✨ ¡EVOLUCIÓN!" + nombre del estadio alcanzado.
- Se auto-oculta con `setTimeout`.

---

## 17. Polish — Seed de charlas

**Archivos:** `src/lib/seed-talks.ts`, `src/pages/DevSeedPage.tsx`

### Datos de charlas

8 charlas de ejemplo con títulos y speakers ficticios relevantes para BilboStack:

1. El futuro de WebAssembly en el edge
2. De monolito a microservicios sin morir en el intento
3. IA generativa en producción: lecciones aprendidas
4. Accesibilidad web: más allá del checklist
5. Platform Engineering: empoderando equipos de desarrollo
6. Observabilidad distribuida con OpenTelemetry
7. Diseño de sistemas resilientes en la nube
8. Testing en el mundo real: estrategias que funcionan

### Página DevSeed (`/dev-seed`)

Ruta pública (sin auth) que muestra los 8 QR de charlas en grid 2×4. Cada QR se puede escanear con la app para probar el flujo de check-in.

Accesible en `/dev-seed` — no aparece en el nav (herramienta de desarrollo).

---

## 18. Polish — Responsive 375px

**Archivo:** `src/pages/BattlePage.tsx`

Ajustes para evitar overflow en pantallas pequeñas:

- **Padding reducido**: `px-6 py-8` → `px-4 py-6` en la vista de pregunta.
- **Margins reducidos**: `mb-6` → `mb-4` entre secciones.
- **Text options**: `text-sm` → `text-xs` con `leading-relaxed` para mejor wrap.
- **Gap entre opciones**: `gap-3` → `gap-2` para que quepan 4 opciones sin scroll.
- **break-words** en el texto de preguntas para evitar overflow horizontal.

---

## 19. Verificación final

- **TypeScript**: `tsc --noEmit` — 0 errores.
- **Build**: `vite build` — 184 módulos, 8 chunks, 1.54s.
- **Chunk principal**: 304 KB (gzip: 97 KB).

### Rutas actualizadas

| Ruta | Página | Auth | Lazy |
|---|---|---|---|
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/my-monster` | MyMonsterPage | Sí | No |
| `/scan` | ScanPage | Sí | ✅ |
| `/user/:id` | UserCardPage | Sí | No |
| `/contacts` | ContactsPage | Sí | ✅ |
| `/battle/:id` | BattlePage | Sí | ✅ |
| `/achievements` | AchievementsPage | Sí | ✅ |
| `/talk-checkin` | TalkCheckInPage | Sí | ✅ |
| `/dev-seed` | DevSeedPage | No | ✅ |

**Estado: Fase 2 polish completado. Pendiente únicamente verificación visual E2E en navegador.**
