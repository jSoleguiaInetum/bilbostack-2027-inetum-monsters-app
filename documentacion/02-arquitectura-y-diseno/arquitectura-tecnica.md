# A. Arquitectura Técnica — BilboStack 2027

## A.1 Stack Recomendado

| Capa | Tecnología | Versión | Justificación |
|---|---|---|---|
| **Frontend** | Vite + React | 6.x / 19.x | SPA sin necesidad de SSR (app de uso interno en evento, no requiere SEO). Vite ofrece HMR instantáneo y builds optimizados. PWA con `vite-plugin-pwa` para experiencia mobile-first sin app store |
| **UI Components** | Tailwind CSS + SNES.CSS | 4.x / latest | Tailwind para layout y paleta custom. **SNES.CSS** ([snes-css.sadlative.com](https://snes-css.sadlative.com/)) para estética retro pixel-art 16-bit en botones, inputs, listas y controles del juego — compatible con React y Tailwind |
| **Animaciones** | CSS nativo (`@keyframes` + `transition`) | — | Animaciones de evolución, combate y transiciones implementadas con CSS nativo. La estética pixel-art/retro se beneficia de animaciones discretas (step-based) que CSS maneja nativamente con `animation-timing-function: steps()`. Cero dependencias adicionales |
| **Estado cliente** | Zustand + TanStack Query | 5.x / 5.x | Zustand para estado local (sesión de combate, UI). TanStack Query para caché de servidor, invalidación y optimistic updates |
| **Backend + DB + Auth + Realtime + Storage** | Supabase (free tier) | — | Plataforma all-in-one 100% gratuita: PostgreSQL (500MB), Auth con Magic Link integrado (50K MAU), Realtime Broadcast para combates, Storage (1GB), Edge Functions (Deno, 500K invocaciones/mes). Elimina la necesidad de backend propio, Redis y servicios separados |
| **Edge Functions** | Supabase Edge Functions (Deno) | — | Lógica server-side para: validación de combates, cálculo de métricas, generación de QR firmados, motor de evolución. Sin cold starts significativos gracias a Deno |
| **Base de datos** | PostgreSQL (via Supabase) | 15+ | Modelo relacional para integridad de combates, contactos y logros. JSONB para metadata de monstruos y objetos. Rankings via queries SQL (para ~1000 usuarios, `ORDER BY` con índice es <10ms, no requiere Redis) |
| **Real-time** | Supabase Realtime (Broadcast + Presence) | — | Channels por batalla para sincronización de dos jugadores. Broadcast para envío de preguntas y respuestas. Presence para estado online. Gratis hasta 200 conexiones concurrentes |
| **Autenticación** | Supabase Auth (Magic Link) | — | Magic Link nativo en Supabase. Sin contraseñas: un clic en email y está dentro. JWT automático con refresh tokens. RLS (Row Level Security) integrada en PostgreSQL |
| **QR** | `qrcode` (gen) + `html5-qrcode` (scan) | — | Generación en Edge Function de QR con datos firmados (HMAC). Escaneo via cámara del dispositivo, sin app nativa |
| **Almacenamiento assets** | Supabase Storage | — | Imágenes de monstruos y share cards. 1GB gratuito. CDN integrada. Policies de acceso por RLS |
| **Hosting frontend** | Vercel (free tier) | — | Deploy automático de SPA React. 100GB bandwidth/mes gratis. Preview deploys por PR |
| **CI/CD** | GitHub Actions | — | Pipelines de build, test, deploy. 2000 min/mes gratis (repos privados). Integración nativa con Vercel y Supabase CLI |
| **Monorepo** | Turborepo | 2.x | Monorepo con `apps/web`, `packages/shared` (tipos, constantes, validaciones compartidas). El backend vive en Supabase (Edge Functions + migraciones SQL) |
| **Lenguaje** | TypeScript | 5.6+ | Tipos compartidos entre frontend y Edge Functions via paquete `shared`. Strict mode |

### Coste total de infraestructura: €0/mes

| Servicio | Plan | Límites relevantes | Suficiente para evento |
|---|---|---|---|
| Supabase Free | Gratis | 500MB DB, 1GB storage, 50K MAU, 500K edge invocations, 200 concurrent realtime | Sí para ~1000 asistentes en un día |
| Vercel Free | Gratis | 100GB bandwidth, 100 deployments/día | Sí |
| GitHub Actions | Gratis | 2000 min/mes (privado), ilimitado (público) | Sí |

**[HIPÓTESIS: ~1000 asistentes con ~200 concurrentes máximo (no todos usan la app al mismo tiempo).]**

**Gestión del cuello de botella Realtime (200 conexiones concurrentes):**

El free tier limita a 200 conexiones WebSocket simultáneas. Estrategia de optimización:

1. **Conexiones efímeras:** Solo se abre conexión Realtime al entrar en combate. Se cierra al terminar (<60s). El resto de la app (rankings, logros, contactos) usa REST con polling suave
2. **Estimación de pico real:** Un usuario está en combate ~2% del tiempo del evento → en cualquier momento, ~20-40 usuarios en combate → ~40-80 conexiones. Bien dentro del límite
3. **Cola de espera:** Si se detectan >180 conexiones activas, los nuevos combates entran en cola con countdown visual ("Esperando sala disponible..."). UX aceptable dado que la espera sería de segundos
4. **Escalación de emergencia:** Si el día del evento se supera el límite, upgrade a Supabase Pro ($25/mes) — se activa en minutos desde el dashboard sin cambio de código

### Alternativas evaluadas y descartadas

| Opción | Motivo de descarte |
|---|---|
| Next.js (SSR) | No hay necesidad de SEO ni SSR — la app es de uso interno durante el evento. Vite + React SPA es más simple, más rápido de desarrollar y con mejor DX. Las OG images para compartir en redes se generan via Edge Function, no requieren SSR |
| Backend propio (Fastify/Express en VPS) | Sin presupuesto para hosting. Supabase free tier cubre DB + Auth + Realtime + Storage + Edge Functions en una sola plataforma. La lógica de combate se implementa en Edge Functions (Deno) con Realtime Broadcast — sin cold starts significativos |
| Redis | Para ~1000 usuarios, los rankings se resuelven con queries PostgreSQL indexadas (<10ms). El estado de combate se mantiene en Supabase Realtime channels (efímero por diseño). Rate limiting via RLS policies + Edge Function state. No justifica un servicio adicional |
| React Native / Flutter | Evento de un día. Forzar descarga de app nativa reduce adopción drásticamente. PWA cubre las necesidades (cámara para QR, notificaciones, offline mínimo) |
| Firebase | Supabase ofrece PostgreSQL relacional (necesario para integridad de combates), Magic Link nativo, y es open source. Firebase usa Firestore (NoSQL) que complica queries relacionales |

---

## A.2 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CLIENTE (PWA — Vite + React)                      │
│                   UI: Tailwind + SNES.CSS + CSS Animations             │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Onboarding│  │   Home   │  │Mi Monstruo│  │  Combate │  │Rankings │ │
│  └────┬─────┘  └────┬─────┘  └────┬──────┘  └────┬─────┘  └────┬────┘ │
│       │              │             │               │             │      │
│  ┌────┴──────────────┴─────────────┴───────────────┴─────────────┴───┐ │
│  │                    Estado (Zustand + TanStack Query)               │ │
│  └────────────────────────────┬──────────────────────────────────────┘ │
│                               │                                        │
│  ┌────────────────────────────┼──────────────────────────────────────┐ │
│  │              Capa de Comunicación                                 │ │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐  │ │
│  │   │  Supabase Client │  │ Supabase Realtime│  │ QR Scanner    │  │ │
│  │   │  (supabase-js)   │  │ (Broadcast)      │  │(html5-qrcode) │  │ │
│  │   └──────┬───────────┘  └──────┬───────────┘  └───────────────┘  │ │
│  └──────────┼─────────────────────┼──────────────────────────────────┘ │
└─────────────┼─────────────────────┼──────────────────────────────────┘
              │ HTTPS (REST + Auth) │ WSS (Realtime)
              ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          SUPABASE (free tier)                          │
│                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────────────────────┐   │
│  │    Supabase Auth     │  │         Supabase Realtime            │   │
│  │  - Magic Link email  │  │  - Broadcast channels (combates)    │   │
│  │  - JWT automático    │  │  - Presence (estado online)         │   │
│  │  - RLS policies      │  │  - 200 conexiones concurrentes      │   │
│  └──────────────────────┘  └──────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────── Edge Functions (Deno) ──────────────────────┐   │
│  │                                                                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │ Monsters │ │ Battles  │ │Questions │ │  QR      │          │   │
│  │  │  (gen +  │ │ (engine +│ │ (select +│ │ (sign +  │          │   │
│  │  │  evolve) │ │  score)  │ │  validate│ │  verify) │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │   │
│  │                                                                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │   │
│  │  │ Contacts │ │Achievem. │ │Evolution │ │  Social  │          │   │
│  │  │          │ │  (check +│ │ (check + │ │  Share   │          │   │
│  │  │          │ │  unlock) │ │  trigger)│ │ (OG img) │          │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │   │
│  │                                                                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │   │
│  │  │ Rankings │ │ Missions │ │  Admin   │                       │   │
│  │  │ (queries)│ │          │ │          │                       │   │
│  │  └──────────┘ └──────────┘ └──────────┘                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌──────────────────── Database Triggers (PL/pgSQL) ──────────────┐   │
│  │  - on_battle_answer → valida respuesta, actualiza score        │   │
│  │  - on_metrics_change → recalcula expertise/aura_tech           │   │
│  │  - on_achievement_check → desbloquea logros automáticamente    │   │
│  │  - on_evolution_check → dispara evolución si cumple umbrales   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│  ┌───────────────┐  ┌──────────────────┐                              │
│  │  PostgreSQL   │  │ Supabase Storage │                              │
│  │               │  │                  │                              │
│  │ - Usuarios    │  │ - Monster imgs   │                              │
│  │ - Monstruos   │  │ - Share cards    │                              │
│  │ - Combates    │  │ - QR images      │                              │
│  │ - Contactos   │  │ - Achievement    │                              │
│  │ - Logros      │  │   icons          │                              │
│  │ - Preguntas   │  │                  │                              │
│  │ - Misiones    │  │ (1GB gratis)     │                              │
│  │ - Objetos     │  └──────────────────┘                              │
│  │ - QR Codes    │                                                    │
│  │ - Evoluciones │                                                    │
│  │               │                                                    │
│  │ (500MB gratis)│                                                    │
│  └───────────────┘                                                    │
└───────────────────────────────────────────────────────────────────────┘
              │
     ┌────────▼─────────┐
     │  Vercel (free)   │
     │                  │
     │ - Hosting SPA    │
     │ - CDN global     │
     │ - Preview deploys│
     └──────────────────┘
```

---

## A.3 Modelo de Datos de Alto Nivel

### Diagrama Entidad-Relación (simplificado)

```
┌──────────┐       ┌───────────┐       ┌────────────┐
│   User   │1────1│  Monster   │1────N│  Evolution  │
└────┬─────┘       └───────────┘       └────────────┘
     │
     │1
     ├────────N──┐
     │           │
     │    ┌──────▼──────┐
     │    │   Contact   │ (user_id ↔ contact_user_id)
     │    └─────────────┘
     │
     │1                          ┌────────────┐
     ├────────N─────────────────▶│   Battle   │◀──N────1┐
     │  (como challenger)        │            │  (como opponent)
     │                           └─────┬──────┘         │
     │                                 │N               │
     │                           ┌─────▼──────┐         │
     │                           │BattleRound │    ┌────┴─────┐
     │                           └─────┬──────┘    │   User   │
     │                                 │1          └──────────┘
     │                           ┌─────▼──────┐
     │                           │  Question  │
     │                           └────────────┘
     │1
     ├────────N──┐
     │           │
     │    ┌──────▼────────────┐
     │    │UserAchievement    │
     │    └──────┬────────────┘
     │           │N
     │    ┌──────▼────────────┐
     │    │   Achievement     │
     │    └───────────────────┘
     │1
     ├────────N──┐
     │           │
     │    ┌──────▼────────────┐       ┌──────────┐
     │    │  UserObject       │N────1│  Object   │
     │    └───────────────────┘       └──────────┘
     │1
     ├────────N──┐
     │           │
     │    ┌──────▼────────────┐       ┌──────────┐
     │    │  UserMission      │N────1│  Mission  │
     │    └───────────────────┘       └──────────┘
     │1
     └────────1──┐
                 │
          ┌──────▼────────────┐
          │     QRCode        │
          └───────────────────┘
```

### Definición de Entidades

#### User

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR(255) | Unique, índice |
| name | VARCHAR(100) | |
| archetype | ENUM | Developer, UX/Design, Product, DevOps/Platform, QA, Management, IA Engineer, Multiclass |
| role | ENUM | Participant, Admin |
| expertise | INTEGER | Default 1. Nunca negativo |
| aura_tech | INTEGER | Default 1. Nunca negativo |
| email_domain_bonus | SMALLINT | Bonus inicial calculado del dominio del email |
| is_active | BOOLEAN | Default true |
| last_login_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### Monster

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User. Unique (1:1) |
| name | VARCHAR(100) | Nombre generado |
| species | VARCHAR(50) | Tipo de especie generada |
| category | ENUM | Inusual, Singular, Unico, Epico, Legendario |
| visual_seed | VARCHAR(64) | Hash determinista para generar aspecto visual |
| visual_params | JSONB | Parámetros de generación visual (colores, formas, rasgos) |
| image_url | VARCHAR(500) | URL de la imagen actual en R2 |
| current_evolution | SMALLINT | 0-3. Comienza en 0 |
| base_stats | JSONB | Estadísticas base inmutables |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### Evolution

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| monster_id | UUID | FK → Monster |
| evolution_number | SMALLINT | 1, 2 o 3 |
| triggered_at | TIMESTAMP | Momento de la evolución |
| expertise_at_trigger | INTEGER | Snapshot de Expertise al evolucionar |
| aura_tech_at_trigger | INTEGER | Snapshot de Aura Tech al evolucionar |
| previous_image_url | VARCHAR(500) | Imagen antes de evolucionar |
| new_image_url | VARCHAR(500) | Imagen tras evolucionar |
| evolution_type | VARCHAR(50) | Tipo de cambio visual aplicado |

#### Battle

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| challenger_id | UUID | FK → User |
| opponent_id | UUID | FK → User |
| winner_id | UUID | FK → User, nullable (empate / en curso) |
| status | ENUM | Pending, InProgress, Completed, Abandoned |
| challenger_score | SMALLINT | 0-3 |
| opponent_score | SMALLINT | 0-3 |
| started_at | TIMESTAMP | |
| finished_at | TIMESTAMP | Nullable |
| duration_ms | INTEGER | Duración total real |

**Constraint:** UNIQUE(challenger_id, opponent_id) + CHECK que no exista la combinación inversa → garantiza un solo combate por par de usuarios.

#### BattleRound

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| battle_id | UUID | FK → Battle |
| round_number | SMALLINT | 1, 2, 3 (o 4 si muerte súbita) |
| question_id | UUID | FK → Question |
| challenger_answer | VARCHAR(1) | a, b, c, d |
| opponent_answer | VARCHAR(1) | a, b, c, d |
| challenger_time_ms | INTEGER | Tiempo de respuesta en ms |
| opponent_time_ms | INTEGER | Tiempo de respuesta en ms |
| round_winner_id | UUID | FK → User, nullable |

#### Question

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| text | VARCHAR(500) | Enunciado |
| options | JSONB | Array de {key, text} — 4 opciones |
| correct_option | VARCHAR(1) | a, b, c, d |
| type | ENUM | Universal, Specialized, Crossover |
| archetype | ENUM | Nullable. Para preguntas Specialized |
| difficulty | SMALLINT | 1-5 |
| expertise_reward | INTEGER | Puntos por respuesta correcta |
| aura_tech_reward | INTEGER | Puntos por respuesta correcta |
| is_active | BOOLEAN | Default true |
| times_used | INTEGER | Para balanceo de uso |

#### Contact

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User |
| contact_user_id | UUID | FK → User |
| created_at | TIMESTAMP | |

**Constraint:** UNIQUE(user_id, contact_user_id). La relación NO es bidireccional automáticamente (cada usuario decide si añade al otro).

#### Achievement

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| code | VARCHAR(50) | Unique. Identificador interno (e.g., `first_battle`, `5_contacts`) |
| name | VARCHAR(100) | Nombre visible al usuario |
| description | VARCHAR(500) | |
| icon_url | VARCHAR(500) | |
| aura_tech_reward | INTEGER | Mínimo 1 |
| expertise_reward | INTEGER | Default 0 |
| object_reward_id | UUID | FK → Object, nullable |
| is_hidden | BOOLEAN | Logros secretos no se muestran hasta desbloquearlos |
| is_active | BOOLEAN | |

#### UserAchievement

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User |
| achievement_id | UUID | FK → Achievement |
| unlocked_at | TIMESTAMP | |

**Constraint:** UNIQUE(user_id, achievement_id)

#### Object

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | |
| description | VARCHAR(500) | |
| rarity | ENUM | Inusual, Singular, Unico, Epico, Legendario |
| benefit | VARCHAR(200) | Descripción del efecto |
| benefit_type | ENUM | ExpertiseBoost, AuraTechBoost, Cosmetic, Title, Special |
| benefit_value | INTEGER | Valor numérico del efecto (si aplica) |
| icon_url | VARCHAR(500) | |
| origin | VARCHAR(100) | De dónde se obtiene |
| is_active | BOOLEAN | |

#### UserObject

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User |
| object_id | UUID | FK → Object |
| obtained_at | TIMESTAMP | |
| source | VARCHAR(50) | Achievement, QR, Battle, Mission |

#### Mission

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| name | VARCHAR(100) | |
| description | VARCHAR(500) | |
| type | ENUM | Base, Contextual, QRActivated |
| objective | JSONB | Condiciones de completado (e.g., `{type: "contacts", count: 3}`) |
| aura_tech_reward | INTEGER | |
| expertise_reward | INTEGER | |
| object_reward_id | UUID | FK → Object, nullable |
| is_active | BOOLEAN | |

#### UserMission

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → User |
| mission_id | UUID | FK → Mission |
| status | ENUM | Active, Completed, Expired |
| progress | JSONB | Estado parcial (e.g., `{contacts_made: 2}`) |
| activated_at | TIMESTAMP | |
| completed_at | TIMESTAMP | Nullable |

#### QRCode

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| type | ENUM | Person, NPC, Talk, Mission, Object, Event |
| reference_id | UUID | FK polimórfico: apunta a User, Mission, Object, etc. según type |
| payload | VARCHAR(500) | Datos codificados en el QR (incluye HMAC) |
| image_url | VARCHAR(500) | URL del QR renderizado |
| is_active | BOOLEAN | |
| scan_count | INTEGER | Contador de escaneos |
| created_at | TIMESTAMP | |

#### QRScan (log de escaneos)

| Campo | Tipo | Notas |
|---|---|---|
| id | UUID | PK |
| scanned_by_user_id | UUID | FK → User |
| qr_code_id | UUID | FK → QRCode |
| scanned_at | TIMESTAMP | |
| result_action | VARCHAR(50) | Battle, Contact, Achievement, Object, Mission, CheckIn |

### Índices clave

```
User:           idx_user_email (email) UNIQUE
                idx_user_expertise (expertise DESC) — para rankings
                idx_user_aura_tech (aura_tech DESC) — para rankings
Monster:        idx_monster_user (user_id) UNIQUE
Battle:         idx_battle_pair (challenger_id, opponent_id) UNIQUE
                idx_battle_pair_rev (opponent_id, challenger_id) UNIQUE
                idx_battle_status (status) WHERE status = 'InProgress'
Contact:        idx_contact_pair (user_id, contact_user_id) UNIQUE
                idx_contact_user (user_id) — para contar contactos
QRScan:         idx_scan_user (scanned_by_user_id, scanned_at DESC)
UserAchievement: idx_ua_user (user_id)
```

---

## A.4 Mapa de Módulos y Dependencias

### Estructura del monorepo

```
bilbostack-2027/
├── apps/
│   └── web/                        # Vite + React PWA (frontend)
│       ├── src/
│       │   ├── pages/              # Rutas (react-router-dom)
│       │   │   ├── auth/           # Login, onboarding
│       │   │   ├── game/           # Home, monster, QR, battle, contacts
│       │   │   ├── admin/          # Dashboard privado
│       │   │   └── public/         # Dashboard público, rankings
│       │   ├── components/
│       │   │   ├── battle/         # UI de combate (countdown, rondas, resultado)
│       │   │   ├── monster/        # Visualización y animación de monstruo
│       │   │   ├── qr/             # Scanner y display QR
│       │   │   ├── share/          # Tarjetas compartibles
│       │   │   └── ui/             # Design system (SNES.CSS + Tailwind)
│       │   ├── hooks/              # Custom hooks (useAuth, useBattle, useRealtime)
│       │   ├── stores/             # Zustand stores
│       │   ├── lib/
│       │   │   └── supabase.ts     # Cliente Supabase inicializado
│       │   └── styles/
│       │       └── animations.css  # @keyframes para evoluciones, combates, etc.
│       ├── public/
│       │   └── manifest.json       # PWA manifest
│       └── vite.config.ts
│
├── supabase/                       # Backend (Supabase project)
│   ├── functions/                  # Edge Functions (Deno/TypeScript)
│   │   ├── battle-engine/          # Motor de combate (validación, scoring)
│   │   ├── monster-generator/      # Generación procedural de monstruos
│   │   ├── evolution-check/        # Verificar y disparar evoluciones
│   │   ├── qr-sign/                # Firma HMAC de códigos QR
│   │   ├── qr-resolve/             # Resolver acción al escanear QR
│   │   ├── metrics-recalc/         # Recálculo de Expertise y Aura Tech
│   │   ├── achievement-check/      # Verificar y desbloquear logros
│   │   ├── share-card/             # Generar imagen OG para compartir
│   │   └── admin/                  # Endpoints administrativos protegidos
│   ├── migrations/                 # Migraciones SQL (schema + triggers)
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_triggers.sql        # on_battle_answer, on_metrics_change, etc.
│   │   └── 004_seed_questions.sql
│   ├── seed.sql                    # Datos iniciales (preguntas, logros, misiones)
│   └── config.toml                 # Configuración local de Supabase
│
├── packages/
│   └── shared/                     # Tipos, constantes, validaciones
│       ├── types/                  # Interfaces TS compartidas (frontend + functions)
│       ├── constants/              # Enums, configuración, umbrales de evolución
│       ├── validators/             # Zod schemas (validación compartida)
│       └── utils/                  # Funciones puras (hash, categoría, etc.)
│
├── turbo.json
├── package.json
└── .github/workflows/
    ├── deploy-web.yml              # Build + deploy Vite SPA a Vercel
    └── deploy-functions.yml        # Deploy Edge Functions a Supabase
```

### Mapa de dependencias entre Edge Functions

```
                    ┌──────────────────┐
                    │  Supabase Auth   │
                    │  (Magic Link)    │
                    └────────┬─────────┘
                             │ (JWT automático en cada request)
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
    ┌─────────┐    ┌───────────────┐       ┌──────────┐
    │  Users  │◄───│monster-gen    │       │ qr-sign  │
    │  (RLS)  │    │(Edge Function)│       │(Edge Fn) │
    └────┬────┘    └──────┬────────┘       └────┬─────┘
         │                │                     │
         │    ┌───────────┤           ┌─────────┤
         │    │           │           │         │
         ▼    ▼           ▼           ▼         ▼
    ┌──────────┐  ┌───────────────┐  ┌────────────┐
    │ Contacts │  │battle-engine  │  │ qr-resolve │
    │  (RLS)   │  │(Edge Fn +    │  │ (Edge Fn)  │
    └────┬─────┘  │ Realtime)    │  └──────┬─────┘
         │        └──────┬────────┘         │
         │               │                  │
         ▼               ▼                  ▼
    ┌────────────┐ ┌────────────┐    ┌──────────┐
    │achievement │ │ Questions  │    │ Missions │
    │-check      │ │  (tabla +  │    │  (RLS)   │
    │(Edge Fn)   │ │  seed SQL) │    └──────────┘
    └────┬───────┘ └────────────┘
         │
         ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │evolution   │  │ Rankings   │  │ share-card │
    │-check      │  │ (queries   │  │ (Edge Fn)  │
    │(Edge Fn)   │  │  SQL+idx)  │  └────────────┘
    └────────────┘  └────────────┘

    ─── Database Triggers (PL/pgSQL, ejecutan automáticamente) ───

    on_battle_answer   → valida respuesta, actualiza score, notifica via Realtime
    on_metrics_change  → recalcula expertise/aura_tech del usuario
    on_contact_added   → incrementa aura_tech, verifica logros de networking
    on_achievement_unlock → otorga recompensas (objetos, expertise, aura_tech)

    ─── Edge Functions compartidas ───

    metrics-recalc  ← invocada por battle-engine, achievement-check, qr-resolve
    evolution-check ← invocada tras cada metrics-recalc
```

### Dependencias críticas (orden de implementación)

| Orden | Módulo | Depende de |
|---|---|---|
| 1 | shared (types, validators) | — |
| 2 | Auth | shared |
| 3 | Users | Auth, shared |
| 4 | Questions | shared (pool necesario antes de combates) |
| 5 | Monsters (generación) | Users |
| 6 | QR | Users, Monsters |
| 7 | Contacts | Users, QR |
| 8 | Battles | Users, Monsters, Questions, QR |
| 9 | Achievements | Users, Contacts, Battles |
| 10 | Objects | Achievements |
| 11 | Missions | Users, QR, Objects |
| 12 | Evolution | Monsters, MetricsCalculator |
| 13 | Rankings | Users (queries sobre expertise, aura_tech, contacts, wins) |
| 14 | Social Share | Users, Monsters, Achievements |
| 15 | Admin | Todos los anteriores |

---

## A.5 Estrategia de Generación Visual de Monstruos

### Enfoque: Generación Procedural Determinista + Composición de Assets

**[HIPÓTESIS: No hay presupuesto para generación por IA generativa en tiempo real (coste por imagen ~$0.04-0.08, x1000 usuarios = $40-80 solo en generación inicial). Se opta por composición procedural de assets pre-diseñados, que es determinista, instantánea y sin coste por ejecución.]**

### Algoritmo de generación

```
Input: nombre + email + arquetipo
                │
                ▼
┌──────────────────────────────┐
│  1. Generar visual_seed      │
│     SHA-256(email.lower())   │
│     → hash de 64 chars hex   │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  2. Extraer parámetros       │
│     del hash                 │
│                              │
│  chars[0-3]  → body_shape    │  (16 variantes de cuerpo)
│  chars[4-7]  → color_primary │  (mapeado a paleta de 32 colores)
│  chars[8-11] → color_second  │  (paleta secundaria)
│  chars[12-13]→ eyes_type     │  (16 variantes)
│  chars[14-15]→ mouth_type    │  (16 variantes)
│  chars[16-17]→ accessory     │  (16 variantes de accesorio tech)
│  chars[18-19]→ pattern       │  (16 patrones de textura)
│  chars[20-21]→ aura_effect   │  (16 efectos de aura)
│  chars[22-23]→ size_mod      │  (variación de tamaño)
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  3. Aplicar modificadores    │
│     por arquetipo            │
│                              │
│  Developer  → +tech elements │
│  UX/Design  → +artistic      │
│  DevOps     → +mechanical    │
│  QA         → +analytical    │
│  Product    → +leadership    │
│  Management → +strategic     │
│  IA Engineer→ +neural/AI      │
│  Multiclass → +hybrid        │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  4. Determinar categoría     │
│                              │
│  char[24-27] → rarity_score  │
│                              │
│  0-60% → Inusual             │
│  61-82% → Singular           │
│  83-93% → Único              │
│  94-98% → Épico              │
│  99-100% → Legendario        │
│                              │
│  Categoría afecta:           │
│  - Número de accesorios      │
│  - Complejidad del aura      │
│  - Bonus inicial Aura Tech   │
│  NO afecta stats finales     │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  5. Renderizar imagen        │
│                              │
│  Server-side: canvas (Node)  │
│  Composición de capas SVG:   │
│    Layer 1: Background/Aura  │
│    Layer 2: Body             │
│    Layer 3: Pattern/Texture  │
│    Layer 4: Eyes             │
│    Layer 5: Mouth            │
│    Layer 6: Accessory(ies)   │
│    Layer 7: Archetype badge  │
│                              │
│  Output: PNG 512x512         │
│  Upload a Cloudflare R2      │
└──────────────────────────────┘
```

### Assets necesarios (trabajo de ilustración)

| Tipo de asset | Variantes | Formato | Notas |
|---|---|---|---|
| Cuerpos base | 16 | SVG | Siluetas de criaturas tech |
| Ojos | 16 | SVG | |
| Bocas | 16 | SVG | |
| Accesorios tech | 16 | SVG | Antenas, chips, cables, visores, etc. |
| Patrones/texturas | 16 | SVG | Circuitos, binario, ondas, pixels |
| Efectos de aura | 16 | SVG/CSS | Brillos, partículas, halos |
| Modificadores de arquetipo | 7 | SVG | Un badge/elemento por arquetipo |
| **Total assets base** | **103** | | |

**[HIPÓTESIS: Se contrata un ilustrador freelance para producir los ~103 assets SVG. Estimación: 2-3 semanas de trabajo, ~€2.000-3.000. Los assets deben seguir la paleta BilboStack (#232D4B, #E20074, #F5F340) y estética videojuego tech.]**

### Evoluciones visuales

Cada evolución (máx. 3) aplica transformaciones progresivas:

| Evolución | Cambios visuales |
|---|---|
| Evo 1 (Expertise ≥ X) | Nuevo accesorio + pattern más complejo + aura más intensa |
| Evo 2 (Aura Tech ≥ Y) | Cambio de body shape (versión "powered up") + segundo color más vibrante |
| Evo 3 (Expertise ≥ Z AND Aura Tech ≥ W) | Transformación completa: body shape final + aura legendaria + todos los accesorios. Aspecto "final form" |

**[HIPÓTESIS: Umbrales de evolución. Evo 1: Expertise ≥ 15. Evo 2: Aura Tech ≥ 20. Evo 3: Expertise ≥ 30 AND Aura Tech ≥ 35. Estos valores se calibrarán con datos de testing pre-evento para que ~70% de los asistentes activos alcancen Evo 1, ~40% Evo 2, y ~10-15% Evo 3.]**

### Librería de renderizado

- **Server-side (Edge Function `monster-generator`):** Composición de capas SVG en la Edge Function (Deno). Renderizar SVG compuesto directamente (sin rasterizar a PNG) y almacenarlo en Supabase Storage. Los SVG son más ligeros (~5-20KB vs ~50-100KB PNG) y escalan sin pérdida. Alternativa: usar `resvg-wasm` (binding WebAssembly de resvg, compatible con Deno) si se necesita PNG
- **Client-side:** Los monstruos se muestran como `<img>` cargando el SVG desde Supabase Storage/CDN. Las animaciones de evolución se hacen con CSS nativo (`@keyframes` con `steps()` para estética pixel-art, `transform: scale()`, `filter: brightness()`, pseudo-elementos para partículas)
- Pre-generar las 4 versiones del monstruo (base + 3 evoluciones) en el momento de registro, para evitar latencia durante el evento

---

## A.6 Decisiones Técnicas Clave

### DT-01: Autenticación — Supabase Auth (Magic Link)

| Aspecto | Decisión |
|---|---|
| **Método** | Magic Link vía email, nativo en Supabase Auth |
| **Justificación** | En un evento de un día, la fricción de crear contraseña reduce la adopción. El usuario ya proporciona email obligatoriamente. Un clic en el email y está dentro |
| **Implementación** | 1) Usuario introduce email → 2) `supabase.auth.signInWithOtp({ email })` → 3) Supabase envía magic link automáticamente (usa su propio servicio SMTP gratuito, hasta 4 emails/hora por usuario) → 4) Usuario clica → JWT emitido automáticamente por Supabase |
| **Coste email** | Supabase incluye envío de emails de auth en el free tier (usa servicio SMTP integrado). Sin proveedor externo necesario |
| **Fallback** | Si el email tarda, ofrecer código OTP de 6 dígitos (Supabase Auth soporta `signInWithOtp` con `type: 'sms'` o token manual). Alternativa: registro presencial donde admin genera sesión directamente |
| **RLS** | Row Level Security activada en todas las tablas. Las policies usan `auth.uid()` para que cada usuario solo acceda a sus datos. Admin role verificado via `auth.jwt() ->> 'role'` |
| **Riesgo** | WiFi del evento inestable para recibir email. Mitigación: campaña de registro previo al evento (días antes vía web) + opción OTP presencial |

### DT-02: Combates en tiempo real — Supabase Realtime Broadcast

| Aspecto | Decisión |
|---|---|
| **Protocolo** | WebSocket via Supabase Realtime (Broadcast channels) |
| **Justificación** | El combate requiere sincronización de dos jugadores con countdown compartido. Supabase Realtime soporta Broadcast (mensajes efímeros entre clientes) y Presence (estado online) — incluido en free tier (200 conexiones concurrentes) |
| **Arquitectura** | Modelo híbrido: los clientes se comunican via Broadcast channel (`battle:{battleId}`), pero la **validación** ocurre en Edge Functions. Flujo: cliente envía respuesta → Edge Function valida, calcula score, inserta en `battle_rounds` → Database trigger notifica resultado via Realtime |
| **Estado del combate** | Tabla `battles` + `battle_rounds` en PostgreSQL (fuente de verdad). El estado efímero del countdown se gestiona client-side con sincronización vía Broadcast |
| **Flujo** | `channel.send('battle:init')` → `channel.send('battle:ready')` → Edge Function envía pregunta via `channel.send('round:start')` → clientes responden → Edge Function valida → `channel.send('round:result')` → `channel.send('battle:final')` |
| **Anti-trampa** | Las preguntas se almacenan server-side y se envían al canal solo cuando empieza la ronda. La Edge Function registra timestamps de recepción (no del cliente). Las opciones se barajan server-side por ronda |
| **Desconexión** | Supabase Presence detecta desconexión. Si un jugador pierde presencia >15s, la Edge Function `battle-engine` resuelve la ronda a favor del oponente. Reconexión automática vía `supabase-js` |
| **Límite free tier** | 200 conexiones Realtime concurrentes. Un combate usa 2 conexiones (una por jugador). Máximo ~100 combates simultáneos — suficiente para ~1000 asistentes (no todos combaten a la vez) |

### DT-03: Códigos QR — Payload firmado con HMAC

| Aspecto | Decisión |
|---|---|
| **Contenido del QR** | URL con payload: `https://app.bilbostack.com/qr/{type}/{id}?sig={hmac}` |
| **Firma** | HMAC-SHA256 sobre `{type}:{id}:{secret}`. Secret almacenado en Supabase Edge Function secrets (env vars) |
| **Justificación** | Previene fabricación de QR falsos. La verificación es O(1) sin DB lookup |
| **QR de persona** | Se genera al registrarse (Edge Function `qr-sign`). Contiene `Person:{userId}`. Se muestra en la pantalla "Mi QR" del usuario |
| **QR físicos** | QR de charla, misión, objeto, evento: generados por admin vía dashboard y Edge Function. Impresos/proyectados en el venue |
| **Escaneo** | Biblioteca `html5-qrcode` usa la cámara del dispositivo. Al decodificar, la SPA intercepta la URL, invoca Edge Function `qr-resolve` que verifica HMAC y ejecuta la acción correspondiente |
| **Rate limit** | Verificado en `qr-resolve`: consulta `qr_scans` para comprobar que no existe escaneo del mismo QR por el mismo usuario en los últimos 60s |

### DT-04: Rankings — PostgreSQL con índices

| Aspecto | Decisión |
|---|---|
| **Estructura** | 4 queries SQL con índices dedicados: `idx_user_expertise DESC`, `idx_user_aura_tech DESC`, contactos via `COUNT` sobre `contacts`, victorias via `COUNT` sobre `battles WHERE winner_id` |
| **Justificación** | Para ~1000 usuarios, `SELECT ... ORDER BY expertise DESC LIMIT 50` con índice es <5ms. Redis no justifica su complejidad ni coste para este volumen |
| **Vistas materializadas** | Si el rendimiento lo requiere durante el evento, se pueden crear `MATERIALIZED VIEW`s de rankings y refrescar cada 30s con `pg_cron` (disponible en Supabase) |
| **Caché HTTP** | Los endpoints de rankings se sirven con `Cache-Control: public, max-age=15`. Suficiente para que se sientan "en vivo" sin saturar la DB |

### DT-05: PWA — Experiencia app sin app store

| Aspecto | Decisión |
|---|---|
| **Justificación** | App nativa requiere descarga → fricción mortal para evento de un día. PWA con `manifest.json` + service worker (`vite-plugin-pwa`) permite "Add to Home Screen" |
| **Service Worker** | Caché de assets estáticos (imágenes de monstruos, UI, SNES.CSS). No caché de datos dinámicos — el evento requiere datos en tiempo real |
| **Permisos** | Cámara (para QR scanner). Notificaciones opcionales (para avisos de evolución) |
| **Compatibilidad** | iOS Safari + Chrome Android. Safari tiene limitaciones con push notifications, pero el flujo core (QR scanner, combates via Realtime) funciona |
| **Offline** | Mínimo: pantalla de "Conecta al WiFi del evento" con el monstruo del usuario visible (cacheado en service worker). No se permite jugar offline |

### DT-06: Generación de tarjetas compartibles — Edge Function + SVG

| Aspecto | Decisión |
|---|---|
| **Método** | Edge Function `share-card` genera SVG dinámico con datos del usuario, lo rasteriza a PNG via `resvg-wasm` y lo almacena en Supabase Storage |
| **Flujo** | URL compartible tipo `https://app.bilbostack.com/share/{userId}` → meta tags OG apuntan a la URL de la imagen en Supabase Storage → LinkedIn/redes previsualizan la tarjeta |
| **Contenido** | Nombre, monstruo (SVG embebido), categoría, Expertise, Aura Tech, logros destacados, evolución alcanzada, branding BilboStack (paleta #232D4B, #E20074, #F5F340) |
| **Generación** | La tarjeta se regenera automáticamente cuando el usuario evoluciona o desbloquea logros significativos (invocada desde `evolution-check` y `achievement-check`) |
| **Caché** | Almacenada en Supabase Storage con path `share-cards/{userId}.png`. Se sobreescribe en cada regeneración. URL pública estable |
| **Coste** | 0€ — Supabase Storage free tier (1GB) cubre ~1000 tarjetas de ~100KB cada una (~100MB total) |

### DT-07: Modelo de eventos — Database Triggers (PL/pgSQL)

| Aspecto | Decisión |
|---|---|
| **Patrón** | Database triggers en PostgreSQL que reaccionan a INSERTs/UPDATEs y ejecutan lógica encadenada |
| **Justificación** | En una arquitectura serverless (Edge Functions), no hay un proceso Node.js persistente para EventEmitter. Los triggers de PostgreSQL son la alternativa natural: se ejecutan transaccionalmente, son atómicos y no dependen de un servidor |
| **Triggers principales** | `after_battle_round_insert` → valida score, actualiza `battles` / `after_battle_complete` → recalcula expertise y aura_tech → `after_metrics_update` → verifica umbrales de evolución → `after_evolution_insert` → regenera imagen del monstruo |
| **Encadenamiento** | Un combate completado dispara: actualización de métricas → verificación de logros → verificación de evolución → regeneración de share card. Todo dentro de la misma transacción excepto la generación de imágenes (async via `pg_net` o Edge Function invocada desde trigger) |
| **Límite** | Los triggers deben ser rápidos (<100ms). Operaciones pesadas (generar imagen, enviar notificación) se delegan a Edge Functions invocadas asíncronamente via `supabase.functions.invoke()` desde el trigger usando la extensión `pg_net` |

### Resumen de decisiones técnicas

```
┌──────────────────────────────────────────────────────────┐
│               DECISIONES TÉCNICAS CLAVE                  │
├──────────┬───────────────────────────────────────────────┤
│ DT-01    │ Supabase Auth Magic Link (sin contraseñas)    │
│ DT-02    │ Supabase Realtime Broadcast (combates)        │
│ DT-03    │ QR con HMAC-SHA256 anti-falsificación         │
│ DT-04    │ PostgreSQL + índices para rankings (sin Redis)│
│ DT-05    │ PWA con vite-plugin-pwa (sin app store)       │
│ DT-06    │ Edge Function + resvg-wasm para share cards   │
│ DT-07    │ Database Triggers PL/pgSQL para eventos       │
└──────────┴───────────────────────────────────────────────┘

Coste total infraestructura: €0/mes (Supabase Free + Vercel Free + GitHub Actions Free)
```
