# E. Estrategia de Calidad y Operaciones

## E.1 QA — Estrategia de Testing

### Pirámide de testing

```
         ╱  E2E  ╲            ~10% de tests
        ╱──────────╲
       ╱ Integración╲         ~25% de tests
      ╱──────────────╲
     ╱   Unitarios    ╲       ~65% de tests
    ╱──────────────────╲
```

### Tipos de testing y herramientas

| Tipo | Herramienta | Alcance | Frecuencia |
|---|---|---|---|
| Unitario | Vitest (frontend), Deno test (Edge Functions) | Lógica de negocio, utilidades, generación de monstruos, cálculo de métricas | Cada commit (CI) |
| Integración | Supabase CLI (local) + fetch directo a Edge Functions | Flujos de combate, sistema de QR, evoluciones, triggers PL/pgSQL | Cada PR |
| E2E | Playwright | Flujos completos: registro → combate → evolución, escaneo QR, rankings | Nightly + pre-deploy |
| Visual regression | Playwright screenshots + Percy | Pantallas clave: monstruo, combate, tarjetas compartibles | Cada PR con cambios UI |
| Load / performance | k6 (Grafana) | Concurrencia día del evento, picos de combates, escaneos QR simultáneos | Semanal en staging + ensayo general |
| Chaos | Scripts manuales | Desconexión Supabase Realtime mid-combate, latencia de DB, Edge Function timeout | Ensayo general (2 sesiones) |
| Seguridad | OWASP ZAP (DAST), npm audit (SCA) | Vulnerabilidades web, dependencias, inyección en QR | Semanal + pre-release |
| Accesibilidad | axe-core + Lighthouse | Cumplimiento WCAG 2.1 AA en pantallas principales | Cada sprint |

### Cobertura mínima por módulo

| Módulo | Cobertura unit | Cobertura integración | Justificación |
|---|---|---|---|
| Generación de monstruos | 95% | 80% | Algoritmo determinista crítico — un bug genera monstruos duplicados |
| Sistema de combate | 90% | 85% | Flujo en tiempo real, errores visibles inmediatamente por 2 usuarios |
| Cálculo de métricas (Expertise/Aura Tech) | 95% | 75% | Afecta rankings y evoluciones — errores rompen la experiencia |
| Sistema de evolución | 90% | 80% | Debe ser determinista y justo |
| Autenticación (Supabase Auth) | 85% | 90% | Seguridad; fallos = accesos no autorizados |
| Sistema QR | 80% | 85% | Variabilidad de dispositivos/cámaras; integración crítica |
| Rankings | 80% | 75% | Consultas pesadas, visibilidad pública |
| Contactos/Logros | 75% | 70% | Menos críticos, lógica más simple |
| Dashboard admin | 70% | 60% | Usuarios internos, menor riesgo |
| Database Triggers (PL/pgSQL) | 90% | 85% | Lógica encadenada (métricas → evolución → logros); errores en cascada |

**Cobertura global mínima: 80% unitaria, 70% integración.**

### Plan de testing pre-evento

#### T-30 días: Testing de carga con datos sintéticos

**[HIPÓTESIS: 800-1000 asistentes esperados]** — se dimensiona para picos de 200 usuarios concurrentes (límite Supabase Realtime free tier).

| Escenario | Usuarios simulados | Duración | Métrica objetivo |
|---|---|---|---|
| Registro masivo (apertura puertas) | 400 concurrentes en 10 min | 15 min | p95 < 2s, 0 errores |
| Pico de combates (descanso entre charlas) | 100 combates simultáneos (200 conexiones Realtime) | 10 min | p95 < 500ms por pregunta, 0 desincronización |
| Escaneo QR masivo | 300 scans/minuto | 5 min | p95 < 1s, 0 QR inválidos aceptados |
| Rankings en directo | 600 lectores + 50 escrituras/s | 5 min | p95 < 1s, datos consistentes |
| Supabase Realtime saturación | 200+ conexiones concurrentes | 10 min | Cola de espera funciona, 0 errores 500 |

#### T-14 días: Ensayo general (dress rehearsal)

- **Participantes:** 15-20 personas del equipo Inetum + voluntarios
- **Duración:** 2 horas simulando evento comprimido
- **Checklist:**
  1. Registro completo con email real (Supabase Auth Magic Link)
  2. Verificar unicidad de monstruos generados
  3. Escanear QR con mínimo 5 dispositivos distintos (iOS Safari, Android Chrome, Android Firefox)
  4. Completar 3+ combates por persona (verificar que cada jugador recibe preguntas de su arquetipo)
  5. Verificar evolución tras alcanzar umbrales
  6. Verificar auto-adición de contacto al combatir e iconos de origen (🤝/⚔️👑/⚔️💀/⚔️🤗)
  7. Generar tarjeta compartible y verificar en LinkedIn (branding Inetum + BilboStack)
  8. Probar dashboard admin: crear logro, asignar objeto, ver estadísticas
  9. Simular desconexión Supabase Realtime mid-combate → verificar resolución por timeout
  10. Verificar rankings en dashboard público
  11. Verificar logros visibles (pendientes con pista) y ocultos (revelados al desbloquearse)

#### T-7 días: Smoke testing final

- Deploy a producción con app desactivada para usuarios
- Smoke test de todas las Edge Functions críticas
- Verificar certificados SSL (Vercel + Supabase gestionan automáticamente)
- Confirmar que los QR pre-impresos (charlas, NPCs, misiones) resuelven correctamente

### Testing específico de combates en tiempo real

| Caso de test | Descripción | Criterio de éxito |
|---|---|---|
| Happy path | Dos usuarios completan combate de 3 rondas, cada uno respondiendo preguntas de su arquetipo | Resultado correcto, métricas actualizadas, contacto auto-añadido, < 60s |
| Desconexión mid-combate | Un usuario pierde presencia en Supabase Realtime en pregunta 2 | Timeout 15s → derrota por abandono, oponente recibe victoria |
| Combate duplicado | Mismos usuarios intentan combatir de nuevo | Bloqueo con mensaje claro: "Ya habéis combatido" |
| Empate | Ambos aciertan las mismas rondas con mismo tiempo | Muerte súbita con pregunta crossover (misma para ambos) |
| Ronda nula | Ambos jugadores fallan su pregunta en la misma ronda | Ronda no cuenta, se juega 1 ronda adicional |
| Latencia asimétrica | Un usuario con 3G, otro con WiFi | Timestamps de respuesta registrados por la Edge Function, no client-side |
| Combate + cierre sesión | Usuario cierra app durante combate | Mismo que desconexión: Supabase Presence detecta ausencia → timeout → derrota |
| Concurrencia extrema | 100 combates iniciados en el mismo segundo (200 conexiones Realtime) | Todos se resuelven sin deadlocks ni preguntas repetidas |
| Límite Realtime alcanzado | >200 conexiones Realtime concurrentes | Cola de espera activa, nuevos combates esperan con countdown visual |
| Iconos de contacto | Tras combate, verificar lista de contactos del ganador y perdedor | Ganador ve ⚔️👑, perdedor ve ⚔️💀 junto al contacto |

### Testing específico de QR

| Caso de test | Descripción | Criterio de éxito |
|---|---|---|
| QR persona válido | Escaneo de QR de otro participante | Muestra opciones: Combatir (+ contacto automático) / Añadir contacto (solo contacto) |
| QR persona propio | Usuario escanea su propio QR | Mensaje de error amigable, no crash |
| QR charla | Escaneo de QR colocado en sala | +Aura Tech, registro de asistencia, logro si aplica |
| QR manipulado | QR con payload alterado (HMAC inválido) | Rechazo con error genérico (no revelar estructura interna) |
| QR caducado/inválido | QR de evento pasado o inexistente | Error claro: "QR no reconocido" |
| Cámara sin permiso | Usuario deniega acceso a cámara | Mensaje explicativo con instrucciones para habilitar |
| Baja luminosidad | QR escaneado en sala oscura (ponencias) | Activar linterna automáticamente si disponible |
| Doble escaneo rápido | Mismo QR escaneado 2 veces en < 2s | Deduplicación: procesa solo el primero |

---

## E.2 DevOps — CI/CD y Despliegue

### Entornos

| Entorno | Propósito | Infraestructura | Datos |
|---|---|---|---|
| `local` | Desarrollo individual | `supabase start` (PostgreSQL + Auth + Realtime + Storage local) + `npm run dev` (Vite) | Seed con datos de prueba (50 usuarios ficticios) via `supabase/seed.sql` |
| `staging` | Pre-producción, testing de carga | Proyecto Supabase separado (free tier) + Vercel Preview | Seed automático en cada deploy via migraciones |
| `prod` | Evento en vivo | Proyecto Supabase producción + Vercel producción | Datos reales. Supabase incluye backups automáticos diarios (free tier: 7 días retención) |

**Coste total infraestructura: €0/mes** — Supabase free tier + Vercel free tier + GitHub Actions free.

**[HIPÓTESIS: Se usan 2 proyectos Supabase gratuitos: uno para staging y otro para producción. Supabase permite múltiples proyectos en el free tier (límite: 2 activos).]**

### Pipeline CI/CD

```
┌──────────────────────────────────────────────────────────────────────┐
│                        GitHub Actions Pipeline                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PR abierto / push a rama:                                          │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐            │
│  │  Lint   │→│  Build   │→│  Unit    │→│  Integr.  │            │
│  │ ESLint  │  │ Vite +   │  │ Vitest + │  │ Supabase  │            │
│  │Prettier │  │ tsc      │  │ Deno test│  │ CLI local │            │
│  └─────────┘  └──────────┘  └──────────┘  └───────────┘            │
│                                                    │                 │
│  Merge a main:                                     ▼                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐         │
│  │ Security │→│  Deploy  │→│  Deploy  │→│ Smoke test  │         │
│  │ npm audit│  │ Supabase │  │  Vercel  │  │  Playwright │         │
│  │ ZAP scan │  │ staging  │  │ preview  │  │  (5 flows)  │         │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────┘         │
│                                                    │                 │
│  Tag release (manual):                             ▼                 │
│  ┌───────────────────┐  ┌──────────┐  ┌───────────────────────┐     │
│  │ Deploy prod       │→│  Smoke   │→│ Notificación Slack   │     │
│  │ supabase db push  │  │  E2E    │  │ + rollback manual si  │     │
│  │ supabase functions│  │          │  │   falla smoke test    │     │
│  │ deploy            │  │          │  │                       │     │
│  └───────────────────┘  └──────────┘  └───────────────────────┘     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Comandos clave del pipeline

```bash
# CI — Tests
supabase start                          # Levanta Supabase local (PostgreSQL, Auth, Realtime, Storage)
supabase db reset                       # Aplica migraciones + seed en local
npx vitest run                          # Tests unitarios frontend
deno test supabase/functions/           # Tests unitarios Edge Functions
npx playwright test                     # Tests E2E

# CD — Deploy a staging
supabase link --project-ref <staging>   # Conectar al proyecto staging
supabase db push                        # Aplicar migraciones pendientes
supabase functions deploy               # Deploy de todas las Edge Functions
# Vercel: auto-deploy vía GitHub integration (preview en cada PR, staging en merge a main)

# CD — Deploy a producción
supabase link --project-ref <prod>      # Conectar al proyecto producción
supabase db push                        # Aplicar migraciones
supabase functions deploy               # Deploy Edge Functions
# Vercel: promote preview → production (o auto-deploy en merge a main)
```

**Tiempos objetivo del pipeline:**

| Stage | Tiempo máximo |
|---|---|
| Lint + Build | 2 min |
| Tests unitarios | 3 min |
| Tests integración (Supabase local) | 5 min |
| Deploy Supabase (migraciones + functions) | 2 min |
| Deploy Vercel | 1 min |
| Smoke tests | 3 min |
| **Total PR** | **< 10 min** |
| **Total deploy producción** | **< 12 min** |

### Estrategia de despliegue — Día del evento

**Vercel Instant Rollback + Supabase Function Versioning:**

```
                    Día del evento
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌────────────┐     ┌──────────┐      ┌────────────┐
│  Vercel    │     │ Supabase │      │  Versión   │
│  PROD      │     │   PROD   │      │  anterior  │
│  (activo)  │     │ (activo) │      │  (Vercel   │
│  v1.2.0    │     │          │      │  rollback) │
└────────────┘     └──────────┘      └────────────┘
```

- **T-1h antes del evento:** Verificar que producción responde correctamente (smoke test manual)
- **Durante el evento:** Producción sirve tráfico. Solo se actúa por incidencia crítica
- **Rollback frontend:** Vercel permite rollback instantáneo a cualquier deployment anterior (< 10s, un clic en dashboard)
- **Rollback Edge Functions:** `supabase functions deploy --version <previous>` o re-deploy del commit anterior
- **Rollback migraciones DB:** Las migraciones SQL no se revierten automáticamente. Para el día del evento, las migraciones ya deben estar aplicadas con antelación (T-7 días)
- **Regla de oro:** NO SE DESPLIEGA DURANTE EL EVENTO salvo incidencia P0

### Configuración como código

```
bilbostack-2027/
├── supabase/
│   ├── config.toml                # Configuración local de Supabase (auth, storage, etc.)
│   ├── migrations/                # Migraciones SQL versionadas
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_triggers.sql
│   │   └── 004_seed_questions.sql
│   ├── functions/                 # Edge Functions (Deno/TypeScript)
│   │   ├── battle-engine/
│   │   ├── monster-generator/
│   │   ├── evolution-check/
│   │   ├── qr-sign/
│   │   ├── qr-resolve/
│   │   └── ...
│   └── seed.sql                   # Datos iniciales para dev/staging
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint + build + test en cada PR
│       ├── deploy-staging.yml     # Deploy a Supabase staging + Vercel preview
│       └── deploy-prod.yml        # Deploy a Supabase prod + Vercel prod (manual trigger)
├── vercel.json                    # Config Vercel (headers, redirects, rewrites)
└── .env.local.example             # Variables de entorno locales (Supabase URL, anon key)
```

---

## E.3 Observabilidad

### Stack de observabilidad

**Enfoque: Aprovechar dashboards nativos de Supabase + Vercel (coste €0)**

| Capa | Herramienta | Propósito |
|---|---|---|
| Logs Edge Functions | Supabase Dashboard → Logs | Logs de ejecución de Edge Functions (stdout/stderr), filtrados por función |
| Logs PostgreSQL | Supabase Dashboard → Logs → PostgreSQL | Queries lentas, errores de triggers, conexiones |
| Métricas de uso | Supabase Dashboard → Reports | Conexiones Realtime, invocaciones Edge Functions, tamaño DB, storage |
| Métricas frontend | Vercel Analytics (free) | Core Web Vitals, tiempos de carga, errores JS |
| Alertas de uso | Supabase email alerts + GitHub Actions cron | Notificación cuando se acerca a límites del free tier |
| Uptime | GitHub Actions cron (cada 5 min) | Health check básico al endpoint de Supabase y Vercel |
| Dashboard de negocio | Dashboard admin (pantalla del MVP) | Estadísticas del evento en tiempo real |

### Logging strategy

```
Edge Functions (Deno):
  → console.log() / console.error()
  → Visibles en Supabase Dashboard → Edge Function Logs
  → Retención: 1 hora en free tier (suficiente para debugging en el evento)

PostgreSQL:
  → Logs de queries via pg_stat_statements
  → Visibles en Supabase Dashboard → Database → Logs
  → Slow query threshold: 1000ms

Frontend (Vite + React):
  → Errores capturados con window.onerror + Error Boundary
  → Vercel Analytics para métricas de rendimiento
```

**Estructura de logs en Edge Functions:**

```typescript
console.log(JSON.stringify({
  action: "battle.complete",
  userId: "usr_xxx",
  battleId: "btl_yyy",
  winnerId: "usr_xxx",
  rounds: 3,
  duration_ms: 45200,
  ts: new Date().toISOString()
}));
```

**Reglas de PII:**
- Nunca loggear email, nombre completo ni tokens JWT completos
- `userId` es un ID opaco (UUID), no el email
- Logs de combate registran IDs, no nombres

### Métricas clave del día del evento

#### Panel 1: Salud técnica (equipo Inetum — ops)

| Métrica | Fuente | Alerta si |
|---|---|---|
| Edge Function invocations/hora | Supabase Dashboard → Reports | > 40.000/hora (≈500K/mes se agotaría en ~12h) |
| Edge Function error rate | Supabase Dashboard → Logs | > 1% durante 2 min |
| Edge Function p95 latency | Supabase Dashboard → Logs (manual) | > 2s durante 3 min |
| Supabase Realtime connections | Supabase Dashboard → Realtime Inspector | > 180 (límite: 200) |
| PostgreSQL DB size | Supabase Dashboard → Database → Settings | > 400MB (límite: 500MB) |
| Supabase Storage usage | Supabase Dashboard → Storage | > 800MB (límite: 1GB) |
| Vercel bandwidth | Vercel Dashboard → Usage | > 80GB (límite: 100GB/mes) |
| Frontend error rate | Vercel Analytics | > 5% error rate JS |

#### Panel 2: Métricas de negocio (equipo Inetum + organización BilboStack)

| Métrica | Query SQL directa | Refresco |
|---|---|---|
| Usuarios registrados (acumulado) | `SELECT count(*) FROM auth.users` | 30s |
| Usuarios activos (última hora) | `SELECT count(*) FROM users WHERE updated_at > now() - interval '1h'` | 30s |
| Combates en curso | `SELECT count(*) FROM battles WHERE status = 'InProgress'` | 15s |
| Combates completados | `SELECT count(*) FROM battles WHERE status = 'Completed'` | 30s |
| QR escaneados total | `SELECT count(*) FROM qr_scans` | 30s |
| Contactos generados | `SELECT count(*) FROM contacts` | 30s |
| Logros desbloqueados | `SELECT count(*) FROM user_achievements` | 30s |
| Evoluciones ocurridas | `SELECT count(*) FROM evolutions` | 30s |
| Top 5 por Expertise | `SELECT name, expertise FROM users ORDER BY expertise DESC LIMIT 5` | 1 min |
| Top 5 por Aura Tech | `SELECT name, aura_tech FROM users ORDER BY aura_tech DESC LIMIT 5` | 1 min |
| Distribución por arquetipo | `SELECT archetype, count(*) FROM users GROUP BY archetype` | 5 min |

Estas queries se ejecutan desde el **Dashboard admin** (pantalla del MVP), no desde herramientas externas.

#### Panel 3: Dashboard público (proyectable en pantallas del evento)

- Rankings top 10 animados (actualización cada 60s)
- Contador de combates totales
- Evoluciones recientes (últimas 5)
- Mapa de calor de actividad por hora

### Alertas — Día del evento

**Supabase free tier envía alertas por email al acercarse a límites de uso.** Para alertas más activas:

**GitHub Actions cron job** (cada 5 minutos) que:
1. Llama a la API de Supabase para verificar estado del proyecto
2. Consulta métricas clave (conexiones Realtime, invocaciones, DB size)
3. Envía notificación a Slack si algún umbral se supera

| Alerta | Severidad | Canal | Acción |
|---|---|---|---|
| Edge Functions no responden (health check falla 3x) | P0 - Crítica | Slack #bilbostack-ops + email | Verificar Supabase status page → redeploy functions |
| Realtime connections > 180 | P1 - Alta | Slack #bilbostack-ops | Activar cola de espera para combates (ya implementada) |
| Edge Function error rate > 5% | P1 - Alta | Slack #bilbostack-ops | Revisar logs en Supabase Dashboard |
| DB size > 400MB | P2 - Media | Slack #bilbostack-ops | Evaluar upgrade a Supabase Pro ($25/mes) |
| 0 combates en últimos 15 min (si evento activo) | P2 - Media | Slack #bilbostack-ops | Verificar Supabase Realtime en dashboard |
| Edge Function invocations > 400K/mes | P2 - Media | Slack #bilbostack-ops | Evaluar upgrade a Supabase Pro |
| Vercel: frontend no carga | P0 - Crítica | Slack #bilbostack-ops | Rollback instantáneo en Vercel dashboard |

### Runbook de incidencias — Día del evento

#### P0: App no carga (frontend)

```
1. Verificar Vercel Dashboard → ¿Deployment activo?
   NO → Redeploy del último commit estable
   SÍ → Paso 2
2. Verificar que el dominio resuelve correctamente (DNS)
   NO → Verificar configuración de dominio en Vercel
   SÍ → Paso 3
3. Abrir DevTools en navegador → ¿Errores JS?
   SÍ → Identificar error → Hotfix o rollback en Vercel (< 10s)
   NO → Verificar Supabase (paso siguiente)
4. Si no se identifica causa en 3 min:
   → Rollback a deployment anterior en Vercel (un clic)
   → Comunicar al equipo: "Frontend restaurado, investigando causa"
```

#### P0: Edge Functions no responden

```
1. Verificar status.supabase.com → ¿Incidencia activa?
   SÍ → No es accionable. Esperar resolución de Supabase.
        Comunicar: "Estamos experimentando problemas. Trabajando en la solución."
   NO → Paso 2
2. Verificar Supabase Dashboard → Edge Function Logs
   → Buscar: timeout, OOM, connection refused, unhandled error
3. Intentar redeploy:
   → git checkout <last-known-good-tag>
   → supabase functions deploy
4. Si no se resuelve en 5 min:
   → Comunicar: "Servicio en mantenimiento temporal"
   → Post-mortem después del evento
```

#### P1: Combates no funcionan

```
1. Verificar Supabase Dashboard → Realtime Inspector
   → ¿Conexiones activas? ¿Mensajes fluyendo?
   NO → Verificar estado de Supabase Realtime en status.supabase.com
   SÍ → Paso 2
2. Verificar Edge Function battle-engine → Logs
   → Buscar: error, timeout, deadlock
   → ¿Preguntas disponibles? (pool agotado = no hay preguntas sin usar)
3. Verificar que el trigger on_battle_answer funciona:
   → Insertar un registro de test manualmente desde Supabase SQL Editor
4. Si no se resuelve en 5 min:
   → Mensaje en app: "Los combates están temporalmente pausados"
   → Mantener resto de funcionalidades operativas (contactos, QR, logros)
```

#### P1: QR no escanean

```
1. ¿Es un dispositivo/modelo específico o generalizado?
   ESPECÍFICO → Problema de compatibilidad de cámara, no accionable en caliente
   GENERALIZADO → Paso 2
2. Verificar Edge Function qr-resolve → Logs
   → ¿Responde? ¿Devuelve datos correctos? ¿HMAC validation falla?
   NO → Verificar que QR_SECRET_KEY está configurado (supabase secrets list)
   SÍ → Paso 3
3. Verificar que los QR físicos impresos son legibles
   → Escanear manualmente con app de QR genérica
   ILEGIBLES → Problema de impresión, no de software
   LEGIBLES → Problema de parsing en la app → Hotfix en Vercel
```

### Equipo de operaciones — Día del evento

| Rol | Persona | Responsabilidad |
|---|---|---|
| Ops Lead | 1 dev senior Inetum | Monitorización Supabase + Vercel dashboards, decisión de rollback, comunicación |
| Ops Support | 1 dev Inetum | Investigación de incidencias, ejecución de runbooks, hotfixes |
| Floor Support | 1-2 personas Inetum | Soporte presencial a asistentes con problemas de QR/app |

**[HIPÓTESIS: Equipo Inetum de 3-4 personas dedicadas el día del evento para soporte técnico]**

---

## E.4 Seguridad

### Autenticación — Supabase Auth (Magic Link)

**Supabase Auth gestiona el ciclo completo de autenticación. No hay implementación manual de JWT.**

```
┌──────────┐     ┌──────────────┐     ┌──────────┐
│  Cliente │────│ Supabase Auth│────│   DB     │
│  (PWA)   │     │              │     │(PostgreSQL)│
└──────────┘     └──────────────┘     └──────────┘
     │                │
     │  1. signInWithOtp({email})
     │────────────────►│
     │                │  2. Supabase envía magic link
     │                │     al email del usuario
     │                │     (SMTP integrado, gratis)
     │                │
     │  ... usuario clica el link ...
     │                │
     │  3. Callback URL
     │────────────────►│  4. Supabase verifica token
     │                │     y establece sesión
     │  5. supabase-js│
     │  recibe tokens │
     │  automáticamente│
     │◄────────────────│
     │                │
     │  6. Requests   │
     │  supabase-js   │  7. supabase-js incluye JWT
     │  incluye JWT   │     automáticamente en headers
     │  automáticamente│     → RLS aplica en cada query
     │────────────────►│
```

| Parámetro | Valor |
|---|---|
| Método | Magic Link vía email (Supabase Auth nativo) |
| Algoritmo JWT | HS256 (gestionado por Supabase) |
| Expiración access token | 1 hora (configurable en Supabase Dashboard) |
| Expiración refresh token | 7 días (cubre evento + post-evento para compartir) |
| Almacenamiento tokens | `supabase-js` gestiona automáticamente (localStorage por defecto) |
| Rotación refresh token | Sí — gestionada automáticamente por Supabase Auth |
| Payload JWT | `{ sub: userId, role: "authenticated", aud: "authenticated", iat, exp }` |
| Roles custom | Claim `app_role` añadido via trigger `on_auth_user_created` (Participant, Admin, etc.) |
| RLS | Activada en TODAS las tablas. Policies usan `auth.uid()` y `auth.jwt()` |

### Protección de datos (GDPR/RGPD)

**[HIPÓTESIS: Asistentes mayoritariamente de España/UE, aplica RGPD]**

| Requisito RGPD | Implementación |
|---|---|
| Consentimiento explícito | Checkbox obligatorio en registro: "Acepto las condiciones de participación y el tratamiento de mis datos para la experiencia gamificada de Inetum en BilboStack 2027" |
| Finalidad limitada | Datos usados exclusivamente para la experiencia gamificada del evento |
| Minimización | Solo se recogen: nombre, email, arquetipo. No se pide empresa, cargo, teléfono |
| Derecho de acceso | Edge Function `user-data-export` — exporta todos los datos del usuario en JSON |
| Derecho de supresión | Edge Function `user-data-delete` — elimina cuenta (Supabase Auth) y anonimiza historial de combates |
| Retención | Datos eliminados automáticamente 90 días post-evento (pg_cron scheduled job) |
| Encriptación en reposo | Supabase PostgreSQL: encriptación AES-256 gestionada por AWS (Supabase corre sobre AWS) |
| Encriptación en tránsito | TLS 1.3 obligatorio — tanto Supabase como Vercel fuerzan HTTPS nativamente |
| DPA | Supabase ofrece DPA (Data Processing Agreement) disponible en su web |
| Región de datos | **[HIPÓTESIS: Proyecto Supabase creado en región EU (Frankfurt) para cumplir con residencia de datos UE]** |

**Datos que NO se comparten públicamente:**
- Email → nunca visible para otros usuarios
- Nombre real → visible solo para contactos mutuos
- En rankings y dashboard público → se muestra nombre del monstruo, no del usuario

### Rate limiting y anti-cheating

Rate limiting implementado en Edge Functions (verificando tabla `qr_scans` y timestamps) y RLS policies.

| Acción | Límite | Ventana | Respuesta al exceder |
|---|---|---|---|
| Magic Link (solicitar) | 4 emails | 1 hora por email (límite Supabase Auth) | Supabase retorna error automáticamente |
| QR scan | 30 scans | 1 min por usuario | 429 + "Espera un momento" |
| Iniciar combate | 10 combates | 10 min por usuario | 429 + "Descansa un poco" |
| Respuesta de combate | 1 respuesta | por pregunta por usuario | Edge Function ignora duplicados |
| Rankings (GET) | Sin rate limit estricto | — | `Cache-Control: public, max-age=15` reduce carga |
| Edge Functions (general) | 500K invocaciones | mes (free tier) | Monitorizar y upgrade si necesario |

**Medidas anti-cheating específicas:**

| Trampa | Detección | Prevención |
|---|---|---|
| Responder demasiado rápido (bot) | Respuesta < 500ms en pregunta de texto | Edge Function marca respuesta como sospechosa, no contar si < 300ms |
| Escanear QR desde captura de pantalla | — | QR personas incluye HMAC estático (válido todo el evento). QR de eventos puede incluir timestamp con expiración si se desea |
| Fabricar QR falsos | Firma HMAC en payload del QR | Edge Function `qr-resolve` verifica HMAC; rechazo silencioso si inválida |
| Crear múltiples cuentas | 1 cuenta por email | Email único en `auth.users` (Supabase Auth lo garantiza) + verificación vía magic link |
| Inyección en respuestas | — | Validación estricta en Edge Function: respuestas son IDs de opción (A/B/C/D), no texto libre |
| Manipulación de Realtime | — | Toda la lógica de combate es server-side (Edge Function `battle-engine`). El cliente solo envía `answerId` vía Broadcast. La Edge Function registra timestamps |

### Input validation

| Capa | Herramienta | Qué valida |
|---|---|---|
| Frontend | Zod + React Hook Form | Formato de inputs antes de enviar |
| Edge Functions | Zod (validación en Deno) | Schema de cada request (tipos, rangos, longitudes) |
| Base de datos | Constraints PostgreSQL + RLS | NOT NULL, UNIQUE, CHECK, FK + políticas de acceso por usuario |

**Reglas de validación específicas:**

| Campo | Regla |
|---|---|
| `name` | 2-50 chars, alphanumeric + spaces + acentos, trim, sanitize HTML |
| `email` | RFC 5322, lowercase, validado por Supabase Auth (magic link confirma existencia) |
| `archetype` | Enum estricto: solo los 8 valores definidos (CHECK constraint en PostgreSQL) |
| `answerId` | UUID v4 que debe existir como opción de la pregunta actual |
| `qrPayload` | URL con HMAC-SHA256 válido, verificado en Edge Function `qr-resolve` |
| `battleId` | UUID v4 que debe existir y estar en estado `InProgress` |

### Prevención de falsificación de QR

```
Generación del QR (Edge Function qr-sign):

  url = "https://app.bilbostack.com/qr/{type}/{id}?sig={hmac}"

  hmac = HMAC-SHA256("{type}:{id}", QR_SECRET_KEY)

  QR codifica la URL completa.

Validación al escanear (Edge Function qr-resolve):

  1. Extraer type, id y sig de la URL
  2. Recalcular HMAC: expected = HMAC-SHA256("{type}:{id}", QR_SECRET_KEY)
  3. Comparar sig === expected (timing-safe comparison)
     INVÁLIDO → Error genérico: "QR no reconocido"
  4. Verificar que entity_id existe en DB
  5. Verificar rate limit: ¿mismo usuario escaneó este QR en los últimos 60s?
     SÍ → "Ya has escaneado este QR"
  6. Procesar interacción según tipo (Person → combate/contacto, Talk → check-in, etc.)
```

**QR_SECRET_KEY:**
- Almacenada como Supabase Edge Function secret (`supabase secrets set QR_SECRET_KEY=...`)
- 256 bits, generada con `crypto.randomBytes(32).toString('hex')`
- Nunca en código ni en variables de entorno del repo
- Rotación: nueva clave para cada edición del evento

### API Security — Checklist

| Control | Implementación |
|---|---|
| HTTPS obligatorio | Supabase y Vercel fuerzan HTTPS nativamente. No requiere configuración |
| CORS | Supabase Dashboard → API Settings → Allowed origins: solo dominio de la app |
| Security headers | `vercel.json` → headers: CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Request size limit | Edge Functions: límite de 2MB por defecto en Supabase |
| SQL injection | Supabase client (`supabase-js`) usa queries parametrizadas por defecto. RLS como capa adicional |
| XSS | React escapa por defecto + CSP strict en `vercel.json` |
| CSRF | Supabase Auth usa tokens en headers (no cookies), no vulnerable a CSRF clásico |
| Dependency scanning | `npm audit` en CI + Dependabot/Renovate para updates automáticos |
| Secrets management | Supabase secrets (`supabase secrets set`) para Edge Functions + Vercel env vars para frontend build |
| Logging de seguridad | Login attempts loggeados por Supabase Auth. Rate limit hits loggeados en Edge Functions |
| RLS | Row Level Security activada en TODAS las tablas. Policies verificadas con tests de integración |
